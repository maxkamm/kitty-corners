<script lang="ts">
  /** Settings overlay = pause (GDD §5.3). Board underneath is blurred by App via .blurred. */
  import HowToPlay from '../components/HowToPlay.svelte';
  import { settingsOpen, restartFromSettings, quitToMenu, screen } from '../lib/game';
  import { soundOn, vibrationOn, patternMarksOn, darkMode, toggleDarkTheme } from '../lib/settings';

  let confirmRestart = false;
  let showHow = false;

  $: inGame = $screen === 'game';

  function close(): void {
    confirmRestart = false;
    showHow = false;
    settingsOpen.set(false);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="overlay"
  role="dialog"
  aria-label="Settings"
  on:click={(e) => {
    if (e.target === e.currentTarget) close();
  }}
>
  <div class="sheet">
    {#if confirmRestart}
      <h2>Restart level?</h2>
      <p class="how">Your marks and hearts will reset. Your streak stays safe.</p>
      <button class="cta" on:click={restartFromSettings}>Yes, restart</button>
      <button class="set-row center" on:click={() => (confirmRestart = false)}>Cancel</button>
    {:else}
      <h2>Settings</h2>
      <button class="cta" on:click={close}>Continue</button>
      <button class="set-row" on:click={() => soundOn.update((v) => !v)}>
        Sound <span class="toggle" class:off={!$soundOn} role="switch" aria-checked={$soundOn}></span>
      </button>
      <button class="set-row" on:click={() => vibrationOn.update((v) => !v)}>
        Vibration <span class="toggle" class:off={!$vibrationOn} role="switch" aria-checked={$vibrationOn}></span>
      </button>
      <button class="set-row" on:click={() => patternMarksOn.update((v) => !v)}>
        Pattern marks <span class="toggle" class:off={!$patternMarksOn} role="switch" aria-checked={$patternMarksOn}></span>
      </button>
      <button class="set-row" on:click={toggleDarkTheme}>
        Dark theme <span class="toggle" class:off={!$darkMode} role="switch" aria-checked={$darkMode}></span>
      </button>
      <button class="set-row center" on:click={() => (showHow = true)}>How to play</button>
      {#if inGame}
        <button class="set-row center danger-row" on:click={() => (confirmRestart = true)}>Restart level</button>
        <button class="link-quiet exit" on:click={quitToMenu}>Quit to menu</button>
      {/if}
    {/if}
  </div>

  {#if showHow}
    <HowToPlay on:close={() => (showHow = false)} />
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
    padding: 24px;
    z-index: 10;
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
    margin-bottom: 2px;
  }
  .sheet .cta {
    padding: 13px;
    font-size: 18px;
  }
  .how {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
  }
  /* settings rows on the white pill sprite (ui_atlas, 9-slice) */
  .set-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: transparent;
    border: 14px solid transparent;
    border-image: url('../assets/btn_white_small.webp') 72 fill / 20px stretch;
    border-radius: 14px;
    padding: 4px 4px;
    font-weight: 700;
    font-size: 15px;
    color: #7d4a49; /* sprite stays cream in dark theme */
    filter: drop-shadow(0 3px 6px rgba(125, 74, 73, 0.14));
    transition: transform 0.07s;
    text-align: left;
  }
  .set-row:active {
    transform: translateY(3px);
    filter: drop-shadow(0 1px 2px rgba(125, 74, 73, 0.14));
  }
  .set-row.center {
    justify-content: center;
  }
  .danger-row {
    color: var(--danger);
  }
  .toggle {
    width: 46px;
    height: 26px;
    border-radius: 99px;
    background: var(--good);
    position: relative;
    flex: none;
    transition: background 0.15s;
  }
  .toggle.off {
    background: var(--line);
  }
  .toggle::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 23px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: left 0.15s;
  }
  .toggle.off::after {
    left: 3px;
  }
  .exit {
    align-self: center;
    margin-top: 2px;
  }
</style>
