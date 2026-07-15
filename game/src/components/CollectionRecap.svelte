<script lang="ts">
  /**
   * Victory recap block (GDD §10.5, Р-47): a compact strip of the breeds first
   * discovered on the level just won — NOT the full reveal card (that already
   * played in-level). Hidden when nothing new was found.
   */
  import { levelNewBreeds } from '../lib/game';
  import { breedById, RARITY } from '../lib/collection';
  import { spriteForBreed } from '../lib/collectionSprites';

  $: items = $levelNewBreeds
    .map((id) => {
      const breed = breedById(id);
      return breed ? { breed, sprite: spriteForBreed(id), rarity: RARITY[breed.rarity] } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
</script>

{#if items.length}
  <div class="recap">
    <div class="rt">✦ New cats this level ✦</div>
    <div class="row">
      {#each items as it}
        <div class="mini">
          <span class="newpip">NEW</span>
          <div class="mp" style="--rar:{it.rarity.color}">
            {#if it.sprite}
              <img src={it.sprite.happy} alt={it.breed.name} draggable="false" />
            {:else}
              <span class="q">?</span>
            {/if}
          </div>
          <div class="nm">{it.breed.name}</div>
          <div class="rl"><span class="dot" style="background:{it.rarity.color}"></span>{it.rarity.label}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .recap {
    width: 100%;
    max-width: 300px;
    background: var(--surface);
    border: 1.5px dashed var(--accent);
    border-radius: 18px;
    padding: 11px 12px 13px;
    box-shadow: var(--shadow-pop);
    z-index: 1;
    animation: recap-in 0.4s ease 0.3s both;
  }
  .rt {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--accent-edge);
    text-align: center;
    margin-bottom: 9px;
  }
  .row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .mini {
    width: 62px;
    text-align: center;
    position: relative;
  }
  .mp {
    width: 54px;
    height: 54px;
    margin: 0 auto 4px;
    border-radius: 16px; /* squircle */
    background: color-mix(in srgb, var(--rar) 16%, var(--surface));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mp img {
    width: 46px;
    height: 46px;
    object-fit: contain;
  }
  .mp .q {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #b7ac9c;
  }
  .nm {
    font-size: 10px;
    font-weight: 800;
    line-height: 1.1;
    color: var(--ink);
  }
  .rl {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 2px;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .newpip {
    position: absolute;
    top: -5px;
    right: 4px;
    background: var(--accent);
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 8px;
    padding: 2px 5px;
    border-radius: 999px;
    z-index: 2;
  }
  @keyframes recap-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .recap {
      animation: none;
    }
  }
</style>
