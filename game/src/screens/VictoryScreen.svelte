<script lang="ts">
  /** Victory (GDD §5.5, Р-30): Win streak feature card + Best streak + time pill + confetti. */
  import LeaderboardOverlay from '../components/LeaderboardOverlay.svelte';
  import LeaderboardPanel from '../components/LeaderboardPanel.svelte';
  import CollectionRecap from '../components/CollectionRecap.svelte';
  import { winLevel, winStreak, bestStreak, winTime, winScore, totalScore, nextLevel } from '../lib/game';
  import { leaderboardType, showNativePopup, winRanks } from '../lib/leaderboard';
  import { catHappyUrl } from '../lib/skin';

  const fmtNum = (n: number): string => n.toLocaleString('en-US');

  let showBoard = false;

  function onTrophy(): void {
    if ($leaderboardType === 'native_popup') void showNativePopup();
    else showBoard = true;
  }

  const CONF_COLORS = ['#F4C892', '#A9DBF5', '#93D4B8', '#E7BFD7', '#FF9457'];
  const confetti = Array.from({ length: 26 }, (_, i) => ({
    left: Math.random() * 96,
    color: CONF_COLORS[i % CONF_COLORS.length],
    delay: Math.random() * 3,
    dur: 2.6 + Math.random() * 1.6
  }));

  $: prevNodes = [$winStreak - 3, $winStreak - 2, $winStreak - 1].filter((n) => n > 0);

  function fmtTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
</script>

