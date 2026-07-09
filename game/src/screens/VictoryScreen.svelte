<script lang="ts">
  /** Victory (GDD §5.5, Р-30): Win streak feature card + Best streak + time pill + confetti. */
  import { winLevel, winStreak, bestStreak, winTime, nextLevel } from '../lib/game';

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
  {#each confetti as c}
    <div
      class="confetti"
      style="left:{c.left}%;background:{c.color};animation-delay:{c.delay}s;animation-duration:{c.dur}s"
    ></div>
  {/each}

  <svg class="mascot" viewBox="0 0 100 100" aria-hidden="true"><use href="#cat-round-happy" /></svg>
  <h1 class="big-title">Level {$winLevel} done!</h1>

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
    <div class="time-pill"><span class="lbl">Your time</span> {fmtTime($winTime)}</div>
  </div>

  <button class="cta next-btn" on:click={() => nextLevel()}>Next level</button>
</section>

<style>
  .win {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 26px;
    gap: 13px;
    text-align: center;
    overflow: hidden;
  }
  .mascot {
    width: 128px;
    height: 116px;
    filter: drop-shadow(0 6px 10px rgba(60, 45, 70, 0.2));
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
    border-radius: 20px;
    border: 1.5px solid var(--line);
    box-shadow: 0 5px 0 var(--edge), var(--shadow);
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
  .time-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 99px;
    padding: 8px 18px;
    box-shadow: 0 3px 0 var(--edge), var(--shadow);
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
    font-size: 20px;
    margin-top: 8px;
    z-index: 1;
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
    .node.current,
    .mascot {
      animation: none;
    }
  }
</style>
