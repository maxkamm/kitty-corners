/**
 * Tests for the first-run tutorial script (src/lib/tutorial.ts).
 * Zero-dependency harness (matches tests/game.test.ts).
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/tutorial.test.ts
 *
 * Verifies that the hand-written script matches the hand-built level:
 * the level is valid and solver-solvable, every step's claim holds on the
 * actual board state, wrong input is ignored, and the walkthrough ends solved.
 */
import { get } from 'svelte/store';
import type { CellState } from '../src/lib/types.ts';
import {
  TUTORIAL_LEVEL,
  GIVEN_IDX,
  STEPS,
  tutCells,
  tutStep,
  tutFinished,
  resetTutorial,
  tutNext,
  tutTap,
  tutCommit
} from '../src/lib/tutorial.ts';
import { solveWithLog } from '../src/lib/solver.ts';

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}

const N = TUTORIAL_LEVEL.size;
const idx = (r: number, c: number): number => r * N + c;

// ---- the level itself ----
check('given is a solution cell', TUTORIAL_LEVEL.solution.some((s) => idx(s.row, s.col) === GIVEN_IDX));
check('one cat per row', new Set(TUTORIAL_LEVEL.solution.map((s) => s.row)).size === N);
check('one cat per column', new Set(TUTORIAL_LEVEL.solution.map((s) => s.col)).size === N);
check(
  'one cat per region',
  new Set(TUTORIAL_LEVEL.solution.map((s) => TUTORIAL_LEVEL.regions[s.row][s.col])).size === N
);
check(
  'cats do not touch',
  TUTORIAL_LEVEL.solution.every((a) =>
    TUTORIAL_LEVEL.solution.every(
      (b) => (a === b) || Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col)) > 1
    )
  )
);
check('solver solves the tutorial level (unique logical solution)', solveWithLog(TUTORIAL_LEVEL) !== null);

// ---- the scripted walkthrough ----
resetTutorial();
check('board starts with the given cat', get(tutCells)[GIVEN_IDX] === 'cat');
check('first step is a read-and-next step', STEPS[0].action === 'next');

// wrong inputs are ignored before/at every step
tutCommit(idx(0, 2)); // not this step's action
check('commit ignored on a next step', get(tutCells)[idx(0, 2)] === 'x' || get(tutCells)[idx(0, 2)] === 'empty');

for (let s = 0; s < STEPS.length; s++) {
  const step = STEPS[s];
  check(`step ${s} is current`, get(tutStep) === s);
  const board = get(tutCells);

  if (step.action === 'next') {
    tutNext();
    continue;
  }

  // every target must be actionable (empty) on the real board state
  check(`step ${s}: targets are empty cells`, step.targets.every((t) => board[t] === 'empty'));

  if (step.action === 'cat') {
    const t = step.targets[0];
    // the teaching claim: the target's region has exactly one free cell — the target
    const reg = TUTORIAL_LEVEL.regions[Math.floor(t / N)][t % N];
    const freeInRegion: number[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (TUTORIAL_LEVEL.regions[r][c] === reg && board[idx(r, c)] === 'empty') {
          freeInRegion.push(idx(r, c));
        }
      }
    }
    const lastStep = s === STEPS.length - 1;
    check(
      `step ${s}: region '${reg}' is down to the target cell`,
      lastStep ? freeInRegion.length === 1 : freeInRegion.length === 1 && freeInRegion[0] === t
    );
    // target is a solution cell
    check(
      `step ${s}: cat target is in the solution`,
      TUTORIAL_LEVEL.solution.some((c) => idx(c.row, c.col) === t)
    );
    // wrong-cell input is ignored
    tutCommit((t + 1) % (N * N) === GIVEN_IDX ? (t + 2) % (N * N) : (t + 1) % (N * N));
    check(`step ${s}: wrong commit ignored`, get(tutStep) === s);
    tutTap(t); // tap on a cat step is ignored
    check(`step ${s}: tap ignored on a cat step`, get(tutCells)[t] === 'empty');
    tutCommit(t);
  } else {
    // x step: targets must NOT be solution cells
    check(
      `step ${s}: x targets are not solution cells`,
      step.targets.every((t) => !TUTORIAL_LEVEL.solution.some((c) => idx(c.row, c.col) === t))
    );
    for (const t of step.targets) tutTap(t);
  }
}

check('tutorial finishes after the last step', get(tutFinished));

// final board equals the solution
const final = get(tutCells);
const cats = final.filter((c: CellState) => c === 'cat').length;
check('final board has N cats', cats === N);
check(
  'final cats match the solution',
  TUTORIAL_LEVEL.solution.every((s) => final[idx(s.row, s.col)] === 'cat')
);
check('no empty cells remain', final.every((c: CellState) => c !== 'empty'));

// reset works
resetTutorial();
check('reset returns to step 0', get(tutStep) === 0 && !get(tutFinished));

// ---- report ----
if (failures.length) {
  console.error(`FAIL: ${failures.length} of ${passed + failures.length}`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`tutorial.test.ts: all ${passed} checks passed`);
