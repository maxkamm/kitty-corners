// Self-hosted fonts (GDD §6.3) — bundled woff2, no external CDN.
// Weights match the former Google Fonts request; latin subset only (English UI).
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles/global.css';
import { initBridge } from './lib/bridge';
import { initPlatform } from './lib/platform';
import { initAds } from './lib/ads';
import { initLeaderboard } from './lib/leaderboard';
import { storage } from './lib/storage';

/**
 * Boot sequence: initialize the Playgama Bridge SDK and load saved progress
 * before mounting. App (and its stores) is imported dynamically so that the
 * synchronous `storage.get(...)` calls made while stores initialize read the
 * already-hydrated cache. On hosts without Bridge, both steps resolve quickly.
 */
async function boot() {
  await initBridge();
  initAds(); // read ad capabilities now that Bridge is initialized
  initLeaderboard(); // read leaderboard flow (Р-43)
  await storage.hydrate();
  // Wire up persistence only now that the cache is hydrated, so the stores'
  // auto-save subscriptions don't overwrite saved progress/settings with their
  // initial default values (single-file bundles can't defer store init past
  // this point via dynamic import).
  const [{ initGamePersistence }, { initSettingsPersistence }] = await Promise.all([
    import('./lib/game'),
    import('./lib/settings')
  ]);
  initGamePersistence();
  initSettingsPersistence();
  const { default: App } = await import('./App.svelte');
  const app = new App({ target: document.getElementById('app')! });
  // First playable frame is mounted → announce readiness and wire host handlers.
  requestAnimationFrame(() => initPlatform());
  return app;
}

export default boot();
