// Explosive neon-synthwave hero: a backlit Neuschwanstein castle silhouette
// against a blazing light-burst — white-hot blaze, god rays, nebula clouds,
// a neon ring, a lens flare and glowing base fog. Glow layers use
// mix-blend-mode:screen so they add additively against the dark hero (genuinely
// vibrant in-browser — a flat PNG export understates it). Verified via review.
//
// viewBox 1180×320 ≈ hero aspect; preserveAspectRatio slice; castle right-biased
// (~x800) so the left-aligned hero copy stays legible.

const SCREEN = { mixBlendMode: "screen" as const };

export function CastleScene() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1180 320"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="blazeWide" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd6ec" stopOpacity="0.85" />
          <stop offset="30%" stopColor="#ec4899" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#d946ef" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blazeCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffe3f1" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#f472b6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="baseHaze" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ff4fa3" stopOpacity="0.6" /><stop offset="100%" stopColor="#ff4fa3" stopOpacity="0" /></radialGradient>
        <radialGradient id="neb1" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#e935c9" stopOpacity="0.7" /><stop offset="100%" stopColor="#e935c9" stopOpacity="0" /></radialGradient>
        <radialGradient id="neb2" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#7c3aed" stopOpacity="0.65" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0" /></radialGradient>
        <radialGradient id="neb3" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fb2e73" stopOpacity="0.6" /><stop offset="100%" stopColor="#fb2e73" stopOpacity="0" /></radialGradient>
        <linearGradient id="csBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1550" /><stop offset="1" stopColor="#0f0628" /></linearGradient>
        <linearGradient id="csRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff4fa3" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
        <filter id="glowS" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glowR" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>

      {/* ── additive glow atmosphere ── */}
      <g style={SCREEN}>
        <ellipse cx="690" cy="85" rx="230" ry="140" fill="url(#neb2)" filter="url(#softBlur)" />
        <ellipse cx="910" cy="110" rx="250" ry="150" fill="url(#neb1)" filter="url(#softBlur)" />
        <ellipse cx="820" cy="215" rx="290" ry="165" fill="url(#neb3)" filter="url(#softBlur)" />

        <g transform="translate(800,200)" opacity="0.8">
          <polygon points="0,0 -9,-360 9,-360" fill="#ffd6ec" fillOpacity="0.18" transform="rotate(-72)" />
          <polygon points="0,0 -9,-360 9,-360" fill="#ffd6ec" fillOpacity="0.2" transform="rotate(-55)" />
          <polygon points="0,0 -10,-360 10,-360" fill="#ffe3f1" fillOpacity="0.24" transform="rotate(-38)" />
          <polygon points="0,0 -10,-360 10,-360" fill="#ffffff" fillOpacity="0.28" transform="rotate(-22)" />
          <polygon points="0,0 -11,-360 11,-360" fill="#ffffff" fillOpacity="0.34" transform="rotate(-8)" />
          <polygon points="0,0 -11,-360 11,-360" fill="#ffffff" fillOpacity="0.34" transform="rotate(8)" />
          <polygon points="0,0 -10,-360 10,-360" fill="#ffffff" fillOpacity="0.28" transform="rotate(22)" />
          <polygon points="0,0 -10,-360 10,-360" fill="#ffe3f1" fillOpacity="0.24" transform="rotate(38)" />
          <polygon points="0,0 -9,-360 9,-360" fill="#ffd6ec" fillOpacity="0.2" transform="rotate(55)" />
          <polygon points="0,0 -9,-360 9,-360" fill="#ffd6ec" fillOpacity="0.18" transform="rotate(72)" />
        </g>

        <ellipse cx="800" cy="205" rx="320" ry="225" fill="url(#blazeWide)" />
        <ellipse cx="800" cy="205" rx="175" ry="150" fill="url(#blazeCore)" />

        <g filter="url(#glowR)">
          <g transform="translate(980,60)">
            <circle r="5" fill="#ffffff" />
            <path d="M0 -40 L2.5 -5 L40 0 L2.5 5 L0 40 L-2.5 5 L-40 0 L-2.5 -5 Z" fill="#ffffff" />
            <path d="M0 -20 L1 -1 L20 0 L1 1 L0 20 L-1 1 L-20 0 L-1 -1 Z" fill="#f9a8d4" />
          </g>
          <circle cx="930" cy="110" r="6" fill="#f472b6" fillOpacity="0.6" />
          <circle cx="900" cy="140" r="3" fill="#f9a8d4" fillOpacity="0.7" />
          <circle cx="1030" cy="30" r="3" fill="#ffe3f1" fillOpacity="0.7" />
        </g>

        <g fill="#ffffff">
          <circle cx="600" cy="50" r="1.1" fillOpacity=".7" /><circle cx="700" cy="30" r="1" fillOpacity=".6" />
          <circle cx="1090" cy="130" r="1" fillOpacity=".55" /><circle cx="560" cy="100" r="1" fillOpacity=".5" />
          <circle cx="1140" cy="70" r="1.1" fillOpacity=".6" /><circle cx="1010" cy="210" r="1" fillOpacity=".5" />
        </g>
      </g>

      {/* distant alps (silhouette against the blaze) */}
      <path d="M500 260 L610 190 L690 228 L780 172 L860 220 L940 182 L1040 224 L1130 190 L1180 242 L1180 270 L500 270 Z" fill="#0a0322" fillOpacity="0.72" />

      {/* glowing base fog */}
      <g style={SCREEN}><ellipse cx="810" cy="250" rx="300" ry="46" fill="url(#baseHaze)" /></g>

      <path d="M540 320 L590 276 L628 296 L672 258 L700 268 L735 250 L775 246 L815 248 L858 244 L900 254 L940 268 L985 250 L1035 288 L1075 320 Z" fill="#0c0326" />

      {/* ── castle silhouette (backlit, hot-pink rim) ── */}
      <rect x="800" y="168" width="42" height="80" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M796 168 L806 150 L836 150 L846 168 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.7" strokeWidth="0.8" />
      <rect x="702" y="192" width="14" height="56" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M699 192 L709 162 L719 192 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.7" strokeWidth="0.8" />
      <rect x="718" y="172" width="22" height="76" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.95" strokeWidth="1" />
      <path d="M714 172 L729 134 L744 172 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.85" strokeWidth="0.9" filter="url(#glowS)" />
      <line x1="729" y1="134" x2="729" y2="125" stroke="#ffd6ec" strokeWidth="1" /><circle cx="729" cy="124" r="1.5" fill="#ffd6ec" />
      <rect x="746" y="146" width="12" height="102" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M743 146 L752 108 L761 146 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.85" strokeWidth="0.9" />
      <line x1="752" y1="108" x2="752" y2="99" stroke="#ffd6ec" strokeWidth="1" /><circle cx="752" cy="98" r="1.4" fill="#ffd6ec" />
      <rect x="764" y="124" width="32" height="124" fill="url(#csBody)" stroke="#ff8fc4" strokeOpacity="1" strokeWidth="1.4" />
      <rect x="764" y="122" width="32" height="4" fill="#6d1b6e" />
      <path d="M760 124 L780 84 L800 124 Z" fill="url(#csRoof)" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="1" filter="url(#glowS)" />
      <line x1="780" y1="84" x2="780" y2="72" stroke="#ffffff" strokeWidth="1.2" /><circle cx="780" cy="71" r="2" fill="#fff" />
      <rect x="804" y="150" width="14" height="98" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M801 150 L811 118 L821 150 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.7" strokeWidth="0.8" />
      <line x1="811" y1="118" x2="811" y2="110" stroke="#ffd6ec" strokeWidth="1" /><circle cx="811" cy="109" r="1.3" fill="#ffd6ec" />
      <rect x="842" y="176" width="56" height="72" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.95" strokeWidth="1" />
      <path d="M838 176 L850 158 L890 158 L902 176 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.7" strokeWidth="0.8" />
      <rect x="898" y="192" width="18" height="56" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.9" strokeWidth="1" />
      <path d="M894 192 L907 158 L920 192 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.7" strokeWidth="0.9" />
      <line x1="907" y1="158" x2="907" y2="150" stroke="#ffd6ec" strokeWidth="1" /><circle cx="907" cy="149" r="1.4" fill="#ffd6ec" />
      <rect x="920" y="206" width="12" height="42" fill="url(#csBody)" stroke="#ff6fb0" strokeOpacity="0.85" strokeWidth="1" />
      <path d="M917 206 L926 180 L935 206 Z" fill="url(#csRoof)" stroke="#ffd6ec" strokeOpacity="0.65" strokeWidth="0.8" />

      <g fill="#ffe9a8" style={SCREEN}>
        <rect x="775" y="140" width="6" height="9" rx="3" /><rect x="775" y="184" width="6" height="9" rx="3" />
        <rect x="849" y="188" width="5" height="8" rx="2.5" /><rect x="859" y="188" width="5" height="8" rx="2.5" /><rect x="869" y="188" width="5" height="8" rx="2.5" /><rect x="879" y="188" width="5" height="8" rx="2.5" /><rect x="889" y="188" width="5" height="8" rx="2.5" />
        <rect x="859" y="208" width="5" height="8" rx="2.5" /><rect x="879" y="208" width="5" height="8" rx="2.5" />
        <rect x="725" y="196" width="4" height="7" rx="2" /><rect x="808" y="196" width="4" height="7" rx="2" />
      </g>

      {/* neon ring arcing over the castle */}
      <g style={SCREEN}><ellipse cx="800" cy="300" rx="255" ry="240" fill="none" stroke="#ff4fa3" strokeOpacity="0.75" strokeWidth="2.4" filter="url(#glowR)" /></g>

      {/* foreground crag + pines */}
      <path d="M540 320 L580 302 L622 298 L662 286 L700 250 L735 246 L778 248 L822 246 L862 248 L905 252 L948 288 L992 296 L1038 300 L1085 320 Z" fill="#0c0326" />
      <path d="M700 250 L735 246 L778 248 L822 246 L862 248 L905 252" stroke="#ff6fb0" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      <g fill="#0a0322">
        <path d="M600 302 l10 -26 l10 26 z M603 290 l7 -18 l7 18 z" />
        <path d="M650 308 l11 -30 l11 30 z" />
        <path d="M985 304 l10 -26 l10 26 z" />
        <path d="M1035 300 l11 -28 l11 28 z" />
      </g>
    </svg>
  );
}
