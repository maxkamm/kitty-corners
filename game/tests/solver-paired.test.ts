/**
 * Regression for the paired/multi-line technique + eliminations-before-placements
 * ordering (fix/solver-paired-lines).
 *
 * Case: Level 7. A cell that "looks free" next to a forced placement (B = (1,1),
 * same big color as A = (1,2)) must be ruled out BEFORE the cat is placed at A —
 * previously B was only crossed by A's shadow, one step too late.
 * Run: node --experimental-strip-types tests/solver-paired.test.ts
 */
import { solveWithLog } from '../src/lib/solver.ts';
import type { LevelDef } from '../src/lib/types.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let passed = 0;
const failures: string[] = [];
const check = (name: string, cond: boolean): void => {
  if (cond) passed++;
  else failures.push(name);
};

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, '../src/data/levels.json'), 'utf8')) as {
  levels: (Omit<LevelDef, 'regions'> & { regions: string[] | string[][] })[];
};
const levels: LevelDef[] = raw.levels.map((l) => ({
  ...l,
  regions: l.regions.map((row) => (typeof row === 'string' ? row.split('') : row))
}));

const has = (cells: { row: number; col: number }[], r: number, c: number): boolean =>
  cells.some((x) => x.row === r && x.col === c);

// ---- Level 7: B=(1,1) ruled out before A=(1,2) is placed ----
{
  const level = levels.find((l) => l.id === 7)!;
  const log = solveWithLog(level);
  check('level 7 still solves', log !== null);
  if (log) {
    const placeA = log.findIndex((s) => s.type === 'place' && has(s.cells, 1, 2));
    const elimB = log.findIndex((s) => s.type === 'eliminate' && has(s.cells, 1, 1));
    check('A=(1,2) is placed', placeA >= 0);
    check('B=(1,1) is eliminated', elimB >= 0);
    check('B is ruled out BEFORE A is placed', elimB >= 0 && placeA >= 0 && elimB < placeA);
    check('level 7 uses the new lineset technique', log.some((s) => s.subtype === 'lineset'));
  }
}

// ---- ordering invariant across the pool: no placement leaves an immediately
//      rule-broken neighbour uncrossed at hint time is out of scope here; we just
//      guard that every level still fully solves with the new ordering ----
{
  let solved = 0;
  for (const l of levels) if (solveWithLog(l) !== null) solved++;
  check(`all ${levels.length} levels still solve`, solved === levels.length);
}

if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`solver-paired.test.ts: all ${passed} checks passed`);
