<script lang="ts">
  import Icons from './components/Icons.svelte';
  import MainScreen from './screens/MainScreen.svelte';
  import TutorialScreen from './screens/TutorialScreen.svelte';
  import GameScreen from './screens/GameScreen.svelte';
  import SettingsOverlay from './screens/SettingsOverlay.svelte';
  import DefeatScreen from './screens/DefeatScreen.svelte';
  import VictoryScreen from './screens/VictoryScreen.svelte';
  import { screen, settingsOpen } from './lib/game';
  import './lib/settings'; // initialize persisted settings side-effects

  // Theme: token sets from mockup (:root / .dark), follow system preference
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = (dark: boolean) => document.documentElement.classList.toggle('dark', dark);
  applyTheme(mq.matches);
  mq.addEventListener?.('change', (e) => applyTheme(e.matches));
</script>

<Icons />

<div class="stage">
  <!-- Settings overlay = pause: board underneath gets blur(6px) + dim (GDD §5.3) -->
  <div class="screen-host" class:blurred={$settingsOpen}>
    {#if $screen === 'main'}
      <MainScreen />
    {:else if $screen === 'tutorial'}
      <TutorialScreen />
    {:else if $screen === 'game'}
      <GameScreen />
    {:else if $screen === 'defeat'}
      <DefeatScreen />
    {:else if $screen === 'victory'}
      <VictoryScreen />
    {/if}
  </div>

  {#if $settingsOpen}
    <SettingsOverlay />
  {/if}

</div>

<style>
  .stage {
    position: relative;
    width: 100%;
    height: 100dvh;
    max-width: 480px;
    margin: 0 auto;
    background: var(--bg);
    overflow: hidden;
    transition: background 0.3s;
  }
  /* Desktop / landscape: let the game use the horizontal space (Playgama desktop reqs). */
  @media (min-aspect-ratio: 1 / 1) {
    .stage {
      max-width: min(1100px, 100%);
    }
  }
  .screen-host {
    position: absolute;
    inset: 0;
  }
  .screen-host.blurred {
    filter: blur(6px) saturate(0.8);
    pointer-events: none;
  }
</style>
