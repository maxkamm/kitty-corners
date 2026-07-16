<script lang="ts">
  /**
   * Collection screen (GDD §10.6) — laid out per collection_scrn.png: title + inline
   * progress + close, an intro banner, rarity sections ("● NAME x/n" + divider) and a
   * 3-column grid of tiles. Unlocked = portrait + name (+ NEW pill); locked = a generic
   * cat silhouette + "???". Tapping a cat opens the detail card (window 4).
   * With the feature OFF it degrades to a plain reveal-all roster (no progress / locks).
   * Uses the shared palette tokens (§6.4); no new colours.
   */
  import { createEventDispatcher, onDestroy } from 'svelte';
  import {
    collection,
    ROSTER,
    RARITY,
    RARITY_ORDER,
    breedById,
    markAllSeen,
    rosterSize,
    BASE_BREED
  } from '../lib/collection';
  import { spriteForBreed } from '../lib/collectionSprites';
  import { FEATURES } from '../lib/features';

  const dispatch = createEventDispatcher();
  const revealAll = !FEATURES.collection;

  // Locked slots show the silhouette of the default cat (Tuxedo), tinted via a
  // CSS mask so every undiscovered breed reads as the same neutral placeholder.
  const silUrl = spriteForBreed(BASE_BREED)?.idle ?? '';

  let selected: string | null = null;

  $: disc = $collection.discovered ?? {};
  $: unlockedCount = Object.keys(disc).length;
  $: total = revealAll ? ROSTER.filter((b) => b.hasArt).length : rosterSize();

  // NOTE: `disc` is passed in explicitly (not closed over) so Svelte sees the
  // reactive dependency and orders these AFTER `disc` is assigned. Closing over
  // `disc` hid the dependency, so `groups` ran before `disc` existed → the very
  // first `disc[id]` threw at mount and killed the scheduler. Also null-safe.
  const isUnlocked = (d: typeof disc, id: string, hasArt: boolean): boolean =>
    revealAll ? hasArt : !!(d && d[id]);
  const isUnseen = (id: string): boolean => {
    const r = disc && disc[id];
    return !revealAll && !!r && !r.seen;
  };

  $: groups = RARITY_ORDER.map((r) => {
    const breeds = ROSTER.filter((b) => b.rarity === r && (revealAll ? b.hasArt : true));
    const got = breeds.filter((b) => isUnlocked(disc, b.id, b.hasArt)).length;
    return { rarity: r, info: RARITY[r], breeds, got, tot: breeds.length };
  }).filter((g) => g.breeds.length);

  onDestroy(() => {
    if (!revealAll) markAllSeen();
  });

  $: selBreed = selected ? breedById(selected) : null;
  $: selRec = selected ? disc[selected] : undefined;
  $: selInfo = selBreed ? RARITY[selBreed.rarity] : undefined;
  $: selSprite = selected ? spriteForBreed(selected) : null;
  $: selUnlocked = selBreed ? isUnlocked(disc, selBreed.id, selBreed.hasArt) : false;
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
      {#if !revealAll}
        <span class="progress"><b>{unlockedCount}</b> / {total}</span>
      {/if}
      <button class="close" aria-label="Close" on:click={() => dispatch('close')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    {#if !revealAll}
      <div class="intro">
        Play more levels to find all cats.<br />
        Harder levels have a better chance to reveal the rarest ones!
      </div>
    {/if}

    <div class="scroll">
      {#each groups as g}
        <div class="sect">
          <div class="sh">
            <span class="dot" style="background:{g.info.color}"></span>
            <span class="sh-name" style="color:{g.info.color}">{g.info.label}</span>
            {#if !revealAll}<span class="sh-count">{g.got} / {g.tot}</span>{/if}
          </div>
          <div class="rule"></div>
          <div class="grid">
            {#each g.breeds as b}
              {@const unlocked = isUnlocked(disc, b.id, b.hasArt)}
              {@const sprite = spriteForBreed(b.id)}
              <button class="cc" class:locked={!unlocked} on:click={() => (selected = b.id)}>
                {#if isUnseen(b.id)}<span class="newpip">NEW</span>{/if}
                <div class="cp">
                  {#if unlocked && sprite}
                    <img src={sprite.idle} alt={b.name} draggable="false" />
                  {:else}
                    <div class="sil" style="-webkit-mask-image:url({silUrl});mask-image:url({silUrl})" aria-hidden="true"></div>
                  {/if}
                </div>
                <div class="nm">{unlocked ? b.name : '???'}</div>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  {#if selBreed}
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
        <button class="close dclose" aria-label="Back" on:click={() => (selected = null)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </button>
        <span class="badge" style="background:{selInfo?.color}">{selInfo?.label}</span>
        <div class="port">
          {#if selUnlocked && selSprite}
            <img src={selSprite.happy} alt={selBreed.name} draggable="false" />
          {:else}
            <div class="sil" style="-webkit-mask-image:url({silUrl});mask-image:url({silUrl})" aria-hidden="true"></div>
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
    padding: 18px;
    z-index: 10;
  }
  .sheet {
    width: 100%;
    max-width: 380px;
    height: 90%;
    background: var(--bg);
    border-radius: 28px;
    padding: 20px 18px 0;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  /* header */
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h2 {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 30px;
    color: var(--ink);
    flex: 1;
    min-width: 0;
  }
  .progress {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 17px;
    color: var(--ink-soft);
    white-space: nowrap;
  }
  .progress b {
    color: var(--accent-edge);
  }
  /* squircle close (pressability §6.7) */
  .close {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 15px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-bottom: 4px solid var(--edge);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.07s;
  }
  .close:active {
    transform: translateY(2px);
  }
  .close svg {
    width: 22px;
    height: 22px;
  }
  /* intro banner */
  .intro {
    margin-top: 12px;
    background: var(--surface);
    border-radius: 16px;
    padding: 12px 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 13.5px;
    line-height: 1.45;
    color: var(--ink-soft);
    box-shadow: var(--shadow);
  }
  .scroll {
    flex: 1;
    overflow-y: auto;
    margin-top: 16px;
    padding-bottom: 18px;
  }
  .sect {
    margin-bottom: 18px;
  }
  .sh {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex: none;
  }
  .sh-name {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .sh-count {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--ink-soft);
  }
  .rule {
    height: 2px;
    background: var(--line);
    border-radius: 2px;
    margin-bottom: 12px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .cc {
    background: var(--surface);
    border: none;
    border-radius: 18px;
    box-shadow: var(--shadow);
    padding: 12px 8px 10px;
    text-align: center;
    position: relative;
    cursor: pointer;
  }
  .cp {
    width: 84px;
    height: 84px;
    margin: 0 auto 8px;
    border-radius: 22px; /* squircle */
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp img {
    width: 78px;
    height: 78px;
    object-fit: contain;
  }
  .cc.locked .cp {
    background: transparent;
  }
  /* silhouette of the default cat, tinted via a CSS mask (ink-soft) */
  .sil {
    width: 78px;
    height: 78px;
    background: rgba(138, 128, 147, 0.34);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
  }
  .nm {
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 12px;
    line-height: 1.15;
    color: var(--ink);
  }
  .cc.locked .nm {
    color: var(--ink-soft);
    letter-spacing: 1px;
  }
  .newpip {
    position: absolute;
    top: -7px;
    left: -4px;
    background: var(--accent);
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 10px;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 999px;
    border-bottom: 2px solid var(--accent-edge);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
  /* detail card (window 4) */
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
    max-width: 280px;
    background: var(--surface);
    border-radius: 26px;
    padding: 22px 18px 18px;
    text-align: center;
    box-shadow: 0 22px 50px rgba(0, 0, 0, 0.3);
    position: relative;
  }
  .dclose {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
  .dclose svg {
    width: 18px;
    height: 18px;
  }
  .badge {
    position: absolute;
    top: 18px;
    left: 18px;
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .port {
    width: 150px;
    height: 150px;
    margin: 10px auto 10px;
    border-radius: 40px; /* squircle */
    background: color-mix(in srgb, var(--rar) 15%, var(--surface));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 -6px 14px rgba(0, 0, 0, 0.07);
  }
  .port img {
    width: 132px;
    height: 132px;
    object-fit: contain;
  }
  .port .sil {
    width: 132px;
    height: 132px;
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
