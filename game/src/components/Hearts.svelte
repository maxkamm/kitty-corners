<script lang="ts">
  /**
   * Hearts burn right-to-left (Р-32): full hearts stay on the left.
   * Juice pass: on loss the burning heart shakes, flashes and collapses into the dent,
   * heart-colored shards fly out; the whole row gives a short shake.
   */
  export let value: number;
  export let max = 3;
  export let size = 33;

  let prev = value;
  let lostIndex = -1; // heart currently playing the burn animation
  let burstKey = 0;
  let lostTimer: ReturnType<typeof setTimeout> | undefined;

  const SHARDS = [
    { dx: -16, dy: -14, r: -40 },
    { dx: 16, dy: -12, r: 50 },
    { dx: -10, dy: 12, r: -70 },
    { dx: 12, dy: 14, r: 60 },
    { dx: 0, dy: -18, r: 20 }
  ];

  $: onValueChange(value);

  function onValueChange(v: number): void {
    if (v < prev) {
      // the heart that just burned sits at index v (rightmost full one)
      lostIndex = v;
      burstKey++;
      clearTimeout(lostTimer);
      lostTimer = setTimeout(() => (lostIndex = -1), 700);
    }
    prev = v;
  }
</script>

{#key burstKey}
  <div class="hearts" class:row-shake={lostIndex >= 0} style="--hs:{size}px" aria-label="{value} of {max} hearts">
    {#each Array(max) as _, i}
      <span class="slot">
        {#if i < value}
          <svg class="heart-full"><use href="#ic-heart-full" /></svg>
        {:else}
          <svg class="heart-empty"><use href="#ic-heart-empty" /></svg>
          {#if i === lostIndex}
            <svg class="heart-burn" aria-hidden="true"><use href="#ic-heart-full" /></svg>
            <span class="shards" aria-hidden="true">
              {#each SHARDS as s, k}
                <i style="--dx:{s.dx}px;--dy:{s.dy}px;--rot:{s.r}deg;--sd:{k * 20}ms"></i>
              {/each}
            </span>
          {/if}
        {/if}
      </span>
    {/each}
  </div>
{/key}

<style>
  .hearts {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .slot {
    position: relative;
    width: var(--hs);
    height: var(--hs);
    flex: none;
  }
  .slot svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .heart-full {
    filter: drop-shadow(0 2px 3px rgba(90, 60, 60, 0.28));
  }
  .heart-empty {
    filter: none;
  }
  /* the burning heart: shake, flash, collapse into the dent */
  .heart-burn {
    filter: drop-shadow(0 2px 3px rgba(90, 60, 60, 0.28));
    transform-origin: 50% 55%;
    animation: heart-burn 0.55s ease-in forwards;
  }
  @keyframes heart-burn {
    0% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    18% {
      transform: translateX(-2.5px) scale(1.12);
    }
    36% {
      transform: translateX(2.5px) scale(1.18);
    }
    55% {
      transform: translateX(-1.5px) scale(1.08);
      opacity: 1;
    }
    100% {
      transform: translateX(0) scale(0.25);
      opacity: 0;
    }
  }
  .shards {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .shards i {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 22%;
    height: 22%;
    background: var(--heart);
    /* tiny heart-ish shard */
    clip-path: polygon(50% 100%, 0 38%, 25% 0, 50% 22%, 75% 0, 100% 38%);
    opacity: 0;
    animation: shard-fly 0.6s ease-out var(--sd, 0ms) forwards;
  }
  @keyframes shard-fly {
    0% {
      transform: translate(-50%, -50%) rotate(0) scale(1);
      opacity: 0.95;
    }
    100% {
      transform: translate(calc(-50% + var(--dx) * 2), calc(-50% + var(--dy) * 2)) rotate(var(--rot)) scale(0.3);
      opacity: 0;
    }
  }
  .row-shake {
    animation: row-shake 0.4s;
  }
  @keyframes row-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    50% { transform: translateX(2px); }
    75% { transform: translateX(-1px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .heart-burn,
    .shards i,
    .row-shake {
      animation: none;
    }
    .heart-burn {
      opacity: 0;
    }
  }
</style>
