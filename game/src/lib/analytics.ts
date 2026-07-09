/** Analytics stub (GDD §7): no analytics in MVP, interface reserved. */
export interface AnalyticsAdapter {
  track(event: string, params?: Record<string, unknown>): void;
}

class NoopAnalytics implements AnalyticsAdapter {
  track(event: string, params?: Record<string, unknown>): void {
    if (import.meta.env.DEV) console.debug('[analytics]', event, params ?? {});
  }
}

export const analytics: AnalyticsAdapter = new NoopAnalytics();
