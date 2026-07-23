/**
 * StreamingMessage — Streaming response display with typing indicator
 * Shows progressively as tokens arrive from the API.
 */

"use client";

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        style={{
          width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden",
          flexShrink: 0, background: "var(--color-surface-1)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover scale-110" />
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "16px 16px 16px 4px",
          fontSize: "var(--type-body-md)",
          lineHeight: 1.6,
          background: "var(--color-surface-1)",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border-subtle)",
          maxWidth: "75%",
        }}
      >
        {content || <TypingIndicator />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span style={{ display: "flex", gap: "4px", alignItems: "center", padding: "4px 0" }}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: "var(--color-accent)",
            animation: "bounce 1s ease-in-out infinite",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
    </span>
  );
}
