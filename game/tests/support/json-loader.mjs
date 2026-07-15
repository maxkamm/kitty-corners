/**
 * ESM hooks so the bundler-oriented source runs under `node --experimental-strip-types`
 * (no Vite/Rollup in the test pipeline):
 *  - resolve: append `.ts` to extensionless relative imports (e.g. `./storage`);
 *  - load: treat bare JSON imports as modules (source omits `with { type: 'json' }`).
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, next) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[a-z0-9]+$/i.test(specifier)) {
    try {
      return await next(specifier + '.ts', context);
    } catch {
      /* fall through to default resolution */
    }
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith('.json')) {
    const json = await readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', shortCircuit: true, source: `export default ${json}` };
  }
  // Vite resolves asset imports (audio/images/fonts) to a URL string; under Node
  // there is no bundler, so stub them with an empty URL (nothing reads the bytes
  // in tests, and audio.ts guards on `typeof Audio`).
  if (/\.(mp3|wav|ogg|webp|png|jpe?g|svg|gif|woff2?)$/i.test(url)) {
    return { format: 'module', shortCircuit: true, source: 'export default "";' };
  }
  return next(url, context);
}
