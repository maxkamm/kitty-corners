/**
 * Level generator (offline tool, Р-37). Replaces tools-make-levels.py.
 *
 * Pipeline per level:
 *   1. random valid cat placement (one per row/col, no touching) — solution first;
 *   2. regions grown from the solution cats (each region contains exactly one cat, connected);
 *   3. uniqueness check (backtracking, ≤2 solutions);
 *   4. solvability check with the IN-GAME logic solver (shared module) — no guessing required;
 *   5. region coloring: ≤8 palette tokens (r1..r8), adjacent regions never share a color;
 *   6. difficulty metrics: solver steps + count of harder "confined" deductions.
 *
 * Run: node --experimental-strip-types tools/generate-levels.ts > src/data/levels.json
 */
import { solveWithLog } from '../src/lib/solver.ts';
import type { LevelDef } from '../src/lib/types.ts';

// ---------- deterministic RNG ----------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = 'abcdefghij';
const PALETTE_SIZE = 10;

// ---------- 1. solution ----------
function genSolution(n: number, rng: () => number): number[] | null {
  const cols: number[] = [];
  const used = new Set<number>();
  const bt = (r: number): boolean => {
    if (r === n) return true;
    for (const c of shuffled([...Array(n).keys()], rng)) {
      if (used.has(c)) continue;
      if (r > 0 && Math.abs(cols[r - 1] - c) <= 1) continue;
      cols.push(c);
      used.add(c);
      if (bt(r + 1)) return true;
      cols.pop();
      used.delete(c);
    }
    return false;
  };
  return bt(0) ? cols : null;
}

// ---------- 2. regions ----------
function growRegions(n: number, sol: number[], rng: () => number): string[][] | null {
  const grid: number[][] = Array.from({ length: n }, () => new Array(n).fill(-1));
  const cells: [number, number][][] = [];
  for (let r = 0; r < n; r++) {
    grid[r][sol[r]] = r;
    cells.push([[r, sol[r]]]);
  }

  // uneven target sizes: small regions constrain the puzzle → unique solutions.
  // force ~n/3 tiny regions (1–3 cells); the rest share the remainder with quadratic skew.
  // larger boards need proportionally more tiny regions to stay unique
  const tinyCount = n >= 10 ? 6 : n === 9 ? 5 : Math.max(1, Math.floor(n / 3));
  const tinySet = new Set(shuffled([...Array(n).keys()], rng).slice(0, tinyCount));
  const targets = new Array(n).fill(1);
  let budget = n * n - n;
  for (const reg of tinySet) {
    const t = 1 + Math.floor(rng() * 3); // 1..3 cells
    targets[reg] = t;
    budget -= t - 1;
  }
  const rest = [...Array(n).keys()].filter((reg) => !tinySet.has(reg));
  const weights = rest.map(() => 0.05 + rng() * rng());
  const wsum = weights.reduce((a, b) => a + b, 0);
  rest.forEach((reg, i) => {
    targets[reg] = 1 + Math.floor((weights[i] / wsum) * budget);
  });

  let remaining = n * n - n;

  const growable = (reg: number): [number, number][] =>
    cells[reg].flatMap(([r, c]) =>
      (
        [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1]
        ] as [number, number][]
      ).filter(([rr, cc]) => rr >= 0 && rr < n && cc >= 0 && cc < n && grid[rr][cc] === -1)
    );

  while (remaining > 0) {
    // regions below target first; if all reached target, any region may overflow
    let candidates = [...Array(n).keys()].filter(
      (reg) => cells[reg].length < targets[reg] && growable(reg).length > 0
    );
    if (!candidates.length) {
      candidates = [...Array(n).keys()].filter((reg) => growable(reg).length > 0);
    }
    if (!candidates.length) return null;
    const reg = candidates[Math.floor(rng() * candidates.length)];
    const free = growable(reg);
    const [rr, cc] = free[Math.floor(rng() * free.length)];
    grid[rr][cc] = reg;
    cells[reg].push([rr, cc]);
    remaining--;
  }
  return grid.map((row) => row.map((v) => LETTERS[v]));
}

// ---------- 3. uniqueness ----------
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

