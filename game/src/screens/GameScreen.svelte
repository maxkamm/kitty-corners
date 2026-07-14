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
    hintCause,
    hint,
    hintFreeUsed,
    settingsOpen,
    autocatUsed,
    celebrating,
    givenCells,
    introOrigin,
    elapsedSeconds,
    quitToMenu,
    useAutocat,
    useHint,
    clearHint
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

  /* Hint banner stays until the player clicks ANYWHERE (§5.1). While a hint is shown we
     attach a one-shot global pointerdown listener; it is armed on the next tick so the
     very click that opened the hint doesn't instantly dismiss it. */
  let hintDismiss: (() => void) | null = null;
  $: syncHintDismiss($hint);
  function syncHintDismiss(h: unknown): void {
    if (typeof window === 'undefined') return;
    if (h && !hintDismiss) {
      const handler = (): void => clearHint();
      hintDismiss = handler;
      setTimeout(() => {
        if (hintDismiss === handler) window.addEventListener('pointerdown', handler, true);
      }, 0);
    } else if (!h && hintDismiss) {
      window.removeEventListener('pointerdown', hintDismiss, true);
      hintDismiss = null;
    }
  }
  onDestroy(() => {
    if (hintDismiss) window.removeEventListener('pointerdown', hintDismiss, true);
  });

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

  <div class="rules-slot">
    <RuleChips />
    {#if $hint}
      <div class="hint-banner hint-{$hint.kind}" role="status">
        <svg class="hb-icon" viewBox="0 0 24 24" aria-hidden="true">
          <use href={$hint.kind === 'place' ? '#ic-cathead-line' : '#ic-paw'} />
        </svg>
        <p>{$hint.text}</p>
        <button class="hb-close" aria-label="Dismiss hint" on:click={() => clearHint()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    {/if}
  </div>

  <div class="board-wrap" bind:clientHeight={wrapH}>
    <Board
      level={$activeLevel}
      cells={$cells}
      errorCells={$errorCells}
      hintCells={$hintCells}
      causeCells={$hintCause}
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
    <div class="game-bottom">
      {#if $rewardedSupported}
        <button
          class="round-btn"
          aria-label="Place one cat for me"
          disabled={$autocatUsed}
          on:click={() => useAutocat()}
        >
          <svg viewBox="0 0 24 24"><use href="#ic-cathead-line" /></svg>
          <span class="badge"><svg width="9" height="9" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg></span>
        </button>
      {/if}
      <!-- Hint always available: first is free, later ones rewarded (Р-56); badge appears once free is used -->
      <button class="round-btn" aria-label="Hint: next logical step" on:click={() => useHint()}>
        <svg viewBox="0 0 24 24"><use href="#ic-bulb-line" /></svg>
        {#if $hintFreeUsed && $rewardedSupported}
          <span class="badge"><svg width="9" height="9" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg></span>
        {/if}
      </button>
    </div>
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
  .rules-slot {
    position: relative;
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
  /* Teaching hint banner (§5.1): overlays the three rule chips at the top of the board */
  .hint-banner {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface);
    color: var(--ink);
    border-radius: 16px;
    border-left: 5px solid var(--accent);
    padding: 11px 12px 11px 13px;
    box-shadow: var(--shadow-pop, 0 8px 20px rgba(125, 74, 73, 0.22));
    animation: hint-banner-in 0.24s ease both;
    z-index: 6;
  }
  /* place hints read as a "go here" cue → cat-head accent; eliminate stays warm (paws) */
  .hint-banner.hint-place {
    border-left-color: var(--accent);
  }
  .hint-banner .hb-icon {
    flex: none;
    width: 24px;
    height: 24px;
    color: var(--accent);
  }
  .hint-banner p {
    margin: 0;
    flex: 1;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 13.5px;
    line-height: 1.3;
  }
  .hint-banner .hb-close {
    flex: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink);
    opacity: 0.55;
    background: transparent;
  }
  .hint-banner .hb-close:active {
    opacity: 1;
  }
  .hint-banner .hb-close svg {
    width: 16px;
    height: 16px;
  }
  @keyframes hint-banner-in {
    from { opacity: 0; transform: translate(-50%, -8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hint-banner {
      animation: none;
    }
  }
  /* ---- Desktop / landscape layout (Playgama desktop reqs): board centered,
     HUD spread across the horizontal space. Also fixes phone-landscape (QA KC-1). ---- */
  @media (min-aspect-ratio: 1 / 1) {
    .game {
      display: grid;
      /* No fr on the side columns: otherwise they would eat all the free space and
         pin the board at its 320px min. Fixed-range tracks + centered grid let the
         board grow to fill the middle column on large displays (KC-2). */
      grid-template-columns: minmax(150px, 240px) minmax(320px, 640px) minmax(150px, 240px);
      justify-content: center;
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
      max-width: 260px;
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
      max-width: 260px;
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
