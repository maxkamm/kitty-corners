/**
 * Tests for the leaderboard adapter (src/lib/leaderboard.ts) and its win-flow
 * integration: a mock Bridge with a `leaderboards` module is installed before
 * the game imports, then a real level is solved and the submitted score is
 * asserted to equal the cumulative totalScore.
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/leaderboard.test.ts
 */
import { get } from 'svelte/store';
import type { LevelDef } from '../src/lib/types.ts';

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}
function eq(name: string, got: unknown, want: unknown): void {
  check(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`, got === want);
}

// ---- browser env stubs (before any game import) ----
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
};
(globalThis as any).window = {
  matchMedia: () => ({ matches: true }) // reduced motion → synchronous flows
};

// ---- mock Bridge with an in_game leaderboards module ----
const setScoreCalls: { id: string; score: number }[] = [];
(globalThis as any).bridge = {
  initialize: async () => {},
  EVENT_NAME: {},
  advertisement: undefined,
  storage: undefined, // storage adapter falls back to localStorage
  platform: { language: 'en', id: 'test', isAudioEnabled: true, sendMessage: () => {}, on: () => {} },
  leaderboards: {
    type: 'in_game',
    setScore: async (id: string, score: number) => {
      setScoreCalls.push({ id, score });
    },
    getEntries: async () => [
      { id: 'p1', name: 'Alice', photo: '', score: '500', rank: '1' },
      { id: 'p2', name: '', photo: '', score: 100, rank: 2 }
    ],
    showNativePopup: async () => {}
  }
};

const lb = await import('../src/lib/leaderboard.ts');
const game = await import('../src/lib/game.ts');
const { analytics } = await import('../src/lib/analytics.ts');
(analytics as any).track = () => {};
game.tutorialDone.set(true);

// ---- adapter: init reads the bridge flow ----
lb.initLeaderboard();
eq('type read from bridge', get(lb.leaderboardType), 'in_game');

// ---- adapter: getEntries normalizes types and fills blanks ----
{
  const entries = (await lb.getEntries(0))!;
  eq('entries count', entries.length, 2);
  eq('string score coerced', entries[0].score, 500);
  eq('string rank coerced', entries[0].rank, 1);
  eq('blank name filled', entries[1].name, 'Player');
}

// ---- integration: winning a level submits the cumulative total ----
{
  game.levelNumber.set(1);
  game.totalScore.set(0);
  game.startGame();
  const level: LevelDef = get(game.currentLevel);
  const solutionIdx = level.solution.map((s) => game.idx(level, s.row, s.col));
  for (const i of solutionIdx) {
    if (get(game.cells)[i] !== 'cat') game.commitCat(i);
  }
  eq('level won', get(game.screen), 'victory');
  check('score credited', get(game.winScore) > 0);
  // submitScore is async fire-and-forget — let the microtask run
  await new Promise((r) => setTimeout(r, 0));
  eq('one submission per win', setScoreCalls.length, 1);
  eq('submitted to the configured board', setScoreCalls[0].id, lb.LEADERBOARD_ID);
  eq('submitted value = cumulative total', setScoreCalls[0].score, get(game.totalScore));
}

// ---- adapter: not_available is a hard no-op ----
{
  (globalThis as any).bridge.leaderboards.type = 'not_available';
  const before = setScoreCalls.length;
  await lb.submitScore(999);
  eq('no submission when not_available', setScoreCalls.length, before);
  const entries = await lb.getEntries(0);
  eq('no entries when not_available', entries, null);
}

// ---- report ----
if (failures.length) {
  console.error(`FAIL: ${failures.length} of ${passed + failures.length}`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`leaderboard.test.ts: all ${passed} checks passed`);
