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
import { writable, get } from 'svelte/store';
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
    // Best-effort "this is you": prefer the platform player id when exposed…
    const selfId = (b as unknown as { player?: { id?: string } }).player?.id;
    const entries = raw.map((e: BridgeLeaderboardEntry) => ({
      id: e.id,
      name: e.name || 'Player',
      photo: e.photo || '',
      score: Number(e.score) || 0,
      rank: Number(e.rank) || 0,
      self: selfId != null && String(e.id) === String(selfId)
    }));
    // …otherwise flag the single row whose score equals the total we submitted
    // (that's the player's own entry) so it can be highlighted.
    if (!entries.some((e) => e.self)) {
      const mine = entries.filter((e) => e.score === playerTotal);
      if (mine.length === 1) mine[0].self = true;
    }
    return entries;
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

// ---------- persistent desktop panel (Р-44) ----------
/**
 * Entries backing the always-on desktop panel. Kept at module level so the
 * board survives screen switches (game → victory) mid-animation.
 */
export const panelEntries = writable<LeaderboardEntry[] | null>(null);
/** score gain currently "flying" into the board (drives the panel chip) */
export const pendingGain = writable(0);

/** duration of the +points flight before the standings update */
export const FLY_MS = 800;
let applyTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Rank movement for the win just played: shown by the desktop panel implicitly
 * (FLIP) and by the compact rank strip on the mobile win screen (Р-45).
 */
export const winRanks = writable<{ from: number; to: number } | null>(null);

/**
 * Rank for a given total against a standings snapshot. Self rows are matched
 * by flag (mock) — a real server row simply holds the pre-win total, so it
 * never outranks either value and the count stays correct.
 */
function rankFor(entries: LeaderboardEntry[], total: number): number {
  return 1 + entries.filter((e) => !e.self && e.score > total).length;
}

/** (Re)load the panel entries. No-op unless the flow is 'in_game' (or mock). */
export async function refreshEntries(playerTotal: number): Promise<void> {
  const entries = await getEntries(playerTotal);
  if (entries) panelEntries.set(entries);
}

/**
 * Win choreography (Р-44): show the flying "+gain" chip, then update the
 * standings (self row climbs — the panel animates the reorder via FLIP).
 * Runs at module level so it completes even if the game screen unmounts
 * during the celebration.
 */
export function queueGain(gain: number, newTotal: number, reducedMotion = false): void {
  // only flows that render our own standings animate
  if (!mockMode && getBridge()?.leaderboards?.type !== 'in_game') return;
  clearTimeout(applyTimer);
  winRanks.set(null);

  // rank movement (Р-45) from the PRE-win snapshot; load it if nothing did yet
  // (portrait never mounts the panel)
  const oldTotal = newTotal - gain;
  const cached = get(panelEntries);
  const snapshot = cached ? Promise.resolve(cached) : getEntries(oldTotal);
  void snapshot.then((entries) => {
    if (!entries) return;
    if (!cached) panelEntries.set(entries);
    winRanks.set({ from: rankFor(entries, oldTotal), to: rankFor(entries, newTotal) });
  });

  if (reducedMotion) {
    void refreshEntries(newTotal);
    return;
  }
  pendingGain.set(gain);
  applyTimer = setTimeout(() => {
    void refreshEntries(newTotal).then(() => pendingGain.set(0));
  }, FLY_MS);
}

/** Dev-mock board: fixed cast around the player's real total. */
function mockEntries(playerTotal: number): LeaderboardEntry[] {
  const cast = [
    { name: 'Whiskers', score: 48210 },
    { name: 'Mittens', score: 31475 },
    { name: 'Purrfessor', score: 19980 },
    { name: 'Sir Pounce', score: 14620 },
    { name: 'Biscuit', score: 11005 },
    { name: 'Naptime', score: 8340 },
    { name: 'Marmalade', score: 6120 },
    { name: 'Shadow', score: 4780 },
    { name: 'Catnip Carl', score: 2115 },
    { name: 'Pixel', score: 1340 },
    { name: 'Tofu', score: 760 },
    { name: 'Waffles', score: 430 }
  ];
  const all = [
    ...cast.map((c, i) => ({ id: `mock-${i}`, name: c.name, photo: '', score: c.score, rank: 0 })),
    { id: 'self', name: 'You', photo: '', score: playerTotal, rank: 0, self: true }
  ];
  all.sort((a, b) => b.score - a.score);
  return all.map((e, i) => ({ ...e, rank: i + 1 }));
}
