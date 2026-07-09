/**
 * Game state & rules (GDD §2–3, §5).
 * Svelte stores; persistence via storage abstraction.
 */
import { writable, derived, get } from 'svelte/store';
import type { LevelDef, CellState, Screen, SolverStep } from './types';
import { storage } from './storage';
import { ads, fakeAdVisible } from './ads';
import { analytics } from './analytics';
import { sfx } from './audio';
import { vibrate } from './haptics';
import { solveWithLog } from './solver';
import levelsData from '../data/levels.json';

/** On-disk format stores each region row as a compact string ("aabbbc"). */
interface RawLevel extends Omit<LevelDef, 'regions'> {
  regions: string[] | string[][];
}

const LEVELS: LevelDef[] = (levelsData as { levels: RawLevel[] }).levels.map((l) => ({
  ...l,
  regions: l.regions.map((row) => (typeof row === 'string' ? row.split('') : row))
}));

export const HEARTS_MAX = 3;

// ---------- persisted ----------
export const levelNumber = writable<number>(storage.get('level', 1));
export const streak = writable<number>(storage.get('streak', 0));
export const bestStreak = writable<number>(storage.get('bestStreak', 0));

levelNumber.subscribe((v) => storage.set('level', v));
streak.subscribe((v) => storage.set('streak', v));
bestStreak.subscribe((v) => storage.set('bestStreak', v));

// ---------- session ----------
export const screen = writable<Screen>('main');
export const settingsOpen = writable(false);
export const hearts = writable(HEARTS_MAX);
export const cells = writable<CellState[]>([]);
export const autocatUsed = writable(false);
/** cell indices flashing as error */
export const errorCells = writable<number[]>([]);
/** cell indices highlighted by hint */
export const hintCells = writable<number[]>([]);
/** victory time, seconds */
export const winTime = writable(0);
/** board celebration in progress (joy wave before the Victory screen) */
export const celebrating = writable(false);
/** input lock during outcome transitions (celebration / last-heart burn) */
let inputLocked = false;
/** pre-placed (non-removable) cats of the current level (Р-36) */
export const givenCells = writable<number[]>([]);
/** primary given index while the level intro plays (cat pop + X wave), or -1 */
export const introOrigin = writable(-1);
/** streak value captured for the victory card (after +1) */
export const winStreak = writable(0);
/** level number captured for the victory title (KC-3: levelNumber increments at win) */
export const winLevel = writable(0);

/**
 * Hidden active-play timer (KC-5): excludes the intro, settings pause,
 * ad overlays and the defeat screen. GDD §5.2: measured silently, shown on victory.
 */
let activeMs = 0;
let runningSince: number | null = null;

function pauseTimer(): void {
  if (runningSince !== null) {
    activeMs += Date.now() - runningSince;
    runningSince = null;
  }
}

function resumeTimer(): void {
  if (
    runningSince === null &&
    get(screen) === 'game' &&
    !get(settingsOpen) &&
    !get(fakeAdVisible) &&
    !inputLocked
  ) {
    runningSince = Date.now();
  }
}

function activeSeconds(): number {
  return Math.max(
    1,
    Math.round((activeMs + (runningSince !== null ? Date.now() - runningSince : 0)) / 1000)
  );
}

settingsOpen.subscribe((v) => (v ? pauseTimer() : resumeTimer()));
fakeAdVisible.subscribe((v) => (v ? pauseTimer() : resumeTimer()));
screen.subscribe((v) => (v === 'game' ? resumeTimer() : pauseTimer()));

let solverLog: SolverStep[] | null = null;
/** Indices of the current level's unique-solution cats (commit target check). */
let solutionSet = new Set<number>();
let errorTimer: ReturnType<typeof setTimeout> | undefined;
let hintTimer: ReturnType<typeof setTimeout> | undefined;
let outcomeTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Difficulty curve (Р-38): levels 1..N walk the pool in curve order;
 * beyond the pool the game loops over the harder half forever.
 */
