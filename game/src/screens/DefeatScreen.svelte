<script lang="ts">
  /** Defeat (GDD §5.4, Р-40): rewarded «Skip level» dominates (Playgama-compliant),
   *  restart secondary, quit — quiet link. */
  import Hearts from '../components/Hearts.svelte';
  import { streak, skipLevelWithAd, restartAfterDefeat, quitAfterDefeat } from '../lib/game';
</script>

<section class="lose">
  <svg class="mascot" viewBox="0 0 100 100" aria-hidden="true"><use href="#cat-round-sad" /></svg>

  <Hearts value={0} size={45} />

  <h1 class="big-title">Out of hearts</h1>

  {#if $streak > 0}
    <div class="streak-warn">
      <svg class="flame-s"><use href="#ic-flame" /></svg>
      Your {$streak}&nbsp;level streak will end here
    </div>
  {/if}

  <button class="cta" on:click={() => skipLevelWithAd()}>
    Skip this level
    <small><svg width="13" height="13" style="vertical-align:-2px" viewBox="0 0 24 24"><use href="#ic-play-ad" /></svg> watch a short ad · streak stays safe</small>
  </button>
  <button class="btn-secondary" on:click={restartAfterDefeat}>Restart level</button>
  <button class="link-quiet" on:click={quitAfterDefeat}>Quit to menu</button>
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
  }
  .mascot {
    width: 128px;
    height: 116px;
    filter: drop-shadow(0 6px 10px rgba(60, 45, 70, 0.2));
    animation: mascot-droop 0.7s cubic-bezier(0.25, 0.9, 0.4, 1) both;
  }
  @keyframes mascot-droop {
    0% {
      transform: translateY(-14px) scale(0.96);
      opacity: 0;
    }
    100% {
      transform: translateY(0) scale(1);
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
    font-size: 19px;
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
</style>
