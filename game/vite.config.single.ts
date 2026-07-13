import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  base: './',
  build: { target: 'es2019', outDir: '/tmp/kc-single', emptyOutDir: true, assetsInlineLimit: 100000000 }
});
