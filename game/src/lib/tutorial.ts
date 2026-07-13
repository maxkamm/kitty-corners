/**
 * Guided first-run tutorial (GDD §2.1, Р-41): a scripted 4×4 level.
 * Self-contained state machine — deliberately independent of game.ts
 * (no hearts, no ads, no timer): the tutorial is a safe sandbox.
 *
 * The script walks the level's real logical solution, teaching in order:
 * the given cat + its auto-X wave → "only free cell in a region" deduction
 * (long-press commit) → manual ✕ marking (tap) → two more cats → win.
 */
import { writable, get } from 'svelte/store';
import type { LevelDef, CellState } from './types';
import { sfx } from './audio';

/** Hand-built 4×4 level. Unique solution: (0,1) (1,3) (2,0) (3,2); given: (2,0). */
export const TUTORIAL_LEVEL: LevelDef = {
  id: 0,
  size: 4,
  regions: [
    ['a', 'a', 'b', 'b'],
    ['a', 'b', 'b', 'b'],
    ['c', 'c', 'd', 'b'],
    ['c', 'd', 'd', 'd']
  ],
  colors: { a: 'r7', b: 'r10', c: 'r1', d: 'r3' },
  solution: [
    { row: 0, col: 1 },
    { row: 1, col: 3 },
    { row: 2, col: 0 },
    { row: 3, col: 2 }
  ],
  givens: [{ row: 2, col: 0 }]
};

const N = TUTORIAL_LEVEL.size;
export const GIVEN_IDX = 2 * N + 0; // (2,0)

export interface TutorialStep {
  /** 'next' — read & press the button; 'x' — tap target cells; 'cat' — long-press the target */
  action: 'next' | 'x' | 'cat';
  text: string;
  /** cells the player must act on (glowing); empty for 'next' */
  targets: number[];
}

const i = (r: number, c: number): number => r * N + c;

/** Script steps follow the level's actual chain of deductions — see module docstring. */
export const STEPS: TutorialStep[] = [
  {
    action: 'next',
    text: 'This cat is already home. Everything it rules out is crossed off — its row, its column, its color and all its neighbours.',
    targets: []
  },
  {
    action: 'cat',
    text: 'The pink region has only one free cell left, so its cat must live there. Press and hold the glowing cell to settle it.',
    targets: [i(0, 1)]
  },
  {
    action: 'x',
    text: 'A cat claims its row, column and neighbours. Tap the glowing cells to cross them off — ✕ marks are your notes.',
    targets: [i(0, 2), i(0, 3), i(1, 2)]
  },
  {
    action: 'cat',
    text: 'Now the teal region is down to a single free cell. Hold it to settle the next cat.',
    targets: [i(1, 3)]
  },
  {
    action: 'x',
    text: 'That cat rules out this corner too — tap to cross it off.',
    targets: [i(3, 3)]
  },
  {
    action: 'cat',
    text: 'One home left. Hold it to settle the last cat.',
    targets: [i(3, 2)]
  }
];

/** Cells eliminated by the given cat (its row, column, region, neighbours). */
function initialBoard(): CellState[] {
  const board: CellState[] = new Array(N * N).fill('empty');
  const g = TUTORIAL_LEVEL.givens![0];
  board[i(g.row, g.col)] = 'cat';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[i(r, c)] !== 'empty') continue;
      if (
        r === g.row ||
        c === g.col ||
        TUTORIAL_LEVEL.regions[r][c] === TUTORIAL_LEVEL.regions[g.row][g.col] ||
        (Math.abs(r - g.row) <= 1 && Math.abs(c - g.col) <= 1)
      ) {
        board[i(r, c)] = 'x';
      }
    }
  }
  return board;
}

// ---------- reactive state ----------
export const tutCells = writable<CellState[]>(initialBoard());
export const tutStep = writable(0);
/** all steps done — celebration + finish overlay */
export const tutFinished = writable(false);

export function resetTutorial(): void {
  tutCells.set(initialBoard());
  tutStep.set(0);
  tutFinished.set(false);
}

function advanceIfStepDone(): void {
  const step = STEPS[get(tutStep)];
  const board = get(tutCells);
  const want: CellState = step.action === 'cat' ? 'cat' : 'x';
  if (step.targets.every((t) => board[t] === want)) {
    if (get(tutStep) === STEPS.length - 1) {
      tutFinished.set(true);
      sfx.cheer(); // happy cats bounce at the end of the guided level
    } else tutStep.update((s) => s + 1);
  }
}

/** 'next' steps: the button in the tutorial screen. */
export function tutNext(): void {
  if (STEPS[get(tutStep)].action === 'next') tutStep.update((s) => s + 1);
}

/** Tap: only accepted on a glowing target of an ✕ step. */
export function tutTap(cell: number): void {
  const step = STEPS[get(tutStep)];
  if (get(tutFinished) || step.action !== 'x' || !step.targets.includes(cell)) return;
  tutCells.update((b) => {
    const next = b.slice();
    if (next[cell] === 'empty') next[cell] = 'x';
    return next;
  });
  sfx.tap();
  advanceIfStepDone();
}

/** Long-press commit: only accepted on the glowing target of a cat step. */
export function tutCommit(cell: number): void {
  const step = STEPS[get(tutStep)];
  if (get(tutFinished) || step.action !== 'cat' || !step.targets.includes(cell)) return;
  tutCells.update((b) => {
    const next = b.slice();
    next[cell] = 'cat';
    return next;
  });
  sfx.commit();
  advanceIfStepDone();
}
