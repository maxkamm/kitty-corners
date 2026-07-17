/**
 * Cat collection — core logic (GDD §10, Р-46…Р-55). Post-MVP, gated by
 * FEATURES.collection.
 *
 * Pure logic only: the roster, rarity tiers, the seeded weighted drop, per-level
 * board assignment and discovery/persistence live here. NO `.webp` imports — this
 * module is pulled into `game.ts` and therefore into the Node test harness, which
 * only understands `.ts`/`.json`. Sprite URLs live in `collectionSprites.ts`
 * (UI-only).
 */
import { writable, get } from 'svelte/store';
import { storage } from './storage';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Breed {
  id: string;
  name: string;
  rarity: Rarity;
  /**
   * false until art is produced (Р-53). Roster keeps the breed so the Collection
   * screen shows its silhouette + tier, but it is never dropped onto the board.
   */
  hasArt: boolean;
}

export interface RarityInfo {
  label: string;
  /** base draw weight — higher = more common (Р-48). */
  base: number;
  /** difficulty (player level number) at which the tier starts appearing (Р-50). */
  threshold: number;
  /** eligibility ramps 0→1 over this many levels past the threshold. */
  ramp: number;
  /** UI accent for badges / dots (proposed tokens, §6.4). */
  color: string;
  /** display order, common → legendary. */
  order: number;
}

