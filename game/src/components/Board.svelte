<script lang="ts">
  /**
   * Board (GDD §5.2, §7):
   * - CSS Grid with BOTH grid-template-columns and -rows = repeat(N,1fr);
   *   cell content (SVG) positioned absolute in % — see the intrinsic-size bug note in GDD §7.
   * - Region borders: inset box-shadow per differing neighbour (ref: buildBoard() in mockup).
   * - Tap = toggle X (tap on a cat removes it). Long-press ~380ms with charging ring = commit a cat.
   */
  import type { LevelDef, CellState } from '../lib/types';
  import { tapCell, commitCat } from '../lib/game';

  export let level: LevelDef;
  export let cells: CellState[];
  export let errorCells: number[] = [];
  export let hintCells: number[] = [];
  /** cells glowing persistently while the tutorial waits for them */
  export let guideCells: number[] = [];
  /** input handlers — default to the real game; the tutorial passes its own */
  export let onTap: (i: number) => void = tapCell;
  export let onCommit: (i: number) => void = commitCat;
  /** joy wave across cats before the Victory screen */
  export let celebrate = false;
  /** pre-placed cats (non-removable, Р-36) */
  export let givens: number[] = [];
  /** primary given index while the level intro plays, or -1 */
  export let introOrigin = -1;
  /** available height from the parent, px (KC-1: board must fit short/landscape viewports) */
  export let maxPx = 0;

  /** KC-2: larger boards may grow beyond 372px so cells reach 40px+ on wide screens */
  $: basePx = n >= 9 ? n * 44 : 372;
  $: sizeLimit = maxPx > 0 ? Math.min(basePx, maxPx) : basePx;

  /** intro timings: cat pops first, X marks ripple out by Chebyshev distance */
  const INTRO_CAT_DELAY_MS = 120;
  const INTRO_X_BASE_MS = 650;
  const INTRO_X_STEP_MS = 70;


  function introXDelay(i: number): number {
    const or = Math.floor(introOrigin / n);
    const oc = introOrigin % n;
    const r = Math.floor(i / n);
    const c = i % n;
    const dist = Math.max(Math.abs(r - or), Math.abs(c - oc));
    return INTRO_X_BASE_MS + dist * INTRO_X_STEP_MS;
  }

  /** particle burst directions for the commit pop (unit offsets, %) */
  const PARTICLES = [
    { dx: -38, dy: -30 },
    { dx: 38, dy: -30 },
    { dx: -46, dy: 8 },
    { dx: 46, dy: 8 },
    { dx: -22, dy: -46 },
    { dx: 22, dy: -46 }
  ];

  const LONG_PRESS_MS = 380;
  const RING_DELAY_MS = 90; // KC-10: don't flash the ring on short taps
  const MOVE_CANCEL_PX = 12;

  let charging = -1; // cell index with active charge ring
  let pressTimer: ReturnType<typeof setTimeout> | undefined;
  let ringTimer: ReturnType<typeof setTimeout> | undefined;
  let pressedIndex = -1;
  let committed = false;
  let startX = 0;
  let startY = 0;

  $: n = level.size;

  function cellBg(r: number, c: number): string {
    const id = level.regions[r][c];
    return `var(--${level.colors?.[id] ?? id})`;
  }

  /** Thick contour where the neighbouring cell belongs to another region (GDD §6.6). */
  function regionShadow(r: number, c: number): string {
    const reg = level.regions[r][c];
    const sh: string[] = [];
    if (r > 0 && level.regions[r - 1][c] !== reg) sh.push('inset 0 1.5px 0 var(--region-line)');
    if (r < n - 1 && level.regions[r + 1][c] !== reg) sh.push('inset 0 -1.5px 0 var(--region-line)');
    if (c > 0 && level.regions[r][c - 1] !== reg) sh.push('inset 1.5px 0 0 var(--region-line)');
    if (c < n - 1 && level.regions[r][c + 1] !== reg) sh.push('inset -1.5px 0 0 var(--region-line)');
    return sh.join(',');
  }

  function cancelPress(): void {
    clearTimeout(pressTimer);
    clearTimeout(ringTimer);
    charging = -1;
    pressedIndex = -1;
  }

  function onDown(e: PointerEvent, i: number): void {
    if (e.button !== undefined && e.button !== 0) return;
    committed = false;
    pressedIndex = i;
    startX = e.clientX;
    startY = e.clientY;
    if (cells[i] !== 'cat') {
      clearTimeout(pressTimer);
      clearTimeout(ringTimer);
      ringTimer = setTimeout(() => (charging = i), RING_DELAY_MS);
      pressTimer = setTimeout(() => {
        committed = true;
        charging = -1;
        onCommit(i);
      }, LONG_PRESS_MS);
    }
  }

  function onUp(i: number): void {
    const wasPressed = pressedIndex === i && !committed;
    cancelPress();
    if (wasPressed) onTap(i);
  }

  function onMove(e: PointerEvent): void {
    if (pressedIndex < 0) return;
    if (Math.abs(e.clientX - startX) > MOVE_CANCEL_PX || Math.abs(e.clientY - startY) > MOVE_CANCEL_PX) {
      cancelPress();
    }
  }

  /** Desktop convenience: right-click commits a cat (long-press with the mouse still works). */
  function onContext(e: MouseEvent, i: number): void {
    e.preventDefault();
    cancelPress();
    if (cells[i] !== 'cat') onCommit(i);
  }
