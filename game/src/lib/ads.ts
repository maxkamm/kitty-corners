/**
 * Ads adapter (GDD §4): 100% ads via the Playgama Bridge SDK.
 *
 * Bridge's advertisement API is event-driven (fire `showInterstitial()` /
 * `showRewarded()`, then observe state-change events). This adapter wraps that
 * into the promise-based interface the game uses:
 *   - showInterstitial(): resolves when the ad closes/fails (or is skipped).
 *   - showRewarded(): resolves true only if the player earned the reward.
 *
 * On unsupported hosts (local dev) Bridge uses a mock platform: interstitials
 * resolve immediately and rewarded ads resolve false (no reward granted).
 */
import { writable } from 'svelte/store';
import { getBridge, type AdState, type Bridge } from './bridge';

export interface AdsAdapter {
  /** Interstitial on level boundaries; 180s minimum interval (GDD §4). */
  showInterstitial(): Promise<void>;
  /** Rewarded video; resolves true only if the reward was granted. */
  showRewarded(): Promise<boolean>;
}

/**
 * True while a full-screen ad is open. The hidden victory timer subscribes to
 * this to exclude ad time from "Your time" (QA KC-5).
 */
export const adActive = writable(false);

/** Whether rewarded ads work on this host. Rewarded-gated UI hides when false. */
export const rewardedSupported = writable(true);

/**
 * Transient, user-facing notice shown when a rewarded ad cannot be delivered
 * (platform unsupported or no ad fill) — so ad-gated buttons never silently
 * do nothing. Auto-clears; screens render it as a small toast.
 */
export const adNotice = writable<string | null>(null);
let adNoticeTimer: ReturnType<typeof setTimeout> | undefined;
function notifyAdUnavailable(): void {
  adNotice.set('No ad available right now — please try again in a moment.');
  clearTimeout(adNoticeTimer);
  adNoticeTimer = setTimeout(() => adNotice.set(null), 2600);
}

/**
 * Read ad capabilities from Bridge once it's initialized (call after initBridge()).
 * When Bridge is absent (local dev) the default stays `true` so ad-gated buttons
 * remain testable; on a real host the value reflects the platform.
 */
export function initAds(): void {
  const b = getBridge();
  if (b?.advertisement) rewardedSupported.set(Boolean(b.advertisement.isRewardedSupported));
}

/** GDD §4: minimum interval between interstitials. */
const MIN_INTERSTITIAL_DELAY_S = 180;
/**
 * If the ad never reaches `opened`/`loading`, treat the request as skipped
 * (cooldown) or unsupported and let the game continue. Kept short so a
 * cooldown-skipped interstitial doesn't stall the level transition; the
 * `loading` guard below still lets a genuinely-incoming ad open.
 */
const OPEN_TIMEOUT_MS = 700;

class BridgeAdsAdapter implements AdsAdapter {
  private listenersReady = false;

  private interstitialResolve: (() => void) | null = null;
  private rewardedResolve: ((granted: boolean) => void) | null = null;
  private rewardedGranted = false;
  /** Whether the current rewarded actually opened (distinguishes no-fill from user-close). */
  private rewardedOpened = false;

  /** Attach state listeners + apply config once, after Bridge is available. */
  private ensureListeners(b: Bridge): void {
    if (this.listenersReady) return;
    this.listenersReady = true;
    try {
      b.advertisement.setMinimumDelayBetweenInterstitial(MIN_INTERSTITIAL_DELAY_S);
    } catch {
      /* not fatal */
    }
    b.advertisement.on(b.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, (s) => this.onInterstitial(s));
    b.advertisement.on(b.EVENT_NAME.REWARDED_STATE_CHANGED, (s) => this.onRewarded(s));
  }

  private onInterstitial(state: AdState): void {
    if (state === 'opened') {
      adActive.set(true);
    } else if (state === 'closed' || state === 'failed') {
      adActive.set(false);
      this.settleInterstitial();
    }
  }

  private onRewarded(state: AdState): void {
    if (state === 'opened') {
      adActive.set(true);
      this.rewardedGranted = false;
      this.rewardedOpened = true;
    } else if (state === 'rewarded') {
      // Grant only in this state (Bridge docs). Settle on the following close/fail.
      this.rewardedGranted = true;
    } else if (state === 'closed' || state === 'failed') {
      adActive.set(false);
      this.settleRewarded();
    }
  }

  private settleInterstitial(): void {
    const resolve = this.interstitialResolve;
    this.interstitialResolve = null;
    resolve?.();
  }

  private settleRewarded(): void {
    const resolve = this.rewardedResolve;
    const granted = this.rewardedGranted;
    const shown = this.rewardedOpened;
    this.rewardedResolve = null;
    this.rewardedGranted = false;
    this.rewardedOpened = false;
    if (!resolve) return;
    // Ad never opened and nothing granted → it couldn't be shown (no fill / error).
    if (!shown && !granted) notifyAdUnavailable();
    resolve(granted);
  }

  showInterstitial(): Promise<void> {
    const b = getBridge();
    if (!b?.advertisement?.isInterstitialSupported) return Promise.resolve();
    this.ensureListeners(b);
    // Resolve any prior pending request to avoid a stuck promise.
    this.settleInterstitial();

    return new Promise<void>((resolve) => {
      this.interstitialResolve = resolve;
      b.advertisement.showInterstitial();
      // Skipped by cooldown or never opened → resolve so the game continues.
      // Keep waiting while the ad is still 'loading' (it is about to open) so we
      // don't advance the game and let the ad pop over the next level.
      setTimeout(() => {
        const state = b.advertisement.interstitialState;
        if (this.interstitialResolve === resolve && state !== 'opened' && state !== 'loading') {
          this.settleInterstitial();
        }
      }, OPEN_TIMEOUT_MS);
    });
  }

  showRewarded(): Promise<boolean> {
    const b = getBridge();
    if (!b?.advertisement?.isRewardedSupported) {
      notifyAdUnavailable();
      return Promise.resolve(false);
    }
    this.ensureListeners(b);
    // Resolve any prior pending request (no reward) before starting a new one.
    this.settleRewarded();

    return new Promise<boolean>((resolve) => {
      this.rewardedResolve = resolve;
      this.rewardedGranted = false;
      this.rewardedOpened = false;
      b.advertisement.showRewarded();
      // Never opened (unsupported / silently failed) → no reward.
      setTimeout(() => {
        const state = b.advertisement.rewardedState;
        if (
          this.rewardedResolve === resolve &&
          state !== 'opened' &&
          state !== 'loading' &&
          state !== 'rewarded'
        ) {
          this.settleRewarded();
        }
      }, OPEN_TIMEOUT_MS);
    });
  }
}

export const ads: AdsAdapter = new BridgeAdsAdapter();
