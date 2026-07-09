/**
 * Logic solver. Produces an ordered log of deduction steps for a level;
 * the hint button surfaces the next step not yet reflected on the player's board (GDD §5.2).
 * Shared by the game and tools/generate-levels.ts, so bundled levels are fully solvable by it.
 */
import type { LevelDef, SolverStep } from './types';

interface Ctx {
  n: number;
  regions: string[][];
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

/** Cells eliminated by a cat at (r,c): same row, column, region, and 8 neighbours. */
function eliminatedBy(ctx: Ctx, r: number, c: number, cand: Set<string>): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (const k of cand) {
    const [rr, cc] = k.split(',').map(Number);
    if (rr === r && cc === c) continue;
    if (
      rr === r ||
      cc === c ||
      ctx.regions[rr][cc] === ctx.regions[r][c] ||
      (Math.abs(rr - r) <= 1 && Math.abs(cc - c) <= 1)
    ) {
      out.push({ row: rr, col: cc });
    }
  }
  return out;
}

/**
 * Runs basic deductions to completion. Returns the full step log
 * (alternating eliminate/place) or null if the level needs harder techniques.
 */
export function solveWithLog(level: LevelDef): SolverStep[] | null {
  const n = level.size;
  const ctx: Ctx = { n, regions: level.regions };
  const cand = new Set<string>();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cand.add(key(r, c));
  const placed = new Set<string>();
  const steps: SolverStep[] = [];

  const regionNames = Array.from(new Set(level.regions.flat()));

  const groups = (): { label: string; cells: [number, number][] }[] => {
    const out: { label: string; cells: [number, number][] }[] = [];
    for (const name of regionNames) {
      const cells: [number, number][] = [];
      for (const k of cand) {
        const [r, c] = k.split(',').map(Number);
        if (level.regions[r][c] === name && !placed.has(k)) cells.push([r, c]);
      }
      out.push({ label: `region ${name}`, cells });
    }
    for (let r = 0; r < n; r++) {
      const cells: [number, number][] = [];
      for (const k of cand) {
        const [rr, cc] = k.split(',').map(Number);
        if (rr === r && !placed.has(k)) cells.push([rr, cc]);
      }
      out.push({ label: `row ${r + 1}`, cells });
    }
    for (let c = 0; c < n; c++) {
      const cells: [number, number][] = [];
      for (const k of cand) {
        const [rr, cc] = k.split(',').map(Number);
        if (cc === c && !placed.has(k)) cells.push([rr, cc]);
      }
      out.push({ label: `column ${c + 1}`, cells });
    }
    return out;
  };

  while (placed.size < n) {
    let progress = false;

    // 1) single remaining candidate in a region/row/column → place a cat
    for (const g of groups()) {
      if (g.cells.length === 1) {
        const [r, c] = g.cells[0];
        if (placed.has(key(r, c))) continue;
        placed.add(key(r, c));
        steps.push({
          type: 'place',
          cells: [{ row: r, col: c }],
          reason: `Only one spot left in ${g.label}`
        });
        const gone = eliminatedBy(ctx, r, c, cand);
        if (gone.length) {
          for (const cell of gone) cand.delete(key(cell.row, cell.col));
          steps.push({
            type: 'eliminate',
            cells: gone,
            reason: `A cat at that spot rules these out`
          });
        }
        progress = true;
      }
    }
    if (progress) continue;

    // 2) region confined to a single row/column → eliminate the rest of that line
    for (const name of regionNames) {
      const cells: [number, number][] = [];
      for (const k of cand) {
        const [r, c] = k.split(',').map(Number);
        if (level.regions[r][c] === name && !placed.has(k)) cells.push([r, c]);
      }
      if (cells.length === 0) continue;
      const rows = new Set(cells.map(([r]) => r));
      const cols = new Set(cells.map(([, c]) => c));
      if (rows.size === 1) {
        const rr = cells[0][0];
        const gone: { row: number; col: number }[] = [];
        for (const k of cand) {
          const [r, c] = k.split(',').map(Number);
          if (r === rr && level.regions[r][c] !== name) gone.push({ row: r, col: c });
        }
        if (gone.length) {
          for (const cell of gone) cand.delete(key(cell.row, cell.col));
          steps.push({
            type: 'eliminate',
            cells: gone,
            reason: `Region ${name} fits only in row ${rr + 1}`
          });
          progress = true;
        }
      } else if (cols.size === 1) {
        const cc = cells[0][1];
        const gone: { row: number; col: number }[] = [];
        for (const k of cand) {
          const [r, c] = k.split(',').map(Number);
          if (c === cc && level.regions[r][c] !== name) gone.push({ row: r, col: c });
        }
        if (gone.length) {
          for (const cell of gone) cand.delete(key(cell.row, cell.col));
          steps.push({
            type: 'eliminate',
            cells: gone,
            reason: `Region ${name} fits only in column ${cc + 1}`
          });
          progress = true;
        }
      }
    }

    if (progress) continue;

    // 3) starvation: a cat at X would leave some other group with no candidates → X is impossible
    {
      const activeGroups = groups().filter((g) => g.cells.length > 0);
      const gone: { row: number; col: number }[] = [];
      let starved = '';
      outer: for (const k of cand) {
        const [r, c] = k.split(',').map(Number);
        if (placed.has(k)) continue;
        const wouldGo = new Set(eliminatedBy(ctx, r, c, cand).map((e) => key(e.row, e.col)));
        for (const g of activeGroups) {
          // the group that X itself satisfies is fine
          if (g.cells.some(([gr, gc]) => gr === r && gc === c)) continue;
          if (g.cells.every(([gr, gc]) => wouldGo.has(key(gr, gc)))) {
            gone.push({ row: r, col: c });
            starved = g.label;
            continue outer;
          }
        }
      }
      if (gone.length) {
        for (const cell of gone) cand.delete(key(cell.row, cell.col));
        steps.push({
          type: 'eliminate',
          cells: gone,
          reason: `A cat there would leave ${starved} without a spot`
        });
        progress = true;
      }
    }

    if (!progress) return null; // needs harder techniques than the solver knows
  }
  return steps;
}
