/**
 * Storage abstraction (GDD §7): dev → localStorage, release → Playgama Bridge Storage.
 * Bridge SDK is plugged in only at release stage via an adapter implementing this interface.
 */
export interface StorageAdapter {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
}

const PREFIX = 'kc.';

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — ignore */
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
