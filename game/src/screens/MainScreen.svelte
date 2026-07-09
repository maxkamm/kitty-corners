<script lang="ts">
  import PawBg from '../components/PawBg.svelte';
  import LogoMark from '../components/LogoMark.svelte';
  import { levelNumber, streak, startGame, settingsOpen } from '../lib/game';

  let showHow = false;
</script>

<section class="main">
  <PawBg />

  <div class="top-icons">
    <button class="icon-btn" aria-label="Settings" on:click={() => settingsOpen.set(true)}>
      <svg><use href="#ic-gear" /></svg>
    </button>
    <button class="icon-btn" aria-label="How to play" on:click={() => (showHow = true)}>
      <svg><use href="#ic-q" /></svg>
    </button>
  </div>

  <div class="logo-wrap">
    <LogoMark />
    <h1 class="logo-name">Kitty<br /><span class="row2">Corners</span></h1>
    <div class="tagline">a cozy logic puzzle</div>
  </div>

  <div class="main-bottom">
    {#if $streak > 0}
      <div class="streak-chip">
        <svg class="flame-s"><use href="#ic-flame" /></svg>
        {$streak} level streak
      </div>
    {/if}
    <button class="cta play-btn" on:click={startGame}>Play <small>Level {$levelNumber}</small></button>
  </div>

  {#if showHow}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      class="overlay"
      role="dialog"
      aria-label="How to play"
      on:click={(e) => {
        if (e.target === e.currentTarget) showHow = false;
      }}
    >
      <div class="sheet">
        <h2>How to play</h2>
        <p>Place one cat in every color region — exactly one per row and column, and cats can never touch, not even diagonally.</p>
        <p>Tap a cell to mark it with an ✕. Press and hold to place a cat.</p>
        <button class="cta" on:click={() => (showHow = false)}>Got it</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .main {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 28px 24px 40px;
  }
  .top-icons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    z-index: 1;
  }
  .logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    z-index: 1;
  }
  .logo-name {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 44px;
    line-height: 0.95;
    text-align: center;
    letter-spacing: -0.5px;
  }
  .logo-name .row2 {
    color: var(--accent);
  }
  .tagline {
    color: var(--ink-soft);
    font-weight: 700;
    font-size: 14px;
  }
  .main-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    z-index: 1;
    width: 100%;
  }
  .streak-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 99px;
    padding: 9px 18px;
    box-shadow: 0 4px 0 var(--edge), var(--shadow);
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 16px;
  }
  .play-btn {
    width: 100%;
    max-width: 280px;
    padding: 16px 20px;
    font-size: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .play-btn small {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 13px;
    opacity: 0.85;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(40, 30, 50, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 5;
  }
  .sheet {
    width: 100%;
    max-width: 330px;
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
  }
  .sheet p {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
  }
  .sheet .cta {
    padding: 13px;
    font-size: 18px;
  }
</style>
