/**
 * Unit tests for the cat-collection core (src/lib/collection.ts), GDD §10.
 * Zero-dependency harness (matches tests/game.test.ts).
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/collection.test.ts
 */
import { get } from 'svelte/store';

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
const { storage } = await import('../src/lib/storage.ts');

// ============================================================
// 1) Drop weight gating (Р-48, Р-50) — base × gate, no discovery bias
// ============================================================
{
  const common = C.breedById('tuxedo')!; // common, threshold 1
  const rare = C.breedById('tonkinese')!; // rare, threshold 20
  const legendary = C.breedById('savannah')!; // legendary, threshold 60

  check('common drops from level 1', C.dropWeight(common, 1) > 0);
  eq('rare gated below threshold', C.dropWeight(rare, 10), 0);
  check('rare drops at its threshold', C.dropWeight(rare, 20) > 0);
  eq('legendary gated below threshold', C.dropWeight(legendary, 30), 0);
  check('legendary drops at its threshold', C.dropWeight(legendary, 60) > 0);
}

// ============================================================
// 2) New-cat cadence schedule (§10.4)
// ============================================================
{
  eq('cadence lvl 1', C.newCatChance(1), 1);
  eq('cadence lvl 10', C.newCatChance(10), 1);
  eq('cadence lvl 11', C.newCatChance(11), 0.5);
  eq('cadence lvl 30', C.newCatChance(30), 0.5);
  eq('cadence lvl 31', C.newCatChance(31), 0.25);
  eq('cadence lvl 60', C.newCatChance(60), 0.25);
  eq('cadence lvl 61 tapers to ~0.1', C.newCatChance(61), 0.1);
}

// ============================================================
// 3) Board breed count K (Р-49): U and board size
// ============================================================
{
  eq('K: fresh 6×6 → 1', C.boardBreedCount(0, 6, 6), 1);
  eq('K: U=4 6×6 → 2', C.boardBreedCount(4, 6, 6), 2);
  eq('K: U=20 6×6 capped at 2', C.boardBreedCount(20, 6, 6), 2);
  eq('K: U=20 10×10 capped at 5', C.boardBreedCount(20, 10, 10), 5);
  eq('K: bounded by region count', C.boardBreedCount(0, 10, 3), 1);
}

// ============================================================
// 4) assignBoardBreeds — bootstrap, determinism, starter familiar, ≤1 newcomer
// ============================================================
const regionIds = ['a', 'b', 'c', 'd', 'e', 'f'];
{
  // bootstrap: no collection → the base cat everywhere
  const boot = C.assignBoardBreeds({
    levelNumber: 1,
    entryNonce: 1,
    discovered: new Set<string>(),
    regionIds,
    size: 6,
    givenRegionId: 'a',
    baseBreed: 'tuxedo'
  });
  check('bootstrap: all regions are the base cat', Object.values(boot).every((v) => v === 'tuxedo'));

  const discovered = new Set<string>(['tuxedo', 'dilutecalico', 'bombay']);
  const ctx = {
    levelNumber: 5,
    entryNonce: 1,
    discovered,
    regionIds,
    size: 6,
    givenRegionId: 'a',
    baseBreed: 'tuxedo'
  };
  const m1 = C.assignBoardBreeds(ctx);
  const m2 = C.assignBoardBreeds({ ...ctx, discovered: new Set(discovered) });
  eq('same seed → identical map', JSON.stringify(m1), JSON.stringify(m2));
  eq('every region assigned', Object.keys(m1).length, regionIds.length);
  check('all assignments are real breeds', Object.values(m1).every((id) => !!C.breedById(id)));
  check('starter is a familiar (already-collected) breed', discovered.has(m1['a']));
  const newOnes = new Set(Object.values(m1).filter((id) => !discovered.has(id)));
  check('at most one NEW breed on the board', newOnes.size <= 1);

  // re-roll on a fresh entry can change the board
  let reRolled = false;
  for (let n = 2; n <= 10 && !reRolled; n++) {
    if (JSON.stringify(C.assignBoardBreeds({ ...ctx, entryNonce: n })) !== JSON.stringify(m1))
      reRolled = true;
  }
  check('a fresh entry can re-roll the breeds', reRolled);
}

// ============================================================
// 5) Newcomer respects the difficulty gate (early = commons only)
// ============================================================
{
  // one common collected → early levels can only introduce another common
  const discovered = new Set<string>(['tuxedo']);
  let sawNew = false;
  for (let n = 1; n <= 12; n++) {
    const m = C.assignBoardBreeds({
      levelNumber: 1,
      entryNonce: n,
      discovered,
      regionIds,
      size: 6,
      givenRegionId: 'a',
      baseBreed: 'tuxedo'
    });
    for (const id of Object.values(m)) {
      if (!discovered.has(id)) {
        sawNew = true;
        check(`newcomer at lvl 1 is common (${id})`, C.breedById(id)!.rarity === 'common');
      }
    }
  }
  check('a newcomer did appear on early levels', sawNew);
}

// ============================================================
// 6) discoverBreed + persistence (Р-47, §10.7)
// ============================================================
{
  C.initCollectionPersistence();
  eq('discover: first time is new', C.discoverBreed('tuxedo', 3), true);
  eq('discover: second time is not new', C.discoverBreed('tuxedo', 5), false);
  check('isDiscovered after discovery', C.isDiscovered('tuxedo'));
  const rec = get(C.collection).discovered['tuxedo'];
  eq('count increments on re-encounter', rec.count, 2);
  eq('firstLevel kept from first discovery', rec.firstLevel, 3);
  check('collection persisted to storage', (store.get('kc.collection') ?? '').includes('tuxedo'));
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

// ============================================================
// 8) Robust load: a malformed/old-shape saved blob must not break the store
//    (regression: `discovered` undefined → `discovered[id]` threw at mount)
// ============================================================
{
  // simulate a stale save from an earlier build with no `discovered` map
  storage.set('collection', { v: 1 } as never);
  C.initCollectionPersistence();
  const d = get(C.collection).discovered;
  check('malformed save → discovered is an object', !!d && typeof d === 'object');
  eq('malformed save → discovered is empty', Object.keys(d).length, 0);
  check('indexing after malformed load does not throw', C.isDiscovered('tuxedo') === false);
}

// ---- report ----
if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`collection.ts: all ${passed} assertions pass`);
