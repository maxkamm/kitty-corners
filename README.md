# Kitty Corners

A cozy logic puzzle: place one cat per row, column and colored region so that no
two cats touch (including diagonally). Built for the Playgama web platform.

## Structure

- `game/` — the app (Svelte 4 + TypeScript + Vite)
  - `src/lib/` — game state machine, rules, solver, storage/ads/audio adapters
  - `src/screens/`, `src/components/` — UI
  - `src/data/levels.json` — the 90-level pool (generated & validated)
  - `tools/generate-levels.ts` — level generator
  - `tests/` — solver/level validation + `game.ts` unit tests
- `gdd-kitty-corners.md` — game design document
- `bug-report.md` — QA report

## Develop

```bash
cd game
npm install
npm run dev        # local dev server
npm run check      # svelte-check (type + a11y)
npm test           # solver + game.ts unit tests
npm run build      # production bundle → game/dist
```

## Notes

- Fonts (Baloo 2, Nunito) are self-hosted via `@fontsource` and bundled — no CDN.
- `game/dist/` and `node_modules/` are build artifacts and are git-ignored.
- Playgama Bridge SDK is fully wired: ads (`ads.ts`), storage (`storage.ts`), and platform
  lifecycle (`platform.ts`: `game_ready`, language, universal PAUSE/AUDIO mute+pause,
  `level_*` messages). Init/boot in `src/main.ts`; SDK loads from CDN in `index.html` and
  uses a mock platform in local dev.
- `public/playgama-bridge-config.json` was generated with the official
  [config editor](https://playgama.github.io/bridge-config-editor/) for a Playgama launch
  (interstitial + rewarded preload, 180s min interstitial interval, built-in error popup).
  To publish on other platforms (GameDistribution, Y8, Telegram, …), re-open the editor,
  add those platforms with their real IDs, and replace this file.
