/**
 * Level scoring (GDD §3.1, Р-42): score = Base × Time × Clean × Eye × Help.
 *
 * - Base rewards difficulty: 100 × solver steps (levels.json meta.steps, 10–26).
 * - Time: linear around a per-level par (12 s × steps); zen-friendly — slow play
 *   floors at ×0.5, it never zeroes the score.
 * - Clean: mistakes hurt more than slowness (×1 / ×0.6 / ×0.35).
 * - Eye: solving with few player-placed ✕ marks is a BONUS (up to ×1.4), never a
 *   penalty — manual marking is legitimate mastery (GDD §2).
 * - Help: rewarded hint ×0.8 each, autocat ×0.5 — otherwise leaderboard points
 *   could be bought by watching ads.
 *
 * Pure module: no stores, no side effects (unit-tested in tests/score.test.ts).
 */

export const BASE_PER_STEP = 100;
export const PAR_SEC_PER_STEP = 12;
export const TIME_MAX = 1.5;
export const TIME_MIN = 0.5;
export const ERROR_MULT = [1, 0.6, 0.35] as const;
export const EYE_MAX_BONUS = 0.4;
export const HINT_MULT = 0.8;
export const AUTOCAT_MULT = 0.5;

export interface ScoreInput {
  /** solver steps from the level meta (difficulty proxy) */
  steps: number;
  /** board size N (N×N) */
  size: number;
  /** active play time, seconds (hidden timer, KC-5) */
  timeSec: number;
  /** wrong cat commits this run (0..2 on a win) */
  errors: number;
  /** unique cells the PLAYER marked with ✕ (auto-X from the given not counted) */
  xCells: number;
  /** rewarded hints used this run */
  hints: number;
  /** rewarded autocat used this run */
  autocat: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Par time for a level, seconds. */
export function parSeconds(steps: number): number {
  return PAR_SEC_PER_STEP * steps;
}

/** Final score for a won level, rounded to a multiple of 5. */
export function computeScore(i: ScoreInput): number {
  const base = BASE_PER_STEP * i.steps;
  const time = clamp(TIME_MAX - 0.5 * (i.timeSec / parSeconds(i.steps)), TIME_MIN, TIME_MAX);
  const clean = ERROR_MULT[Math.min(i.errors, ERROR_MULT.length - 1)];
  const freeCells = i.size * i.size - i.size; // cells not taken by the solution cats
  const eye = 1 + EYE_MAX_BONUS * Math.max(0, 1 - i.xCells / freeCells);
  const help = Math.pow(HINT_MULT, i.hints) * (i.autocat ? AUTOCAT_MULT : 1);
  return Math.max(0, Math.round((base * time * clean * eye * help) / 5) * 5);
}
