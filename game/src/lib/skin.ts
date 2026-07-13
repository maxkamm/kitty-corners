/**
 * Art skin v2 (reference: kc_reference.png, cats: kc_kitty_list3.png).
 * Each region id gets its own cat breed; sprites cut from kc_kitty_list3.
 * `idle` on the board, `happy` (from kc_kitty_list3_happy) during the victory
 * celebration wave.
 */
import bsh from '../assets/k3_bsh.webp';
import bengal from '../assets/k3_bengal.webp';
import bombay from '../assets/k3_bombay.webp';
import persian from '../assets/k3_persian.webp';
import siamese from '../assets/k3_siamese.webp';
import calico from '../assets/k3_calico.webp';
import mainecoon from '../assets/k3_mainecoon.webp';
import scottishfold from '../assets/k3_scottishfold.webp';
import ragdoll from '../assets/k3_ragdoll.webp';
import sphynx from '../assets/k3_sphynx.webp';
import bshHappy from '../assets/k3happy_bsh.webp';
import bengalHappy from '../assets/k3happy_bengal.webp';
import bombayHappy from '../assets/k3happy_bombay.webp';
import persianHappy from '../assets/k3happy_persian.webp';
import siameseHappy from '../assets/k3happy_siamese.webp';
import calicoHappy from '../assets/k3happy_calico.webp';
import mainecoonHappy from '../assets/k3happy_mainecoon.webp';
import scottishfoldHappy from '../assets/k3happy_scottishfold.webp';
import ragdollHappy from '../assets/k3happy_ragdoll.webp';
import sphynxHappy from '../assets/k3happy_sphynx.webp';

export interface CatSprite {
  idle: string;
  happy: string;
}

/** Order tuned so early levels (few regions) get the most contrasting breeds. */
const BREEDS: CatSprite[] = [
  { idle: bsh, happy: bshHappy }, // gray
  { idle: bengal, happy: bengalHappy }, // orange spotted
  { idle: bombay, happy: bombayHappy }, // black
  { idle: persian, happy: persianHappy }, // white fluffy
  { idle: siamese, happy: siameseHappy }, // cream, dark points
  { idle: calico, happy: calicoHappy }, // tri-color
  { idle: mainecoon, happy: mainecoonHappy }, // brown tabby
  { idle: scottishfold, happy: scottishfoldHappy }, // beige, folded ears
  { idle: ragdoll, happy: ragdollHappy }, // cream/brown, blue eyes
  { idle: sphynx, happy: sphynxHappy } // pink hairless
];

/** Breed roster for the Collection overlay (order matches BREEDS). */
export const BREED_NAMES = [
  'British Shorthair',
  'Bengal',
  'Bombay',
  'Persian',
  'Siamese',
  'Calico',
  'Maine Coon',
  'Scottish Fold',
  'Ragdoll',
  'Sphynx'
] as const;

export function allBreeds(): { name: string; src: string }[] {
  return BREEDS.map((b, i) => ({ name: BREED_NAMES[i], src: b.idle }));
}

/** Cat breed for a region id — stable within a level. Ids are letters ('a'…) in levels.json. */
export function catForRegion(regionId: number | string): CatSprite {
  const n =
    typeof regionId === 'number' ? regionId : String(regionId).toLowerCase().charCodeAt(0) - 97;
  const safe = Number.isFinite(n) ? n : 0;
  return BREEDS[((safe % BREEDS.length) + BREEDS.length) % BREEDS.length];
}

export { default as heartUrl } from '../assets/heart3d.webp';
export { default as mainHeroUrl } from '../assets/main_hero.webp';
/* Result-screen mascots (art skin v2): the gray BSH that fronts the logo —
   happy on victory, neutral idle on defeat. These are re-centred on a square
   canvas with even margins so the head floats without looking cropped. */
export { default as catHappyUrl } from '../assets/mascot_happy.webp';
export { default as catSadUrl } from '../assets/mascot_sad.webp';
/* ui_atlas button sprites are referenced directly from component CSS:
   btn_green_pill.webp (Play), btn_squircle.webp (icon buttons);
   btn_green_small.webp / btn_white_pill.webp / btn_white_small.webp are reserved for CTAs. */
export { default as mainLeavesUrl } from '../assets/main_leaves.webp';
export { default as mainButterflyUrl } from '../assets/main_butterfly.webp';
export { default as mainPawtrailUrl } from '../assets/main_pawtrail.webp';
export { default as pawUrl } from '../assets/paw.webp';
export { default as grainUrl } from '../assets/grain.webp';
export { default as plaqueUrl } from '../assets/plaque_blank.webp';
export { default as gearUrl } from '../assets/gear.webp';
export { default as btnWoodUrl } from '../assets/btn_blank.webp';
