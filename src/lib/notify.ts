// Cross-platform notifications: Web Notifications API + optional Capacitor LocalNotifications

export type NotifyOptions = { title: string; body?: string };
export type Permission = NotificationPermission | 'unsupported';

// ---- Permissions (web) ----
export async function ensurePermission(): Promise<Permission> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch (err) {
    if (import.meta.env.DEV) console.warn('Notification permission error', err);
    return 'unsupported';
  }
}

// ---- Beep (Web Audio) ----
// Provide a typed constructor helper that supports vendor-prefixed contexts.
type AudioContextCtor = typeof AudioContext;
function getAudioContextCtor(): AudioContextCtor | undefined {
  const w = window as Window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

// Singleton AudioContext — prevents accumulation on long sessions
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  const Ctx = getAudioContextCtor();
  if (!Ctx) throw new Error('AudioContext not supported');
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new Ctx();
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx.state === 'suspended') {
    void _audioCtx.resume();
  }
  return _audioCtx;
}

export function beep(ms = 400, hz = 880): void {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = hz;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(now + ms / 1000 + 0.02);
    // Don't close the singleton context — just let the oscillator finish
  } catch (err) {
    if (import.meta.env.DEV) console.warn('beep() failed', err);
  }
}

// ---- Web notifications fallback ----
export function webNotify({ title, body }: NotifyOptions): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  // `void` keeps linters happy if `no-new` is enabled
  void new Notification(title, { body });
}

// ---- Capacitor Local Notifications (typed) ----
interface CapacitorLocalNotifications {
  requestPermissions(): Promise<{ display?: 'granted' | 'denied'; granted?: boolean }>;
  schedule(opts: {
    notifications: Array<{
      id: number;
      title: string;
      body?: string;
      schedule?: { at?: Date };
    }>;
  }): Promise<unknown>;
}

interface CapacitorPlugins { LocalNotifications?: CapacitorLocalNotifications }
interface CapacitorGlobal { Plugins?: CapacitorPlugins }

declare global {
  interface Window { Capacitor?: CapacitorGlobal }
}

export async function nativeNotify(opts: NotifyOptions): Promise<void> {
  const cap = window.Capacitor?.Plugins?.LocalNotifications;
  if (!cap) return webNotify(opts);

  try {
    const res = await cap.requestPermissions();
    const granted = res.display === 'granted' || res.granted === true;
    if (!granted) return webNotify(opts);

    const id = Math.floor(Math.random() * 1e9);
    await cap.schedule({
      notifications: [{
        id,
        title: opts.title,
        body: opts.body ?? '',
        schedule: { at: new Date(Date.now() + 250) }
      }]
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('nativeNotify() failed → fallback to web', err);
    webNotify(opts);
  }
}
