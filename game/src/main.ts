import App from './App.svelte';
// Self-hosted fonts (GDD §6.3) — bundled woff2, no external CDN.
// Weights match the former Google Fonts request; latin subset only (English UI).
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import './styles/global.css';

const app = new App({
  target: document.getElementById('app')!
});

export default app;
