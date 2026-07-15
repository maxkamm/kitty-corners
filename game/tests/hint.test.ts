/**
 * Unit tests for the attentiveness hint (src/lib/game.ts, Р-62): when the player
 * placed a cat but forgot paws around it, the hint names the missing cells grouped
 * by the rule that forbids them.
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/hint.test.ts
 */
import type { LevelDef, CellState } from '../src/lib/types.ts';

let passed = 0;
const failures: string[] = [];
const check = (name: string, cond: boolean): void => {
  if (cond) passed++;
  else failures.push(name);
};

// ---- browser stubs before importing game.ts ----
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
};
(globalThis as any).window = { matchMedia: () => ({ matches: true }) };

const { attentivenessHint } = await import('../src/lib/game.ts');

const n = 4;
const at = (r: number, c: number): number => r * n + c;
const level: LevelDef = {
  id: 1,
  size: n,
  regions: [
    ['a', 'a', 'b', 'b'],
    ['a', 'a', 'b', 'b'],
    ['c', 'c', 'd', 'd'],
    ['c', 'c', 'd', 'd']
  ],
  solution: [],
  meta: { steps: 0 }
};
const empty = (): CellState[] => new Array(n * n).fill('empty') as CellState[];

// ---- no cats → no attentiveness hint ----
check('no cats → null', attentivenessHint(level, empty()) === null);

// ---- cat with nothing marked → row/column rule first ----
{
  const b = empty();
  b[at(0, 0)] = 'cat';
  const h = attentivenessHint(level, b)!;
  check('rowcol: is an eliminate hint', h?.kind === 'eliminate');
  check('rowcol: mentions row and column', h.text.includes('row and column'));
  check('rowcol: targets the row neighbour', h.targets.includes(at(0, 1)));
  check('rowcol: targets the column neighbour', h.targets.includes(at(1, 0)));
  check('rowcol: does NOT target the diagonal yet', !h.targets.includes(at(1, 1)));
  check('rowcol: cause is the cat', h.cause.length === 1 && h.cause[0] === at(0, 0));
}

// ---- row/column already marked → touching (diagonal) rule next ----
{
  const b = empty();
  b[at(0, 0)] = 'cat';
  for (const i of [at(0, 1), at(0, 2), at(0, 3), at(1, 0), at(2, 0), at(3, 0)]) b[i] = 'x';
  const h = attentivenessHint(level, b)!;
  check('touch: mentions next to each other', h.text.includes('next to each other'));
  check('touch: targets the diagonal cell', h.targets.includes(at(1, 1)));
  check('touch: only the diagonal remains', h.targets.length === 1);
}

// ---- fully tidy cat → no hint for it ----
{
  const b = empty();
  b[at(0, 0)] = 'cat';
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (!(r === 0 && c === 0) && (r === 0 || c === 0 || (r <= 1 && c <= 1))) b[at(r, c)] = 'x';
  check('tidy cat → null', attentivenessHint(level, b) === null);
}

if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`hint.test.ts: all ${passed} checks passed`);
