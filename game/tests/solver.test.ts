/**
 * Level pool validation:
 *  - the in-game logic solver fully solves every level, placements match the stored solution;
 *  - solution is unique (independent backtracking count);
 *  - regions are connected;
 *  - coloring is valid: unique color per region, exactly the contrast-first palette prefix (Р-39).
 * Run: node --experimental-strip-types tests/solver.test.ts
 */
import { solveWithLog } from '../src/lib/solver.ts';
import type { LevelDef } from '../src/lib/types.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, '../src/data/levels.json'), 'utf8')) as {
  levels: (Omit<LevelDef, 'regions'> & { regions: string[] | string[][] })[];
};

const levels: LevelDef[] = raw.levels.map((l) => ({
  ...l,
  regions: l.regions.map((row) => (typeof row === 'string' ? row.split('') : row))
}));

function countSolutions(regions: string[][], limit = 2): number {
  const n = regions.length;
  const colUsed = new Array(n).fill(false);
  const regUsed = new Map<string, boolean>();
  const cols: number[] = [];
  let count = 0;
  const bt = (r: number): void => {
    if (count >= limit) return;
    if (r === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c] || regUsed.get(regions[r][c])) continue;
      if (r > 0 && Math.abs(cols[r - 1] - c) <= 1) continue;
      colUsed[c] = true;
      regUsed.set(regions[r][c], true);
      cols.push(c);
      bt(r + 1);
      cols.pop();
      colUsed[c] = false;
      regUsed.set(regions[r][c], false);
    }
  };
  bt(0);
  return count;
}

function connected(regions: string[][]): boolean {
  const n = regions.length;
  for (const id of new Set(regions.flat())) {
    const cells: string[] = [];
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (regions[r][c] === id) cells.push(`${r},${c}`);
    const seen = new Set([cells[0]]);
    const stack = [cells[0]];
    while (stack.length) {
      const [r, c] = stack.pop()!.split(',').map(Number);
      for (const [rr, cc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        const k = `${rr},${cc}`;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n && regions[rr][cc] === id && !seen.has(k)) {
          seen.add(k);
          stack.push(k);
        }
      }
    }
    if (seen.size !== cells.length) return false;
  }
  return true;
}

/** must match PALETTE_ORDER in tools/generate-levels.ts */
const PALETTE_ORDER = ['r4', 'r9', 'r3', 'r6', 'r8', 'r2', 'r1', 'r7', 'r5', 'r10'];

function coloringValid(level: LevelDef): boolean {
  const colors = level.colors ?? {};
  const ids = [...new Set(level.regions.flat())];
  const used = ids.map((id) => colors[id] ?? id);
  if (new Set(used).size !== ids.length) return false; // unique per region (Р-39)
  // exactly the contrast-first prefix of the palette order
  const expected = new Set(PALETTE_ORDER.slice(0, ids.length));
  return used.every((t) => expected.has(t));
}

let failed = 0;
const bySize = new Map<number, number>();
for (const level of levels) {
  const problems: string[] = [];
  const steps = solveWithLog(level);
  if (!steps) problems.push('solver stuck');
  else {
    const placed = steps
      .filter((s) => s.type === 'place')
      .map((s) => `${s.cells[0].row},${s.cells[0].col}`)
      .sort();
    const expected = level.solution.map((s) => `${s.row},${s.col}`).sort();
    if (JSON.stringify(placed) !== JSON.stringify(expected)) problems.push('solution mismatch');
  }
  if (countSolutions(level.regions) !== 1) problems.push('not unique');
  if (!connected(level.regions)) problems.push('disconnected region');
  if (!coloringValid(level)) problems.push('bad coloring');
  if (problems.length) {
    console.error(`level ${level.id} (${level.size}x${level.size}): ${problems.join(', ')}`);
    failed++;
  } else {
    bySize.set(level.size, (bySize.get(level.size) ?? 0) + 1);
  }
}
if (failed) {
  console.error(`FAILED: ${failed}/${levels.length}`);
  process.exit(1);
}
console.log(
  `all ${levels.length} levels pass:`,
  [...bySize.entries()].map(([n, k]) => `${n}x${n}·${k}`).join(', ')
);
