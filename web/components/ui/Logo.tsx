export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background: rounded square with subtle gradient */}
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b2e" />
          <stop offset="100%" stopColor="#14111f" />
        </linearGradient>
        <linearGradient id="logoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="logoLetter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logoAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>

      {/* Hexagon shield */}
      <path
        d="M24 2 L43 13 L43 35 L24 46 L5 35 L5 13 Z"
        fill="url(#logoBg)"
        stroke="url(#logoStroke)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Stylised "D" with flowing tail */}
      <path
        d="M16 13h10c4.97 0 9 3.58 9 8s-3.58 8-9 8h-6V13z"
        fill="none"
        stroke="url(#logoLetter)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Flowing accent line inside the D */}
      <path
        d="M20 17c1.5 0 3 .8 4 2"
        stroke="url(#logoAccent)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Gold accent dot */}
      <circle cx="34" cy="14" r="3" fill="url(#logoAccent)" opacity="0.9" />
    </svg>
  );
}
