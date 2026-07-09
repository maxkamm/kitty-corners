/** Vibration wrapper. Toggle lives in settings. */
let enabled = false;

export function setVibrationEnabled(v: boolean): void {
  enabled = v;
}

export function vibrate(pattern: number | number[]): void {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported — ignore */
  }
}
