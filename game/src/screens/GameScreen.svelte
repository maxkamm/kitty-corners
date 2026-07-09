<script lang="ts">
  import Board from '../components/Board.svelte';
  import Hearts from '../components/Hearts.svelte';
  import RuleChips from '../components/RuleChips.svelte';
  let wrapH = 0;

  import {
    activeLevel,
    activeLevelNumber,
    cells,
    hearts,
    errorCells,
    hintCells,
    settingsOpen,
    autocatUsed,
    celebrating,
    givenCells,
    introOrigin,
    useAutocat,
    useHint
  } from '../lib/game';
  import { rewardedSupported, adNotice } from '../lib/ads';
</script>

<section class="game">
  <div class="game-top">
    <div class="level-chip">Level {$activeLevelNumber}</div>
    <Hearts value={$hearts} />
    <button class="icon-btn" aria-label="Settings" on:click={() => settingsOpen.set(true)}>
      <svg><use href="#ic-gear" /></svg>
    </button>
  </div>

  <div class="rules-slot"><RuleChips /></div>

  <div class="board-wrap" bind:clientHeight={wrapH}>
    <Board
      level={$activeLevel}
      cells={$cells}
      errorCells={$errorCells}
      hintCells={$hintCells}
      celebrate={$celebrating}
      givens={$givenCells}
      introOrigin={$introOrigin}
      maxPx={wrapH}
    />
  </div>

  {#if $rewardedSupported}
    <div class="game-bottom">
      <button
        class="round-btn"
        aria-label="Place one cat for me"
        disabled={$autocatUsed}
        on:click={() => useAutocat()}
      >
        <svg><use href="#ic-cathead" /></svg>
        <span class="ad-tag"><svg width="10" height="10" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg> ad</span>
      </button>
      <button class="round-btn" aria-label="Hint: next logical step" on:click={() => useHint()}>
        <svg><use href="#ic-bulb" /></svg>
        <span class="ad-tag"><svg width="10" height="10" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg> ad</span>
      </button>
    </div>
  {/if}

  {#if $adNotice}
    <div class="ad-toast" role="status">{$adNotice}</div>
  {/if}
</section>

<style>
  .game {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 16px 14px 18px;
    gap: 12px;
  }
  .game-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .level-chip {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 20px;
  }
  .board-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 0;
  }
  .game-bottom {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding-bottom: 4px;
  }
  .round-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    box-shadow: 0 5px 0 #e0763b, var(--shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.08s;
  }
  .round-btn:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 #e0763b;
  }
  .round-btn:disabled {
    filter: grayscale(1);
    opacity: 0.55;
    cursor: default;
  }
  .round-btn > svg {
    width: 30px;
    height: 30px;
  }
  .ad-toast {
    position: absolute;
    left: 50%;
    bottom: 92px;
    transform: translateX(-50%);
    max-width: 88%;
    background: var(--ink);
    color: var(--bg);
    border-radius: 12px;
    padding: 9px 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 13px;
    text-align: center;
    box-shadow: var(--shadow);
    animation: ad-toast-in 0.2s ease both;
  }
  @keyframes ad-toast-in {
    from {
      opacity: 0;
      transform: translate(-50%, 6px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ad-toast {
      animation: none;
    }
  }
  .ad-tag {
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: var(--bg);
    border-radius: 8px;
    padding: 2px 7px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 9px;
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }
  /* ---- Desktop / landscape layout (Playgama desktop reqs): board centered,
     HUD spread across the horizontal space. Also fixes phone-landscape (QA KC-1). ---- */
  @media (min-aspect-ratio: 1 / 1) {
    .game {
      display: grid;
      grid-template-columns: minmax(150px, 1fr) minmax(280px, 440px) minmax(150px, 1fr);
      grid-template-rows: auto 1fr;
      grid-template-areas:
        "top   top   top"
        "rules board actions";
      align-items: center;
      column-gap: 24px;
      row-gap: 10px;
      padding: 18px 28px 22px;
    }
    .game-top {
      grid-area: top;
    }
    .rules-slot {
      grid-area: rules;
      justify-self: start;
      width: 100%;
      max-width: 240px;
    }
    .board-wrap {
      grid-area: board;
      height: 100%;
    }
    .game-bottom {
      grid-area: actions;
      flex-direction: column;
      justify-self: end;
      align-self: center;
      gap: 30px;
      padding-bottom: 0;
    }
  }
</style>
