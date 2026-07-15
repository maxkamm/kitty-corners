/**
 * Cat collection — sprite URLs (GDD §10.8). UI-only: imports `.webp` assets, so it
 * must NOT be pulled into `game.ts`/the Node test harness. Breed logic lives in
 * `collection.ts`. Art: kc_kitty_list4 (idle) + kc_kitty_list4_happy (happy),
 * sliced to k4_<id> / k4happy_<id>.
 */
import type { CatSprite } from './skin';

import idle_tuxedo from '../assets/k4_tuxedo.webp';
import idle_dilutecalico from '../assets/k4_dilutecalico.webp';
import idle_tortoiseshell from '../assets/k4_tortoiseshell.webp';
import idle_oddeyedwhite from '../assets/k4_oddeyedwhite.webp';
import idle_americanshorthair from '../assets/k4_americanshorthair.webp';
import idle_mainecoonred from '../assets/k4_mainecoonred.webp';
import idle_munchkin from '../assets/k4_munchkin.webp';
import idle_japanesebobtail from '../assets/k4_japanesebobtail.webp';
import idle_russianblue from '../assets/k4_russianblue.webp';
import idle_burmese from '../assets/k4_burmese.webp';
import idle_himalayan from '../assets/k4_himalayan.webp';
import idle_ragdoll from '../assets/k4_ragdoll.webp';
import idle_chartreux from '../assets/k4_chartreux.webp';
import idle_exoticshorthair from '../assets/k4_exoticshorthair.webp';
import idle_turkishangora from '../assets/k4_turkishangora.webp';
import idle_abyssinian from '../assets/k4_abyssinian.webp';
import idle_tonkinese from '../assets/k4_tonkinese.webp';
import idle_orientalshorthair from '../assets/k4_orientalshorthair.webp';
import idle_birman from '../assets/k4_birman.webp';
import idle_norwegian from '../assets/k4_norwegian.webp';
import idle_siberian from '../assets/k4_siberian.webp';
import idle_singapura from '../assets/k4_singapura.webp';
import idle_devonrex from '../assets/k4_devonrex.webp';
import idle_laperm from '../assets/k4_laperm.webp';
import idle_selkirkrex from '../assets/k4_selkirkrex.webp';
import idle_savannah from '../assets/k4_savannah.webp';
import idle_egyptianmau from '../assets/k4_egyptianmau.webp';
import idle_vankedisi from '../assets/k4_vankedisi.webp';

import happy_tuxedo from '../assets/k4happy_tuxedo.webp';
import happy_dilutecalico from '../assets/k4happy_dilutecalico.webp';
import happy_tortoiseshell from '../assets/k4happy_tortoiseshell.webp';
import happy_oddeyedwhite from '../assets/k4happy_oddeyedwhite.webp';
import happy_americanshorthair from '../assets/k4happy_americanshorthair.webp';
import happy_mainecoonred from '../assets/k4happy_mainecoonred.webp';
import happy_munchkin from '../assets/k4happy_munchkin.webp';
import happy_japanesebobtail from '../assets/k4happy_japanesebobtail.webp';
import happy_russianblue from '../assets/k4happy_russianblue.webp';
import happy_burmese from '../assets/k4happy_burmese.webp';
import happy_himalayan from '../assets/k4happy_himalayan.webp';
import happy_ragdoll from '../assets/k4happy_ragdoll.webp';
import happy_chartreux from '../assets/k4happy_chartreux.webp';
import happy_exoticshorthair from '../assets/k4happy_exoticshorthair.webp';
import happy_turkishangora from '../assets/k4happy_turkishangora.webp';
import happy_abyssinian from '../assets/k4happy_abyssinian.webp';
import happy_tonkinese from '../assets/k4happy_tonkinese.webp';
import happy_orientalshorthair from '../assets/k4happy_orientalshorthair.webp';
import happy_birman from '../assets/k4happy_birman.webp';
import happy_norwegian from '../assets/k4happy_norwegian.webp';
import happy_siberian from '../assets/k4happy_siberian.webp';
import happy_singapura from '../assets/k4happy_singapura.webp';
import happy_devonrex from '../assets/k4happy_devonrex.webp';
import happy_laperm from '../assets/k4happy_laperm.webp';
import happy_selkirkrex from '../assets/k4happy_selkirkrex.webp';
import happy_savannah from '../assets/k4happy_savannah.webp';
import happy_egyptianmau from '../assets/k4happy_egyptianmau.webp';
import happy_vankedisi from '../assets/k4happy_vankedisi.webp';

const SPRITES: Record<string, CatSprite> = {
  tuxedo: { idle: idle_tuxedo, happy: happy_tuxedo },
  dilutecalico: { idle: idle_dilutecalico, happy: happy_dilutecalico },
  tortoiseshell: { idle: idle_tortoiseshell, happy: happy_tortoiseshell },
  oddeyedwhite: { idle: idle_oddeyedwhite, happy: happy_oddeyedwhite },
  americanshorthair: { idle: idle_americanshorthair, happy: happy_americanshorthair },
  mainecoonred: { idle: idle_mainecoonred, happy: happy_mainecoonred },
  munchkin: { idle: idle_munchkin, happy: happy_munchkin },
  japanesebobtail: { idle: idle_japanesebobtail, happy: happy_japanesebobtail },
  russianblue: { idle: idle_russianblue, happy: happy_russianblue },
  burmese: { idle: idle_burmese, happy: happy_burmese },
  himalayan: { idle: idle_himalayan, happy: happy_himalayan },
  ragdoll: { idle: idle_ragdoll, happy: happy_ragdoll },
  chartreux: { idle: idle_chartreux, happy: happy_chartreux },
  exoticshorthair: { idle: idle_exoticshorthair, happy: happy_exoticshorthair },
  turkishangora: { idle: idle_turkishangora, happy: happy_turkishangora },
  abyssinian: { idle: idle_abyssinian, happy: happy_abyssinian },
  tonkinese: { idle: idle_tonkinese, happy: happy_tonkinese },
  orientalshorthair: { idle: idle_orientalshorthair, happy: happy_orientalshorthair },
  birman: { idle: idle_birman, happy: happy_birman },
  norwegian: { idle: idle_norwegian, happy: happy_norwegian },
  siberian: { idle: idle_siberian, happy: happy_siberian },
  singapura: { idle: idle_singapura, happy: happy_singapura },
  devonrex: { idle: idle_devonrex, happy: happy_devonrex },
  laperm: { idle: idle_laperm, happy: happy_laperm },
  selkirkrex: { idle: idle_selkirkrex, happy: happy_selkirkrex },
  savannah: { idle: idle_savannah, happy: happy_savannah },
  egyptianmau: { idle: idle_egyptianmau, happy: happy_egyptianmau },
  vankedisi: { idle: idle_vankedisi, happy: happy_vankedisi },
};

/** Sprite pair for a breed id, or null if unknown. */
export function spriteForBreed(id: string): CatSprite | null {
  return SPRITES[id] ?? null;
}
