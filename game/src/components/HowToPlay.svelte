<script lang="ts">
  /**
   * "How to play" slides (GDD §2.1): 3 short cards — rules, controls, hearts.
   * Used as a modal from the Main screen "?" and Settings, and as the first
   * phase of the first-run tutorial (where the last button reads "Try it").
   */
  import { createEventDispatcher } from 'svelte';

  /** last-slide button label — the tutorial overrides it */
  export let doneLabel = 'Got it';

  const dispatch = createEventDispatcher<{ close: void }>();
  let slide = 0;
  const LAST = 2;

  function next(): void {
    if (slide === LAST) dispatch('close');
    else slide++;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-no-noninteractive-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-label="How to play"
  on:click={(e) => {
    if (e.target === e.currentTarget) dispatch('close');
  }}
>
  <div class="sheet">
    <h2>How to play</h2>

    <div class="slides">
    {#if slide === 0}
      <div class="rule-row">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <rect x="1" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="25" y="1" width="10" height="10" rx="2.5" fill="var(--r2)" />
          <rect x="1" y="13" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="13" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="25" y="13" width="10" height="10" rx="2.5" fill="var(--line)" />
          <rect x="1" y="25" width="10" height="10" rx="2.5" fill="var(--r2)" /><rect x="13" y="25" width="10" height="10" rx="2.5" fill="var(--line)" /><rect x="25" y="25" width="10" height="10" rx="2.5" fill="var(--line)" />
          <use href="#cat-round" x="13" y="13" width="10" height="10" />
        </svg>
        <p><b>1 cat per color</b> — exactly one cat in every color region.</p>
      </div>
      <div class="rule-row">
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
        <p><b>1 cat per row and column</b> — no sharing lines.</p>
      </div>
      <div class="rule-row">
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
        <p><b>Cats cannot touch</b> — not even diagonally.</p>
      </div>
    {:else if slide === 1}
      <div class="rule-row">
        <svg class="pad" viewBox="0 0 24 24" aria-hidden="true"><use href="#soft-x" /></svg>
        <p><b>Tap</b> a cell to mark it with an ✕ — your own notes for cells no cat can use. Tap again to clear.</p>
      </div>
      <div class="rule-row">
        <svg class="pad" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-cathead" /></svg>
        <p><b>Press and hold</b> (~half a second) or <b>double-tap</b> to settle a cat. On desktop, right-click works too.</p>
      </div>
    {:else}
      <div class="rule-row">
        <svg class="pad" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-heart-full" /></svg>
        <p>A cat in the wrong cell costs a <b>heart</b> — you have three per level. Every puzzle is solvable by pure logic, no guessing needed.</p>
      </div>
      <div class="rule-row">
        <svg class="pad" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-flame" /></svg>
        <p>No timer. Solve levels back to back to grow your <b>streak</b> — and take all the time you like.</p>
      </div>
    {/if}
    </div>

    <div class="dots" aria-hidden="true">
      {#each [0, 1, 2] as d}
        <span class="dot" class:on={slide === d}></span>
      {/each}
    </div>
    <button class="cta" on:click={next}>{slide === LAST ? doneLabel : 'Next'}</button>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(40, 30, 50, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 20;
  }
  .sheet {
    width: 100%;
    max-width: 330px;
    /* one fixed height across all three slides (sized to the tallest);
       clamps + scrolls on very short screens (e.g. phone landscape) */
    height: 432px;
    max-height: calc(100% - 48px);
    background: var(--bg);
    border-radius: 24px;
    padding: 22px 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sheet h2 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 22px;
    text-align: center;
    flex: none;
  }
  .slides {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    overflow-y: auto;
  }
  .rule-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface);
    border-radius: 16px;
    padding: 10px 12px;
    box-shadow: var(--shadow-pop);
  }
  .rule-row svg {
    width: 44px;
    height: 44px;
    flex: none;
  }
  .rule-row svg.pad {
    padding: 7px;
    color: var(--accent);
  }
  .rule-row p {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  .dots {
    display: flex;
    justify-content: center;
    gap: 7px;
    flex: none;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--line);
    transition: background 0.15s;
  }
  .dot.on {
    background: var(--accent);
  }
  .sheet .cta {
    padding: 13px;
    flex: none;
  }
</style>
