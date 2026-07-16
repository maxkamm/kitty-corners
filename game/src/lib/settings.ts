/** User settings (GDD §5.3), persisted. Pattern marks render is post-MVP (§8) — toggle stored only. */
import { writable } from 'svelte/store';
import { storage } from './storage';
import { setSoundEnabled, setMusicEnabled } from './audio';
import { setVibrationEnabled } from './haptics';

export const soundOn = writable<boolean>(storage.get('sound', true));
export const vibrationOn = writable<boolean>(storage.get('vibration', false));
export const patternMarksOn = writable<boolean>(storage.get('patternMarks', false));
/** Background music setting — independent of Sound (SFX). */
export const musicOn = writable<boolean>(storage.get('music', true));

/**
 * Wire up settings persistence. Called once from boot() AFTER storage.hydrate()
 * resolves, for the same reason as initGamePersistence(): re-apply the hydrated
 * values and only then attach the auto-save subscriptions, so the initial
 * defaults don't overwrite saved settings before hydrate() runs.
 */
export function initSettingsPersistence(): void {
  soundOn.set(storage.get('sound', true));
  vibrationOn.set(storage.get('vibration', false));
  patternMarksOn.set(storage.get('patternMarks', false));
  musicOn.set(storage.get('music', true));

  soundOn.subscribe((v) => {
    storage.set('sound', v);
    setSoundEnabled(v);
  });
  vibrationOn.subscribe((v) => {
    storage.set('vibration', v);
    setVibrationEnabled(v);
  });
  patternMarksOn.subscribe((v) => storage.set('patternMarks', v));
  musicOn.subscribe((v) => {
    storage.set('music', v);
    setMusicEnabled(v);
  });
}

/**
 * Theme is locked to light for now — dark theme is temporarily disabled and its
 * toggle is hidden from Settings. Device colour-scheme is intentionally ignored;
 * the app always starts (and stays) light.
 */
export const darkMode = writable<boolean>(false);
