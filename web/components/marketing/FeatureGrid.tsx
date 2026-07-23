/**
 * FeatureGrid — 3-column feature card grid
 */

interface Feature {
  icon: string; title: string; description: string;
}

const FEATURES: Feature[] = [
  { icon: "📚", title: "Structured Curriculum", description: "CEFR-aligned lessons from A1 to C1. Each lesson builds on the last for steady progress." },
  { icon: "🤖", title: "AI Tutor Emma", description: "Practice conversations, get corrections, and learn at your own pace with our AI tutor." },
  { icon: "🧠", title: "Spaced Repetition", description: "Smart flashcards that show you words at the perfect time for long-term memory." },
  { icon: "📊", title: "Progress Tracking", description: "Detailed analytics showing your streaks, vocabulary growth, quiz scores, and more." },
  { icon: "🎯", title: "Personalized Learning", description: "Adaptive content that matches your skill level and learning goals." },
  { icon: "🔊", title: "Audio & Pronunciation", description: "Native pronunciation audio and speaking practice to perfect your accent." },
];

export function FeatureGrid() {
  return (
    <section style={{ padding: "60px 24px", maxWidth: "960px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 40px" }}>
        Everything you need to learn German
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            padding: "24px", borderRadius: "var(--radius-md)",
            background: "var(--color-surface-1)", border: "1px solid var(--color-border-subtle)",
            transition: "transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--elevation-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}>{f.icon}</span>
            <h3 style={{ fontSize: "var(--type-heading-sm)", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" }}>{f.title}</h3>
            <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
