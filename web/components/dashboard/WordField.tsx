// Hero background: a drifting field of German words and umlauts, neon-gradient
// tinted. Replaces the literal Brandenburg Gate — for a language app the most
// characteristic hero art is the language itself. Kept right-biased and low
// opacity so the left-aligned hero copy stays legible.
//
// viewBox 1180×320 ≈ hero aspect; preserveAspectRatio slice to cover the banner.

const WORDS = [
  // t: text, x, y, size, op: opacity, rot: degrees, outline: stroke-only
  { t: "Willkommen", x: 560, y: 78, size: 46, op: 0.18, rot: -5, outline: false },
  { t: "Hallo", x: 980, y: 96, size: 62, op: 0.24, rot: 4, outline: true },
  { t: "Deutsch", x: 640, y: 190, size: 78, op: 0.08, rot: 0, outline: true },
  { t: "Guten Tag", x: 840, y: 250, size: 40, op: 0.16, rot: -3, outline: false },
  { t: "Danke", x: 1050, y: 210, size: 38, op: 0.18, rot: 6, outline: false },
] as const;

// Scattered accent letters (umlauts + ß)
const GLYPHS = [
  { t: "ä", x: 1120, y: 150, size: 46, op: 0.24 },
  { t: "ö", x: 545, y: 265, size: 40, op: 0.16 },
  { t: "ü", x: 930, y: 155, size: 36, op: 0.2 },
  { t: "ß", x: 760, y: 300, size: 42, op: 0.16 },
] as const;

const STARS = [
  [900, 46, 1.3, 0.7], [1080, 70, 1, 0.55], [700, 40, 1.1, 0.6],
  [1150, 130, 1.1, 0.5], [610, 120, 1, 0.5], [1010, 250, 1, 0.5],
] as const;

export function WordField() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1180 320"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontWeight: 800 }}
    >
      <defs>
        <linearGradient id="wfGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="wfGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ambient glow, center-right */}
      <ellipse cx="840" cy="230" rx="360" ry="170" fill="url(#wfGlow)" />

      {/* Giant ghost umlaut watermark, far right */}
      <text x="1000" y="260" fontSize="360" opacity="0.05" fill="url(#wfGrad)" textAnchor="middle">ä</text>

      {/* Words */}
      {WORDS.map((w, i) => (
        <text
          key={i}
          x={w.x}
          y={w.y}
          fontSize={w.size}
          opacity={w.op}
          transform={`rotate(${w.rot} ${w.x} ${w.y})`}
          fill={w.outline ? "none" : "url(#wfGrad)"}
          stroke={w.outline ? "url(#wfGrad)" : "none"}
          strokeWidth={w.outline ? 1.4 : 0}
        >
          {w.t}
        </text>
      ))}

      {/* Accent glyphs */}
      {GLYPHS.map((g, i) => (
        <text key={i} x={g.x} y={g.y} fontSize={g.size} opacity={g.op} fill="url(#wfGrad)" textAnchor="middle">
          {g.t}
        </text>
      ))}

      {/* Stars for synthwave continuity */}
      {STARS.map(([x, y, r, o], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fbcfe8" fillOpacity={o} />
      ))}
      <path d="M960 150 l1.6 4.5 4.5 1.6 -4.5 1.6 -1.6 4.5 -1.6 -4.5 -4.5 -1.6 4.5 -1.6 z" fill="#f9a8d4" fillOpacity="0.7" />
    </svg>
  );
}
