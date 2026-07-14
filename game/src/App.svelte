<script lang="ts">
  import Icons from './components/Icons.svelte';
  import MainScreen from './screens/MainScreen.svelte';
  import TutorialScreen from './screens/TutorialScreen.svelte';
  import GameScreen from './screens/GameScreen.svelte';
  import SettingsOverlay from './screens/SettingsOverlay.svelte';
  import DefeatScreen from './screens/DefeatScreen.svelte';
  import VictoryScreen from './screens/VictoryScreen.svelte';
  import { onMount } from 'svelte';
  import { screen, settingsOpen } from './lib/game';
  import { darkMode } from './lib/settings'; // also initializes persisted settings side-effects
  import { startMusic } from './lib/audio';

  // Theme: token sets (:root / .dark). Follows the system until the player
  // flips the toggle in Settings (lib/settings.ts resolves the preference).
  darkMode.subscribe((dark) => document.documentElement.classList.toggle('dark', dark));

  // Browsers block audio until a user gesture — start the music on the first tap
  // (it's a no-op if the Music setting is off).
  onMount(() => {
    const kick = (): void => startMusic();
    window.addEventListener('pointerdown', kick, { once: true });
    return () => window.removeEventListener('pointerdown', kick);
  });
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
    /* transparent: the full-bleed body gradient shows through, so the centered
       stage never reads as a floating card on wide screens. */
    background: transparent;
    overflow: hidden;
    transition: background 0.3s;
  }
  /* Desktop / landscape: let the game use the horizontal space (Playgama desktop reqs).
     Cap-and-center: above this width the body gradient fills the sides (full-bleed). */
  @media (min-aspect-ratio: 1 / 1) {
    .stage {
      max-width: min(1240px, 100%);
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
