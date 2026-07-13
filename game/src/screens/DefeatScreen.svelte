<script lang="ts">
  /** Defeat (GDD §5.4, Р-40): rewarded «Skip level» dominates (Playgama-compliant),
   *  restart secondary, quit — quiet link. */
  import Hearts from '../components/Hearts.svelte';
  import { streak, skipLevelWithAd, restartAfterDefeat, quitAfterDefeat } from '../lib/game';
  import { rewardedSupported, adNotice } from '../lib/ads';
  import { catSadUrl } from '../lib/skin';
</script>

<section class="lose">
  <img class="mascot" src={catSadUrl} alt="" draggable="false" />

  <Hearts value={0} size={45} />

  <h1 class="big-title">Out of hearts</h1>

  {#if $streak > 0}
    <div class="streak-warn">
      <svg class="flame-s"><use href="#ic-flame" /></svg>
      Your {$streak}&nbsp;level streak will end here
    </div>
  {/if}

  {#if $rewardedSupported}
    <button class="cta" on:click={() => skipLevelWithAd()}>
      Skip this level
      <small><svg width="13" height="13" style="vertical-align:-2px" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg> watch a short ad · streak stays safe</small>
    </button>
    <button class="btn-secondary" on:click={restartAfterDefeat}>Restart level</button>
  {:else}
    <button class="cta" on:click={restartAfterDefeat}>Restart level</button>
  {/if}
  <button class="link-quiet" on:click={quitAfterDefeat}>Quit to menu</button>

  {#if $adNotice}
    <div class="ad-toast" role="status">{$adNotice}</div>
  {/if}
</section>

<style>
  .lose {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 26px;
    gap: 14px;
    text-align: center;
    background: linear-gradient(180deg, #fcebd8 0%, #fdeedd 45%, #fbe8d1 100%);
  }
  :global(.dark) .lose {
    background: linear-gradient(180deg, #2a2433 0%, #241f2b 60%, #1e1a26 100%);
  }
  .mascot {
    width: 144px;
    height: 144px;
    object-fit: contain;
    filter: drop-shadow(0 8px 12px rgba(125, 74, 73, 0.22));
    animation: mascot-droop 0.7s cubic-bezier(0.25, 0.9, 0.4, 1) both;
  }
  @keyframes mascot-droop {
    0% {
      transform: translateY(-14px) scale(0.96) rotate(-3deg);
      opacity: 0;
    }
    100% {
      transform: translateY(0) scale(1) rotate(-3deg);
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .mascot {
      animation: none;
    }
  }
  .streak-warn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--accent-soft);
    color: var(--accent-ink);
    border-radius: 12px;
    padding: 9px 14px;
    font-weight: 800;
    font-size: 14px;
  }
  :global(.dark) .streak-warn {
    color: #ffd9be;
  }
  .lose .cta {
    width: 100%;
    max-width: 300px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    margin-top: 8px;
  }
  .lose .cta small {
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 12px;
    opacity: 0.9;
  }
  .lose .btn-secondary {
    width: 100%;
    max-width: 300px;
    padding: 12px;
    font-size: 16px;
  }
  .ad-toast {
    position: absolute;
    left: 50%;
    bottom: 26px;
    transform: translateX(-50%);
    max-width: 88%;
    background: var(--ink);
    color: var(--bg);
    border-radius: 12px;
    padding: 9px 14px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 13px;
    box-shadow: var(--shadow);
  }
</style>
