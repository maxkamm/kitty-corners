/**
 * Feature flags — compile-time constants (GDD §7).
 *
 * `collection` gates the post-MVP cat-collection feature (GDD §10): rarity-tiered
 * breeds, difficulty-gated weighted drops, the in-level "New cat!" reveal, the
 * Victory recap block and the discovery-based Collection screen.
 *
 * OFF for the base release. Flip to `true` to enable the feature everywhere.
 * Kept as a plain (mutable) object rather than `as const` so tests can toggle it
 * at runtime before exercising the game/collection flows.
 */
export const FEATURES = {
  collection: false
};
