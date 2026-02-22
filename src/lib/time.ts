export function toISO(date: Date) { return new Date(date).toISOString(); }
export function addMinutes(iso: string, mins: number) { return new Date(new Date(iso).getTime() + mins*60000).toISOString(); }
export function hhmm(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}
export function fromHHMM(hhmm: string, baseISO: string) {
  const [h,m] = hhmm.split(':').map(Number);
  const d = new Date(baseISO);
  d.setHours(h,m,0,0);
  return d.toISOString();
}
export function todayISO() { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); }

/** Human label for time until target, e.g. "2h 03m", "45m", "now" */
export function fmtDelta(targetISO?: string, now = new Date()): string {
  if (!targetISO) return '';
  const ms = new Date(targetISO).getTime() - now.getTime();
  if (ms <= 30_000) return 'now';
  const totalM = Math.round(ms / 60000);
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`;
}