// ---------- 5. coloring ----------
/**
 * Priority order of palette tokens (Р-39): greedy max-min Lab distance —
 * any prefix is a maximally contrasting set; similar hues (steel blue, aqua)
 * only join on 9×9–10×10 when the palette runs out.
 * Computed from the light-theme palette: r4 yellow → r9 lavender → r3 green →
 * r6 salmon → r8 grey → r2 light blue → r1 orange → r7 pink → r5 steel blue → r10 aqua.
 */
const PALETTE_ORDER = ['r4', 'r9', 'r3', 'r6', 'r8', 'r2', 'r1', 'r7', 'r5', 'r10'];

/** Every region gets a UNIQUE palette color (Р-39) — «1 Cat per color» must read literally. */
function colorRegions(regions: string[][], rng: () => number): Record<string, string> | null {
  const ids = Array.from(new Set(regions.flat()));
  if (ids.length > PALETTE_ORDER.length) return null;
  // fixed contrast-first subset, random assignment to regions
  const tokens = shuffled(PALETTE_ORDER.slice(0, ids.length), rng);
  return Object.fromEntries(ids.map((id, i) => [id, tokens[i]]));
}

// ---------- main ----------
interface GenLevel extends Omit<LevelDef, 'regions' | 'id'> {
  regions: string[]; // row strings, one char per cell
  meta: { steps: number; confined: number; starve: number; score: number };
}

function generateOne(n: number, rng: () => number): GenLevel | null {
  const sol = genSolution(n, rng);
  if (!sol) return null;
  const regions = growRegions(n, sol, rng);
  if (!regions) return null;
  if (countSolutions(regions) !== 1) return null;
  const level: LevelDef = {
    id: 0,
    size: n,
    regions,
    solution: sol.map((c, r) => ({ row: r, col: c }))
  };
  const steps = solveWithLog(level);
  if (!steps) return null; // requires guessing / harder techniques — reject
  const colors = colorRegions(regions, rng);
  if (!colors) return null;
  return {
    size: n,
    regions: regions.map((row) => row.join('')),
    colors,
    solution: level.solution,
    meta: {
      steps: steps.length,
      confined: steps.filter((s) => s.reason.startsWith('Region')).length,
      starve: steps.filter((s) => s.reason.startsWith('A cat there')).length,
      score: 0 // filled below
    }
  };
}

/**
 * Difficulty score (Р-38): board size dominates but doesn't fully separate —
 * a hard 6×6 may rank above the easiest 7×7. Harder techniques weigh extra.
 */
function difficultyScore(l: GenLevel): number {
  return (l.size - 6) * 12 + l.meta.steps + 2 * l.meta.confined + 4 * l.meta.starve;
}

const PLAN: [number, number][] = [
  [6, 20],
  [7, 20],
  [8, 20],
  [9, 15],
  [10, 15]
];

const rng = mulberry32(20260708);
const pool: GenLevel[] = [];
for (const [n, want] of PLAN) {
  let got = 0;
  let attempts = 0;
  const cap = 100000;
  while (got < want && attempts < cap) {
    attempts++;
    const lvl = generateOne(n, rng);
    if (lvl) {
      pool.push(lvl);
      got++;
    }
  }
  console.error(`size ${n}: ${got}/${want} levels in ${attempts} attempts`);
  if (got < want) process.exit(1);
}

// difficulty curve (Р-38): global ramp by score with light in-window variety
for (const l of pool) l.meta.score = difficultyScore(l);
pool.sort((a, b) => a.meta.score - b.meta.score);
const WINDOW = 5;
for (let i = 0; i < pool.length; i += WINDOW) {
  const win = pool.slice(i, i + WINDOW);
  const mixed = shuffled(win, rng);
  pool.splice(i, win.length, ...mixed);
}
// level 1 must be the gentlest opener
const easiest = pool.reduce((m, l) => (l.meta.score < m.meta.score ? l : m), pool[0]);
pool.splice(pool.indexOf(easiest), 1);
pool.unshift(easiest);

const levels = pool.map((l, i) => ({ id: i + 1, ...l }));

console.log(JSON.stringify({ levels }, null, 1));