<section class="win">
  <div class="fx" aria-hidden="true">
    {#each confetti as c}
      <div
        class="confetti"
        style="left:{c.left}%;background:{c.color};animation-delay:{c.delay}s;animation-duration:{c.dur}s"
      ></div>
    {/each}
  </div>

  <img class="mascot" src={catHappyUrl} alt="" draggable="false" />
  <h1 class="big-title">Level {$winLevel + 1} done!</h1>

  <div class="win-stats">
    <div class="streak-card">
      <div class="streak-head">Win streak</div>
      <div class="streak-hero">
        <svg class="flame-big" viewBox="0 0 24 28"><use href="#ic-flame" /></svg>
        <span class="num">{$winStreak}</span>
        <span class="plus-pop">+1</span>
      </div>
      <div class="streak-track" aria-hidden="true">
        {#each prevNodes as n}
          <span class="node"><svg><use href="#ic-paw" /></svg><span class="n">{n}</span></span>
          <span class="bar"></span>
        {/each}
        <span class="node current"><svg><use href="#ic-paw" /></svg><span class="n">{$winStreak}</span></span>
        <span class="bar dim"></span>
        <span class="node next"><span class="n">{$winStreak + 1}</span></span>
      </div>
      <div class="streak-best">Best streak · <b>{$bestStreak}</b></div>
    </div>
    <div class="score-pill">
      <span class="gain">+{fmtNum($winScore)}</span>
      <span class="lbl">points</span>
      <span class="total">Total · <b>{fmtNum($totalScore)}</b></span>
    </div>
    <div class="time-pill"><span class="lbl">Your time</span> {fmtTime($winTime)}</div>

    <!-- Cat collection recap (GDD §10.5): compact strip of breeds discovered this level -->
    <CollectionRecap />

    <!-- Mobile rank strip (Р-45): compact climb animation; desktop shows the panel instead -->
    {#if $leaderboardType === 'in_game' && $winRanks}
      <button class="rank-strip" on:click={onTrophy} aria-label="Open leaderboard">
        <svg class="cup"><use href="#ic-trophy" /></svg>
        {#if $winRanks.to < $winRanks.from}
          <span class="was">#{$winRanks.from}</span>
          <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h11m0 0-4-4m4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="now up">#{$winRanks.to}</span>
          <span class="lbl">you climbed!</span>
        {:else}
          <span class="now">#{$winRanks.to}</span>
          <span class="lbl">your rank</span>
        {/if}
      </button>
    {/if}
  </div>

  <button class="cta next-btn" on:click={() => nextLevel()}>Next level</button>

  {#if showBoard}
    <LeaderboardOverlay on:close={() => (showBoard = false)} />
  {/if}

  <!-- Desktop (Р-44): the persistent panel stays on the right so any standings
       movement that started during the celebration remains visible here -->
  {#if $leaderboardType === 'in_game'}
    <div class="lb-side"><LeaderboardPanel /></div>
  {/if}
</section>

<style>
  .win {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* safe center: centers when it fits, aligns to top (no clipping) when the
       stack is taller than the screen; scrolls as a last resort */
    justify-content: safe center;
    /* base spacing, expanded to clear device safe areas (notch / rounded corners) */
    padding: max(24px, env(safe-area-inset-top)) max(26px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom)) max(26px, env(safe-area-inset-left));
    gap: 11px;
    text-align: center;
    overflow-x: hidden;
    overflow-y: auto;
    background: linear-gradient(180deg, #fcebd8 0%, #fdeedd 45%, #fbe8d1 100%);
  }
  :global(.dark) .win {
    background: linear-gradient(180deg, #2a2433 0%, #241f2b 60%, #1e1a26 100%);
  }
  .mascot {
    width: 132px;
    height: 132px;
    flex: none;
    object-fit: contain;
    filter: drop-shadow(0 8px 12px rgba(125, 74, 73, 0.22));
    transform-origin: 50% 85%;
    animation: mascot-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both,
      mascot-sway 2.6s ease-in-out 0.6s infinite;
  }
  @keyframes mascot-in {
    0% {
      transform: scale(0.3) translateY(20%);
      opacity: 0;
    }
    60% {
      transform: scale(1.08, 0.9);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes mascot-sway {
    0%, 100% {
      transform: rotate(-2deg);
    }
    50% {
      transform: rotate(2deg);
    }
  }
  .win-stats {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .streak-card {
    width: 100%;
    max-width: 300px;
    background: var(--surface);
    border-radius: 22px;
    box-shadow: var(--shadow-pop);
    padding: 14px 18px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
    z-index: 1;
  }
  .streak-head {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    color: var(--ink-soft);
    text-transform: uppercase;
  }
  .streak-hero {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }
  .flame-big {
    width: 40px;
    height: 46px;
    filter: drop-shadow(0 3px 8px rgba(255, 148, 87, 0.5));
  }
  .num {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 54px;
    line-height: 0.9;
  }
  .plus-pop {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: var(--good);
    animation: pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
  }
  @keyframes pop {
    0% {
      transform: scale(0) translateY(6px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  .streak-track {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .node {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    position: relative;
  }
  .node svg {
    width: 14px;
    height: 14px;
    color: var(--accent);
  }
  .node .n {
    position: absolute;
    top: 112%;
    font-size: 10px;
    font-weight: 800;
    color: var(--ink-soft);
  }
  .node.current {
    width: 34px;
    height: 34px;
    background: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);
    animation: nodein 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  }
  .node.current svg {
    width: 18px;
    height: 18px;
    color: #fff;
  }
  .node.current .n {
    color: var(--accent);
    font-size: 11px;
  }
  @keyframes nodein {
    from {
      transform: scale(0.3);
    }
    to {
      transform: scale(1);
    }
  }
  .node.next {
    background: none;
    border: 2px dashed var(--line);
  }
  .node.next .n {
    opacity: 0.7;
  }
  .bar {
    flex: 1;
    height: 4px;
    background: var(--accent-soft);
    border-radius: 2px;
    margin: 0 4px;
  }
  .bar.dim {
    background: var(--line);
  }
  .streak-best {
    font-size: 12px;
    font-weight: 800;
    color: var(--ink-soft);
  }
  .streak-best b {
    color: var(--ink);
  }
  .score-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border-radius: 99px;
    padding: 9px 18px;
    box-shadow: var(--shadow-pop);
    font-weight: 800;
    font-size: 14px;
    z-index: 1;
  }
  .score-pill .gain {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: var(--good);
    animation: pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
  }
  .score-pill .lbl {
    color: var(--ink-soft);
    font-weight: 700;
  }
  .score-pill .total {
    color: var(--ink-soft);
    font-weight: 700;
    font-size: 12px;
    border-left: 1.5px solid var(--line);
    padding-left: 10px;
  }
  .score-pill .total b {
    color: var(--ink);
  }
  .time-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--surface);
    border-radius: 99px;
    padding: 9px 18px;
    box-shadow: var(--shadow-pop);
    font-weight: 800;
    font-size: 14px;
    z-index: 1;
  }
  .time-pill .lbl {
    color: var(--ink-soft);
    font-weight: 700;
  }
  .next-btn {
    width: 100%;
    max-width: 300px;
    padding: 15px;
    margin-top: 8px;
    z-index: 1;
  }
  .rank-strip {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--surface);
    border-radius: 99px;
    padding: 9px 18px;
    box-shadow: var(--shadow-pop);
    font-weight: 800;
    font-size: 14px;
    z-index: 1;
    animation: strip-in 0.4s ease 0.5s both;
  }
  @keyframes strip-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .rank-strip .cup {
    width: 16px;
    height: 16px;
    color: var(--accent);
  }
  .rank-strip .was {
    color: var(--ink-soft);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
    animation: was-fade 0.5s ease 1.1s both;
  }
  @keyframes was-fade {
    from { opacity: 1; }
    to { opacity: 0.45; }
  }
  .rank-strip .arrow {
    width: 16px;
    height: 16px;
    color: var(--good);
  }
  .rank-strip .now {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 18px;
  }
  /* the climb: new rank pops in rising from below */
  .rank-strip .now.up {
    color: var(--good);
    animation: rank-climb 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s both;
  }
  @keyframes rank-climb {
    0% {
      opacity: 0;
      transform: translateY(85%) scale(0.6);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .rank-strip .lbl {
    color: var(--ink-soft);
    font-weight: 700;
    font-size: 12px;
  }
  .lb-side {
    display: none;
  }
  @media (min-aspect-ratio: 1 / 1) {
    .lb-side {
      display: block;
      position: absolute;
      right: max(28px, env(safe-area-inset-right));
      top: 50%;
      transform: translateY(-50%);
      width: 240px;
      z-index: 1;
    }
    /* the panel's FLIP already shows the climb on desktop */
    .rank-strip {
      display: none;
    }
  }
  .fx {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .confetti {
    position: absolute;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 3px;
    opacity: 0.85;
    animation: fall 3.2s linear infinite;
  }
  @keyframes fall {
    from {
      transform: translateY(-40px) rotate(0);
    }
    to {
      transform: translateY(110vh) rotate(540deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .confetti {
      animation: none;
      display: none;
    }
    .plus-pop,
    .score-pill .gain,
    .node.current,
    .mascot,
    .rank-strip,
    .rank-strip .was,
    .rank-strip .now.up {
      animation: none;
    }
  }
</style>
