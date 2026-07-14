/**
 * Unit tests for the game state machine (src/lib/game.ts).
 * Zero-dependency harness (matches tests/solver.test.ts).
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/game.test.ts
 *
 * Browser globals are stubbed BEFORE game.ts is dynamically imported:
 *  - matchMedia => prefers-reduced-motion, so loadLevel/onWin take the synchronous
 *    (no-animation) path and state can be asserted immediately;
 *  - an in-memory localStorage so persistence is observable;
 *  - analytics/ads are neutered after import (no import.meta.env, no fake-ad timers).
 */
import type { LevelDef, CellState } from '../src/lib/types.ts';

// ---- tiny assert harness ----
let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}
function eq(name: string, got: unknown, want: unknown): void {
  check(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`, got === want);
}

// ---- browser env stubs (must exist before importing game.ts) ----
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
};
(globalThis as any).window = {
  matchMedia: () => ({ matches: true }) // force reduced-motion (synchronous flows)
};

// ---- import module under test + collaborators (singletons) ----
const game = await import('../src/lib/game.ts');
// boot() wires up progress persistence after storage.hydrate(); do the same here
// so the auto-save subscriptions are attached (they no longer run at import time).
game.initGamePersistence();
// These tests exercise the real level flow; mark the first-run tutorial as done
// so startGame() goes straight to the level (the tutorial has its own tests).
game.tutorialDone.set(true);
const { analytics } = await import('../src/lib/analytics.ts');
const { ads } = await import('../src/lib/ads.ts');
import { get } from 'svelte/store';
import levelsData from '../src/data/levels.json';

// neutralize side effects
(analytics as any).track = () => {};
(ads as any).showRewarded = async () => true;
(ads as any).showInterstitial = async () => {};

const {
  violates, idx, currentLevel, activeLevel, activeLevelNumber,
  levelNumber, streak, bestStreak, screen, hearts, cells, autocatUsed,
  errorCells, winLevel, winStreak, winTime, givenCells,
  startGame, loadLevel, tapCell, commitCat, useAutocat,
  restartAfterDefeat, quitAfterDefeat, nextLevel, skipLevelWithAd,
  AUTO_X_UNTIL_LEVEL
} = game;

// on-disk levels (compact regions) → the parsed count/order matches game.ts
const rawLevels = (levelsData as { levels: (Omit<LevelDef, 'regions'> & { regions: string[] | string[][] })[] }).levels;
const TOTAL = rawLevels.length;

// ============================================================
// 1) Rule engine: violates()
// ============================================================
{
  const L = {
    id: 0, size: 4,
    regions: [
      ['a', 'b', 'b', 'c'],
      ['b', 'b', 'c', 'c'],
      ['d', 'd', 'c', 'c'],
      ['d', 'd', 'c', 'a'] // 'a' at (0,0) and (3,3): far apart, isolates the region rule
    ],
    solution: [], colors: {}
  } as unknown as LevelDef;
  const empty = new Array(16).fill('empty') as CellState[];
  const withCat = empty.slice();
  withCat[0] = 'cat'; // cat at (0,0)

  check('violates: same row', violates(L, withCat, 0, 2) === true);
  check('violates: same column', violates(L, withCat, 2, 0) === true);
  check('violates: adjacency (diagonal touch)', violates(L, withCat, 1, 1) === true);
  check('violates: same region far apart', violates(L, withCat, 3, 3) === true);
  check('violates: no conflict', violates(L, withCat, 2, 2) === false);
  check('violates: ignores the cell itself', violates(L, withCat, 0, 0) === false);
}

// ============================================================
// 2) Difficulty curve / endless loop: currentLevel via levelNumber
// ============================================================
{
  const half = Math.floor(TOTAL / 2);
  const expectIdx = (n: number) => (n <= TOTAL ? n - 1 : half + ((n - TOTAL - 1) % (TOTAL - half)));
  levelNumber.set(1);
  eq('currentLevel: level 1 → first', get(currentLevel).id, rawLevels[expectIdx(1)].id);
  levelNumber.set(TOTAL);
  eq('currentLevel: last pool level', get(currentLevel).id, rawLevels[expectIdx(TOTAL)].id);
  levelNumber.set(TOTAL + 1);
  eq('currentLevel: loop wraps to harder half', get(currentLevel).id, rawLevels[half].id);
  levelNumber.set(TOTAL + (TOTAL - half) + 1);
  eq('currentLevel: loop period', get(currentLevel).id, rawLevels[half].id);
}

// ============================================================
// 3) loadLevel: givens, hearts, auto-X falloff (Р-38)
// ============================================================
{
  levelNumber.set(1); // ≤ AUTO_X_UNTIL_LEVEL
  startGame();
  eq('loadLevel: screen is game', get(screen), 'game');
  eq('loadLevel: hearts full', get(hearts), 3);
  eq('loadLevel: not autocatUsed', get(autocatUsed), false);
  eq('loadLevel: one given', get(givenCells).length, 1);
  const gi = get(givenCells)[0];
  eq('loadLevel: given cell is a cat', get(cells)[gi], 'cat');
  check('loadLevel: activeLevel snapshot set', get(activeLevel).id === get(currentLevel).id);
  eq('loadLevel: activeLevelNumber snapshot', get(activeLevelNumber), 1);
  check('auto-X present on early level', get(cells).some((c) => c === 'x'));

  levelNumber.set(AUTO_X_UNTIL_LEVEL + 1); // > falloff
  loadLevel();
  check('no auto-X after falloff level', !get(cells).some((c) => c === 'x'));
}

// ============================================================
// 4) commitCat: heart loss on illegal move, defeat at 0 hearts
// ============================================================
{
  levelNumber.set(1);
  startGame();
  const gi = get(givenCells)[0];
  const size = get(currentLevel).size;
  const gr = Math.floor(gi / size);
  // an empty-able cell in the given's row (illegal: shares the row with the given cat)
  let bad = -1;
  for (let c = 0; c < size; c++) {
    const i = gr * size + c;
    if (i !== gi) { bad = i; break; }
  }
  const before = get(hearts);
  commitCat(bad);
  eq('commitCat illegal: heart lost', get(hearts), before - 1);
  check('commitCat illegal: no cat placed', get(cells)[bad] !== 'cat');
  check('commitCat illegal: error flash set', get(errorCells).includes(bad));

  commitCat(bad);
  commitCat(bad); // 3rd illegal → 0 hearts
  eq('commitCat: hearts drained to 0', get(hearts), 0);
  eq('commitCat: defeat screen', get(screen), 'defeat');
}

// ============================================================
// 4b) commitCat: a locally-legal but non-solution commit also costs a heart
//     (every cat has exactly one legal cell = its solution cell).
// ============================================================
{
  levelNumber.set(1);
  startGame();
  const level = get(currentLevel);
  const size = level.size;
  const solutionIdx = new Set(level.solution.map((s) => idx(level, s.row, s.col)));
  const board = get(cells);
  // find a non-solution cell that does NOT conflict with any placed cat
  // (under the old rules this commit was allowed with no penalty — the KC-4 dead-end trap)
  let tricky = -1;
  for (let i = 0; i < board.length; i++) {
    if (solutionIdx.has(i) || board[i] === 'cat') continue;
    const r = Math.floor(i / size);
    const c = i % size;
    if (!violates(level, board, r, c)) { tricky = i; break; }
  }
  check('commit non-solution: found a legal-but-wrong cell', tricky >= 0);
  const before = get(hearts);
  commitCat(tricky);
  eq('commit non-solution: heart lost', get(hearts), before - 1);
  check('commit non-solution: no cat placed', get(cells)[tricky] !== 'cat');
  check('commit non-solution: error flash set', get(errorCells).includes(tricky));
}

// ============================================================
// 5) Win flow (KC-3 progress-at-win + activeLevel snapshot regression fix)
// ============================================================
{
  levelNumber.set(1);
  streak.set(0);
  bestStreak.set(0);
  startGame();
  const level = get(currentLevel);
  const startLevelId = level.id;
  for (const s of level.solution) commitCat(idx(level, s.row, s.col));

  eq('win: victory screen', get(screen), 'victory');
  eq('win: streak incremented', get(streak), 1);
  eq('win: bestStreak tracks', get(bestStreak), 1);
  eq('win: winLevel captured (pre-increment)', get(winLevel), 1);
  eq('win: winStreak captured', get(winStreak), 1);
  eq('win: levelNumber advanced', get(levelNumber), 2);
  eq('win: activeLevelNumber stays on solved level (regression fix)', get(activeLevelNumber), 1);
  eq('win: activeLevel stays on solved board (regression fix)', get(activeLevel).id, startLevelId);
  check('win: hidden timer recorded', get(winTime) >= 1);
}

// ============================================================
// 6) nextLevel syncs the snapshot to the advanced level
// ============================================================
{
  // continuing from the win above: levelNumber === 2, activeLevelNumber === 1
  await nextLevel();
  eq('nextLevel: screen game', get(screen), 'game');
  eq('nextLevel: activeLevelNumber synced', get(activeLevelNumber), get(levelNumber));
}

// ============================================================
// 7) tapCell: toggle X, remove own cat, respect locked givens
// ============================================================
{
  levelNumber.set(1);
  startGame();
  const empty = get(cells).findIndex((c) => c === 'empty');
  tapCell(empty);
  eq('tapCell: empty → x', get(cells)[empty], 'x');
  tapCell(empty);
  eq('tapCell: x → empty', get(cells)[empty], 'empty');

  const gi = get(givenCells)[0];
  tapCell(gi);
  eq('tapCell: given cat not removable', get(cells)[gi], 'cat');
}

// ============================================================
// 8) Autocat (KC-4): removes contradicting player cats, then places a solution cat
// ============================================================
{
  levelNumber.set(1);
  startGame();
  const level = get(currentLevel);
  const solutionIdx = new Set(level.solution.map((s) => idx(level, s.row, s.col)));
  const board = new Array(level.size * level.size).fill('empty') as CellState[];
  const gi = get(givenCells)[0];
  board[gi] = 'cat';
  // a wrong cat: any non-solution cell
  const wrong = board.findIndex((_, i) => !solutionIdx.has(i));
  board[wrong] = 'cat';
  cells.set(board);
  autocatUsed.set(false);

  const catsBefore = get(cells).filter((c) => c === 'cat').length;
  await useAutocat();
  eq('autocat: wrong cat removed', get(cells)[wrong], 'empty');
  eq('autocat: marked used', get(autocatUsed), true);
  check('autocat: error flash on removed cat', get(errorCells).includes(wrong));
  const solCats = get(cells).filter((c, i) => c === 'cat' && solutionIdx.has(i)).length;
  check('autocat: a solution cat is placed', solCats >= 2); // given + autocat pick
  check('autocat: board has no more cats than before (swap not add)', get(cells).filter((c) => c === 'cat').length <= catsBefore);
}

// ============================================================
// 9) Streak resets on defeat actions
// ============================================================
{
  streak.set(7);
  restartAfterDefeat();
  eq('restartAfterDefeat: streak reset', get(streak), 0);
  eq('restartAfterDefeat: back in game', get(screen), 'game');

  streak.set(5);
  quitAfterDefeat();
  eq('quitAfterDefeat: streak reset', get(streak), 0);
  eq('quitAfterDefeat: back to menu', get(screen), 'main');
}

// ============================================================
// 10) skipLevelWithAd: advances level, preserves (does not extend) streak
// ============================================================
{
  levelNumber.set(3);
  streak.set(4);
  screen.set('defeat');
  const ok = await skipLevelWithAd();
  check('skipLevelWithAd: resolved true', ok === true);
  eq('skipLevelWithAd: level advanced', get(levelNumber), 4);
  eq('skipLevelWithAd: streak preserved', get(streak), 4);
  eq('skipLevelWithAd: back in game', get(screen), 'game');
}

// ============================================================
// 11) Persistence: level/streak written through storage
// ============================================================
{
  levelNumber.set(42);
  streak.set(9);
  eq('persist: kc.level written', store.get('kc.level'), '42');
  eq('persist: kc.streak written', store.get('kc.streak'), '9');
}

// ---- report ----
if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`game.ts: all ${passed} assertions pass`);
