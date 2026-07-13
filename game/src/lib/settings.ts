/** User settings (GDD §5.3), persisted. Pattern marks render is post-MVP (§8) — toggle stored only. */
import { writable, get } from 'svelte/store';
import { storage } from './storage';
import { setSoundEnabled } from './audio';
import { setVibrationEnabled } from './haptics';

export const soundOn = writable<boolean>(storage.get('sound', true));
export const vibrationOn = writable<boolean>(storage.get('vibration', false));
export const patternMarksOn = writable<boolean>(storage.get('patternMarks', false));

soundOn.subscribe((v) => {
  storage.set('sound', v);
  setSoundEnabled(v);
});
vibrationOn.subscribe((v) => {
  storage.set('vibration', v);
  setVibrationEnabled(v);
});
patternMarksOn.subscribe((v) => storage.set('patternMarks', v));

/** Theme: follows the system until the player flips the toggle, then sticks. */
export type ThemePref = 'auto' | 'light' | 'dark';
const mq =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

export const themePref = writable<ThemePref>(storage.get('theme', 'auto'));
themePref.subscribe((v) => storage.set('theme', v));

/** Effective theme, resolved against the system preference. */
export const darkMode = writable<boolean>(false);
function recomputeDark(): void {
  const p = get(themePref);
  darkMode.set(p === 'auto' ? !!mq?.matches : p === 'dark');
}
themePref.subscribe(recomputeDark);
mq?.addEventListener?.('change', recomputeDark);

export function toggleDarkTheme(): void {
  themePref.set(get(darkMode) ? 'light' : 'dark');
}
