<script lang="ts">
  /** Main menu — art skin v2, laid out per kc_main_screen.png. */
  import HowToPlay from '../components/HowToPlay.svelte';
  import LeaderboardOverlay from '../components/LeaderboardOverlay.svelte';
  import CollectionOverlay from '../components/CollectionOverlay.svelte';
  import { levelNumber, streak, startGame, settingsOpen, tutorialDone } from '../lib/game';
  import { leaderboardType, showNativePopup } from '../lib/leaderboard';
  import { mainHeroUrl, mainLeavesUrl, mainButterflyUrl, mainPawtrailUrl } from '../lib/skin';

  let showHow = false;
  let showBoard = false;
  let showCollection = false;

  function onStats(): void {
    if ($leaderboardType === 'native_popup') void showNativePopup();
    else showBoard = true;
  }
</script>

<section class="main">
  <!-- decor cut from the reference: leaves (top-left), butterfly trail, paw trail -->
  <img class="deco leaves" src={mainLeavesUrl} alt="" draggable="false" />
  <img class="deco butterfly" src={mainButterflyUrl} alt="" draggable="false" />
  <img class="deco pawtrail" src={mainPawtrailUrl} alt="" draggable="false" />

  <div class="top-icons">
    <div class="left-icons">
      <button class="squircle" aria-label="How to play" on:click={() => (showHow = true)}>
        <svg><use href="#ic-q" /></svg>
      </button>
      {#if $streak > 0}
        <div class="squircle streak-badge" aria-label="{$streak} level streak">
          <svg viewBox="0 0 24 28" class="flame"><use href="#ic-flame" /></svg>
          <b>{$streak}</b>
        </div>
      {/if}
    </div>
    <button class="squircle" aria-label="Settings" on:click={() => settingsOpen.set(true)}>
      <svg><use href="#ic-gear" /></svg>
    </button>
  </div>

  <img class="hero" src={mainHeroUrl} alt="Kitty Corners — a cozy logic puzzle" draggable="false" />

  <div class="main-bottom">
    <div class="side-btn">
      <button class="squircle big" aria-label="Collection" on:click={() => (showCollection = true)}>
        <svg><use href="#ic-cathead-line" /></svg>
      </button>
      <span class="side-label">Collection</span>
    </div>

    <button class="play-big" on:click={startGame}>
      Play
      {#if $tutorialDone}<small>Level {$levelNumber + 1}</small>{/if}
    </button>

    <div class="side-btn">
      <button class="squircle big" aria-label="Leaderboard" on:click={onStats}>
        <svg><use href="#ic-trophy" /></svg>
      </button>
      <span class="side-label">Leaderboard</span>
    </div>
  </div>

  {#if showHow}
    <HowToPlay on:close={() => (showHow = false)} />
  {/if}
  {#if showBoard}
    <LeaderboardOverlay on:close={() => (showBoard = false)} />
  {/if}
  {#if showCollection}
    <CollectionOverlay on:close={() => (showCollection = false)} />
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
    /* base spacing, expanded to clear device safe areas (notch / rounded corners) */
    padding: max(24px, env(safe-area-inset-top)) max(22px, env(safe-area-inset-right))
      max(34px, env(safe-area-inset-bottom)) max(22px, env(safe-area-inset-left));
    background: linear-gradient(180deg, #fcebd8 0%, #fdeedd 45%, #fbe8d1 100%);
    overflow: hidden;
  }
  :global(.dark) .main {
    background: linear-gradient(180deg, #2a2433 0%, #241f2b 60%, #1e1a26 100%);
  }
  .deco {
    position: absolute;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .leaves {
    top: 0;
    left: 0;
    width: 53%;
  }
  .butterfly {
    top: 17%;
    right: 6%;
    width: 26%;
  }
  .pawtrail {
    left: 0;
    bottom: 21%;
    width: 100%;
  }
  :global(.dark) .deco {
    opacity: 0.55;
  }
  .top-icons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    z-index: 1;
  }
  .left-icons {
    display: flex;
    gap: 12px;
  }
  .squircle {
    width: 58px;
    height: 58px;
    flex: none;
    border-radius: 20px;
    /* ui_atlas: blank squircle sprite; icons overlaid on top */
    background: url('../assets/btn_squircle.webp') center / 100% 100% no-repeat;
    filter: drop-shadow(0 5px 8px rgba(125, 74, 73, 0.18));
    color: #7d4a49; /* fixed: sprite stays cream in dark theme */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.07s;
  }
  button.squircle:active {
    transform: translateY(3px);
  }
  .squircle svg {
    width: 27px;
    height: 27px;
  }
  .streak-badge {
    width: auto;
    padding: 0 14px;
    gap: 5px;
    font-family: 'Baloo 2', sans-serif;
    font-size: 20px;
  }
  .streak-badge .flame {
    width: 21px;
    height: 25px;
  }
  .hero {
    width: min(78%, 340px);
    z-index: 1;
  }
  .main-bottom {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 18px;
    z-index: 1;
  }
  .side-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }
  .side-btn .big {
    width: 64px;
    height: 64px;
    border-radius: 22px;
  }
  .side-btn .big svg {
    width: 31px;
    height: 31px;
  }
  .side-label {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--ink);
  }
  /* big green Play: glossy pill sprite from ui_atlas */
  .play-big {
    flex: 1;
    max-width: 260px;
    aspect-ratio: 552 / 187;
    padding: 6px 20px 12px;
    border-radius: 26px;
    background: url('../assets/btn_green_pill.webp') center / 100% 100% no-repeat;
    filter: drop-shadow(0 6px 10px rgba(105, 90, 60, 0.25));
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 30px;
    line-height: 1.05;
    color: #fff;
    text-shadow: 0 1.5px 2px rgba(60, 90, 10, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    transition: transform 0.08s;
  }
  .play-big:active {
    transform: translateY(4px);
    filter: drop-shadow(0 2px 4px rgba(105, 90, 60, 0.25));
  }
  .play-big small {
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 15px;
    color: #e7f2bb;
  }
  /* Landscape / desktop: keep the menu as a cohesive centered column instead of
     stretching the phone layout across the full width; the full-bleed body
     gradient fills the sides (cap-and-center). */
  @media (min-aspect-ratio: 1 / 1) {
    .main {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      width: 100%;
      max-width: 620px;
      padding: max(28px, env(safe-area-inset-top)) max(26px, env(safe-area-inset-right))
        max(40px, env(safe-area-inset-bottom)) max(26px, env(safe-area-inset-left));
      /* let the corner decor bleed out of the narrow menu column; the stage
         (overflow:hidden) still clips it to the play-area edge */
      overflow: visible;
    }
    .hero {
      width: min(72%, 420px);
    }
    .main-bottom {
      max-width: 520px;
      gap: 26px;
    }
    /* Anchor the leafy branch to the top-left of the play area (like on phones)
       instead of the column edge, so it no longer cuts abruptly mid-branch.
       The negative offset spans from the column left to the stage left edge. */
    .leaves {
      left: calc((620px - min(1240px, 100vw)) / 2);
      width: min(46vw, 560px);
      /* feather the far-left so the branch dissolves into the background instead
         of a hard cut (and hides the soft artifact baked into the source art) */
      -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 40%);
      mask-image: linear-gradient(to right, transparent 0%, #000 40%);
    }
    /* keep the paw trail within the menu column */
    .pawtrail {
      left: 0;
    }
  }
</style>
