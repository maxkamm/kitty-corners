<script lang="ts">
  /** Dev-only fake ad overlay for the ads stub. Replaced by real Bridge SDK ads at release. */
  import { fakeAdVisible } from '../lib/ads';
</script>

{#if $fakeAdVisible}
  <div class="ad-stub" role="dialog" aria-label="Ad">
    <svg width="44" height="44" viewBox="0 0 24 24" style="color:#fff"><use href="#ic-play-ad" /></svg>
    <div class="txt">ad playing…</div>
  </div>
{/if}

<style>
  .ad-stub {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: rgba(20, 15, 28, 0.88);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .txt {
    color: #fff;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    font-size: 18px;
    opacity: 0.85;
  }
</style>
