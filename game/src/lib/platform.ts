/**
 * Platform lifecycle wiring (Playgama Bridge, GDD §4/§7).
 *
 * Handles the required host integration beyond ads/storage:
 *   - read `platform.language` (captured for future localization; UI is English today)
 *   - universal AUDIO_STATE_CHANGED / PAUSE_STATE_CHANGED handlers — the Bridge-
 *     recommended single place to mute + pause for ANY reason (ads, tab switch,
 *     system pause), instead of reacting per ad type
 *   - send `game_ready` once the first playable frame is up
 *
 * Must run after `initBridge()` resolves.
 */
import { writable } from 'svelte/store';
import { getBridge } from './bridge';
import { setPlatformAudioAllowed } from './audio';

/** True while the host has paused the game (tab switch, system pause, ad, …). */
export const platformPaused = writable(false);
/** Player language reported by the host (ISO 639-1). English-only UI for now. */
export const platformLanguage = writable('en');

let started = false;

/** Attach platform handlers and announce readiness. Safe to call without Bridge. */
export function initPlatform(): void {
  if (started) return;
  started = true;

  const b = getBridge();
  if (!b?.platform) return;

  try {
    if (b.platform.language) platformLanguage.set(b.platform.language);
  } catch {
    /* ignore */
  }

  // Universal audio + pause handlers (Bridge best practice: handle once here).
  try {
    setPlatformAudioAllowed(b.platform.isAudioEnabled !== false);
    b.platform.on(b.EVENT_NAME.AUDIO_STATE_CHANGED, (enabled) =>
      setPlatformAudioAllowed(Boolean(enabled))
    );
    b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED, (paused) =>
      platformPaused.set(Boolean(paused))
    );
  } catch (error) {
    console.warn('[platform] failed to attach lifecycle handlers', error);
  }

  // First playable frame is ready — dismiss the platform loader.
  try {
    void b.platform.sendMessage('game_ready');
  } catch {
    /* ignore */
  }
}

/** Send a host lifecycle message (level_started/completed/failed/paused/resumed).
 *  Safe no-op on platforms that don't relay the message or when Bridge is absent. */
export function sendPlatformMessage(message: string): void {
  const b = getBridge();
  if (!b?.platform) return;
  try {
    void b.platform.sendMessage(message);
  } catch {
    /* ignore */
  }
}