function levelIndexFor(n: number): number {
  const total = LEVELS.length;
  if (n <= total) return n - 1;
  const half = Math.floor(total / 2);
  return half + ((n - total - 1) % (total - half));
}

/** Assistance falloff (Р-38): auto-X marks from the given cat only on early levels. */
export const AUTO_X_UNTIL_LEVEL = 20;

export const currentLevel = derived(levelNumber, ($n): LevelDef => LEVELS[levelIndexFor($n)]);

/**
 * Snapshot of the level shown on the board and its player-facing number.
 * `levelNumber` (and thus `currentLevel`) advances at the moment of victory (KC-3),
 * so these frozen copies keep the celebration wave — and the header — rendering the
 * board the player just solved instead of the upcoming (differently sized) level.
 */
export const activeLevel = writable<LevelDef>(LEVELS[levelIndexFor(get(levelNumber))]);
export const activeLevelNumber = writable<number>(get(levelNumber));

export function idx(level: LevelDef, r: number, c: number): number {
  return r * level.size + c;
}

// ---------- rules ----------
/** Returns true if a cat at (r,c) violates any of the three rules vs current cats. */
export function violates(level: LevelDef, board: CellState[], r: number, c: number): boolean {
  const n = level.size;
  for (let rr = 0; rr < n; rr++) {
    for (let cc = 0; cc < n; cc++) {
      if (board[idx(level, rr, cc)] !== 'cat') continue;
      if (rr === r && cc === c) continue;
      if (rr === r || cc === c) return true; // 1 cat per row/column
      if (level.regions[rr][cc] === level.regions[r][c]) return true; // 1 cat per color
      if (Math.abs(rr - r) <= 1 && Math.abs(cc - c) <= 1) return true; // cats cannot touch
    }
  }
  return false;
}

/** Cells eliminated by a cat at (r,c): its row, column, region and 8 neighbours. */
function cellsEliminatedBy(level: LevelDef, r: number, c: number): number[] {
  const n = level.size;
  const out: number[] = [];
  for (let rr = 0; rr < n; rr++) {
    for (let cc = 0; cc < n; cc++) {
      if (rr === r && cc === c) continue;
      if (
        rr === r ||
        cc === c ||
        level.regions[rr][cc] === level.regions[r][c] ||
        (Math.abs(rr - r) <= 1 && Math.abs(cc - c) <= 1)
      ) {
        out.push(idx(level, rr, cc));
      }
    }
  }
  return out;
}

/**
 * Auto-pick the given: the cat of the smallest or second-smallest region
 * (alternating by level id for variety). Tiny regions are the most constrained —
 * giving them away keeps the interesting deductions for the player.
 */
function pickGivens(level: LevelDef): { row: number; col: number }[] {
  if (level.givens?.length) return level.givens;
  const sizes = new Map<string, number>();
  for (const row of level.regions) {
    for (const id of row) sizes.set(id, (sizes.get(id) ?? 0) + 1);
  }
  const ranked = level.solution
    .slice()
    .sort(
      (a, b) =>
        sizes.get(level.regions[a.row][a.col])! - sizes.get(level.regions[b.row][b.col])!
    );
  const pick = Math.min(level.id % 2, ranked.length - 1); // smallest / second-smallest
  return [ranked[pick]];
}

function isSolved(level: LevelDef, board: CellState[]): boolean {
  const n = level.size;
  let count = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[idx(level, r, c)] !== 'cat') continue;
      count++;
      if (violates(level, board, r, c)) return false;
    }
  }
  return count === n;
}

// ---------- level lifecycle ----------
/** Level intro (Р-36): given cat pops in, then X marks ripple out from it. */
const INTRO_MS = 1400;

