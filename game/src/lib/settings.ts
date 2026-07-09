/** User settings (GDD §5.3), persisted. Pattern marks render is post-MVP (§8) — toggle stored only. */
import { writable } from 'svelte/store';
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
