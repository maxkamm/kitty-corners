/**
 * Upgrade-safety test: a player updating from an OLD build (e.g. build 34) must
 * keep their progress. Build 34 wrote these keys under the `kc.` prefix as JSON:
 *   level, streak, bestStreak, sound, vibration, patternMarks, tutorialDone,
 *   totalScore, theme
 * Build 40 uses the SAME prefix + serialization and only ADDS `music` and
 * `collection`. This simulates the real boot order (hydrate → init*) against a
 * build-34 save and asserts nothing is lost and the new keys default cleanly.
 *
 * Run: node --experimental-strip-types --import ./tests/support/register-loader.mjs tests/migration.test.ts
 */
import { get } from 'svelte/store';

let passed = 0;
const failures: string[] = [];
function eq(name: string, got: unknown, want: unknown): void {
  if (got === want) passed++;
  else failures.push(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`);
}
function ok(name: string, cond: boolean): void {
  if (cond) passed++;
  else failures.push(name);
}

// ---- 1) seed a build-34 save into localStorage BEFORE anything imports storage ----
const disk = new Map<string, string>([
  ['kc.level', '12'],
  ['kc.streak', '4'],
  ['kc.bestStreak', '9'],
  ['kc.totalScore', '15230'],
  ['kc.tutorialDone', 'true'],
  ['kc.sound', 'false'],
  ['kc.vibration', 'true'],
  ['kc.patternMarks', 'true'],
  ['kc.theme', '"light"']
  // note: no kc.music, no kc.collection — those keys did not exist in build 34
]);
(globalThis as any).localStorage = {
  getItem: (k: string) => (disk.has(k) ? disk.get(k)! : null),
  setItem: (k: string, v: string) => void disk.set(k, v),
  removeItem: (k: string) => void disk.delete(k)
};
(globalThis as any).window = { matchMedia: () => ({ matches: true }) };

// ---- 2) reproduce the real boot order: hydrate the cache, THEN init stores ----
const { storage } = await import('../src/lib/storage.ts');
await storage.hydrate();

const game = await import('../src/lib/game.ts');
const settings = await import('../src/lib/settings.ts');
const collection = await import('../src/lib/collection.ts');

game.initGamePersistence();
settings.initSettingsPersistence();

// ---- 3) progress from the old save must survive the upgrade ----
eq('level preserved', get(game.levelNumber), 12);
eq('streak preserved', get(game.streak), 4);
eq('best streak preserved', get(game.bestStreak), 9);
eq('total score preserved', get(game.totalScore), 15230);
eq('tutorialDone preserved', get(game.tutorialDone), true);

// ---- 4) settings from the old save must survive ----
eq('sound preserved (off)', get(settings.soundOn), false);
eq('vibration preserved (on)', get(settings.vibrationOn), true);
eq('patternMarks preserved (on)', get(settings.patternMarksOn), true);

// ---- 5) new keys absent in the old save default cleanly (no loss, no crash) ----
eq('music defaults on', get(settings.musicOn), true);
const disc = get(collection.collection).discovered;
ok('collection defaults to empty object', !!disc && typeof disc === 'object' && Object.keys(disc).length === 0);
ok('reading collection does not throw', collection.isDiscovered('tuxedo') === false);

// ---- 6) the old values are still on disk untouched (write-through didn't clobber) ----
eq('disk level untouched', disk.get('kc.level'), '12');
eq('disk totalScore untouched', disk.get('kc.totalScore'), '15230');

if (failures.length) {
  console.error(`FAILED ${failures.length} / ${passed + failures.length}:`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`migration.test.ts: all ${passed} assertions pass — build 34 → 40 keeps progress`);
