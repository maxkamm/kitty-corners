/**
 * Playgama Bridge SDK access layer.
 *
 * The Bridge script is loaded from CDN in index.html and exposes a global
 * `bridge` object. On unsupported hosts (including local `npm run dev`) Bridge
 * transparently uses a mock platform that returns safe defaults instead of
 * throwing, so the same code runs everywhere.
 *
 * This module only wraps *access + initialization*. Ads and storage live in
 * `ads.ts` / `storage.ts`; the broader lifecycle wiring (game_ready, language,
 * the universal PAUSE/AUDIO handlers, config) is a separate release pass.
 */

export type AdState = 'loading' | 'opened' | 'closed' | 'rewarded' | 'failed';

interface BridgeAdvertisement {
  isInterstitialSupported: boolean;
  isRewardedSupported: boolean;
  interstitialState: AdState;
  rewardedState: AdState;
  minimumDelayBetweenInterstitial: number;
  setMinimumDelayBetweenInterstitial(seconds: number): void;
  showInterstitial(placement?: string): void;
  showRewarded(placement?: string): void;
  on(event: string, cb: (state: AdState) => void): void;
}

interface BridgeStorage {
  defaultType: string;
  isAvailable(type: string): boolean;
  get(keys: string | string[]): Promise<unknown>;
  set(keys: string | string[], values: unknown | unknown[]): Promise<void>;
  delete(keys: string | string[]): Promise<void>;
}

interface BridgePlatform {
  language: string;
  id: string;
  isAudioEnabled: boolean;
  sendMessage(message: string): Promise<void> | void;
  on(event: string, cb: (value: unknown) => void): void;
}

export interface Bridge {
  initialize(): Promise<void>;
  EVENT_NAME: Record<string, string>;
  advertisement: BridgeAdvertisement;
  storage: BridgeStorage;
  platform: BridgePlatform;
}

declare global {
  // The CDN script assigns a global `bridge`.
  // eslint-disable-next-line no-var
  var bridge: Bridge | undefined;
}

/** Returns the global Bridge instance, or undefined if the script did not load. */
export function getBridge(): Bridge | undefined {
  return typeof bridge !== 'undefined' ? bridge : undefined;
}

let initPromise: Promise<void> | null = null;

/**
 * Initialize the Bridge SDK exactly once. Must complete before any other
 * `bridge.*` call (storage, advertisement). Safe to call when the script is
 * absent — resolves immediately so local dev keeps working.
 */
export function initBridge(): Promise<void> {
  if (initPromise) return initPromise;
  const b = getBridge();
  if (!b) {
    initPromise = Promise.resolve();
    return initPromise;
  }
  initPromise = b.initialize().catch((error) => {
    console.warn('[bridge] initialize failed, running without platform features', error);
  });
  return initPromise;
}
