// src/lib/google.ts
// Read-only Calendar events + Google Tasks via Google Identity Services (GIS)

export type GEvent = {
  id: string;
  summary: string;
  startISO: string;
  endISO?: string;
  location?: string;
  htmlLink?: string;
  allDay: boolean;
};

export type GTask = {
  id: string;
  title: string;
  dueISO?: string;       // tasks may be "date-only" in RFC3339 (00:00:00Z)
  notes?: string;
  status: 'needsAction' | 'completed';
  updatedISO?: string;
  link?: string;
  listId: string;        // which tasklist it came from
  listTitle: string;
};

type GoogleTokenClient = {
  requestAccessToken: (opts?: { prompt?: '' | 'none' | 'consent' }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (opts: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string; grantedScopes?: string }) => void;
          }) => GoogleTokenClient;
        }
      }
    }
  }
}

const SCOPE_CAL = 'https://www.googleapis.com/auth/calendar.readonly';
const SCOPE_TASKS = 'https://www.googleapis.com/auth/tasks.readonly';

let accessToken: string | null = null;
const grantedScopes = new Set<string>();

function clientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!id) throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
  return id;
}

async function ensureScopes(required: string[]): Promise<void> {
  // If we already have the token and all required scopes, we're good
  if (accessToken && required.every(s => grantedScopes.has(s))) return;
  if (!window.google?.accounts?.oauth2) throw new Error('Google Identity Services not loaded');

  const scopeStr = Array.from(new Set([...grantedScopes, ...required])).join(' ');

  accessToken = await new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts!.oauth2!.initTokenClient({
      client_id: clientId(),
      scope: scopeStr,
      callback: (resp) => {
        if (resp?.access_token) {
          resolve(resp.access_token);
          // Track granted scopes (GIS returns a space-delimited string)
          if (resp.grantedScopes) {
            resp.grantedScopes.split(' ').forEach(s => grantedScopes.add(s));
          } else {
            // Fallback: assume we got what we asked for
            scopeStr.split(' ').forEach(s => grantedScopes.add(s));
          }
        } else {
          reject(new Error(resp?.error || 'Token request failed'));
        }
      },
    });
    client.requestAccessToken({ prompt: grantedScopes.size ? 'consent' : undefined });
  });
}

// ---- Calendar (Events) ----
export async function listTodayEvents(): Promise<GEvent[]> {
  await ensureScopes([SCOPE_CAL]);

  const now = new Date();
  const start = new Date(now); start.setHours(0,0,0,0);
  const end   = new Date(now); end.setHours(23,59,59,999);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`Calendar list failed: ${res.status} ${await res.text()}`);

  type ApiEvent = {
    id: string; status?: string; summary?: string; location?: string; htmlLink?: string;
    start?: { dateTime?: string; date?: string };
    end?:   { dateTime?: string; date?: string };
  };

  const data = await res.json() as { items?: ApiEvent[] };
  const items = (data.items ?? [])
    .filter(e => e.status !== 'cancelled')
    .map((e): GEvent => {
      const startISO = e.start?.dateTime ?? (e.start?.date ? `${e.start.date}T00:00:00.000Z` : new Date().toISOString());
      const endISO   = e.end?.dateTime   ?? (e.end?.date   ? `${e.end.date}T23:59:59.999Z` : undefined);
      const allDay = !!e.start?.date && !e.start?.dateTime;
      return {
        id: e.id,
        summary: e.summary || '(no title)',
        startISO,
        endISO,
        location: e.location,
        htmlLink: e.htmlLink,
        allDay,
      };
    });

  return items;
}

// ---- Google Tasks (due today, not completed) ----
export async function listTodayTasks(): Promise<GTask[]> {
  await ensureScopes([SCOPE_TASKS]);

  // 1) list tasklists
  const resLists = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists?maxResults=50', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!resLists.ok) throw new Error(`Tasklists failed: ${resLists.status} ${await resLists.text()}`);

  const listsData = await resLists.json() as { items?: Array<{ id: string; title?: string }> };
  const lists = listsData.items ?? [];

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);

  const all: GTask[] = [];
  for (const list of lists) {
    const url = new URL(`https://www.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks`);
    url.searchParams.set('maxResults', '100');
    url.searchParams.set('showHidden', 'false');
    url.searchParams.set('showCompleted', 'false');

    const resTasks = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!resTasks.ok) continue; // skip this list on error

    type ApiTask = {
      id: string;
      title?: string;
      due?: string;           // RFC3339; may be date-only "YYYY-MM-DDT00:00:00.000Z"
      notes?: string;
      status?: 'needsAction' | 'completed';
      updated?: string;
      selfLink?: string;
      hidden?: boolean;
      deleted?: boolean;
    };

    const data = await resTasks.json() as { items?: ApiTask[] };
    for (const t of (data.items ?? [])) {
      if (t.deleted || t.hidden) continue;
      if (t.status === 'completed') continue;

      // Filter to "due today" (if due missing, skip for now)
      if (!t.due) continue;
      const due = new Date(t.due);
      if (due < todayStart || due > todayEnd) continue;

      all.push({
        id: t.id,
        title: t.title || '(untitled)',
        dueISO: t.due,
        notes: t.notes,
        status: t.status ?? 'needsAction',
        updatedISO: t.updated,
        link: t.selfLink,
        listId: list.id,
        listTitle: list.title ?? 'Tasks',
      });
    }
  }

  // sort by due time then title
  all.sort((a, b) => (new Date(a.dueISO ?? 0).getTime()) - (new Date(b.dueISO ?? 0).getTime()) || a.title.localeCompare(b.title));
  return all;
}



