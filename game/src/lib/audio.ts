/** WebAudio wrapper (GDD §7). Tiny synth cues + looping background music. */

/** Music track lives in public/ (served next to index.html) rather than inlined:
 *  a 1.3 MB base64 blob in the JS would choke the release obfuscator. */
const musicUrl = import.meta.env.BASE_URL + 'music.mp3';

let ctx: AudioContext | null = null;
/** User's Sound setting (GDD §5.3). */
let userEnabled = true;
/** Platform-requested audio gate (Bridge AUDIO_STATE_CHANGED); overrides the user setting. */
let platformAudioAllowed = true;

/* ---- background music (looping, separate from the SFX synth) ---- */
let musicEl: HTMLAudioElement | null = null;
/** User's Music setting — independent of the Sound (SFX) toggle. */
let musicUserEnabled = true;

/** Music plays only when the user has it on AND the platform allows audio. */
function musicAudible(): boolean {
  return musicUserEnabled && platformAudioAllowed;
}

function ensureMusic(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  if (!musicEl) {
    musicEl = new Audio(musicUrl);
    musicEl.loop = true;
    musicEl.volume = 0.1; // soft background bed — deliberately low (≈1/3 of the initial 0.3)
    musicEl.preload = 'auto';
  }
  return musicEl;
}

/** Reconcile playback with the current settings. play() may reject until the
 *  first user gesture (autoplay policy) — that's fine, startMusic() retries. */
function applyMusic(): void {
  const m = ensureMusic();
  if (!m) return;
  if (musicAudible()) void m.play().catch(() => {});
  else m.pause();
}

/** Toggle background music (bound to the Music setting). */
export function setMusicEnabled(v: boolean): void {
  musicUserEnabled = v;
  applyMusic();
}

/** Kick playback off from the first user gesture — browsers block audio until then. */
export function startMusic(): void {
  applyMusic();
}

/** Sound is audible only when the user has it on AND the platform allows audio. */
function audible(): boolean {
  return userEnabled && platformAudioAllowed;
}

export function setSoundEnabled(v: boolean): void {
  userEnabled = v;
}

/** Called by the Bridge platform handler when the host mutes/unmutes audio. */
export function setPlatformAudioAllowed(v: boolean): void {
  platformAudioAllowed = v;
  // Suspend/resume the audio context so already-scheduled tones go quiet too.
  if (ctx) {
    if (!v && ctx.state === 'running') void ctx.suspend();
    else if (v && ctx.state === 'suspended') void ctx.resume();
  }
  // Pause/resume the music with the same platform gate.
  applyMusic();
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended' && platformAudioAllowed) void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.08, when = 0): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A single pitch-gliding note — used for playful "mrrp" cat chirps. */
function glide(f0: number, f1: number, dur: number, type: OscillatorType, gain = 0.07, when = 0): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap(): void {
    if (audible()) tone(660, 0.06, 'triangle', 0.05);
  },
  commit(): void {
    if (!audible()) return;
    tone(520, 0.09, 'sine', 0.09);
    tone(780, 0.12, 'sine', 0.07, 0.06);
  },
  error(): void {
    if (!audible()) return;
    tone(180, 0.18, 'sawtooth', 0.06);
    tone(140, 0.22, 'sawtooth', 0.05, 0.08);
  },
  win(): void {
    if (!audible()) return;
    // joyful ascending C-major arpeggio, then a bright shimmer to finish
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.08));
    tone(1318.5, 0.3, 'sine', 0.06, 0.34); // E6
    tone(1567.98, 0.42, 'sine', 0.05, 0.4); // G6 sparkle
  },
  /** Happy cats bouncing on their cells — a rising trill of playful chirps. */
  cheer(): void {
    if (!audible()) return;
    glide(500, 900, 0.14, 'triangle', 0.06, 0);
    glide(650, 1100, 0.14, 'triangle', 0.06, 0.15);
    glide(820, 1320, 0.18, 'triangle', 0.055, 0.32);
  },
  lose(): void {
    if (!audible()) return;
    [330, 262, 196].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.12));
  }
};
