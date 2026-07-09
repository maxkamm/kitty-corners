/**
 * Ads adapter (GDD §4): 100% ads via Playgama Bridge SDK.
 * Dev build uses a stub that simulates an ad with a short fake overlay.
 * Release: implement BridgeAdsAdapter over Playgama Bridge, keep this interface.
 */
import { writable } from 'svelte/store';

export interface AdsAdapter {
  /** Interstitial on level boundaries; 180s show timeout between calls. */
  showInterstitial(): Promise<void>;
  /** Rewarded video; resolves true if reward granted. */
  showRewarded(): Promise<boolean>;
}

/** Fake-ad overlay state for the dev stub (rendered by AdStubOverlay.svelte). */
export const fakeAdVisible = writable(false);

const INTERSTITIAL_COOLDOWN_MS = 180_000;

class DevStubAds implements AdsAdapter {
  private lastInterstitial = 0;

  private playFake(durationMs: number): Promise<void> {
    fakeAdVisible.set(true);
    return new Promise((resolve) =>
      setTimeout(() => {
        fakeAdVisible.set(false);
        resolve();
      }, durationMs)
    );
  }

  async showInterstitial(): Promise<void> {
    const now = Date.now();
    if (now - this.lastInterstitial < INTERSTITIAL_COOLDOWN_MS) return;
    this.lastInterstitial = now;
    await this.playFake(1200);
  }

  async showRewarded(): Promise<boolean> {
    await this.playFake(1500);
    return true;
  }
}

export const ads: AdsAdapter = new DevStubAds();
