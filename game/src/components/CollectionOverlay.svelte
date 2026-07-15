<script lang="ts">
  /**
   * Collection screen (GDD §10.6): rarity-grouped roster with progress, locked
   * silhouettes, NEW pips and a per-cat detail card (§10, window 3 + 4).
   * With the feature OFF it degrades to a plain reveal-all roster (no progress /
   * locks) so the menu button still shows the cats.
   */
  import { createEventDispatcher, onDestroy } from 'svelte';
  import {
    collection,
    ROSTER,
    RARITY,
    RARITY_ORDER,
    breedById,
    markAllSeen,
    rosterSize
  } from '../lib/collection';
  import { spriteForBreed } from '../lib/collectionSprites';
  import { FEATURES } from '../lib/features';

  const dispatch = createEventDispatcher();
  const revealAll = !FEATURES.collection;

  let selected: string | null = null;

  $: disc = $collection.discovered;
  $: unlockedCount = Object.keys(disc).length;
  $: total = revealAll ? ROSTER.filter((b) => b.hasArt).length : rosterSize();

  const isUnlocked = (id: string, hasArt: boolean): boolean =>
    revealAll ? hasArt : !!disc[id];
  const isUnseen = (id: string): boolean => !revealAll && !!disc[id] && !disc[id].seen;

  $: groups = RARITY_ORDER.map((r) => ({
    rarity: r,
    info: RARITY[r],
    breeds: ROSTER.filter((b) => b.rarity === r && (revealAll ? b.hasArt : true))
  })).filter((g) => g.breeds.length);

  // mark seen on close, so NEW pips stay visible for this viewing then clear next time
  onDestroy(() => {
    if (!revealAll) markAllSeen();
  });

  $: selBreed = selected ? breedById(selected) : null;
  $: selRec = selected ? disc[selected] : undefined;
  $: selInfo = selBreed ? RARITY[selBreed.rarity] : undefined;
  $: selSprite = selected ? spriteForBreed(selected) : null;
  $: selUnlocked = selBreed ? isUnlocked(selBreed.id, selBreed.hasArt) : false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-no-noninteractive-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-label="Cat collection"
  on:click={(e) => {
    if (e.target === e.currentTarget) dispatch('close');
  }}