export function loadLevel(): void {
  clearTimeout(outcomeTimer);
  inputLocked = false;
  celebrating.set(false);
  const level = get(currentLevel);
  activeLevel.set(level);
  activeLevelNumber.set(get(levelNumber));
  const board: CellState[] = new Array(level.size * level.size).fill('empty');

  // pre-placed cat(s) (Р-36); auto-X marks only on early levels (Р-38)
  const givens = pickGivens(level);
  const givenIdx = givens.map((g) => idx(level, g.row, g.col));
  for (const gi of givenIdx) board[gi] = 'cat';
  const withAutoX = get(levelNumber) <= AUTO_X_UNTIL_LEVEL;
  if (withAutoX) {
    for (const g of givens) {
      for (const e of cellsEliminatedBy(level, g.row, g.col)) {
        if (board[e] === 'empty') board[e] = 'x';
      }
    }
  }
  givenCells.set(givenIdx);
  cells.set(board);

  hearts.set(HEARTS_MAX);
  autocatUsed.set(false);
  hintCells.set([]);
  errorCells.set([]);
  solverLog = solveWithLog(level);
  solutionSet = new Set(level.solution.map((s) => idx(level, s.row, s.col)));
  activeMs = 0; // hidden timer starts after the intro (KC-5)
  runningSince = null;
  analytics.track('level_start', { level: get(levelNumber) });

  if (reducedMotion()) {
    introOrigin.set(-1);
    resumeTimer();
  } else {
    introOrigin.set(givenIdx[0]);
    inputLocked = true;
    // shorter intro when there is no X wave to draw
    const introMs = withAutoX ? INTRO_MS : 700;
    outcomeTimer = setTimeout(() => {
      inputLocked = false;
      introOrigin.set(-1);
      resumeTimer();
    }, introMs);
  }
}

export function startGame(): void {
  screen.set('game');
  loadLevel(); // after screen switch, so the active-play timer resumes correctly (KC-5)
}

// ---------- interactions ----------
/** Tap: toggle X mark; tap on a cat removes it. */
export function tapCell(i: number): void {
  if (inputLocked) return;
  if (get(givenCells).includes(i)) return; // pre-placed cats are locked (Р-36)
  cells.update((b) => {
    const next = b.slice();
    if (next[i] === 'cat') next[i] = 'empty';
    else next[i] = next[i] === 'x' ? 'empty' : 'x';
    return next;
  });
  sfx.tap();
  vibrate(10);
}

/** Long-press commit: place a cat; a rule-breaking commit costs a heart (GDD §2). */
export function commitCat(i: number): void {
  if (inputLocked) return;
  const level = get(currentLevel);
  const board = get(cells);

  if (board[i] === 'cat') return;

  // A commit is correct only if the cell belongs to the level's unique solution.
  // Every level has a single solution reachable by pure logic (solver, no guessing),
  // so each cat has exactly one legal cell; any other commit is a mistake and costs a
  // heart, even when it does not (yet) conflict with an already-placed cat.
  if (!solutionSet.has(i)) {
    sfx.error();
    vibrate([30, 40, 30]);
    errorCells.set([i]);
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => errorCells.set([]), 600);
    hearts.update((h) => h - 1);
    if (get(hearts) <= 0) {
      sfx.lose();
      analytics.track('defeat', { level: get(levelNumber) });
      if (reducedMotion()) {
        screen.set('defeat');
      } else {
        // let the last heart finish burning before the Defeat screen
        inputLocked = true;
        outcomeTimer = setTimeout(() => {
          inputLocked = false;
          screen.set('defeat');
        }, 800);
      }
    }
    return;
  }

  cells.update((b) => {
    const next = b.slice();
    next[i] = 'cat';
    return next;
  });
  sfx.commit();
  vibrate(20);

  if (isSolved(level, get(cells))) void onWin();
}

/** Joy-wave duration on the board before the Victory screen (juice pass). */
const CELEBRATION_MS = 1200;

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

async function onWin(): Promise<void> {
  winTime.set(activeSeconds());
  pauseTimer();
  streak.update((s) => s + 1);
  const s = get(streak);
  winStreak.set(s);
  bestStreak.update((b) => Math.max(b, s));
  // progress persists at the moment of victory (KC-3), not on «Next level»
  winLevel.set(get(levelNumber));
  levelNumber.update((n) => n + 1);
  sfx.win();
  vibrate([20, 30, 20, 30, 40]);
  analytics.track('level_win', { level: get(winLevel), time: get(winTime) });
  if (reducedMotion()) {
    screen.set('victory');
    return;
  }
  inputLocked = true;
  celebrating.set(true);
  outcomeTimer = setTimeout(() => {
    inputLocked = false;
    celebrating.set(false);
    screen.set('victory');
  }, CELEBRATION_MS);
}

