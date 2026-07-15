<script lang="ts">
  /**
   * In-level "New cat!" reveal (GDD §10.5, Р-47). Pops when a long-press commit
   * (or autocat) places the first cat of a breed not yet in the collection.
   * Input + the active-play timer are already paused by game.ts; the card stays up
   * until the player taps anywhere — no auto-dismiss — then dismissReveal() resumes.
   */
  import { revealBreedId, dismissReveal } from '../lib/game';
  import { breedById, RARITY } from '../lib/collection';
  import { spriteForBreed } from '../lib/collectionSprites';

  $: breed = $revealBreedId ? breedById($revealBreedId) : undefined;
  $: sprite = $revealBreedId ? spriteForBreed($revealBreedId) : null;
  $: rarity = breed ? RARITY[breed.rarity] : undefined;

  function close(): void {
    dismissReveal();
  }
</script>

{#if breed}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-no-noninteractive-element-interactions -->
  <div class="reveal" role="dialog" aria-label="New cat discovered" on:click={close}>
    <div class="card" style="--rar:{rarity?.color ?? 'var(--accent)'}">
      <div class="ribbon">NEW CAT!</div>
      <div class="port">
        {#if sprite}
          <img src={sprite.happy} alt={breed.name} draggable="false" />
        {:else}
          <span class="silhouette">?</span>
        {/if}
      </div>
      <h3>{breed.name}</h3>
      <span class="badge" style="background:{rarity?.color}">{rarity?.label}</span>
      <div class="hint">tap to continue</div>
    </div>
  </div>
{/if}

<style>
  .reveal {
    position: absolute;
    inset: 0;
    z-index: 12;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 26px;
    background: rgba(40, 30, 50, 0.5);
    animation: dim-in 0.2s ease both;
  }
  .card {
    width: 100%;
    max-width: 270px;
    background: var(--surface);
    border-radius: 26px;
    padding: 22px 18px 16px;
    text-align: center;
    box-shadow: 0 22px 50px rgba(0, 0, 0, 0.3);
    position: relative;
    animation: card-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .ribbon {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 1px;
    padding: 6px 18px;
    border-radius: 999px;
    border-bottom: 3px solid var(--accent-edge);
    white-space: nowrap;
  }
  .port {
    width: 132px;
    height: 132px;
    margin: 12px auto 8px;
    border-radius: 36px; /* squircle (portrait variant B) */
    background: color-mix(in srgb, var(--rar) 16%, var(--surface));
    box-shadow: inset 0 -6px 14px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .port img {
    width: 120px;
    height: 120px;
    object-fit: contain;
  }
  .silhouette {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 54px;
    color: color-mix(in srgb, var(--rar) 45%, #b7ac9c);
  }
  h3 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 24px;
    margin: 2px 0 8px;
    color: var(--ink);
  }
  .badge {
    display: inline-block;
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    padding: 3px 12px;
    border-radius: 999px;
  }
  .hint {
    margin-top: 14px;
    font-size: 12px;
    color: var(--ink-soft);
  }
  @keyframes dim-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes card-in {
    0% {
      transform: scale(0.6) translateY(10%);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .reveal,
    .card {
      animation: none;
    }
  }
</style>
