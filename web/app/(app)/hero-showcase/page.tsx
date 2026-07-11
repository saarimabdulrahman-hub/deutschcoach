"use client";

// Gate SVG shared across all variants
function GateSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 0 }}>
      <div className="w-[42%] h-full relative">
        <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gb" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.45"/>
              <stop offset="30%" stopColor="#fff" stopOpacity="0.2"/>
              <stop offset="60%" stopColor="#fff" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#fff" stopOpacity="0.03"/>
            </linearGradient>
          </defs>
          <g stroke="url(#gb)" strokeWidth="2" fill="none">
            <polygon points="20,80 150,8 280,80" fill="rgba(255,255,255,0.02)"/>
            <rect x="12" y="80" width="276" height="7" fill="rgba(255,255,255,0.03)"/>
            <rect x="12" y="218" width="276" height="9" fill="rgba(255,255,255,0.03)"/>
            {[22,68,114,156,202,248].map((x,i) => (
              <rect key={i} x={x} y="87" width={i===2||i===3?24:22} height="131" fill="rgba(255,255,255,0.015)"/>
            ))}
            <path d="M134 218 L134 138 Q150 113 166 138 L166 218" fill="rgba(255,255,255,0.03)"/>
            <g transform="translate(135,30) scale(0.45)" stroke="url(#gb)" strokeWidth="2.5">
              <circle cx="15" cy="10" r="8"/><line x1="15" y1="18" x2="15" y2="35"/>
              <line x1="0" y1="20" x2="30" y2="20"/><line x1="5" y1="25" x2="25" y2="25"/>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function HeroFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#040418" }}>
      <div className="relative overflow-hidden h-[250px] flex items-center">
        {children}
        <GateSVG />
        {/* Fog overlay after gate */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 60px 20px rgba(0,0,0,0.6)" }} />
        {/* Text + CTA */}
        <div className="relative z-10 flex items-center w-full px-5">
          <div className="flex-1">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-widest mb-1" style={{color:"rgba(255,255,255,0.4)",textShadow:"0 1px 2px rgba(0,0,0,0.6)"}}>Welcome to DeutschFlow</p>
            <h2 className="text-xs sm:text-sm font-bold leading-tight mb-1" style={{color:"#fff",textShadow:"0 1px 6px rgba(0,0,0,0.5)"}}>Your German learning journey starts here</h2>
            <p className="text-[9px] hidden sm:block" style={{color:"rgba(255,255,255,0.35)"}}>Structured lessons, smart flashcards, AI tutor.</p>
          </div>
          <div className="hidden lg:block rounded-xl p-3 w-[140px] flex-shrink-0"
            style={{background:"rgba(10,14,30,0.25)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <p className="text-[10px] font-bold mb-1" style={{color:"#fff"}}>Ready?</p>
            <button className="w-full px-3 py-1.5 rounded-lg text-[10px] font-bold glossy-accent">Start →</button>
          </div>
        </div>
      </div>
      <div className="p-2 px-3 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(123,63,251,0.15)", color: "#A24BFF" }}>{label}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 10 FULL HERO VARIATIONS with Gate
// ═══════════════════════════════════════════════════════════════════

function V1() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(170deg, #06061a 0%, #0d0830 50%, #1a0d50 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"5%",width:140,height:140,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-30,background:"radial-gradient(circle, rgba(200,180,255,0.12) 0%, transparent 65%)",filter:"blur(18px)" }} />
      <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle at 55% 40%, rgba(255,255,255,0.07) 0%, transparent 65%)" }} />
    </div>
    {[...Array(8)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${10+i*10}%`,top:`${5+i*8}%`,width:1.5,height:1.5,background:"rgba(255,255,255,0.4)"}}/>))}
  </>;
}

function V2() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #020212 0%, #0a0220 40%, #1a0040 70%, #2d0050 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"5%",width:120,height:120,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-25,background:"radial-gradient(circle, rgba(213,108,255,0.2) 0%, transparent 60%)",filter:"blur(8px)" }} />
      <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle, #D56CFF 0%, #A24BFF 40%, transparent 70%)",filter:"blur(2px)" }} />
    </div>
    {[...Array(18)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${(i*23+5)%95}%`,top:`${(i*31+3)%80}%`,width:i%3===0?2:1,height:i%3===0?2:1,background:"rgba(255,255,255,0.3)",boxShadow:i%3===0?"0 0 4px rgba(213,108,255,0.4)":"none"}}/>))}
  </>;
}

