/**
 * Cat collection — sprite URLs (GDD §10.8). UI-only: imports `.webp` assets, so it
 * must NOT be pulled into `game.ts`/the Node test harness. Breed logic lives in
 * `collection.ts`.
 * Art: kc_kitty_list3 (k3_/k3happy_) + kc_kitty_list4 (k4_/k4happy_); idle + happy.
 */
import type { CatSprite } from './skin';

import i3_bombay from '../assets/k3_bombay.webp';
import i3_bsh from '../assets/k3_bsh.webp';
import i3_bengal from '../assets/k3_bengal.webp';
import i3_persian from '../assets/k3_persian.webp';
import i3_siamese from '../assets/k3_siamese.webp';
import i3_calico from '../assets/k3_calico.webp';
import i3_mainecoon from '../assets/k3_mainecoon.webp';
import i3_scottishfold from '../assets/k3_scottishfold.webp';
import i3_ragdoll from '../assets/k3_ragdoll.webp';
import i3_sphynx from '../assets/k3_sphynx.webp';
import h3_bombay from '../assets/k3happy_bombay.webp';
import h3_bsh from '../assets/k3happy_bsh.webp';
import h3_bengal from '../assets/k3happy_bengal.webp';
import h3_persian from '../assets/k3happy_persian.webp';
import h3_siamese from '../assets/k3happy_siamese.webp';
import h3_calico from '../assets/k3happy_calico.webp';
import h3_mainecoon from '../assets/k3happy_mainecoon.webp';
import h3_scottishfold from '../assets/k3happy_scottishfold.webp';
import h3_ragdoll from '../assets/k3happy_ragdoll.webp';
import h3_sphynx from '../assets/k3happy_sphynx.webp';

import i4_tuxedo from '../assets/k4_tuxedo.webp';
import i4_dilutecalico from '../assets/k4_dilutecalico.webp';
import i4_tortoiseshell from '../assets/k4_tortoiseshell.webp';
import i4_oddeyedwhite from '../assets/k4_oddeyedwhite.webp';
import i4_americanshorthair from '../assets/k4_americanshorthair.webp';
import i4_mainecoonred from '../assets/k4_mainecoonred.webp';
import i4_munchkin from '../assets/k4_munchkin.webp';
import i4_japanesebobtail from '../assets/k4_japanesebobtail.webp';
import i4_russianblue from '../assets/k4_russianblue.webp';
import i4_burmese from '../assets/k4_burmese.webp';
import i4_himalayan from '../assets/k4_himalayan.webp';
import i4_chartreux from '../assets/k4_chartreux.webp';
import i4_exoticshorthair from '../assets/k4_exoticshorthair.webp';
import i4_turkishangora from '../assets/k4_turkishangora.webp';
import i4_abyssinian from '../assets/k4_abyssinian.webp';
import i4_tonkinese from '../assets/k4_tonkinese.webp';
import i4_orientalshorthair from '../assets/k4_orientalshorthair.webp';
import i4_birman from '../assets/k4_birman.webp';
import i4_norwegian from '../assets/k4_norwegian.webp';
import i4_siberian from '../assets/k4_siberian.webp';
import i4_singapura from '../assets/k4_singapura.webp';
import i4_devonrex from '../assets/k4_devonrex.webp';
import i4_laperm from '../assets/k4_laperm.webp';
import i4_selkirkrex from '../assets/k4_selkirkrex.webp';
import i4_savannah from '../assets/k4_savannah.webp';
import i4_egyptianmau from '../assets/k4_egyptianmau.webp';
import i4_vankedisi from '../assets/k4_vankedisi.webp';
import h4_tuxedo from '../assets/k4happy_tuxedo.webp';
import h4_dilutecalico from '../assets/k4happy_dilutecalico.webp';
import h4_tortoiseshell from '../assets/k4happy_tortoiseshell.webp';
import h4_oddeyedwhite from '../assets/k4happy_oddeyedwhite.webp';
import h4_americanshorthair from '../assets/k4happy_americanshorthair.webp';
import h4_mainecoonred from '../assets/k4happy_mainecoonred.webp';
import h4_munchkin from '../assets/k4happy_munchkin.webp';
import h4_japanesebobtail from '../assets/k4happy_japanesebobtail.webp';
import h4_russianblue from '../assets/k4happy_russianblue.webp';
import h4_burmese from '../assets/k4happy_burmese.webp';
import h4_himalayan from '../assets/k4happy_himalayan.webp';
import h4_chartreux from '../assets/k4happy_chartreux.webp';
import h4_exoticshorthair from '../assets/k4happy_exoticshorthair.webp';
import h4_turkishangora from '../assets/k4happy_turkishangora.webp';
import h4_abyssinian from '../assets/k4happy_abyssinian.webp';
import h4_tonkinese from '../assets/k4happy_tonkinese.webp';
import h4_orientalshorthair from '../assets/k4happy_orientalshorthair.webp';
import h4_birman from '../assets/k4happy_birman.webp';
import h4_norwegian from '../assets/k4happy_norwegian.webp';
import h4_siberian from '../assets/k4happy_siberian.webp';
import h4_singapura from '../assets/k4happy_singapura.webp';
import h4_devonrex from '../assets/k4happy_devonrex.webp';
import h4_laperm from '../assets/k4happy_laperm.webp';
import h4_selkirkrex from '../assets/k4happy_selkirkrex.webp';
import h4_savannah from '../assets/k4happy_savannah.webp';
import h4_egyptianmau from '../assets/k4happy_egyptianmau.webp';
import h4_vankedisi from '../assets/k4happy_vankedisi.webp';

