<!-- SVG sprite extracted from mockup v22 as-is (GDD §7). Cat lab archive intentionally excluded from prod. -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="catG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#756C88" />
      <stop offset="1" stop-color="#4A4458" />
    </linearGradient>
    <linearGradient id="flameG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFB067" />
      <stop offset="1" stop-color="#FF7E3E" />
    </linearGradient>
    <linearGradient id="heartRedG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FF8E9B" />
      <stop offset="1" stop-color="#E04B58" />
    </linearGradient>
    <path id="heart-path" d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.4 4.3 4.3 0 0 1 6.2 0l.9 1 .9-1a4.3 4.3 0 0 1 6.2 0 4.6 4.6 0 0 1 0 6.4Z" />

    <!-- B. Round — the mascot (Р-28) -->
    <symbol id="cat-round" viewBox="0 0 100 100">
      <path d="M22 42 L26 10 Q27 5 31 8 L50 25 Z" fill="url(#catG)" />
      <path d="M78 42 L74 10 Q73 5 69 8 L50 25 Z" fill="url(#catG)" />
      <path d="M28 31 L29.8 16 L40.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <path d="M72 31 L70.2 16 L59.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <ellipse cx="50" cy="58" rx="35" ry="33" fill="url(#catG)" />
      <path d="M24 47 Q32 32 46 28" stroke="#FFFFFF" stroke-width="5" opacity=".15" fill="none" stroke-linecap="round" />
      <path d="M44 29 v6 M50 28 v7 M56 29 v6" stroke="#383344" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
      <circle cx="38" cy="55" r="5" fill="#F6EFE2" /><circle cx="62" cy="55" r="5" fill="#F6EFE2" />
      <circle cx="39" cy="56" r="2.6" fill="#383344" /><circle cx="63" cy="56" r="2.6" fill="#383344" />
      <circle cx="37.4" cy="53.4" r="1.1" fill="#fff" /><circle cx="61.4" cy="53.4" r="1.1" fill="#fff" />
      <path d="M46.8 66 L53.2 66 L50 70 Z" fill="#F2A0AC" />
      <path d="M50 70 Q46 76 41 72 M50 70 Q54 76 59 72" stroke="#F6EFE2" stroke-width="2.4" fill="none" stroke-linecap="round" />
      <circle cx="27" cy="66" r="4" fill="#F2A0AC" opacity=".45" /><circle cx="73" cy="66" r="4" fill="#F2A0AC" opacity=".45" />
      <path d="M20 60 L8 57 M20 66 L9 68" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
      <path d="M80 60 L92 57 M80 66 L91 68" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
    </symbol>

    <!-- happy Round: same head geometry, joyful face (juice pass, GDD §8) -->
    <symbol id="cat-round-happy" viewBox="0 0 100 100">
      <path d="M22 42 L26 10 Q27 5 31 8 L50 25 Z" fill="url(#catG)" />
      <path d="M78 42 L74 10 Q73 5 69 8 L50 25 Z" fill="url(#catG)" />
      <path d="M28 31 L29.8 16 L40.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <path d="M72 31 L70.2 16 L59.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <ellipse cx="50" cy="58" rx="35" ry="33" fill="url(#catG)" />
      <path d="M24 47 Q32 32 46 28" stroke="#FFFFFF" stroke-width="5" opacity=".15" fill="none" stroke-linecap="round" />
      <path d="M44 29 v6 M50 28 v7 M56 29 v6" stroke="#383344" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
      <!-- closed joyful eyes (chibi-style arcs) -->
      <path d="M32 56 Q38 50 44 56 M56 56 Q62 50 68 56" stroke="#F6EFE2" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M46.8 64 L53.2 64 L50 68 Z" fill="#F2A0AC" />
      <!-- open smiling mouth -->
      <path d="M42 70 Q50 78 58 70 Q54 74.5 50 74.5 Q46 74.5 42 70 Z" fill="#F6EFE2" />
      <!-- bright blush -->
      <circle cx="27" cy="66" r="4.5" fill="#F2A0AC" opacity=".6" /><circle cx="73" cy="66" r="4.5" fill="#F2A0AC" opacity=".6" />
      <!-- perked-up whiskers -->
      <path d="M20 62 L8 58 M20 67 L9 66" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
      <path d="M80 62 L92 58 M80 67 L91 66" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
    </symbol>

    <!-- sad Round: same head geometry, sad face (GDD §6.1) -->
    <symbol id="cat-round-sad" viewBox="0 0 100 100">
      <path d="M22 42 L26 10 Q27 5 31 8 L50 25 Z" fill="url(#catG)" />
      <path d="M78 42 L74 10 Q73 5 69 8 L50 25 Z" fill="url(#catG)" />
      <path d="M28 31 L29.8 16 L40.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <path d="M72 31 L70.2 16 L59.5 25 Z" fill="#F2A0AC" opacity=".95" />
      <ellipse cx="50" cy="58" rx="35" ry="33" fill="url(#catG)" />
      <path d="M24 47 Q32 32 46 28" stroke="#FFFFFF" stroke-width="5" opacity=".15" fill="none" stroke-linecap="round" />
      <path d="M44 29 v6 M50 28 v7 M56 29 v6" stroke="#383344" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
      <path d="M32 56 Q38 51 44 56 M56 56 Q62 51 68 56" stroke="#F6EFE2" stroke-width="2.6" fill="none" stroke-linecap="round" />
      <path d="M31 60 q-3.4 4.6 0 7 q3.4 -2.4 0 -7" fill="#A9DBF5" />
      <path d="M46.8 65 L53.2 65 L50 69 Z" fill="#F2A0AC" />
      <path d="M45 74.5 Q50 71.5 55 74.5" stroke="#F6EFE2" stroke-width="2.4" fill="none" stroke-linecap="round" />
      <circle cx="27" cy="66" r="4" fill="#F2A0AC" opacity=".35" /><circle cx="73" cy="66" r="4" fill="#F2A0AC" opacity=".35" />
      <path d="M20 62 L9 65 M20 67 L10 71" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
      <path d="M80 62 L91 65 M80 67 L90 71" stroke="#3F3A4C" stroke-width="1.8" stroke-linecap="round" opacity=".5" />
    </symbol>

    <symbol id="soft-x" viewBox="0 0 24 24">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
    </symbol>
    <!-- solid chunky gear, 6 rounded teeth + big hole (kc_reference) -->
    <symbol id="ic-gear" viewBox="0 0 24 24">
      <g fill="currentColor">
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" />
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" transform="rotate(60 12 12)" />
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" transform="rotate(120 12 12)" />
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" transform="rotate(180 12 12)" />
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" transform="rotate(240 12 12)" />
        <rect x="9.9" y="2.5" width="4.2" height="6.4" rx="2" transform="rotate(300 12 12)" />
        <path fill-rule="evenodd" d="M12 5.3 a6.7 6.7 0 1 0 0.001 0 Z M12 9.2 a2.8 2.8 0 1 1 -0.001 0 Z" />
      </g>
    </symbol>
    <symbol id="ic-trophy" viewBox="0 0 24 24">
      <path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M8 5.2H5.2a.7.7 0 0 0-.7.8c.1 2 1.3 3.4 3.6 3.8M16 5.2h2.8a.7.7 0 0 1 .7.8c-.1 2-1.3 3.4-3.6 3.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <path d="M12 11.5v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M8.5 19c.3-2 1.7-3 3.5-3s3.2 1 3.5 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    </symbol>
    <symbol id="ic-q" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M9.6 9.2c.3-1.4 1.5-2.2 2.9-2 1.3.1 2.3 1.1 2.3 2.3 0 1.6-2.3 2-2.3 3.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="12.4" cy="16.6" r="1.1" fill="currentColor" />
    </symbol>
    <symbol id="ic-heart-full" viewBox="0 0 24 24">
      <path d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.4 4.3 4.3 0 0 1 6.2 0l.9 1 .9-1a4.3 4.3 0 0 1 6.2 0 4.6 4.6 0 0 1 0 6.4Z" fill="url(#heartRedG)" />
      <ellipse cx="8.2" cy="8.9" rx="2.6" ry="1.5" fill="#fff" opacity=".75" transform="rotate(-32 8.2 8.9)" />
      <ellipse cx="13.5" cy="7.9" rx="3.4" ry="1.2" fill="#fff" opacity=".35" transform="rotate(-14 13.5 7.9)" />
    </symbol>
    <symbol id="ic-heart-empty" viewBox="0 0 24 24">
      <use href="#heart-path" fill="var(--dent-deep)" />
      <use href="#heart-path" fill="var(--dent-face)" transform="translate(0.54 1.2) scale(0.955)" />
    </symbol>
    <symbol id="ic-play-ad" viewBox="0 0 24 24">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M10 9l5 3-5 3z" fill="currentColor" />
    </symbol>
    <symbol id="ic-cathead" viewBox="0 0 24 24">
      <path d="M5.6 10.5 L6.1 4.2 Q6.2 3.2 7 3.9 L10.6 7 Z" fill="currentColor" />
      <path d="M18.4 10.5 L17.9 4.2 Q17.8 3.2 17 3.9 L13.4 7 Z" fill="currentColor" />
      <circle cx="12" cy="13.2" r="7.6" fill="currentColor" />
      <circle cx="9.3" cy="12.6" r="1.1" fill="var(--accent)" />
      <circle cx="14.7" cy="12.6" r="1.1" fill="var(--accent)" />
      <path d="M10.9 15.6 L13.1 15.6 L12 17 Z" fill="var(--accent)" />
    </symbol>
    <symbol id="ic-bulb" viewBox="0 0 24 24">
      <path d="M12 2.6a6.2 6.2 0 0 0-3.7 11.2c.6.5 1 1.2 1.1 2h5.2c.1-.8.5-1.5 1.1-2A6.2 6.2 0 0 0 12 2.6Z" fill="currentColor" />
      <rect x="9.5" y="17" width="5" height="1.7" rx=".85" fill="currentColor" />
      <rect x="10.1" y="19.4" width="3.8" height="1.6" rx=".8" fill="currentColor" />
    </symbol>
    <!-- bar chart for the Stats squircle (kc_main_screen) -->
    <symbol id="ic-bars" viewBox="0 0 24 24">
      <rect x="4.2" y="10.5" width="4" height="9" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.9" />
      <rect x="10" y="5" width="4" height="14.5" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.9" />
      <rect x="15.8" y="8" width="4" height="11.5" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.9" />
    </symbol>
    <!-- art skin v2: linear icons for the white squircle action buttons (kc_reference) -->
    <symbol id="ic-cathead-line" viewBox="0 0 24 24">
      <path
        d="M5.4 9.6 L5 4.8 Q5 3.9 5.8 4.4 L9.2 6.8 Q10.5 6.2 12 6.2 Q13.5 6.2 14.8 6.8 L18.2 4.4 Q19 3.9 19 4.8 L18.6 9.6 Q19.8 11.3 19.8 13.4 Q19.8 19.4 12 19.4 Q4.2 19.4 4.2 13.4 Q4.2 11.3 5.4 9.6 Z"
        fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
      <circle cx="9" cy="12.4" r="1.05" fill="currentColor" />
      <circle cx="15" cy="12.4" r="1.05" fill="currentColor" />
      <path d="M10.9 15.4 h2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </symbol>
    <symbol id="ic-bulb-line" viewBox="0 0 24 24">
      <path d="M12 6.4a4.6 4.6 0 0 0-2.7 8.3c.4.35.8.85.9 1.5h3.6c.1-.65.5-1.15.9-1.5A4.6 4.6 0 0 0 12 6.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M10.3 18.6h3.4M11 20.6h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      <path d="M12 2.4v1.8M5.7 5.2l1.3 1.3M18.3 5.2 17 6.5M3.6 11.2h1.9M18.5 11.2h1.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    </symbol>
    <symbol id="ic-flame" viewBox="0 0 24 28">
      <path d="M12 1.5 C8.5 7 4.5 9.5 4.5 15.5 a7.5 7.5 0 0 0 15 0 C19.5 9.5 15.5 7 12 1.5 Z" fill="url(#flameG)" />
      <path d="M12 11 C10 13.6 8.4 14.8 8.4 17.6 a3.6 3.6 0 0 0 7.2 0 C15.6 14.8 14 13.6 12 11 Z" fill="#FFD97A" />
    </symbol>
    <symbol id="ic-paw" viewBox="0 0 24 24">
      <ellipse cx="12" cy="15.8" rx="5.6" ry="4.4" fill="currentColor" />
      <circle cx="5.8" cy="10" r="2.3" fill="currentColor" />
      <circle cx="12" cy="7.8" r="2.3" fill="currentColor" />
      <circle cx="18.2" cy="10" r="2.3" fill="currentColor" />
    </symbol>
  </defs>
</svg>