function V3() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0520 0%, #1a0a35 50%, #3d1560 80%, #4d1860 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"50%",width:100,height:100,transform:"translate(-50%,-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-35,background:"radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 60%)",filter:"blur(14px)" }} />
      <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(245,158,11,0.08) 30%, transparent 60%)" }} />
    </div>
    {[...Array(12)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${15+i*7}%`,top:`${3+i*2}%`,width:1,height:1,background:"rgba(255,220,180,0.3)"}}/>))}
  </>;
}

function V4() {
  return <>
    <div className="absolute inset-0" style={{ background: "#080420" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"15%",width:160,height:160,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-40,background:"radial-gradient(circle, rgba(180,160,220,0.06) 0%, transparent 60%)",filter:"blur(20px)" }} />
    </div>
  </>;
}

function V5() {
  return <>
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0d50 0%, #0a0428 50%, #020818 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"10%",width:180,height:180,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-35,background:"radial-gradient(circle, rgba(220,200,255,0.1) 0%, transparent 55%)",filter:"blur(10px)" }} />
      {[0,45,90,135,180,225,270,315].map((deg,i)=>(<div key={i} className="absolute top-1/2 left-1/2 pointer-events-none" style={{width:1,height:80,background:`rgba(255,255,255,${0.04-i*0.003})`,transform:`translate(-50%,-50%) rotate(${deg}deg)`,transformOrigin:"0 0",filter:"blur(2px)"}}/>))}
    </div>
    {[...Array(25)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${(i*29+7)%98}%`,top:`${(i*37+3)%70}%`,width:i%6===0?2:1,height:i%6===0?2:1,background:`rgba(255,255,255,${0.15+(i%4)*0.08})`}}/>))}
  </>;
}

function V6() {
  return <>
    <div className="absolute inset-0" style={{ background: "#030612" }} />
    <div className="absolute pointer-events-none" style={{ right:"15%",top:"10%",width:80,height:80 }}>
      <div className="absolute rounded-full" style={{ inset:-15,background:"radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)",filter:"blur(6px)" }} />
    </div>
    {[...Array(15)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${(i*35+10)%95}%`,top:`${(i*25+5)%80}%`,width:1,height:1,background:"rgba(255,255,255,0.4)"}}/>))}
  </>;
}

function V7() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #020d1a 0%, #051530 40%, #0d0840 75%, #150a50 100%)" }} />
    <div className="absolute top-[15%] left-0 right-0 h-[35%] pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent 10%, rgba(45,229,115,0.06) 25%, rgba(45,229,115,0.12) 40%, rgba(123,63,251,0.1) 55%, rgba(213,108,255,0.06) 70%, transparent 85%)", filter:"blur(18px)" }} />
    {[...Array(15)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${(i*31+8)%96}%`,top:`${(i*27+5)%75}%`,width:1,height:1,background:i%4===0?"rgba(200,255,200,0.3)":"rgba(255,255,255,0.2)"}}/>))}
  </>;
}

function V8() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #000000 0%, #060420 30%, #0d0530 60%, #1a0a50 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"5%",width:100,height:100,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-20,background:"radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 55%)",filter:"blur(4px)" }} />
      {[0,60,120,180].map((deg,i)=>(<div key={i} className="absolute top-1/2 left-1/2 pointer-events-none" style={{width:2,height:70,background:"rgba(255,255,255,0.06)",transform:`translate(-50%,-50%) rotate(${deg}deg)`,transformOrigin:"0 0"}}/>))}
    </div>
    {[...Array(6)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${20+i*12}%`,top:`${5+i*3}%`,width:2,height:2,background:"rgba(255,255,255,0.5)"}}/>))}
  </>;
}

function V9() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0e0830 0%, #140c38 50%, #1a0e40 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"40%",top:"15%",width:140,height:140 }}>
      <div className="absolute rounded-full" style={{ inset:-35,background:"radial-gradient(circle, rgba(200,180,240,0.05) 0%, transparent 60%)",filter:"blur(20px)" }} />
    </div>
    {[...Array(10)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${15+i*9}%`,top:`${5+i*6}%`,width:1,height:1,background:"rgba(255,255,255,0.2)"}}/>))}
  </>;
}

function V10() {
  return <>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0420 0%, #120a35 30%, #1a0d48 55%, #200d45 75%, #180a35 100%)" }} />
    <div className="absolute pointer-events-none" style={{ left:"50%",top:"10%",width:110,height:110,transform:"translateX(-50%)" }}>
      <div className="absolute rounded-full" style={{ inset:-25,background:"radial-gradient(circle, rgba(255,240,220,0.08) 0%, transparent 60%)",filter:"blur(12px)" }} />
    </div>
    {[...Array(15)].map((_,i)=>(<div key={i} className="absolute rounded-full" style={{left:`${(i*27+5)%95}%`,top:`${(i*23+3)%75}%`,width:i%5===0?2:1,height:i%5===0?2:1,background:i%5===0?"rgba(255,240,220,0.4)":"rgba(255,255,255,0.25)"}}/>))}
  </>;
}

const VARIANTS = [
  { label:"1. Deep Violet Dream", C:V1 },
  { label:"2. Neon Berlin", C:V2 },
  { label:"3. Golden Hour Gate", C:V3 },
  { label:"4. Mystic Fog", C:V4 },
  { label:"5. Celestial Alignment", C:V5 },
  { label:"6. Glass & Light", C:V6 },
  { label:"7. Aurora Berlin", C:V7 },
  { label:"8. Monument at Midnight", C:V8 },
  { label:"9. Soft Amethyst", C:V9 },
  { label:"10. Digital Renaissance", C:V10 },
];

export default function HeroShowcase() {
  return (
    <div style={{ background: "var(--color-page-bg)", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#fff" }}>Hero Variations — with Brandenburg Gate</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Full hero compositions. Gate + moon + particles + text + CTA. Pick one.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {VARIANTS.map((v) => (
            <HeroFrame key={v.label} label={v.label}>
              <v.C />
            </HeroFrame>
          ))}
        </div>
      </div>
    </div>
  );
}
