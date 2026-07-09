<!-- Rules strip (GDD §5.2, Р-33): flat chips, mini-grid 3×3 (40px) + text. Rule texts in EN. -->
<div class="rules-strip" aria-label="Rules">
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="25" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" />
      <rect x="1" y="13" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="13" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="25" y="13" width="10" height="10" rx="2.5" fill="var(--line)" />
      <rect x="1" y="25" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="25" width="10" height="10" rx="2.5" fill="var(--line)" /><rect x="25" y="25" width="10" height="10" rx="2.5" fill="var(--line)" />
      <use href="#soft-x" x="3" y="3" width="6" height="6" /><use href="#soft-x" x="15" y="3" width="6" height="6" /><use href="#soft-x" x="27" y="3" width="6" height="6" />
      <use href="#soft-x" x="3" y="15" width="6" height="6" /><use href="#soft-x" x="3" y="27" width="6" height="6" />
      <use href="#cat-round" x="13" y="13" width="10" height="10" />
    </svg>
    <span>1 Cat per color</span>
  </div>
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      {#each [1, 13, 25] as y}
        {#each [1, 13, 25] as x}
          <rect {x} {y} width="10" height="10" rx="2.5" fill="var(--line)" />
        {/each}
      {/each}
      <use href="#soft-x" x="3" y="3" width="6" height="6" /><use href="#soft-x" x="27" y="3" width="6" height="6" />
      <use href="#soft-x" x="15" y="15" width="6" height="6" /><use href="#soft-x" x="15" y="27" width="6" height="6" />
      <use href="#cat-round" x="13" y="1" width="10" height="10" />
    </svg>
    <span>1 Cat per column and row</span>
  </div>
  <div class="rule-chip">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      {#each [1, 13, 25] as y}
        {#each [1, 13, 25] as x}
          <rect {x} {y} width="10" height="10" rx="2.5" fill="var(--line)" />
        {/each}
      {/each}
      {#each [[3, 3], [15, 3], [27, 3], [3, 15], [27, 15], [3, 27], [15, 27], [27, 27]] as [x, y]}
        <use href="#soft-x" {x} {y} width="6" height="6" />
      {/each}
      <use href="#cat-round" x="13" y="13" width="10" height="10" />
    </svg>
    <span>Cats cannot touch</span>
  </div>
  <div class="rule-chip controls-chip">
    <span class="ctrl">Tap — add / remove a cross;</span>
    <span class="ctrl">Long-press — place a cat</span>
  </div>
</div>

<style>
  .rules-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
  }
  /* Controls hint: full-width row beneath the three rule chips (portrait). */
  .controls-chip {
    flex: 1 0 100%;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rule-chip {
    flex: 1;
    background: var(--surface);
    border-radius: 12px;
    padding: 6px 7px;
    border: 1.5px solid var(--line);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 800;
    color: var(--ink-soft);
    text-align: left;
    line-height: 1.2;
    box-shadow: var(--shadow);
  }
  .rule-chip svg {
    width: 40px;
    height: 40px;
    flex: none;
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
    .controls-chip {
      flex: none;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
