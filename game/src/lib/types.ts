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
}

export type CellState = 'empty' | 'x' | 'cat';

export type Screen = 'main' | 'tutorial' | 'game' | 'defeat' | 'victory';

export interface SolverStep {
  type: 'place' | 'eliminate';
  /** cells affected: for 'place' — the cat cell; for 'eliminate' — crossed-out cells */
  cells: { row: number; col: number }[];
  reason: string;
}
