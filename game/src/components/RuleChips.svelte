<!-- Rules strip (GDD §5.2, Р-33): flat chips, mini-grid 3×3 (40px) + text. Rule texts in EN. -->
<script lang="ts">
  import { catForRegion } from '../lib/skin';
  const chipCat = catForRegion(0).idle;
</script>

<div class="rules-strip" aria-label="Rules">
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <!-- kc_reference card 1: blue X chips mark the covered color -->
      {#each [[1, 1], [13, 1], [25, 1], [1, 13], [1, 25]] as [x, y]}
        <rect {x} {y} width="10" height="10" rx="3" fill="#7cb1f2" />
        <path d="M{x + 3} {y + 3} l4 4 m0 -4 l-4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" />
      {/each}
      {#each [[25, 13], [13, 25], [25, 25]] as [x, y]}
        <rect {x} {y} width="10" height="10" rx="3" fill="var(--surface-2)" />
      {/each}
      <rect x="13" y="13" width="10" height="10" rx="3" fill="var(--surface-2)" />
      <image href={chipCat} x="12" y="12" width="12" height="12" />
    </svg>
    <span>1 Cat per color</span>
  </div>
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      {#each [1, 13, 25] as y}
        {#each [1, 13, 25] as x}
          <rect {x} {y} width="10" height="10" rx="3" fill="var(--surface-2)" />
        {/each}
      {/each}
      <!-- paws mark the rest of the cat's row (top) and column (middle) -->
      {#each [[1, 1], [25, 1], [13, 13], [13, 25]] as [x, y]}
        <use href="#ic-paw" x={x + 2} y={y + 2} width="6" height="6" class="mini-paw" />
      {/each}
      <image href={chipCat} x="12" y="0" width="12" height="12" />
    </svg>
    <span>1 Cat per column and row</span>
  </div>
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      {#each [1, 13, 25] as y}
        {#each [1, 13, 25] as x}
          <rect {x} {y} width="10" height="10" rx="3" fill="var(--surface-2)" />
        {/each}
      {/each}
      {#each [[3, 3], [15, 3], [27, 3], [3, 15], [27, 15], [3, 27], [15, 27], [27, 27]] as [x, y]}
        <use href="#ic-paw" {x} {y} width="6" height="6" class="mini-paw" />
      {/each}
      <image href={chipCat} x="12" y="12" width="12" height="12" />
    </svg>
    <span>Cats cannot touch</span>
  </div>
</div>

<style>
  .rules-strip {
    display: flex;
    gap: 8px;
    justify-content: center;
    /* roughly align with the (now fluid) board footprint in portrait, centered */
    max-width: 460px;
    margin: 0 auto;
    width: 100%;
  }
  .rule-chip {
    flex: 1;
    min-width: 0;
    background: var(--surface);
    border-radius: 16px;
    padding: 13px 9px;
    box-shadow: var(--shadow-pop);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    color: var(--ink);
    text-align: left;
    line-height: 1.3;
  }
  .mini-paw {
    color: rgba(63, 36, 26, 0.6);
  }
  .rule-chip svg {
    width: 46px;
    height: 46px;
    flex: none;
  }
  /* Portrait: when vertical space is tight, shrink the chips (font, padding,
     mini-grid) with the viewport height so they don't push the board off-screen. */
  @media (orientation: portrait) {
    .rule-chip {
      padding: clamp(6px, 1.6vh, 13px) 9px;
      gap: clamp(5px, 1vh, 8px);
      font-size: clamp(9px, 1.6vh, 11px);
    }
    .rule-chip svg {
      width: clamp(30px, 6vh, 46px);
      height: clamp(30px, 6vh, 46px);
    }
  }
  /* Landscape/desktop: chips stack vertically in the side column. */
  @media (min-aspect-ratio: 1 / 1) {
    .rules-strip {
      flex-direction: column;
      gap: 10px;
    }
    .rule-chip {
      flex: none;
    }
  }
</style>
