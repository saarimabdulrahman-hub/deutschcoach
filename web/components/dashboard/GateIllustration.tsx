"use client";

// Premium illustrated Brandenburg Gate — low perspective, architectural detail, rim-lit
// Designed to be backlit by a moon positioned behind it

export function GateIllustration() {
  return (
    <svg viewBox="0 0 600 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Moon backlight gradient — brightest at center behind gate */}
        <radialGradient id="moonGlow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="15%" stopColor="#f5e6ff" stopOpacity="0.6"/>
          <stop offset="35%" stopColor="#d4a0ff" stopOpacity="0.2"/>
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>

        {/* Light rays from moon */}
        <radialGradient id="lightRays" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.15"/>
          <stop offset="20%" stopColor="#e0c8ff" stopOpacity="0.06"/>
          <stop offset="50%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>

        {/* Gate body — dark silhouette with violet undertones */}
        <linearGradient id="gateFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1050"/>
          <stop offset="40%" stopColor="#140a38"/>
          <stop offset="100%" stopColor="#0d0625"/>
        </linearGradient>

        {/* Rim light on gate edges — from moon behind */}
        <linearGradient id="rimLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8d5ff" stopOpacity="0.9"/>
          <stop offset="15%" stopColor="#c9a0ff" stopOpacity="0.6"/>
          <stop offset="40%" stopColor="#9b60ff" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.05"/>
        </linearGradient>

        {/* Gate edge highlight — sharp rim lighting */}
        <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
          <stop offset="30%" stopColor="#d4a0ff" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </linearGradient>

        {/* Column shading */}
        <linearGradient id="colShade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d1570" stopOpacity="0.8"/>
          <stop offset="25%" stopColor="#1a0d45" stopOpacity="0.5"/>
          <stop offset="50%" stopColor="#140a38" stopOpacity="0.3"/>
          <stop offset="75%" stopColor="#1a0d45" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#2d1570" stopOpacity="0.8"/>
        </linearGradient>

        {/* Fog gradient */}
        <linearGradient id="fogGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1a1050" stopOpacity="0.8"/>
          <stop offset="40%" stopColor="#140a38" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="600" height="500" fill="url(#lightRays)"/>

      {/* Massive violet moon behind gate */}
      <circle cx="300" cy="155" r="95" fill="url(#moonGlow)"/>
      <circle cx="300" cy="155" r="55" fill="#fff" opacity="0.08"/>
      <circle cx="300" cy="155" r="35" fill="#f5e6ff" opacity="0.06"/>

      {/* Volumetric light rays radiating from behind gate */}
      <g opacity="0.12">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <line key={i} x1="300" y1="155" x2={300 + Math.cos(deg * Math.PI/180) * 400} y2={155 + Math.sin(deg * Math.PI/180) * 300}
            stroke="#e0c8ff" strokeWidth={i % 2 === 0 ? "2" : "1"} opacity={0.3 - i * 0.02}/>
        ))}
      </g>

      {/* ═══ BRANDENBURG GATE — CENTERED ═══ */}
      <g transform="translate(300, 0)">

        {/* ── PEDIMENT (triangular top) ── */}
        <polygon points="-125,100 0,18 125,100" fill="url(#gateFill)" stroke="url(#rimLight)" strokeWidth="3"/>
        {/* Pediment inner shadow */}
        <polygon points="-120,100 0,23 120,100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        {/* Pediment stepped layers */}
        <polygon points="-115,100 0,30 115,100" fill="none" stroke="url(#rimLight)" strokeWidth="1" opacity="0.3"/>

        {/* ── UPPER BEAM ── */}
        <rect x="-130" y="100" width="260" height="14" fill="url(#gateFill)" stroke="url(#rimLight)" strokeWidth="2.5"/>
        <rect x="-130" y="100" width="260" height="3" fill="rgba(255,255,255,0.08)"/>

        {/* ── LOWER BEAM ── */}
        <rect x="-130" y="270" width="260" height="16" fill="url(#gateFill)" stroke="url(#rimLight)" strokeWidth="2"/>

        {/* ── SIX DORIC COLUMNS ── */}
        {[
          { x: -115, w: 28 },
          { x: -68,  w: 26 },
          { x: -20,  w: 24 },
          { x: 8,    w: 24 },
          { x: 42,   w: 26 },
          { x: 87,   w: 28 },
        ].map((col, i) => (
          <g key={i}>
            {/* Column body */}
            <rect x={col.x} y="114" width={col.w} height="156" fill="url(#colShade)" stroke="url(#rimLight)" strokeWidth="1.5"/>
            {/* Column fluting lines */}
            {[1,2,3].map((n) => (
              <line key={n} x1={col.x + (col.w * n / 4)} y1="118" x2={col.x + (col.w * n / 4)} y2="266"
                stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
            ))}
            {/* Column top capital */}
            <rect x={col.x - 2} y="114" width={col.w + 4} height="8" fill="url(#gateFill)" stroke="url(#rimLight)" strokeWidth="1"/>
            {/* Column base */}
            <rect x={col.x - 1} y="263" width={col.w + 2} height="7" fill="url(#gateFill)" stroke="url(#rimLight)" strokeWidth="1"/>
          </g>
        ))}

        {/* ── CENTER ARCHWAY ── */}
        <path d="M-16 270 L-16 150 Q0 120 16 150 L16 270"
          fill="rgba(5,2,20,0.5)" stroke="url(#rimLight)" strokeWidth="2"/>
        {/* Archway inner glow from moon */}
        <path d="M-14 270 L-14 152 Q0 124 14 152 L14 270"
          fill="none" stroke="rgba(200,160,255,0.15)" strokeWidth="6" filter="blur(3px)"/>

        {/* ── QUADRIGA (statue on top) ── */}
        <g transform="translate(0, 38) scale(0.7)" fill="none" stroke="url(#rimLight)" strokeWidth="3" opacity="0.7">
          {/* Chariot base */}
          <rect x="-18" y="5" width="36" height="8" rx="2"/>
          {/* Horse bodies — simplified */}
          <ellipse cx="-10" cy="-8" rx="8" ry="5"/>
          <ellipse cx="10" cy="-8" rx="8" ry="5"/>
          {/* Horse heads */}
          <line x1="-10" y1="-13" x2="-14" y2="-20"/>
          <line x1="10" y1="-13" x2="14" y2="-20"/>
          {/* Figure */}
          <circle cx="0" cy="-15" r="5"/>
          <line x1="0" y1="-10" x2="0" y2="5"/>
        </g>
      </g>

      {/* ── FOG LAYER — at bottom, fading up over gate base ── */}
      <rect x="0" y="300" width="600" height="200" fill="url(#fogGrad)"/>

      {/* ── AMBIENT PARTICLES ── */}
      {Array.from({length: 18}).map((_, i) => {
        const x = 100 + (i * 67 + 31) % 400;
        const y = 20 + (i * 43 + 17) % 320;
        const s = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5;
        return (
          <circle key={i} cx={x} cy={y} r={s}
            fill={i % 7 === 0 ? "#e0c8ff" : "rgba(255,255,255,0.4)"}
            opacity={i % 7 === 0 ? 0.6 : 0.3}
            style={{ filter: i % 5 === 0 ? "blur(1px)" : "none" }}/>
        );
      })}

      {/* ── STARS ── */}
      {Array.from({length: 25}).map((_, i) => {
        const sx = 30 + (i * 91 + 13) % 540;
        const sy = 10 + (i * 37 + 7) % 200;
        const ss = i % 6 === 0 ? 2 : i % 4 === 0 ? 1.5 : 1;
        return (
          <circle key={i} cx={sx} cy={sy} r={ss}
            fill="rgba(255,255,255,0.5)" opacity={0.3 + (i % 5) * 0.1}/>
        );
      })}
    </svg>
  );
}
