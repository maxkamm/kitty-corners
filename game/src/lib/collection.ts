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
 * Full roster — 20 breeds (GDD §10.2). `hasArt: false` breeds (Russian Blue,
 * Abyssinian, Norwegian Forest, and the Golden/Void/Cosmic legendaries) are shown
 * locked in the Collection and excluded from drops until their art lands.
 */
export const ROSTER: Breed[] = [
  { id: 'bombay', name: 'Bombay', rarity: 'common', hasArt: true },
  { id: 'tabby', name: 'Tabby', rarity: 'common', hasArt: true },
  { id: 'white', name: 'White', rarity: 'common', hasArt: true },
  { id: 'tuxedo', name: 'Tuxedo', rarity: 'common', hasArt: true },
  { id: 'cream', name: 'Cream', rarity: 'common', hasArt: true },
  { id: 'bsh', name: 'British Shorthair', rarity: 'common', hasArt: true },
  { id: 'calico', name: 'Calico', rarity: 'uncommon', hasArt: true },
  { id: 'siamese', name: 'Siamese', rarity: 'uncommon', hasArt: true },
  { id: 'persian', name: 'Persian', rarity: 'uncommon', hasArt: true },
  { id: 'scottishfold', name: 'Scottish Fold', rarity: 'uncommon', hasArt: true },
  { id: 'bengal', name: 'Bengal', rarity: 'rare', hasArt: true },
  { id: 'mainecoon', name: 'Maine Coon', rarity: 'rare', hasArt: true },
  { id: 'ragdoll', name: 'Ragdoll', rarity: 'rare', hasArt: true },
  { id: 'russianblue', name: 'Russian Blue', rarity: 'rare', hasArt: false },
  { id: 'sphynx', name: 'Sphynx', rarity: 'epic', hasArt: true },
  { id: 'abyssinian', name: 'Abyssinian', rarity: 'epic', hasArt: false },
  { id: 'norwegian', name: 'Norwegian Forest', rarity: 'epic', hasArt: false },
  { id: 'golden', name: 'Golden', rarity: 'legendary', hasArt: false },
  { id: 'void', name: 'Void', rarity: 'legendary', hasArt: false },
  { id: 'cosmic', name: 'Cosmic', rarity: 'legendary', hasArt: false }
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

/** Persisted discovery state; write-through to storage on every change. */
export const collection = writable<CollectionState>(storage.get('collection', emptyState()));

/**
 * Wire up collection persistence — called from initGamePersistence() AFTER
 * storage.hydrate() (same deferral as game/settings), so the initial empty state
 * never overwrites a saved collection before hydrate resolves.
 */
export function initCollectionPersistence(): void {
  collection.set(storage.get('collection', emptyState()));
  collection.subscribe((v) => storage.set('collection', v));
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
 * Draw weight for a breed at a given difficulty (Р-48):
 *   weight = base[tier] × gate(difficulty, tier) × bias
 * bias favours not-yet-discovered breeds (×2.5) so the collection fills without
 * guaranteeing any single discovery. Art-less breeds never drop.
 */
export function dropWeight(breed: Breed, difficulty: number, discovered: Set<string>): number {
  if (!breed.hasArt) return 0;
  const g = gate(difficulty, RARITY[breed.rarity]);
  if (g <= 0) return 0;
  const bias = discovered.has(breed.id) ? 1 : 2.5;
  return RARITY[breed.rarity].base * g * bias;
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
  /** difficulty proxy = player-facing level number (curve position, Р-38). */
  levelNumber: number;
  /** increments on each fresh entry to a level → stable on restart, re-rolls on re-entry. */
  entryNonce: number;
  /** currently discovered breed ids (drives K and the bias). */
  discovered: Set<string>;
  /** distinct region ids present on the board. */
  regionIds: string[];
  /** board size N. */
  size: number;
}

/**
 * Assign a breed to every region id on the board (GDD §10.3–§10.4). Deterministic
 * for a given (levelNumber, entryNonce): the same seed yields the same map (stable
 * across a restart), a new entry re-rolls. Each chosen breed occupies ≥1 region.
 */
export function assignBoardBreeds(ctx: AssignCtx): Record<string, string> {
  const rng = rngFor(`${ctx.levelNumber}:${ctx.entryNonce}`);
  const k = boardBreedCount(ctx.discovered.size, ctx.size, ctx.regionIds.length);
  const pool = ROSTER.map((b) => ({ b, w: dropWeight(b, ctx.levelNumber, ctx.discovered) })).filter(
    (x) => x.w > 0
  );
  let chosen = weightedSample(pool, k, rng);
  if (chosen.length === 0) chosen = [ROSTER[0]]; // safety: commons are eligible from level 1
  const regions = shuffle(ctx.regionIds.slice(), rng);
  const map: Record<string, string> = {};
  regions.forEach((rid, i) => {
    const breed = i < chosen.length ? chosen[i] : chosen[Math.floor(rng() * chosen.length)];
    map[rid] = breed.id;
  });
  return map;
}
