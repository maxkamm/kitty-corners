<script lang="ts">
  /**
   * First-run tutorial screen (GDD §2.1, Р-41):
   * phase 1 — the "How to play" slides; phase 2 — the guided 4×4 level
   * driven by the script in lib/tutorial.ts. No hearts, no ads, no timer.
   */
  import Board from '../components/Board.svelte';
  import HowToPlay from '../components/HowToPlay.svelte';
  import { finishTutorial, skipTutorial } from '../lib/game';
  import {
    TUTORIAL_LEVEL,
    GIVEN_IDX,
    STEPS,
    tutCells,
    tutStep,
    tutFinished,
    resetTutorial,
    tutNext,
    tutTap,
    tutCommit
  } from '../lib/tutorial';

  let phase: 'slides' | 'board' = 'slides';
  let wrapH = 0;
  /** given-cat intro (cat pop + X wave), mirrors the real level intro (Р-36) */
  let introOrigin = -1;
  let introDone = false;
  /** joy wave before the finish sheet */
  let celebrate = false;
  let showFinish = false;

  const INTRO_MS = 1400;
  const CELEBRATION_MS = 1200;

  $: step = STEPS[$tutStep];
  $: guideCells = introDone && !$tutFinished ? step.targets : [];

  function reducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  function startBoard(): void {
    resetTutorial();
    phase = 'board';
    if (reducedMotion()) {
      introDone = true;
      return;
    }
    introOrigin = GIVEN_IDX;
    setTimeout(() => {
      introOrigin = -1;
      introDone = true;
    }, INTRO_MS);
  }

  $: if ($tutFinished && !celebrate && !showFinish) {
    if (reducedMotion()) {
      showFinish = true;
    } else {
      celebrate = true;
      setTimeout(() => {
        celebrate = false;
        showFinish = true;
      }, CELEBRATION_MS);
    }
  }
</script>

{#if phase === 'slides'}
  <HowToPlay doneLabel="Try it" on:close={startBoard} />
{:else}
  <section class="tut">
    <div class="tut-top">
      <div class="tut-chip">Tutorial</div>
      {#if !$tutFinished}
        <button class="link-quiet" on:click={skipTutorial}>Skip</button>
      {/if}
    </div>

    <div class="bubble" role="status">
      {#if introDone}
        <p>{$tutFinished ? 'All three rules satisfied — solved!' : step.text}</p>
        {#if !$tutFinished && step.action === 'next'}
          <button class="cta next-btn" on:click={tutNext}>Next</button>
        {/if}
      {:else}
        <p>Watch closely…</p>
      {/if}
    </div>

    <div class="board-wrap" bind:clientHeight={wrapH}>
      <Board
        level={TUTORIAL_LEVEL}
        cells={$tutCells}
        givens={[GIVEN_IDX]}
        {introOrigin}
        {guideCells}
        {celebrate}
        onTap={introDone ? tutTap : () => {}}
        onCommit={introDone ? tutCommit : () => {}}
        maxPx={wrapH}
      />
    </div>
  </section>

  {#if showFinish}
    <div class="overlay" role="dialog" aria-label="Tutorial complete">
      <div class="sheet">
        <h2>You're ready</h2>
        <p>That's all there is to it — one cat per color, row and column, never touching. Enjoy the puzzles.</p>
        <button class="cta" on:click={finishTutorial}>Next level</button>
      </div>
    </div>
  {/if}
{/if}

<style>
  .tut {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 16px 14px 18px;
    gap: 12px;
    background: linear-gradient(180deg, #fcebd8 0%, #fdeedd 45%, #fbe8d1 100%);
  }
  :global(.dark) .tut {
    background: linear-gradient(180deg, #2a2433 0%, #241f2b 60%, #1e1a26 100%);
  }
  .tut-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tut-chip {
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #7d4a49;
    background: url('../assets/btn_white_small.webp') center / 100% 100% no-repeat;
    padding: 7px 18px;
    border-radius: 16px;
    filter: drop-shadow(0 3px 6px rgba(125, 74, 73, 0.14));
  }
  .bubble {
    background: var(--surface);
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: var(--shadow-pop);
    /* fixed height (sized to the tallest hint) so it doesn't jump step to step */
    height: 156px;
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
  }
  .bubble p {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
  }
  .next-btn {
    align-self: center;
    padding: 9px 26px;
  }
  .board-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 0;
  }
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
  }
  .sheet p {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.45;
  }
  .sheet .cta {
    padding: 13px;
  }
  /* Desktop / landscape: keep the column narrow and centered. */
  @media (min-aspect-ratio: 1 / 1) {
    .tut {
      max-width: 560px;
      margin: 0 auto;
      padding: 18px 28px 22px;
    }
  }
</style>
