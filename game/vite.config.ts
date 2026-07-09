import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './', // relative paths — required for Playgama hosting
  build: { target: 'es2019' }
});