>
  <div class="sheet">
    <div class="head">
      <h2>Collection</h2>
      <button class="x" aria-label="Close" on:click={() => dispatch('close')}>✕</button>
    </div>
    {#if !revealAll}
      <div class="prog">
        <div class="pt">{unlockedCount} / {total} collected</div>
        <div class="bar"><i style="width:{(unlockedCount / total) * 100}%"></i></div>
      </div>
    {/if}

    <div class="scroll">
      {#each groups as g}
        <div class="sect">
          <div class="sh" style="color:{g.info.color}">
            <span class="dot" style="background:{g.info.color}"></span>{g.info.label}
          </div>
          <div class="grid">
            {#each g.breeds as b}
              {@const unlocked = isUnlocked(b.id, b.hasArt)}
              {@const sprite = spriteForBreed(b.id)}
              <button class="cc" class:locked={!unlocked} on:click={() => (selected = b.id)}>
                {#if isUnseen(b.id)}<span class="newpip">NEW</span>{/if}
                <div class="cp">
                  {#if unlocked && sprite}
                    <img src={sprite.idle} alt={b.name} draggable="false" />
                  {:else if sprite}
                    <img class="sil" src={sprite.idle} alt="" draggable="false" />
                  {:else}
                    <span class="q">?</span>
                  {/if}
                </div>
                <div class="nm">{unlocked ? b.name : '???'}</div>
                <div class="rd" style="background:{g.info.color};opacity:{unlocked ? 1 : 0.4}"></div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  {#if selBreed}
    <!-- Cat detail (§10.6, window 4) -->
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-no-noninteractive-element-interactions -->
    <div
      class="detail"
      role="dialog"
      aria-label={selUnlocked ? selBreed.name : 'Undiscovered cat'}
      on:click={(e) => {
        if (e.target === e.currentTarget) selected = null;
      }}
    >
      <div class="dcard" style="--rar:{selInfo?.color}">
        <button class="x dclose" aria-label="Back" on:click={() => (selected = null)}>✕</button>
        <span class="badge" style="background:{selInfo?.color}">{selInfo?.label}</span>
        <div class="port">
          {#if selUnlocked && selSprite}
            <img src={selSprite.happy} alt={selBreed.name} draggable="false" />
          {:else if selSprite}
            <img class="sil" src={selSprite.idle} alt="" draggable="false" />
          {:else}
            <span class="q big">?</span>
          {/if}
        </div>
        <h3>{selUnlocked ? selBreed.name : '???'}</h3>
        {#if selUnlocked && selRec}
          <div class="stats">
            <div class="r"><span>Rarity</span><b style="color:{selInfo?.color}">{selInfo?.label}</b></div>
            <div class="r"><span>Times seen</span><b>×{selRec.count}</b></div>
            <div class="r"><span>First met</span><b>Level {selRec.firstLevel}</b></div>
          </div>
        {:else}
          <p class="locked-note">
            Keep playing to discover this {selInfo?.label.toLowerCase()} cat.
            <br />Appears from around Level {selInfo?.threshold}.
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(40, 30, 50, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 10;
  }
  .sheet {
    width: 100%;
    max-width: 360px;
    height: 86%;
    background: var(--bg);
    border-radius: 24px;
    padding: 16px 14px 0;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 22px;
  }
  .x {
    width: 32px;
    height: 32px;
    border-radius: 12px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    color: var(--ink-soft);
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .prog {
    margin-top: 8px;
  }
  .pt {
    font-size: 12px;
    font-weight: 800;
    color: var(--ink-soft);
    margin-bottom: 4px;
  }
  .bar {
    height: 8px;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }
  .bar i {
    display: block;
    height: 100%;
    background: var(--accent);
    border-radius: 999px;
    transition: width 0.4s ease;
  }
  .scroll {
    flex: 1;
    overflow-y: auto;
    margin-top: 12px;
    padding-bottom: 16px;
  }
  .sect {
    margin-bottom: 14px;
  }
  .sh {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
  }
  .cc {
    background: var(--surface);
    border: none;
    border-radius: 14px;
    box-shadow: var(--shadow);
    padding: 9px 5px 7px;
    text-align: center;
    position: relative;
    cursor: pointer;
  }
  .cp {
    width: 52px;
    height: 52px;
    margin: 0 auto 5px;
    border-radius: 15px; /* squircle */
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp img {
    width: 46px;
    height: 46px;
    object-fit: contain;
  }
  .cp img.sil {
    filter: brightness(0);
    opacity: 0.16;
  }
  .cc.locked .cp {
    background: #e7ded2;
  }
  .q {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 22px;
    color: #c3b8a8;
  }
  .q.big {
    font-size: 54px;
  }
  .nm {
    font-size: 9.5px;
    font-weight: 800;
    line-height: 1.1;
    color: var(--ink);
  }
  .cc.locked .nm {
    color: #b7ac9c;
  }
  .rd {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin: 3px auto 0;
  }
  .newpip {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--accent);
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 8px;
    padding: 2px 5px;
    border-radius: 999px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
  /* detail (window 4) */
  .detail {
    position: absolute;
    inset: 0;
    background: rgba(40, 30, 50, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 26px;
    z-index: 11;
  }
  .dcard {
    width: 100%;
    max-width: 268px;
    background: var(--surface);
    border-radius: 26px;
    padding: 20px 18px 18px;
    text-align: center;
    box-shadow: 0 22px 50px rgba(0, 0, 0, 0.3);
    position: relative;
  }
  .dclose {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  .badge {
    position: absolute;
    top: 16px;
    left: 16px;
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    padding: 3px 12px;
    border-radius: 999px;
  }
  .port {
    width: 150px;
    height: 150px;
    margin: 8px auto 10px;
    border-radius: 40px; /* squircle */
    background: color-mix(in srgb, var(--rar) 16%, var(--surface));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 -6px 14px rgba(0, 0, 0, 0.08);
  }
  .port img {
    width: 132px;
    height: 132px;
    object-fit: contain;
  }
  .port img.sil {
    filter: brightness(0);
    opacity: 0.18;
  }
  .dcard h3 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 26px;
    margin: 2px 0 8px;
    color: var(--ink);
  }
  .stats {
    margin-top: 12px;
    background: var(--bg);
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .stats .r {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
  .stats .r span {
    color: var(--ink-soft);
    font-weight: 700;
  }
  .stats .r b {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    color: var(--ink);
  }
  .locked-note {
    margin: 10px 0 2px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--ink-soft);
    font-weight: 700;
  }
</style>