/** Rarity tiers and their difficulty gates (GDD §10.2, §10.4, Р-50). */
export const RARITY: Record<Rarity, RarityInfo> = {
  common: { label: 'Common', base: 100, threshold: 1, ramp: 1, color: '#8A8093', order: 0 },
  uncommon: { label: 'Uncommon', base: 45, threshold: 8, ramp: 4, color: '#5FBD8C', order: 1 },
  rare: { label: 'Rare', base: 18, threshold: 20, ramp: 6, color: '#3E8FD6', order: 2 },
  epic: { label: 'Epic', base: 7, threshold: 40, ramp: 8, color: '#8258C8', order: 3 },
  legendary: { label: 'Legendary', base: 2, threshold: 60, ramp: 10, color: '#E8912B', order: 4 }
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/**
 * Full roster — 37 breeds: 10 from kc_kitty_list3 (k3_/k3happy_) + 27 new from
 * kc_kitty_list4 (k4_/k4happy_); ragdoll appears on both sheets, kept once. Every
 * breed has art (idle + happy). Rarity is a design assignment (§10.2) — tweak
 * freely; the drop gating and Collection grouping follow the `rarity` field.
 */
export const ROSTER: Breed[] = [
  // Common
  { id: 'tuxedo', name: 'Tuxedo', rarity: 'common', hasArt: true },
  { id: 'dilutecalico', name: 'Dilute Calico', rarity: 'common', hasArt: true },
  { id: 'tortoiseshell', name: 'Tortoiseshell', rarity: 'common', hasArt: true },
  { id: 'oddeyedwhite', name: 'Odd-Eyed White', rarity: 'common', hasArt: true },
  { id: 'americanshorthair', name: 'American Shorthair', rarity: 'common', hasArt: true },
  { id: 'mainecoonred', name: 'Maine Coon (Red)', rarity: 'common', hasArt: true },
  { id: 'munchkin', name: 'Munchkin', rarity: 'common', hasArt: true },
  { id: 'japanesebobtail', name: 'Japanese Bobtail', rarity: 'common', hasArt: true },
  { id: 'bombay', name: 'Bombay', rarity: 'common', hasArt: true },
  { id: 'bsh', name: 'British Shorthair', rarity: 'common', hasArt: true },
  // Uncommon
  { id: 'russianblue', name: 'Russian Blue', rarity: 'uncommon', hasArt: true },
  { id: 'burmese', name: 'Burmese', rarity: 'uncommon', hasArt: true },
  { id: 'himalayan', name: 'Himalayan', rarity: 'uncommon', hasArt: true },
  { id: 'ragdoll', name: 'Ragdoll', rarity: 'uncommon', hasArt: true },
  { id: 'persian', name: 'Persian', rarity: 'uncommon', hasArt: true },
  { id: 'siamese', name: 'Siamese', rarity: 'uncommon', hasArt: true },
  { id: 'calico', name: 'Calico', rarity: 'uncommon', hasArt: true },
  { id: 'exoticshorthair', name: 'Exotic Shorthair', rarity: 'uncommon', hasArt: true },
  { id: 'turkishangora', name: 'Turkish Angora', rarity: 'uncommon', hasArt: true },
  // Rare
  { id: 'tonkinese', name: 'Tonkinese', rarity: 'rare', hasArt: true },
  { id: 'orientalshorthair', name: 'Oriental Shorthair', rarity: 'rare', hasArt: true },
  { id: 'birman', name: 'Birman', rarity: 'rare', hasArt: true },
  { id: 'norwegian', name: 'Norwegian Forest', rarity: 'rare', hasArt: true },
  { id: 'siberian', name: 'Siberian', rarity: 'rare', hasArt: true },
  { id: 'mainecoon', name: 'Maine Coon', rarity: 'rare', hasArt: true },
  { id: 'scottishfold', name: 'Scottish Fold', rarity: 'rare', hasArt: true },
  { id: 'chartreux', name: 'Chartreux', rarity: 'rare', hasArt: true },
  { id: 'singapura', name: 'Singapura', rarity: 'rare', hasArt: true },
  // Epic
  { id: 'sphynx', name: 'Sphynx', rarity: 'epic', hasArt: true },
  { id: 'bengal', name: 'Bengal', rarity: 'epic', hasArt: true },
  { id: 'devonrex', name: 'Devon Rex', rarity: 'epic', hasArt: true },
  { id: 'laperm', name: 'LaPerm', rarity: 'epic', hasArt: true },
  { id: 'selkirkrex', name: 'Selkirk Rex', rarity: 'epic', hasArt: true },
  { id: 'abyssinian', name: 'Abyssinian', rarity: 'epic', hasArt: true },
  // Legendary
  { id: 'savannah', name: 'Savannah', rarity: 'legendary', hasArt: true },
  { id: 'egyptianmau', name: 'Egyptian Mau', rarity: 'legendary', hasArt: true },
  { id: 'vankedisi', name: 'Van Kedisi', rarity: 'legendary', hasArt: true }
];

const BY_ID = new Map(ROSTER.map((b) => [b.id, b]));
export function breedById(id: string): Breed | undefined {
  return BY_ID.get(id);
}
export function rosterSize(): number {
  return ROSTER.length;
}

// ---------- persistence (GDD §10.7) ----------
export interface DiscoveryRecord {
  /** player-facing level number where the breed was first met. */
  firstLevel: number;
  /** epoch ms of first discovery. */
  ts: number;
  /** how many times a cat of this breed has been placed (commit + given). */
  count: number;
  /** false until the player has viewed it in the Collection screen (NEW pip). */
  seen: boolean;
}

export interface CollectionState {
  v: 1;
  discovered: Record<string, DiscoveryRecord>;
}

function emptyState(): CollectionState {
  return { v: 1, discovered: {} };
}

/**
 * Load persisted state, tolerating missing or old-shape data. A save written by
 * an earlier build (or a partially-written / migrated blob) may lack a valid
 * `discovered` map; without this guard `discovered` could be `undefined` and the
 * first `discovered[id]` access would throw at mount. Always returns a well-formed
 * state so every consumer can safely index `.discovered`.
 */
function loadState(): CollectionState {
  const raw = storage.get('collection', emptyState()) as { discovered?: unknown } | null;
  const d = raw && typeof raw === 'object' ? raw.discovered : undefined;
  return {
    v: 1,
    discovered: d && typeof d === 'object' ? (d as Record<string, DiscoveryRecord>) : {}
  };
}

/** Persisted discovery state; write-through to storage on every change. */
export const collection = writable<CollectionState>(loadState());

/**
 * Wire up collection persistence — called from initGamePersistence() AFTER
 * storage.hydrate() (same deferral as game/settings), so the initial empty state
 * never overwrites a saved collection before hydrate resolves.
 */
export function initCollectionPersistence(): void {
  collection.set(loadState());
  // Skip the initial subscribe emission: it is just the value we loaded from
  // storage, so re-writing it is pointless — and if a hydrate hiccup left the
  // store momentarily empty, writing that empty value back would CLOBBER the
  // saved collection. Only persist genuine changes (discoveries, mark-seen).
  let first = true;
  collection.subscribe((v) => {
    if (first) {
      first = false;
      return;
    }
    storage.set('collection', v);
  });
}

export function isDiscovered(id: string): boolean {
  return !!get(collection).discovered[id];
}

export function discoveredCount(): number {
  return Object.keys(get(collection).discovered).length;
}

export function discoveredSet(): Set<string> {
  return new Set(Object.keys(get(collection).discovered));
}

/**
 * Record an encounter with a breed (GDD §10.5, Р-47). Returns true when this is
 * the FIRST time (→ show the in-level "New cat!" card); false when already known
 * (the count is still incremented). Persistence is immediate and survives a later
 * defeat.
 */
export function discoverBreed(id: string, levelNumber: number): boolean {
  let isNew = false;
  collection.update((s) => {
    const rec = s.discovered[id];
    if (rec) {
      return { ...s, discovered: { ...s.discovered, [id]: { ...rec, count: rec.count + 1 } } };
    }
    isNew = true;
    return {
      ...s,
      discovered: {
        ...s.discovered,
        [id]: { firstLevel: levelNumber, ts: Date.now(), count: 1, seen: false }
      }
    };
  });
  return isNew;
}

/** A discovered breed the player has not yet viewed in the Collection (NEW pip). */
export function isUnseen(id: string): boolean {
  const rec = get(collection).discovered[id];
  return !!rec && !rec.seen;
}

/** Mark every discovered breed as seen — call when the Collection screen opens. */
export function markAllSeen(): void {
  collection.update((s) => {
    let changed = false;
    const next: Record<string, DiscoveryRecord> = {};
    for (const [id, rec] of Object.entries(s.discovered)) {
      if (!rec.seen) {
        changed = true;
        next[id] = { ...rec, seen: true };
      } else {
        next[id] = rec;
      }
    }
    return changed ? { ...s, discovered: next } : s;
  });
}

// ---------- seeded RNG ----------
/** xmur3 string hash → 32-bit seed. */
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG in [0,1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(seed: string): () => number {
  return mulberry32(xmur3(seed));
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

// ---------- drop system (GDD §10.3, §10.4, Р-48, Р-49) ----------
/** Tier eligibility: 0 below the threshold, ramping to 1 over `ramp` levels. */
function gate(difficulty: number, r: RarityInfo): number {
  if (difficulty < r.threshold) return 0;
  return Math.min(1, (difficulty - r.threshold + 1) / r.ramp);
}

/**
 * Draw weight for a breed at a given difficulty (Р-48): base[tier] × gate. Used to
 * pick the featured newcomer among eligible undiscovered breeds (rarer tiers weigh
 * less, and are 0 until their difficulty gate opens). Art-less breeds never drop.
 */
export function dropWeight(breed: Breed, difficulty: number): number {
  if (!breed.hasArt) return 0;
  const g = gate(difficulty, RARITY[breed.rarity]);
  if (g <= 0) return 0;
  return RARITY[breed.rarity].base * g;
}

/** Fixed starter breed for the tutorial and level 1 — the first cat collected. */
export const BASE_BREED = 'tuxedo';

/**
 * Per-level chance to introduce a NEW breed (§10.4). Discoveries feel frequent
 * early and rare late: ~every level (1–10), ~every 2nd (11–30), ~every 4th
 * (31–60), then ~1 in 10.
 */
export function newCatChance(level: number): number {
  if (level <= 10) return 1;
  if (level <= 30) return 0.5;
  if (level <= 60) return 0.25;
  return 0.1;
}

/**
 * Number of distinct breeds on the board (Р-49):
 *   K = clamp(1 + floor(U/4), 1, Kcap),  Kcap = clamp(N−4, 2, 5)
 * bounded by the region count. Early collections → K = 1 (one breed everywhere);
 * bigger boards allow more variety.
 */
export function boardBreedCount(discovered: number, size: number, regionCount: number): number {
  const cap = Math.min(clamp(size - 4, 2, 5), Math.max(1, regionCount));
  return clamp(1 + Math.floor(discovered / 4), 1, cap);
}

/** Weighted sampling without replacement. */
function weightedSample(
  pool: { b: Breed; w: number }[],
  k: number,
  rng: () => number
): Breed[] {
  const items = pool.slice();
  const out: Breed[] = [];
  const n = Math.min(k, items.length);
  for (let picked = 0; picked < n; picked++) {
    let total = 0;
    for (const it of items) total += it.w;
    if (total <= 0) break;
    let r = rng() * total;
    let idx = 0;
    for (; idx < items.length; idx++) {
      r -= items[idx].w;
      if (r <= 0) break;
    }
    if (idx >= items.length) idx = items.length - 1;
    out.push(items[idx].b);
    items.splice(idx, 1);
  }
  return out;
}

/** Fisher–Yates shuffle with a seeded RNG. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface AssignCtx {
  /** difficulty proxy = player-facing level number (curve position). */
  levelNumber: number;
  /** increments on each fresh entry to a level -> stable on restart, re-rolls on re-entry. */
  entryNonce: number;
  /** currently discovered breed ids. */
  discovered: Set<string>;
  /** distinct region ids present on the board. */
  regionIds: string[];
  /** board size N. */
  size: number;
  /** the starter (given) region id -> always gets a familiar, already-collected breed. */
  givenRegionId: string;
  /** fixed base breed used while the collection is still empty (tutorial / level 1). */
  baseBreed: string;
}

/**
 * Assign a breed to every region (GDD 10.3-10.5). Model:
 *  - Empty collection (tutorial / level 1) -> the base breed everywhere.
 *  - Otherwise the starter region gets a FAMILIAR (already-collected) breed, and at
 *    most ONE new breed (the "featured newcomer") appears -- gated by newCatChance()
 *    and rarity eligibility -- placed in a non-starter region so the player meets it
 *    on their own commit. Remaining regions are familiar breeds, so old cats keep
 *    showing up. Deterministic per (levelNumber, entryNonce).
 */
export function assignBoardBreeds(ctx: AssignCtx): Record<string, string> {
  const rng = rngFor(`${ctx.levelNumber}:${ctx.entryNonce}`);
  const regions = ctx.regionIds;

  // Bootstrap: no collection yet -> the base cat everywhere.
  const collected = ROSTER.filter((b) => ctx.discovered.has(b.id));
  if (collected.length === 0) {
    const map: Record<string, string> = {};
    for (const rid of regions) map[rid] = ctx.baseBreed;
    return map;
  }

  // 1) featured newcomer: at most one, gated by the per-level chance + rarity gate.
  let newcomer: Breed | null = null;
  if (rng() < newCatChance(ctx.levelNumber)) {
    const eligible = ROSTER.map((b) => ({
      b,
      w: ctx.discovered.has(b.id) ? 0 : dropWeight(b, ctx.levelNumber)
    })).filter((x) => x.w > 0);
    const picked = weightedSample(eligible, 1, rng);
    if (picked.length) newcomer = picked[0];
  }

  // 2) distinct breeds on the board (readability cap), with room for a familiar
  //    starter (+ the newcomer if any).
  const cap = boardBreedCount(ctx.discovered.size, ctx.size, regions.length);
  const distinct = Math.min(regions.length, Math.max(cap, newcomer ? 2 : 1));
  const familiarSlots = Math.max(1, distinct - (newcomer ? 1 : 0));
  const familiars = weightedSample(
    collected.map((b) => ({ b, w: 1 })),
    familiarSlots,
    rng
  );
  if (familiars.length === 0) familiars.push(collected[0]);

  // 3) place: starter = a familiar; newcomer -> a non-starter region; rest familiar.
  const others = shuffle(
    regions.filter((r) => r !== ctx.givenRegionId),
    rng
  );
  const map: Record<string, string> = {};
  map[ctx.givenRegionId] = familiars[0].id;
  let oi = 0;
  if (newcomer && others.length) map[others[oi++]] = newcomer.id;
  for (; oi < others.length; oi++) {
    map[others[oi]] = familiars[Math.floor(rng() * familiars.length)].id;
  }
  return map;
}
