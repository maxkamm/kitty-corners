/**
 * Unit tests for the cat-collection core (src/lib/collection.ts), GDD §10.
 * Zero-dependency harness (matches tests/game.test.ts).
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/collection.test.ts
 *
 * Browser globals are stubbed BEFORE the module is imported so the storage layer
 * falls back to an in-memory localStorage (persistence is observable).
 */
import { get } from 'svelte/store';

// ---- tiny assert harness ----
let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}
function eq(name: string, got: unknown, want: unknown): void {
  check(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`, got === want);
}

// ---- browser env stubs (must exist before importing the module) ----
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k)
};
(globalThis as any).window = { matchMedia: () => ({ matches: true }) };

const C = await import('../src/lib/collection.ts');

// ============================================================
// 1) Drop weight gating (Р-48, Р-50)
// ============================================================
{
  const empty = new Set<string>();
  const common = C.breedById('tuxedo')!; // common, threshold 1
  const rare = C.breedById('tonkinese')!; // rare, threshold 20
  const legendary = C.breedById('savannah')!; // legendary, threshold 60

  check('common drops from level 1', C.dropWeight(common, 1, empty) > 0);
  eq('rare gated below threshold', C.dropWeight(rare, 10, empty), 0);
  check('rare drops at its threshold', C.dropWeight(rare, 20, empty) > 0);
  eq('legendary gated well below its threshold', C.dropWeight(legendary, 30, empty), 0);
  check('legendary drops at its threshold', C.dropWeight(legendary, 60, empty) > 0);
}

// ============================================================
// 2) Collection-aware bias favours undiscovered breeds (×2.5)
// ============================================================
{
  const c1 = C.breedById('tuxedo')!;
  const c2 = C.breedById('dilutecalico')!;
  const known = new Set<string>(['tuxedo']);
  const wKnown = C.dropWeight(c1, 1, known); // discovered → ×1
  const wNew = C.dropWeight(c2, 1, known); // undiscovered → ×2.5
  eq('discovered common weight', wKnown, 100);
  eq('undiscovered common weight (×2.5)', wNew, 250);
}

// ============================================================
// 3) Board breed count K (Р-49): U and board size
// ============================================================
{
  eq('K: fresh 6×6 → 1', C.boardBreedCount(0, 6, 6), 1);
  eq('K: U=3 6×6 → 1', C.boardBreedCount(3, 6, 6), 1);
  eq('K: U=4 6×6 → 2', C.boardBreedCount(4, 6, 6), 2);
  eq('K: U=20 6×6 capped at 2', C.boardBreedCount(20, 6, 6), 2);
  eq('K: U=20 10×10 capped at 5', C.boardBreedCount(20, 10, 10), 5);
  eq('K: bounded by region count', C.boardBreedCount(0, 10, 3), 1);
}

// ============================================================
// 4) assignBoardBreeds — determinism, re-roll, coverage (Р-48)
// ============================================================
{
  const regionIds = ['a', 'b', 'c', 'd', 'e', 'f'];
  const base = { levelNumber: 30, entryNonce: 1, discovered: new Set<string>(), regionIds, size: 6 };
  const m1 = C.assignBoardBreeds(base);
  const m1b = C.assignBoardBreeds({ ...base, discovered: new Set<string>() });
  eq('same seed → identical map', JSON.stringify(m1), JSON.stringify(m1b));

  eq('every region assigned', Object.keys(m1).length, regionIds.length);
  check('all assignments are real breeds', Object.values(m1).every((id) => !!C.breedById(id)));

  // fresh collection on a 6×6 → K=1 → whole board one breed
  eq('K=1 board is a single breed', new Set(Object.values(m1)).size, 1);

  // re-roll: a different entryNonce should change the map for at least one nonce
  let reRolled = false;
  for (let n = 2; n <= 8 && !reRolled; n++) {
    if (JSON.stringify(C.assignBoardBreeds({ ...base, entryNonce: n })) !== JSON.stringify(m1)) {
      reRolled = true;
    }
  }
  check('a fresh entry can re-roll the breeds', reRolled);
}

// ============================================================
// 5) Difficulty gating on the board — early levels are commons only
// ============================================================
{
  const regionIds = ['a', 'b', 'c', 'd', 'e', 'f'];
  const m = C.assignBoardBreeds({
    levelNumber: 1,
    entryNonce: 1,
    discovered: new Set<string>(),
    regionIds,
    size: 6
  });
  const rarities = new Set(Object.values(m).map((id) => C.breedById(id)!.rarity));
  check('level 1 board holds only commons', [...rarities].every((r) => r === 'common'));

  // force K=5 on a big early board — still no rare/epic/legendary
  const big = C.assignBoardBreeds({
    levelNumber: 1,
    entryNonce: 3,
    discovered: new Set<string>(['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8']),
    regionIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    size: 10
  });
  check(
    'no non-common appears below its threshold',
    Object.values(big).every((id) => C.breedById(id)!.rarity === 'common')
  );
}

// ============================================================
// 6) discoverBreed + persistence (Р-47, §10.7)
// ============================================================
{
  C.initCollectionPersistence();
  eq('discover: first time is new', C.discoverBreed('tuxedo', 3), true);
  eq('discover: second time is not new', C.discoverBreed('tuxedo', 5), false);
  check('isDiscovered after discovery', C.isDiscovered('tuxedo'));
  eq('discovered count', C.discoveredCount(), 1);

  const rec = get(C.collection).discovered['tuxedo'];
  eq('count increments on re-encounter', rec.count, 2);
  eq('firstLevel kept from first discovery', rec.firstLevel, 3);

  check('collection persisted to storage', !!store.get('kc.collection'));
  check(
    'persisted payload contains the breed',
    (store.get('kc.collection') ?? '').includes('tuxedo')
  );
}

// ============================================================
// 7) NEW pip: unseen until marked seen (§10.6)
// ============================================================
{
  C.discoverBreed('dilutecalico', 2);
  check('freshly discovered breed is unseen', C.isUnseen('dilutecalico'));
  C.markAllSeen();
  check('markAllSeen clears the unseen flag', !C.isUnseen('dilutecalico'));
}

// ---- report ----
if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`collection.ts: all ${passed} assertions pass`);