const SPRITES: Record<string, CatSprite> = {
  bombay: { idle: i3_bombay, happy: h3_bombay },
  bsh: { idle: i3_bsh, happy: h3_bsh },
  bengal: { idle: i3_bengal, happy: h3_bengal },
  persian: { idle: i3_persian, happy: h3_persian },
  siamese: { idle: i3_siamese, happy: h3_siamese },
  calico: { idle: i3_calico, happy: h3_calico },
  mainecoon: { idle: i3_mainecoon, happy: h3_mainecoon },
  scottishfold: { idle: i3_scottishfold, happy: h3_scottishfold },
  ragdoll: { idle: i3_ragdoll, happy: h3_ragdoll },
  sphynx: { idle: i3_sphynx, happy: h3_sphynx },
  tuxedo: { idle: i4_tuxedo, happy: h4_tuxedo },
  dilutecalico: { idle: i4_dilutecalico, happy: h4_dilutecalico },
  tortoiseshell: { idle: i4_tortoiseshell, happy: h4_tortoiseshell },
  oddeyedwhite: { idle: i4_oddeyedwhite, happy: h4_oddeyedwhite },
  americanshorthair: { idle: i4_americanshorthair, happy: h4_americanshorthair },
  mainecoonred: { idle: i4_mainecoonred, happy: h4_mainecoonred },
  munchkin: { idle: i4_munchkin, happy: h4_munchkin },
  japanesebobtail: { idle: i4_japanesebobtail, happy: h4_japanesebobtail },
  russianblue: { idle: i4_russianblue, happy: h4_russianblue },
  burmese: { idle: i4_burmese, happy: h4_burmese },
  himalayan: { idle: i4_himalayan, happy: h4_himalayan },
  chartreux: { idle: i4_chartreux, happy: h4_chartreux },
  exoticshorthair: { idle: i4_exoticshorthair, happy: h4_exoticshorthair },
  turkishangora: { idle: i4_turkishangora, happy: h4_turkishangora },
  abyssinian: { idle: i4_abyssinian, happy: h4_abyssinian },
  tonkinese: { idle: i4_tonkinese, happy: h4_tonkinese },
  orientalshorthair: { idle: i4_orientalshorthair, happy: h4_orientalshorthair },
  birman: { idle: i4_birman, happy: h4_birman },
  norwegian: { idle: i4_norwegian, happy: h4_norwegian },
  siberian: { idle: i4_siberian, happy: h4_siberian },
  singapura: { idle: i4_singapura, happy: h4_singapura },
  devonrex: { idle: i4_devonrex, happy: h4_devonrex },
  laperm: { idle: i4_laperm, happy: h4_laperm },
  selkirkrex: { idle: i4_selkirkrex, happy: h4_selkirkrex },
  savannah: { idle: i4_savannah, happy: h4_savannah },
  egyptianmau: { idle: i4_egyptianmau, happy: h4_egyptianmau },
  vankedisi: { idle: i4_vankedisi, happy: h4_vankedisi },
};

/** Sprite pair for a breed id, or null if unknown. */
export function spriteForBreed(id: string): CatSprite | null {
  return SPRITES[id] ?? null;
}
