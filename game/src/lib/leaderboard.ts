/**
 * Leaderboard adapter (GDD §3.2, Р-43) over the Playgama Bridge SDK.
 *
 * Bridge exposes four flows via `bridge.leaderboards.type`:
 *   - 'not_available' → hide every leaderboard entry point (incl. the Playgama
 *     platform itself, which currently has no leaderboards);
 *   - 'in_game'       → we submit scores AND render our own board (getEntries);
 *   - 'native'        → we only submit scores; the platform draws the board;
 *   - 'native_popup'  → we submit scores and open the platform overlay.
 *
 * The submitted value is the cumulative `totalScore` (Р-42) — one leaderboard,
 * id `total_score`, declared in playgama-bridge-config.json.
 *
 * Local dev / preview builds (no Bridge script): the adapter mocks the
 * 'in_game' flow with fake entries, mirroring how the ads adapter keeps
 * ad-gated UI testable off-platform.
 */
import { writable } from 'svelte/store';
import { getBridge, type LeaderboardsType, type BridgeLeaderboardEntry } from './bridge';

export const LEADERBOARD_ID = 'total_score';

export interface LeaderboardEntry {
  id: string;
  name: string;
  photo: string;
  score: number;
  rank: number;
  /** best-effort "this is you" flag (only reliable for the dev mock) */
  self?: boolean;
}

/** Leaderboard flow on this host; drives which UI entry points render. */
export const leaderboardType = writable<LeaderboardsType>('not_available');

let mockMode = false;

/** Read leaderboard capability once Bridge is initialized (call after initBridge()). */
export function initLeaderboard(): void {
  const b = getBridge();
  if (b) {
    leaderboardType.set(b.leaderboards?.type ?? 'not_available');
    return;
  }
  // No Bridge at all → local dev / standalone preview: mock the in-game flow.
  mockMode = true;
  leaderboardType.set('in_game');
}

/**
 * Submit the cumulative score. Fire-and-forget from the win flow: a submission
 * failure must never break the victory sequence.
 */
export async function submitScore(total: number): Promise<void> {
  const b = getBridge();
  if (!b?.leaderboards || b.leaderboards.type === 'not_available') return;
  try {
    await b.leaderboards.setScore(LEADERBOARD_ID, total);
  } catch (error) {
    console.warn('[leaderboard] setScore failed', error);
  }
}

/** Entries for our own board ('in_game' only). Returns null on failure. */
export async function getEntries(playerTotal: number): Promise<LeaderboardEntry[] | null> {
  if (mockMode) return mockEntries(playerTotal);
  const b = getBridge();
  if (!b?.leaderboards || b.leaderboards.type !== 'in_game') return null;
  try {
    const raw = await b.leaderboards.getEntries(LEADERBOARD_ID);
    return raw.map((e: BridgeLeaderboardEntry) => ({
      id: e.id,
      name: e.name || 'Player',
      photo: e.photo || '',
      score: Number(e.score) || 0,
      rank: Number(e.rank) || 0
    }));
  } catch (error) {
    console.warn('[leaderboard] getEntries failed', error);
    return null;
  }
}

/** Open the platform overlay ('native_popup' only). */
export async function showNativePopup(): Promise<void> {
  const b = getBridge();
  if (!b?.leaderboards || b.leaderboards.type !== 'native_popup') return;
  try {
    await b.leaderboards.showNativePopup(LEADERBOARD_ID);
  } catch (error) {
    console.warn('[leaderboard] showNativePopup failed', error);
  }
}

/** Dev-mock board: fixed cast around the player's real total. */
function mockEntries(playerTotal: number): LeaderboardEntry[] {
  const cast = [
    { name: 'Whiskers', score: 48210 },
    { name: 'Mittens', score: 31475 },
    { name: 'Purrfessor', score: 19980 },
    { name: 'Naptime', score: 8340 },
    { name: 'Catnip Carl', score: 2115 }
  ];
  const all = [
    ...cast.map((c, i) => ({ id: `mock-${i}`, name: c.name, photo: '', score: c.score, rank: 0 })),
    { id: 'self', name: 'You', photo: '', score: playerTotal, rank: 0, self: true }
  ];
  all.sort((a, b) => b.score - a.score);
  return all.map((e, i) => ({ ...e, rank: i + 1 }));
}
