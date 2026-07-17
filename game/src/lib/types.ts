export interface LevelDef {
  id: number;
  size: number;
  /** region id per cell (single char, "a".."j"); rules compare ids, not colors */
  regions: string[][];
  /**
   * region id → palette token "r1".."r10" (CSS vars --r1..--r10).
   * Every region gets a UNIQUE color from the contrast-first palette prefix (Р-39).
   * Optional: when absent, the region id itself is treated as the palette token (legacy format).
   */
  colors?: Record<string, string>;
  solution: { row: number; col: number }[];
  /**
   * Pre-placed cats shown at level start (Р-36). Must be solution cells.
   * Optional: when absent, the game auto-picks the solution cat that eliminates the most cells.
   */
  givens?: { row: number; col: number }[];
  /** generator metadata; steps = solver step count, used as the score difficulty base (Р-42) */
  meta?: { steps: number; [k: string]: unknown };
}

export type CellState = 'empty' | 'x' | 'cat';

export type Screen = 'main' | 'tutorial' | 'game' | 'defeat' | 'victory';

export interface SolverStep {
  type: 'place' | 'eliminate';
  /** cells affected: for 'place' — the cat cell; for 'eliminate' — crossed-out cells */
  cells: { row: number; col: number }[];
  reason: string;
  /**
   * Fine-grained kind of the deduction, for the teaching hint (Р-58):
   * single — only free cell in a group; shadow — cells ruled out by a placed cat;
   * confined — a region locked to one line; lineset — k colors locked into k lines
   * (rows/columns), so other cats on those lines are out; starve — a cat there would
   * empty another group.
   */
  subtype?: 'single' | 'shadow' | 'confined' | 'lineset' | 'starve';
  /** which group forced a 'single' placement — picks the hint noun (row/column/color). */
  groupKind?: 'region' | 'row' | 'column';
  /** cells explaining WHY the step holds (the line/region/cat to highlight, Р-57). */
  cause?: { row: number; col: number }[];
}

/** Kind of hint shown to the player (§5.2). */
export type HintKind = 'place' | 'eliminate' | 'soft';

/** A ready-to-render teaching hint: text + which cells are the target vs the reason. */
export interface HintView {
  kind: HintKind;
  /** player-facing explanation in the game's voice (Р-60) */
  text: string;
  /** cells to act on: place → the cat cell; eliminate → cells to mark with paws */
  targets: number[];
  /** cells that explain why (row/column/region/neighbouring cat), highlighted quietly */
  cause: number[];
}
