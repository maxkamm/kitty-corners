<script lang="ts">
  /**
   * Persistent desktop leaderboard panel (GDD §3.2, Р-44): always on screen to
   * the right of the board (landscape/desktop, 'in_game' flow only).
   *
   * Win choreography, driven by lib/leaderboard.ts stores:
   *   1. `pendingGain` > 0 → a "+points" chip flies in from the board side;
   *   2. after FLY_MS the standings refresh — rows glide to their new spots
   *      (svelte FLIP), so climbing the table is visible;
   *   3. the self row flashes to mark the landing.
   */
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { get } from 'svelte/store';
  import { panelEntries, pendingGain, refreshEntries, FLY_MS } from '../lib/leaderboard';
  import { totalScore } from '../lib/game';

  const fmtNum = (n: number): string => n.toLocaleString('en-US');

  onMount(() => {
    // initial load: standings for the pre-win total when a flight is queued
    if (get(panelEntries) === null) {
      void refreshEntries(get(totalScore) - get(pendingGain));
    }
  });
</script>

<aside class="panel" aria-label="Leaderboard standings">
  <div class="head">
    <svg class="cup"><use href="#ic-trophy" /></svg>
    <span>Leaderboard</span>
  </div>

  {#if $panelEntries === null}
    <div class="loading">Loading…</div>
  {:else}
    <ol class="rows">
      {#each $panelEntries as e (e.id)}
        <li class="row" class:self={e.self} animate:flip={{ duration: 450 }}>
          <span class="rank" class:top={e.rank <= 3}>{e.rank}</span>
          {#if e.photo}
            <img class="avatar" src={e.photo} alt="" loading="lazy" />
          {:else}
            <span class="avatar ph"><svg><use href="#ic-paw" /></svg></span>
          {/if}
          <span class="name">{e.name}</span>
          <span class="pts">{fmtNum(e.score)}</span>
        </li>
      {/each}
    </ol>
  {/if}

  {#if $pendingGain > 0}
    <div class="fly-chip" style="--fly-ms:{FLY_MS}ms" aria-hidden="true">+{fmtNum($pendingGain)}</div>
  {/if}
</aside>

<style>
  .panel {
    position: relative;
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 15px;
  }
  .cup {
    width: 17px;
    height: 17px;
    color: var(--accent);
  }
  .loading {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--ink-soft);
    padding: 8px 0;
  }
  .rows {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--bg);
    border: 1.5px solid var(--line);
    border-radius: 10px;
    padding: 5px 9px;
    font-weight: 700;
    font-size: 12px;
  }
  .row.self {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-soft);
    animation: self-flash 0.6s ease 1;
  }
  @keyframes self-flash {
    0% { background: var(--accent-soft); }
    100% { background: var(--bg); }
  }
  .rank {
    width: 16px;
    text-align: center;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    color: var(--ink-soft);
    flex: none;
  }
  .rank.top {
    color: var(--accent);
  }
  .avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex: none;
    object-fit: cover;
  }
  .avatar.ph {
    background: var(--accent-soft);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar.ph svg {
    width: 11px;
    height: 11px;
    color: var(--accent);
  }
  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pts {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    flex: none;
    font-size: 12px;
  }
  /* "+points" flies in from the board (left) and lands on the table */
  .fly-chip {
    position: absolute;
    top: 50%;
    left: 50%;
    background: var(--good);
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 16px;
    padding: 5px 13px;
    border-radius: 99px;
    box-shadow: var(--shadow);
    pointer-events: none;
    animation: chip-fly var(--fly-ms, 800ms) cubic-bezier(0.25, 0.9, 0.35, 1) both;
    z-index: 2;
  }
  @keyframes chip-fly {
    0% {
      transform: translate(calc(-50% - 46vw), -50%) scale(0.7);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    75% {
      transform: translate(-50%, -50%) scale(1.08);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(0.4);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .fly-chip,
    .row.self {
      animation: none;
    }
  }
</style>
