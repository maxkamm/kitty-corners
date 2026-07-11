<script lang="ts">
  /**
   * In-game leaderboard sheet (GDD §3.2, Р-43) — rendered only when the host's
   * flow is 'in_game' (or the dev mock). Native flows never reach this overlay.
   */
  import { createEventDispatcher, onMount } from 'svelte';
  import { getEntries, type LeaderboardEntry } from '../lib/leaderboard';
  import { totalScore } from '../lib/game';
  import { get } from 'svelte/store';

  const dispatch = createEventDispatcher<{ close: void }>();

  let entries: LeaderboardEntry[] | null = null;
  let failed = false;

  onMount(async () => {
    entries = await getEntries(get(totalScore));
    failed = entries === null;
  });

  const fmtNum = (n: number): string => n.toLocaleString('en-US');
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-no-noninteractive-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-label="Leaderboard"
  on:click={(e) => {
    if (e.target === e.currentTarget) dispatch('close');
  }}
>
  <div class="sheet">
    <h2><svg class="cup"><use href="#ic-trophy" /></svg> Leaderboard</h2>

    {#if failed}
      <p class="note">Couldn't load the leaderboard right now — please try again later.</p>
    {:else if entries === null}
      <p class="note">Loading…</p>
    {:else}
      <ol class="rows">
        {#each entries as e (e.id)}
          <li class="row" class:self={e.self}>
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

    <div class="mine">Your total · <b>{fmtNum($totalScore)}</b></div>
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
    z-index: 20;
  }
  .sheet {
    width: 100%;
    max-width: 330px;
    max-height: 90%;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .cup {
    width: 24px;
    height: 24px;
    color: var(--accent);
  }
  .note {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    color: var(--ink-soft);
    padding: 12px 0;
  }
  .rows {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    min-height: 0;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    padding: 8px 12px;
    font-weight: 700;
    font-size: 14px;
  }
  .row.self {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-soft);
  }
  .rank {
    width: 22px;
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
    width: 26px;
    height: 26px;
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
    width: 14px;
    height: 14px;
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
  }
  .mine {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-soft);
  }
  .mine b {
    color: var(--ink);
  }
  .sheet .cta {
    padding: 13px;
    font-size: 18px;
  }
</style>
