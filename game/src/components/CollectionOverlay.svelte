<script lang="ts">
  /** Collection: the cat breed roster (art skin v2, kc_main_screen bottom-left button). */
  import { createEventDispatcher } from 'svelte';
  import { allBreeds } from '../lib/skin';

  const dispatch = createEventDispatcher();
  const breeds = allBreeds();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-label="Cat collection"
  on:click={(e) => {
    if (e.target === e.currentTarget) dispatch('close');
  }}
>
  <div class="sheet">
    <h2>Collection</h2>
    <div class="grid">
      {#each breeds as b}
        <div class="cat-card">
          <img src={b.src} alt={b.name} draggable="false" />
          <span>{b.name}</span>
        </div>
      {/each}
    </div>
    <button class="cta" on:click={() => dispatch('close')}>Close</button>
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
    z-index: 10;
  }
  .sheet {
    width: 100%;
    max-width: 360px;
    max-height: 86%;
    overflow-y: auto;
    background: var(--bg);
    border-radius: 24px;
    padding: 20px 18px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  h2 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 22px;
    text-align: center;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .cat-card {
    background: var(--surface);
    border-radius: 18px;
    box-shadow: var(--shadow-pop);
    padding: 12px 8px 9px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .cat-card img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }
  .cat-card span {
    font-weight: 800;
    font-size: 11px;
    color: var(--ink);
    text-align: center;
  }
  .sheet .cta {
    padding: 12px;
  }
</style>
