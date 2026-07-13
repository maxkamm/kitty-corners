/**
 * Art skin v2 (reference: kc_reference.png, cats: kc_kitty_list3.png).
 * Each region id gets its own cat breed; sprites cut from kc_kitty_list3.
 * `idle` on the board, `happy` during the victory celebration wave.
 * NOTE: happy poses are pending a separate sheet — same sprite for both, for now.
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

export interface CatSprite {
  idle: string;
  happy: string;
}

const same = (src: string): CatSprite => ({ idle: src, happy: src });

/** Order tuned so early levels (few regions) get the most contrasting breeds. */
const BREEDS: CatSprite[] = [
  same(bsh), // gray
  same(bengal), // orange spotted
  same(bombay), // black
  same(persian), // white fluffy
  same(siamese), // cream, dark points
  same(calico), // tri-color
  same(mainecoon), // brown tabby
  same(scottishfold), // beige, folded ears
  same(ragdoll), // cream/brown, blue eyes
  same(sphynx) // pink hairless
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
