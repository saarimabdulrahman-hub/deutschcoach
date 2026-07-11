// Stylized "reading in bed at night" illustration for the Tip of the Day card,
// recreating the reference art: a figure with a messy bun reading a glowing open
// book under a violet blanket, a bedside lamp, a headboard, a starry backdrop and
// a plant. Flat synthwave vector — no external asset. Verified via visual review.

export function ReadingArt() {
  return (
    <svg
      width="108"
      height="90"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="raSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1440" />
          <stop offset="100%" stopColor="#0d0a24" />
        </linearGradient>
        <radialGradient id="raBookGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fdf4ff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#f0abfc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="raLampCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
        </linearGradient>
        <clipPath id="raClip"><rect x="0" y="0" width="120" height="100" rx="14" /></clipPath>
      </defs>

      <g clipPath="url(#raClip)">
        <rect x="0" y="0" width="120" height="100" fill="url(#raSky)" />
        <g fill="#f9a8d4">
          <path d="M22 12 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" fillOpacity="0.8" />
          <path d="M100 18 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 z" fillOpacity="0.65" />
          <circle cx="34" cy="22" r="1" fillOpacity="0.55" />
          <circle cx="86" cy="12" r="1" fillOpacity="0.55" />
          <circle cx="14" cy="38" r="1" fillOpacity="0.5" />
        </g>

        {/* Headboard (reads as indoors) */}
        <path d="M34 100 L34 62 Q34 54 42 54 L78 54 Q86 54 86 62 L86 100 Z" fill="#221a4d" />
        <path d="M34 62 Q34 54 42 54 L78 54 Q86 54 86 62" stroke="#3b1d60" strokeWidth="1" fill="none" />

        {/* Lamp cone */}
        <path d="M99 69 L113 69 L118 96 L94 96 Z" fill="url(#raLampCone)" />

        {/* Plant, foreground left */}
        <path d="M4 100 C 2 84 12 80 9 71 C 16 78 15 90 13 100 Z" fill="#123a3a" />
        <path d="M11 100 C 11 86 20 82 20 74 C 25 84 20 94 20 100 Z" fill="#16324f" />

        {/* Torso with sloped shoulders */}
        <path d="M49 92 Q48 67 60 65 Q72 67 71 92 Z" fill="#2e1065" />
        <path d="M52 68 Q60 65 68 68" stroke="#3b1580" strokeWidth="1" fill="none" />
        {/* Neck */}
        <path d="M58 58 L62 58 L62 64 Q60 65 58 64 Z" fill="#e3a9bf" />
        {/* Head */}
        <circle cx="60" cy="50" r="9" fill="#f0c4d6" />
        {/* Hair */}
        <path d="M50 52 Q49 39 60 38 Q72 39 70 53 Q71 46 60 45 Q50 46 50 52 Z" fill="#2a1160" />
        <ellipse cx="62" cy="37" rx="5.5" ry="4.5" fill="#2a1160" />
        <path d="M51 48 Q49 55 52 60 M69 49 Q71 55 68 59" stroke="#2a1160" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Face */}
        <path d="M55.5 50 Q57.5 52 59.5 50 M60.5 50 Q62.5 52 64.5 50" stroke="#7a3b52" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M60 51 L59.4 53.4 L60.6 53.4 Z" fill="#d98fa8" />

        {/* Glow rising from the open pages */}
        <ellipse cx="60" cy="73" rx="15" ry="10" fill="url(#raBookGlow)" />

        {/* Arms to the book */}
        <path d="M51 69 Q48 77 55 81" stroke="#2e1065" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <path d="M69 69 Q72 77 65 81" stroke="#2e1065" strokeWidth="4.2" fill="none" strokeLinecap="round" />

        {/* Open book: V opening upward, pages facing her */}
        <path d="M60 84 L47 75 L48 72 L60 80 Z" fill="#faf5ff" />
        <path d="M60 84 L73 75 L72 72 L60 80 Z" fill="#e9ddff" />
        <path d="M60 80 L60 84" stroke="#c4b5fd" strokeWidth="0.7" />
        <path d="M50 77 L58 81 M62 81 L70 77" stroke="#c4b5fd" strokeOpacity="0.7" strokeWidth="0.6" />
        {/* Hands */}
        <circle cx="52" cy="80" r="2.3" fill="#f0c4d6" />
        <circle cx="68" cy="80" r="2.3" fill="#f0c4d6" />

        {/* Blanket: flat draped top */}
        <path d="M6 100 Q9 90 24 89 L96 89 Q111 90 114 100 Z" fill="#1e1b4b" />
        <path d="M6 100 Q9 90 24 89 L96 89 Q111 90 114 100" stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1" fill="none" />
        <path d="M34 94 Q40 92 46 94 M74 94 Q80 92 86 94" stroke="#2a2660" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Nightstand + lamp at mattress level */}
        <rect x="96" y="84" width="20" height="16" fill="#160f34" />
        <line x1="106" y1="84" x2="106" y2="70" stroke="#7c3aed" strokeWidth="1.8" />
        <path d="M100 70 L112 70 L109 62 L103 62 Z" fill="#3b1d60" />
        <line x1="100" y1="70" x2="112" y2="70" stroke="#f9a8d4" strokeWidth="1.4" strokeOpacity="0.9" />
      </g>
    </svg>
  );
}
