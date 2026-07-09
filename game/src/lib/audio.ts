/** WebAudio wrapper (GDD §7). Tiny synth cues, no assets. */
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean): void {
  enabled = v;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
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

export const sfx = {
  tap(): void {
    if (enabled) tone(660, 0.06, 'triangle', 0.05);
  },
  commit(): void {
    if (!enabled) return;
    tone(520, 0.09, 'sine', 0.09);
    tone(780, 0.12, 'sine', 0.07, 0.06);
  },
  error(): void {
    if (!enabled) return;
    tone(180, 0.18, 'sawtooth', 0.06);
    tone(140, 0.22, 'sawtooth', 0.05, 0.08);
  },
  win(): void {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.08, i * 0.09));
  },
  lose(): void {
    if (!enabled) return;
    [330, 262, 196].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.12));
  }
};
