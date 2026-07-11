/**
 * Tests for the scoring formula (src/lib/score.ts) — pure module, no stubs needed.
 * Zero-dependency harness (matches tests/game.test.ts).
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/score.test.ts
 */
import {
  computeScore,
  parSeconds,
  BASE_PER_STEP,
  TIME_MAX,
  TIME_MIN,
  ERROR_MULT,
  EYE_MAX_BONUS,
  HINT_MULT,
  AUTOCAT_MULT,
  type ScoreInput
} from '../src/lib/score.ts';
import levelsData from '../src/data/levels.json' with { type: 'json' };

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}
function eq(name: string, got: unknown, want: unknown): void {
  check(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`, got === want);
}

const base: ScoreInput = {
  steps: 10,
  size: 6,
  timeSec: parSeconds(10), // exactly par → time ×1.0
  errors: 0,
  xCells: 30, // 6²−6 = full marking → eye ×1.0
  hints: 0,
  autocat: false
};
const s = (over: Partial<ScoreInput>): number => computeScore({ ...base, ...over });

// ---- anchor: at par, clean, fully marked, no help → exactly the base ----
eq('anchor score = 100 × steps', s({}), BASE_PER_STEP * 10);

// ---- time ----
check('faster than par earns more', s({ timeSec: 60 }) > s({}));
eq('instant solve caps at ×1.5', s({ timeSec: 0 }), BASE_PER_STEP * 10 * TIME_MAX);
eq('very slow floors at ×0.5 (zen: never zero)', s({ timeSec: 10 * parSeconds(10) }), BASE_PER_STEP * 10 * TIME_MIN);
check('monotonic in time', s({ timeSec: 100 }) >= s({ timeSec: 140 }));

// ---- errors ----
eq('1 error → ×0.6', s({ errors: 1 }), BASE_PER_STEP * 10 * ERROR_MULT[1]);
eq('2 errors → ×0.35', s({ errors: 2 }), BASE_PER_STEP * 10 * ERROR_MULT[2]);
check('one error costs more than being 50% over par', s({ errors: 1 }) < s({ timeSec: parSeconds(10) * 1.5 }));

// ---- eye bonus ----
eq('zero marks → ×1.4', s({ xCells: 0 }), BASE_PER_STEP * 10 * (1 + EYE_MAX_BONUS));
check('fewer marks never score less', s({ xCells: 5 }) >= s({ xCells: 20 }));
eq('over-marking clamps at ×1.0 (bonus, not penalty)', s({ xCells: 999 }), BASE_PER_STEP * 10);

// ---- rewarded help ----
eq('one hint → ×0.8', s({ hints: 1 }), BASE_PER_STEP * 10 * HINT_MULT);
eq('two hints stack', s({ hints: 2 }), Math.round((BASE_PER_STEP * 10 * HINT_MULT * HINT_MULT) / 5) * 5);
eq('autocat → ×0.5', s({ autocat: true }), BASE_PER_STEP * 10 * AUTOCAT_MULT);

// ---- shape ----
check('score is a multiple of 5', s({ timeSec: 37, xCells: 7, errors: 1 }) % 5 === 0);
check('score never negative', s({ timeSec: 9999, errors: 2, hints: 5, autocat: true, xCells: 999 }) >= 0);
check(
  'perfect run ≈ 2.1 × base',
  s({ timeSec: 0, xCells: 0 }) === BASE_PER_STEP * 10 * TIME_MAX * (1 + EYE_MAX_BONUS)
);

// ---- real pool sanity: every level has usable meta.steps ----
const levels = (levelsData as { levels: { size: number; meta?: { steps?: number } }[] }).levels;
check(
  'every pool level has meta.steps ≥ its size',
  levels.every((l) => (l.meta?.steps ?? 0) >= l.size)
);
check(
  'harder levels have a higher score ceiling',
  computeScore({ ...base, steps: 26, size: 10, timeSec: 0, xCells: 0 }) >
    computeScore({ ...base, steps: 10, size: 6, timeSec: 0, xCells: 0 })
);

// ---- report ----
if (failures.length) {
  console.error(`FAIL: ${failures.length} of ${passed + failures.length}`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`score.test.ts: all ${passed} checks passed`);