</script>

<div
  class="board"
  role="grid"
  tabindex="-1"
  aria-label="Puzzle board {n} by {n}"
  style="grid-template-columns:repeat({n},1fr);grid-template-rows:repeat({n},1fr);width:min({sizeLimit}px,100%)"
  on:contextmenu|preventDefault
>
  {#each level.regions as row, r}
    {#each row as _, c}
      {@const i = r * n + c}
      <div
        class="cell"
        class:error={errorCells.includes(i)}
        class:hint={hintCells.includes(i)}
        class:guide={guideCells.includes(i)}
        role="gridcell"
        tabindex="-1"
        style="background:{cellBg(r, c)};{regionShadow(r, c) ? `box-shadow:${regionShadow(r, c)}` : ''}"
        on:pointerdown={(e) => onDown(e, i)}
        on:pointerup={() => onUp(i)}
        on:pointermove={onMove}
        on:pointercancel={cancelPress}
        on:pointerleave={cancelPress}
        on:contextmenu={(e) => onContext(e, i)}
      >
        {#if cells[i] === 'cat'}
          <svg
            class="cat"
            class:celebrate
            class:given-delay={givens.includes(i)}
            style="--wave-d:{c * 70}ms;--gd:{INTRO_CAT_DELAY_MS}ms"
            aria-label={givens.includes(i) ? 'pre-placed cat' : 'cat'}
          >
            <use href="#cat-round" />
          </svg>
          <span class="pop" aria-hidden="true" style="--pop-base:{givens.includes(i) ? INTRO_CAT_DELAY_MS : 0}ms">
            {#each PARTICLES as p, k}
              <i style="--dx:{p.dx}%;--dy:{p.dy}%;--pd:{k * 12}ms"></i>
            {/each}
          </span>
        {:else if cells[i] === 'x'}
          <svg
            class="xmark"
            class:fade-out={celebrate}
            class:intro={introOrigin >= 0}
            style={introOrigin >= 0 ? `--xd:${introXDelay(i)}ms` : ''}
            aria-label="excluded"
          >
            <use href="#soft-x" />
          </svg>
        {/if}
        {#if charging === i}
          <svg class="charge" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--ink)" stroke-opacity=".25" stroke-width="4" />
            <circle class="arc" cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
          </svg>
        {/if}
      </div>
    {/each}
  {/each}
</div>

<style>
  .board {
    display: grid;
    width: 100%;
    aspect-ratio: 1;
    border: 3px solid var(--ink);
    border-radius: 14px;
    overflow: hidden;
    background: var(--ink);
    gap: 1px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .cell {
    position: relative;
  }
  .cell svg {
    position: absolute;
    top: 9%;
    left: 9%;
    width: 82%;
    height: 82%;
    pointer-events: none;
  }
  .cell .xmark {
    top: 33%;
    left: 33%;
    width: 34%;
    height: 34%;
    opacity: 0.55;
  }
  /* commit: soft landing with a single gentle overshoot (smooth easing across keyframes) */
  .cell .cat {
    transform-origin: 50% 85%;
    animation: cat-land 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes cat-land {
    0% {
      transform: scale(0.5) translateY(-10%);
      opacity: 0;
    }
    60% {
      transform: scale(1.05) translateY(0);
      opacity: 1;
    }
    80% {
      transform: scale(0.98, 1.02);
    }
    100% {
      transform: scale(1);
    }
  }
  /* level intro (Р-36): the given cat lands exactly like a committed cat, just after a beat.
     The class is permanent for the level — removing it would re-trigger the base animation. */
  .cell .cat.given-delay {
    animation-delay: var(--gd, 120ms);
    animation-fill-mode: both;
  }
  /* …then X marks draw outward from it, staggered by distance */
  .xmark.intro {
    animation: x-draw 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) var(--xd, 560ms) both;
  }
  @keyframes x-draw {
    0% {
      transform: scale(0) rotate(-45deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0);
      opacity: 0.55;
    }
  }
  /* joy wave before Victory: column-staggered hops */
  .cell .cat.celebrate {
    animation: cat-joy 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) var(--wave-d, 0ms) 2;
  }
  @keyframes cat-joy {
    0%, 100% {
      transform: translateY(0) scale(1, 1);
    }
    30% {
      transform: translateY(-16%) scale(0.92, 1.1);
    }
    60% {
      transform: translateY(2%) scale(1.1, 0.88);
    }
  }
  /* commit pop: particle burst */
  .pop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .pop i {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 9%;
    height: 9%;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0;
    animation: pop-fly 0.5s ease-out calc(var(--pop-base, 0ms) + var(--pd, 0ms)) forwards;
  }
  @keyframes pop-fly {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.9;
    }
    100% {
      transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2);
      opacity: 0;
    }
  }
  .xmark.fade-out {
    animation: x-fade 0.4s forwards;
  }
  @keyframes x-fade {
    to {
      opacity: 0;
      transform: scale(0.6);
    }
  }
  .cell .charge {
    top: 12%;
    left: 12%;
    width: 76%;
    height: 76%;
  }
  .charge .arc {
    stroke-dasharray: 100.53; /* 2πr, r=16 */
    stroke-dashoffset: 100.53;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    animation: charge-fill 0.29s linear forwards; /* ring appears 90ms into the press */
  }
  @keyframes charge-fill {
    to {
      stroke-dashoffset: 0;
    }
  }
  .cell.error {
    animation: err-shake 0.4s;
  }
  .cell.error::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--danger);
    opacity: 0.45;
    animation: err-fade 0.6s forwards;
  }
  @keyframes err-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-2px); }
  }
  @keyframes err-fade {
    to { opacity: 0; }
  }
  .cell.hint::after {
    content: '';
    position: absolute;
    inset: 6%;
    border: 3px solid var(--accent);
    border-radius: 20%;
    animation: hint-pulse 0.8s ease-in-out 3;
    pointer-events: none;
  }
  @keyframes hint-pulse {
    0%, 100% { opacity: 0.35; transform: scale(0.96); }
    50% { opacity: 1; transform: scale(1); }
  }
  /* tutorial: persistent gentle glow until the player acts on the cell */
  .cell.guide::after {
    content: '';
    position: absolute;
    inset: 6%;
    border: 3px solid var(--accent);
    border-radius: 20%;
    animation: hint-pulse 1.2s ease-in-out infinite;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .cell .cat,
    .cell .cat.celebrate,
    .cell .cat.given-delay,
    .cell.error,
    .cell.hint::after,
    .pop i,
    .xmark.fade-out,
    .xmark.intro {
      animation: none;
    }
  }
</style>
