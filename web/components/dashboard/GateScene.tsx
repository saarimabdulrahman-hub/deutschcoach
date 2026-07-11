// Hand-built neon-vector Brandenburg Gate scene for the dashboard hero.
// Replaces the raster /gate.png. Synthwave palette: violet structure with
// glowing pink edges, a magenta horizon, an arcing "latitude" line, the
// Fernsehturm TV tower, a quadriga silhouette, stars, and a reflected
// perspective-grid pathway. Verified via rasterized visual review.
//
// viewBox 1180×320 ≈ hero aspect; preserveAspectRatio slice so it covers the
// banner. Gate is centered at x≈780 (right of the left-aligned copy).

const COLUMN_CX = [677, 718, 759, 801, 842, 883];
const STARS = [
  [980, 40, 1.4, 0.85], [1060, 70, 1, 0.6], [900, 52, 1.2, 0.75],
  [1120, 105, 1.2, 0.55], [560, 58, 1.1, 0.6], [720, 34, 1, 0.55],
  [1010, 128, 1, 0.5], [500, 96, 1.1, 0.5], [1150, 52, 1, 0.6],
] as const;

export function GateScene() {
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
        <radialGradient id="gsHorizon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
          <stop offset="45%" stopColor="#d946ef" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gsColumn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1d60" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="gsEntab" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1550" />
          <stop offset="50%" stopColor="#3b1d60" />
          <stop offset="100%" stopColor="#2a1550" />
        </linearGradient>
        <linearGradient id="gsPath" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.28" />
        </linearGradient>
        <filter id="gsGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gsGlowS" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="780" cy="250" rx="300" ry="100" fill="url(#gsHorizon)" />

      {/* Sky arc, well above the gate */}
      <path d="M 200 240 C 500 -20 1060 -20 1360 240" stroke="#f472b6" strokeWidth="1.5" strokeOpacity="0.55" filter="url(#gsGlow)" />

      {/* Stars */}
      {STARS.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fbcfe8" fillOpacity={o} />
      ))}
      <path d="M640 40 l1.8 5 5 1.8 -5 1.8 -1.8 5 -1.8 -5 -5 -1.8 5 -1.8 z" fill="#f9a8d4" fillOpacity="0.85" />
      <path d="M1080 150 l1.6 4.5 4.5 1.6 -4.5 1.6 -1.6 4.5 -1.6 -4.5 -4.5 -1.6 4.5 -1.6 z" fill="#f9a8d4" fillOpacity="0.7" />

      {/* Fernsehturm TV tower */}
      <path d="M575 252 L585 252 L582 146 L578 146 Z" fill="#2a1550" stroke="#f472b6" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="580" cy="145" r="14" fill="#3b1d60" stroke="#f472b6" strokeWidth="1.6" filter="url(#gsGlowS)" />
      <ellipse cx="580" cy="145" rx="14" ry="5" fill="none" stroke="#f9a8d4" strokeOpacity="0.45" strokeWidth="0.8" />
      <line x1="566" y1="145" x2="594" y2="145" stroke="#f9a8d4" strokeOpacity="0.4" strokeWidth="0.7" />
      <line x1="580" y1="131" x2="580" y2="159" stroke="#f9a8d4" strokeOpacity="0.4" strokeWidth="0.7" />
      <line x1="580" y1="131" x2="580" y2="122" stroke="#f9a8d4" strokeWidth="2" />
      <line x1="580" y1="122" x2="580" y2="112" stroke="#2a1550" strokeWidth="2" />
      <line x1="580" y1="112" x2="580" y2="102" stroke="#f9a8d4" strokeWidth="2" />
      <line x1="580" y1="102" x2="580" y2="94" stroke="#2a1550" strokeWidth="2" />
      <circle cx="580" cy="93" r="1.8" fill="#f9a8d4" />

      {/* Deep passage recess + faint arched portals */}
      <rect x="658" y="140" width="244" height="108" fill="#08031a" />
      <g stroke="#7c3aed" strokeOpacity="0.18" strokeWidth="1" fill="none">
        <path d="M690 248 L690 168 Q698 158 706 168 L706 248" />
        <path d="M731 248 L731 168 Q739 158 747 168 L747 248" />
        <path d="M772 248 L772 166 Q780 156 788 166 L788 248" />
        <path d="M813 248 L813 168 Q821 158 829 168 L829 248" />
        <path d="M854 248 L854 168 Q862 158 870 168 L870 248" />
      </g>

      {/* Columns (tapered, capitals + bases + fluting) */}
      {COLUMN_CX.map((cx, i) => (
        <g key={i}>
          <path d={`M${cx - 8} 140 L${cx + 8} 140 L${cx + 11} 248 L${cx - 11} 248 Z`} fill="url(#gsColumn)" />
          <line x1={cx - 8} y1="140" x2={cx - 11} y2="248" stroke="#f472b6" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1={cx - 4} y1="146" x2={cx - 5} y2="244" stroke="#f472b6" strokeOpacity="0.2" />
          <line x1={cx + 4} y1="146" x2={cx + 5} y2="244" stroke="#f472b6" strokeOpacity="0.2" />
          <rect x={cx - 12} y="134" width="24" height="6" fill="#4c2570" />
          <rect x={cx - 13} y="246" width="26" height="5" fill="#4c2570" />
        </g>
      ))}

      {/* Base platform */}
      <rect x="644" y="248" width="272" height="10" fill="#3b1d60" />
      <rect x="644" y="248" width="272" height="1.6" fill="#f472b6" fillOpacity="0.7" />
      {/* Entablature */}
      <rect x="640" y="120" width="280" height="20" fill="url(#gsEntab)" />
      <rect x="640" y="120" width="280" height="1.8" fill="#f9a8d4" fillOpacity="0.85" />
      <rect x="636" y="130" width="288" height="4" fill="#2a1550" />
      {/* Attic pedestal */}
      <rect x="726" y="100" width="108" height="20" fill="#2a1550" />
      <rect x="726" y="100" width="108" height="1.4" fill="#f472b6" fillOpacity="0.55" />

      {/* Quadriga: four front-facing horses + Victoria with a standard */}
      <g stroke="#f472b6" strokeOpacity="0.7" strokeWidth="0.9" filter="url(#gsGlowS)">
        <rect x="758" y="97" width="44" height="4" fill="#160a33" />
        <path d="M763 100 L763 90 Q763 86 766 86 Q769 86 769 90 L769 100 Z M765 86 L763.5 82 L766 85 Z M767 86 L769 82 L767.5 85 Z" fill="#160a33" />
        <path d="M773 100 L773 90 Q773 86 776 86 Q779 86 779 90 L779 100 Z M775 86 L773.5 82 L776 85 Z M777 86 L779 82 L777.5 85 Z" fill="#160a33" />
        <path d="M789 100 L789 90 Q789 86 792 86 Q795 86 795 90 L795 100 Z M791 86 L789.5 82 L792 85 Z M793 86 L795 82 L793.5 85 Z" fill="#160a33" />
        <path d="M799 100 L799 90 Q799 86 802 86 Q805 86 805 90 L805 100 Z M801 86 L799.5 82 L802 85 Z M803 86 L805 82 L803.5 85 Z" fill="#160a33" />
        <path d="M781 97 L781 80" strokeWidth="1.8" />
        <circle cx="781" cy="77" r="2.6" fill="#160a33" />
        <path d="M781 84 L781 62" strokeWidth="1.4" />
        <circle cx="781" cy="60" r="2.2" fill="#160a33" />
        <path d="M776 66 L786 66" strokeWidth="1.2" />
      </g>

      {/* Ground line */}
      <line x1="300" y1="257" x2="1180" y2="257" stroke="#2a1550" strokeOpacity="0.5" />

      {/* Reflected neon perspective grid pathway */}
      <path d="M772 248 L788 248 L1000 320 L560 320 Z" fill="url(#gsPath)" />
      <g stroke="#f43f5e" strokeOpacity="0.5" strokeWidth="1.1" filter="url(#gsGlowS)">
        <line x1="772" y1="248" x2="560" y2="320" />
        <line x1="788" y1="248" x2="1000" y2="320" />
        <line x1="780" y1="248" x2="780" y2="320" strokeOpacity="0.28" />
        <line x1="742" y1="258" x2="818" y2="258" />
        <line x1="701" y1="272" x2="859" y2="272" />
        <line x1="648" y1="290" x2="912" y2="290" />
        <line x1="595" y1="308" x2="965" y2="308" />
      </g>
      <g stroke="#f43f5e" strokeOpacity="0.22" strokeWidth="0.9">
        <line x1="772" y1="248" x2="776" y2="168" />
        <line x1="788" y1="248" x2="784" y2="168" />
        <line x1="774" y1="210" x2="786" y2="210" />
        <line x1="775" y1="188" x2="785" y2="188" />
      </g>
    </svg>
  );
}
