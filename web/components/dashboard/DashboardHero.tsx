"use client";

export function DashboardHero() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] h-[250px] sm:h-[290px] lg:h-[310px]"
      style={{
        border: "1px solid rgba(217,70,239,0.25)",
        boxShadow: "0 0 40px rgba(217,70,239,0.20), 0 0 80px rgba(123,63,251,0.12), 0 4px 24px rgba(0,0,0,0.55)",
        background: "linear-gradient(170deg, #050420 0%, #0c062d 25%, #110940 55%, #0c062d 75%, #050420 100%)",
      }}
    >
      {/* Ambient purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 58% 25%, rgba(139,70,255,0.22) 0%, transparent 45%), " +
            "radial-gradient(ellipse at 60% 40%, rgba(162,75,255,0.14) 0%, transparent 40%), " +
            "radial-gradient(ellipse at 75% 50%, rgba(123,63,251,0.1) 0%, transparent 35%), " +
            "radial-gradient(ellipse at 35% 50%, rgba(139,70,255,0.08) 0%, transparent 35%), " +
            "radial-gradient(ellipse at 55% 55%, rgba(213,108,255,0.06) 0%, transparent 30%)",
        }}
      />

      {/* Hero image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url('/hero.webp')", backgroundSize: "cover", backgroundPosition: "center right" }}
      />

      {/* Purple tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(50,15,100,0.25) 0%, rgba(30,8,60,0.15) 35%, rgba(20,5,50,0.1) 60%, rgba(50,15,100,0.2) 100%)",
        }}
      />

      {/* Edge darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(4,4,20,0.6) 0%, rgba(4,4,20,0.15) 30%, transparent 55%, transparent 75%, rgba(4,4,20,0.15) 90%, rgba(4,4,20,0.5) 100%)",
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(4,4,20,0.55) 0%, transparent 45%)" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 50px 15px rgba(0,0,0,0.35)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full w-full px-6 sm:px-8 lg:px-10">
        <div className="flex-1 max-w-[460px]">
          <p
            className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
            style={{ color: "rgba(226,232,240,0.82)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
          >
            Welcome to DeutschCoach
          </p>
          <h2
            className="text-[1.5rem] sm:text-[1.9rem] lg:text-[2.35rem] font-extrabold leading-[1.03] tracking-[-0.02em] mb-2.5"
            style={{ color: "#fff", textShadow: "0 2px 14px rgba(120,40,180,0.55)" }}
          >
            Your German learning
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #ffffff 0%, #fbcfe8 30%, #f0abfc 56%, #e879f9 78%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
            >
              journey starts here
            </span>
          </h2>
          <p
            className="text-[11px] sm:text-xs leading-relaxed max-w-sm"
            style={{ color: "rgba(214,200,244,0.68)", textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}
          >
            Structured lessons, smart flashcards, and an AI tutor—everything you need to go from zero to fluent.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3.5 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>✓ Beginner-friendly</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>⏱ 10 min lessons</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(139,70,255,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "rgba(224,208,255,0.85)" }}>📚 80+ lessons</span>
          </div>
        </div>
        <div className="flex-1 hidden sm:block" />
      </div>
    </div>
  );
}
