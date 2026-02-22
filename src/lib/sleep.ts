export type SleepEntry = {
  /** Day bucket keyed to the WAKE day in local time (YYYY-MM-DDT00:00:00.000Z style ISO is fine for v1). */
  dateISO: string;
  bedISO?: string;   // when you went to bed (local)
  wakeISO?: string;  // when you woke up (local)
  quality?: number;  // 1..10
  dream?: string;    // free text
  tzOffsetMin?: number; // local timezone offset at capture time (for future-proofing)
};

export function defaultSleep(dateISO: string): SleepEntry {
  return { dateISO, quality: 7, tzOffsetMin: -new Date().getTimezoneOffset() };
}

/** Returns minutes slept; handles crossing midnight (assumes wake is same or next day). */
export function minutesSlept(e: SleepEntry): number | undefined {
  if (!e.bedISO || !e.wakeISO) return undefined;
  const start = new Date(e.bedISO).getTime();
  let end = new Date(e.wakeISO).getTime();
  if (end <= start) end += 24 * 60 * 60 * 1000; // rolled past midnight
  const mins = Math.round((end - start) / 60000);
  if (mins <= 0 || mins > 16 * 60) return undefined; // sanity cap at 16h
  return mins;
}

export function fmtHhMm(mins?: number): string {
  if (mins == null) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${String(m).padStart(2,'0')}m`;
}

/** Given a bed/wake pair, return the ISO string you should use to bucket the entry (the wake day). */
export function wakeDayISO(wakeISO?: string): string {
  const d = wakeISO ? new Date(wakeISO) : new Date();
  d.setHours(0,0,0,0);
  return d.toISOString();
}

