<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Board from '../components/Board.svelte';
  import Hearts from '../components/Hearts.svelte';
  import RuleChips from '../components/RuleChips.svelte';
  import LeaderboardPanel from '../components/LeaderboardPanel.svelte';
  import { leaderboardType } from '../lib/leaderboard';
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
    elapsedSeconds,
    quitToMenu,
    useAutocat,
    useHint
  } from '../lib/game';
  import { rewardedSupported, adNotice } from '../lib/ads';

  /* Live HUD timer (art skin v2): re-render each second; the source of truth
     stays the hidden active-play timer in game.ts (KC-5 pausing rules apply). */
  let seconds = 0;
  let tick: ReturnType<typeof setInterval> | undefined;
  onMount(() => {
    seconds = elapsedSeconds();
    tick = setInterval(() => (seconds = elapsedSeconds()), 500);
  });
  onDestroy(() => clearInterval(tick));

  function fmtTime(s: number): string {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
</script>

<section class="game">
  <div class="game-top">
    <button class="hud-round" aria-label="Back to menu" on:click={() => quitToMenu()}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 5.6 L6.8 12 L13 18.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7.6 12 H17.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    </button>

    <div class="hud-pill">
      <div class="hud-block hud-level">
        <span class="hud-title">Level {$activeLevelNumber + 1}</span>
        <Hearts value={$hearts} size={22} />
      </div>
      <span class="hud-sep"></span>
      <div class="hud-block">
        <span class="hud-label">Time</span>
        <span class="hud-value">{fmtTime(seconds)}</span>
      </div>
    </div>

    <button class="hud-round" aria-label="Settings" on:click={() => settingsOpen.set(true)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-gear" /></svg>
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

  <div class="side">
    <!-- Desktop only (Р-44): standings always on screen, right of the board -->
    {#if $leaderboardType === 'in_game'}
      <div class="lb-slot"><LeaderboardPanel /></div>
    {/if}
    {#if $rewardedSupported}
      <div class="game-bottom">
        <button
          class="round-btn"
          aria-label="Place one cat for me"
          disabled={$autocatUsed}
          on:click={() => useAutocat()}
        >
          <svg viewBox="0 0 24 24"><use href="#ic-cathead-line" /></svg>
          <span class="badge"><svg width="9" height="9" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg></span>
        </button>
        <button class="round-btn" aria-label="Hint: next logical step" on:click={() => useHint()}>
          <svg viewBox="0 0 24 24"><use href="#ic-bulb-line" /></svg>
          <span class="badge"><svg width="9" height="9" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg></span>
        </button>
      </div>
    {/if}
  </div>

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
    background: linear-gradient(180deg, #fcebd8 0%, #fdeedd 45%, #fbe8d1 100%);
  }
  :global(.dark) .game {
    background: linear-gradient(180deg, #2a2433 0%, #241f2b 60%, #1e1a26 100%);
  }
  .game-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  /* HUD buttons: back, settings — blank squircle sprite from ui_atlas */
  .hud-round {
    width: 54px;
    height: 54px;
    flex: none;
    border-radius: 18px;
    background: url('../assets/btn_squircle.webp') center / 100% 100% no-repeat;
    filter: drop-shadow(0 4px 7px rgba(125, 74, 73, 0.18));
    color: #7d4a49; /* fixed: sprite stays cream in dark theme */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.07s;
  }
  .hud-round:active {
    transform: translateY(2px);
  }
  .hud-round svg {
    width: 26px;
    height: 26px;
  }
  /* header pill: Level + hearts | Score | Time */
  .hud-pill {
    flex: 1;
    min-width: 0;
    background: var(--surface);
    border-radius: 27px;
    box-shadow: var(--shadow-pop);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    gap: 8px;
  }
  .hud-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }
  .hud-title {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 19px;
    line-height: 1.1;
    color: var(--ink);
    white-space: nowrap;
  }
  .hud-label {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 12px;
    line-height: 1.1;
    color: var(--ink);
    opacity: 0.85;
  }
  .hud-value {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 17px;
    line-height: 1.15;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }
  .hud-sep {
    width: 1.5px;
    align-self: stretch;
    margin: 2px 0;
    background: var(--line);
    border-radius: 1px;
    flex: none;
  }
  .board-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 0;
  }
  /* Portrait: .side is transparent to the flex layout, the panel is hidden. */
  .side {
    display: contents;
  }
  .lb-slot {
    display: none;
  }
  .game-bottom {
    display: flex;
    justify-content: center;
    gap: 26px;
    padding-bottom: 4px;
  }
  /* squircle action buttons (ui_atlas sprite) with a red corner badge */
  .round-btn {
    width: 64px;
    height: 64px;
    border-radius: 22px;
    background: url('../assets/btn_squircle.webp') center / 100% 100% no-repeat;
    filter: drop-shadow(0 5px 8px rgba(125, 74, 73, 0.18));
    color: #7d4a49; /* fixed: sprite stays cream in dark theme */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 0.08s;
  }
  .round-btn:active {
    transform: translateY(3px);
  }
  .round-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .round-btn > svg {
    width: 34px;
    height: 34px;
  }
  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--badge);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 12px;
    box-shadow: 0 2px 5px rgba(125, 74, 73, 0.25);
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
    .hud-pill {
      max-width: 560px;
      margin: 0 auto;
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
    /* Desktop: right column = leaderboard panel + action buttons (Р-44) */
    .side {
      grid-area: actions;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      justify-self: end;
      align-self: center;
      width: 100%;
      max-width: 240px;
    }
    .lb-slot {
      display: block;
      width: 100%;
    }
    .game-bottom {
      flex-direction: row;
      gap: 24px;
      padding-bottom: 0;
    }
  }
</style>