/** «Next level» on the victory screen; interstitial on the level boundary (GDD §4).
 *  levelNumber is already incremented at win (KC-3). */
export async function nextLevel(): Promise<void> {
  await ads.showInterstitial();
  startGame();
}

// ---------- defeat screen actions (GDD §3, Р-40) ----------
/**
 * Rewarded «Skip level»: Playgama forbids rewarded «+1 life» on defeat
 * (advertising requirements §6.2–6.3), but explicitly allows level skip.
 * Skip moves on to the next level; the streak is preserved but not extended.
 */
export async function skipLevelWithAd(): Promise<boolean> {
  const ok = await ads.showRewarded();
  if (!ok) return false;
  analytics.track('skip_level', { level: get(levelNumber) });
  levelNumber.update((n) => n + 1);
  startGame();
  return true;
}

export function restartAfterDefeat(): void {
  streak.set(0); // restart after losing all hearts breaks the streak
  startGame();
}

export function quitAfterDefeat(): void {
  streak.set(0);
  screen.set('main');
}

/** Restart from settings mid-level: board+hearts reset, streak intact (GDD §3). */
export function restartFromSettings(): void {
  settingsOpen.set(false);
  loadLevel();
}

export function quitToMenu(): void {
  settingsOpen.set(false);
  screen.set('main');
}

// ---------- rewarded helpers (GDD §5.2) ----------
/** Autocat: places one correct cat. Limit 1/level (Р-31).
 *  KC-4: player cats that contradict the solution are removed first (error flash, no heart cost),
 *  so autocat can never leave a rule-breaking pair on the board. */
export async function useAutocat(): Promise<void> {
  if (get(autocatUsed) || inputLocked) return;
  const ok = await ads.showRewarded();
  if (!ok) return;
  const level = get(currentLevel);
  const board = get(cells);
  const solutionIdx = new Set(level.solution.map((s) => idx(level, s.row, s.col)));
  const wrong: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 'cat' && !solutionIdx.has(i)) wrong.push(i);
  }
  const target = level.solution.find((s) => board[idx(level, s.row, s.col)] !== 'cat');
  if (!target) return;
  autocatUsed.set(true);
  analytics.track('autocat', { level: get(levelNumber), removedWrong: wrong.length });
  const i = idx(level, target.row, target.col);
  cells.update((b) => {
    const next = b.slice();
    for (const w of wrong) next[w] = 'empty';
    next[i] = 'cat';
    return next;
  });
  if (wrong.length) {
    errorCells.set(wrong);
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => errorCells.set([]), 600);
  }
  sfx.commit();
  if (isSolved(level, get(cells))) void onWin();
}

/** Hint: highlight the next logical step from the solver log. */
export async function useHint(): Promise<void> {
  if (inputLocked) return;
  const ok = await ads.showRewarded();
  if (!ok) return;
  const level = get(currentLevel);
  const board = get(cells);
  const steps = solverLog ?? [];
  let targets: number[] = [];
  for (const step of steps) {
    if (step.type === 'place') {
      const i = idx(level, step.cells[0].row, step.cells[0].col);
      if (board[i] !== 'cat') {
        targets = [i];
        break;
      }
    } else {
      const missing = step.cells
        .map((c) => idx(level, c.row, c.col))
        .filter((i) => board[i] === 'empty');
      if (missing.length) {
        targets = missing;
        break;
      }
    }
  }
  // fallback: first solution cell without a cat
  if (!targets.length) {
    const t = level.solution.find((s) => board[idx(level, s.row, s.col)] !== 'cat');
    if (t) targets = [idx(level, t.row, t.col)];
  }
  analytics.track('hint', { level: get(levelNumber) });
  hintCells.set(targets);
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hintCells.set([]), 2500);
}
