import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import JavaScriptObfuscator from 'javascript-obfuscator';

/**
 * Playgama release build: same single-file bundle as vite.config.single.ts, but
 * the final JS is run through a *moderate* obfuscation pass before it is inlined
 * into the HTML. This is a deterrent against casual copy/clone of the shipped
 * game — not real security (any client-side code can ultimately be reversed).
 *
 * The pass runs in `renderChunk` (after Rollup/esbuild have produced & minified
 * the chunk, before viteSingleFile inlines it in `generateBundle`), so the code
 * that ends up in index.html is obfuscated.
 *
 * "Moderate" = string-array + base64 encoding, split strings and light
 * control-flow flattening for real deterrence, but the fragile/heavy options
 * (deadCodeInjection, transformObjectKeys, selfDefending, debugProtection) are
 * left OFF to avoid perf hits and breakage inside portal iframes/ad contexts.
 */
function obfuscate(): Plugin {
  return {
    name: 'kc-obfuscate',
    apply: 'build',
    enforce: 'post',
    renderChunk(code) {
      const result = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        simplify: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 1,
        splitStrings: true,
        splitStringsChunkLength: 10,
        numbersToExpressions: false,
        transformObjectKeys: false,
        deadCodeInjection: false,
        selfDefending: false,
        debugProtection: false,
        disableConsoleOutput: false,
        unicodeEscapeSequence: false
      });
      return { code: result.getObfuscatedCode(), map: null };
    }
  };
}

export default defineConfig({
  plugins: [svelte(), obfuscate(), viteSingleFile()],
  base: './',
  build: {
    target: 'es2019',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    // Disable esbuild minify: the obfuscator (compact:true) must be the final
    // transform, otherwise minify runs after it and renames the obfuscated
    // identifiers / partially normalizes the output.
    minify: false
  }
});
