/**
 * Cat collection — sprite URLs (GDD §10, §10.8). UI-only: this module imports
 * `.webp` assets and must NOT be pulled into `game.ts`/the Node test harness
 * (which only understands `.ts`/`.json`). Breed *logic* lives in `collection.ts`.
 *
 * idle = board pose, happy = reveal / victory pose. The 10 art-skin-v2 breeds use
 * the k3 idle + k3happy pairs; Tabby/White/Tuxedo/Cream use the k_* idle/happy
 * pairs. Art-less breeds (Р-53) have no entry → the UI shows a silhouette.
 */
import type { CatSprite } from './skin';

import k3_bombay from '../assets/k3_bombay.webp';
import k3_bsh from '../assets/k3_bsh.webp';
import k3_bengal from '../assets/k3_bengal.webp';
import k3_persian from '../assets/k3_persian.webp';
import k3_siamese from '../assets/k3_siamese.webp';
import k3_calico from '../assets/k3_calico.webp';
import k3_mainecoon from '../assets/k3_mainecoon.webp';
import k3_scottishfold from '../assets/k3_scottishfold.webp';
import k3_ragdoll from '../assets/k3_ragdoll.webp';
import k3_sphynx from '../assets/k3_sphynx.webp';

import k3h_bombay from '../assets/k3happy_bombay.webp';
import k3h_bsh from '../assets/k3happy_bsh.webp';
import k3h_bengal from '../assets/k3happy_bengal.webp';
import k3h_persian from '../assets/k3happy_persian.webp';
import k3h_siamese from '../assets/k3happy_siamese.webp';
import k3h_calico from '../assets/k3happy_calico.webp';
import k3h_mainecoon from '../assets/k3happy_mainecoon.webp';
import k3h_scottishfold from '../assets/k3happy_scottishfold.webp';
import k3h_ragdoll from '../assets/k3happy_ragdoll.webp';
import k3h_sphynx from '../assets/k3happy_sphynx.webp';

import k_tabby_idle from '../assets/k_tabby_idle.webp';
import k_tabby_happy from '../assets/k_tabby_happy.webp';
import k_white_idle from '../assets/k_white_idle.webp';
import k_white_happy from '../assets/k_white_happy.webp';
import k_tuxedo_idle from '../assets/k_tuxedo_idle.webp';
import k_tuxedo_happy from '../assets/k_tuxedo_happy.webp';
import k_cream_idle from '../assets/k_cream_idle.webp';
import k_cream_happy from '../assets/k_cream_happy.webp';

const SPRITES: Record<string, CatSprite> = {
  bombay: { idle: k3_bombay, happy: k3h_bombay },
  bsh: { idle: k3_bsh, happy: k3h_bsh },
  bengal: { idle: k3_bengal, happy: k3h_bengal },
  persian: { idle: k3_persian, happy: k3h_persian },
  siamese: { idle: k3_siamese, happy: k3h_siamese },
  calico: { idle: k3_calico, happy: k3h_calico },
  mainecoon: { idle: k3_mainecoon, happy: k3h_mainecoon },
  scottishfold: { idle: k3_scottishfold, happy: k3h_scottishfold },
  ragdoll: { idle: k3_ragdoll, happy: k3h_ragdoll },
  sphynx: { idle: k3_sphynx, happy: k3h_sphynx },
  tabby: { idle: k_tabby_idle, happy: k_tabby_happy },
  white: { idle: k_white_idle, happy: k_white_happy },
  tuxedo: { idle: k_tuxedo_idle, happy: k_tuxedo_happy },
  cream: { idle: k_cream_idle, happy: k_cream_happy }
};

/** Sprite pair for a breed id, or null when its art is not ready yet (Р-53). */
export function spriteForBreed(id: string): CatSprite | null {
  return SPRITES[id] ?? null;
}
