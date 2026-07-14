/**
 * Storage abstraction (GDD §7): persisted via the Playgama Bridge SDK.
 *
 * Bridge storage is asynchronous, but the game reads settings/progress
 * synchronously while initializing its stores. To bridge that, this adapter
 * keeps an in-memory write-through cache:
 *   - `hydrate()` loads every known key from Bridge once, before the app mounts.
 *   - `get()` reads synchronously from the cache.
 *   - `set()` updates the cache and fires the Bridge write in the background.
 *
 * If Bridge is unavailable (script failed to load), it falls back to
 * localStorage so local development still works.
 */
import { getBridge } from './bridge';

export interface StorageAdapter {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  /** Load all known keys from the backend into the cache. Call once at boot. */
  hydrate(): Promise<void>;
}

const PREFIX = 'kc.';

/** Every persisted key the game uses (game.ts progress + settings.ts). */
const KEYS = ['level', 'streak', 'bestStreak', 'sound', 'music', 'vibration', 'patternMarks', 'tutorialDone', 'totalScore', 'theme'] as const;

class BridgeStorageAdapter implements StorageAdapter {
  /** Raw JSON strings keyed by unprefixed key — mirrors localStorage semantics. */
  private cache = new Map<string, string>();

  async hydrate(): Promise<void> {
    const b = getBridge();
    const prefixed = KEYS.map((k) => PREFIX + k);
    if (b?.storage) {
      try {
        const values = (await b.storage.get(prefixed)) as unknown[];
        KEYS.forEach((k, i) => {
          const v = Array.isArray(values) ? values[i] : undefined;
          if (v !== null && v !== undefined) this.cache.set(k, String(v));
        });
        return;
      } catch (error) {
        console.warn('[storage] Bridge hydrate failed, falling back to localStorage', error);
      }
    }
    // Fallback: read directly from localStorage.
    for (const k of KEYS) {
      try {
        const raw = localStorage.getItem(PREFIX + k);
        if (raw !== null) this.cache.set(k, raw);
      } catch {
        /* storage unavailable — ignore */
      }
    }
  }

  get<T>(key: string, fallback: T): T {
    const raw = this.cache.get(key);
    if (raw === undefined) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    const raw = JSON.stringify(value);
    // Skip redundant writes (store subscriptions fire once on init with the
    // value we just hydrated).
    if (this.cache.get(key) === raw) return;
    this.cache.set(key, raw);

    const b = getBridge();
    if (b?.storage) {
      Promise.resolve(b.storage.set(PREFIX + key, raw)).catch((error) =>
        console.warn('[storage] Bridge set failed', error)
      );
    } else {
      try {
        localStorage.setItem(PREFIX + key, raw);
      } catch {
        /* storage unavailable — ignore */
      }
    }
  }
}

export const storage: StorageAdapter = new BridgeStorageAdapter();
