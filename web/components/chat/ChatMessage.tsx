/**
 * ChatMessage — Individual message component (user + assistant)
 * Shows avatar, content, corrections, and citations.
 */

"use client";



interface Correction {
  error: string;
  correction: string;
  explanation: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  corrections?: Correction[];
  userName: string;
}

export function ChatMessage({ role, content, corrections, userName }: ChatMessageProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className={`flex items-start gap-2.5 ${role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      {role === "user" ? (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--type-label-md)",
            fontWeight: 700,
            flexShrink: 0,
            background: "var(--color-accent-gradient)",
            color: "#fff",
          }}
        >
          {initial}
        </div>
      ) : (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <img src="/emma-avatar.webp" alt="Emma" className="w-full h-full rounded-full object-cover scale-110" />
        </div>
      )}

      <div className={role === "user" ? "items-end" : "items-start"} style={{ maxWidth: "75%" }}>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize: "var(--type-body-md)",
            lineHeight: 1.6,
            background: role === "user"
              ? "var(--color-accent-gradient)"
              : "var(--color-surface-1)",
            color: role === "user" ? "#fff" : "var(--color-text-secondary)",
            border: role === "user" ? "none" : "1px solid var(--color-border-subtle)",
          }}
        >
          {content}
        </div>

        {corrections && corrections.length > 0 && corrections[0]?.explanation && (
          <div
            style={{
              marginTop: "6px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--type-body-sm)",
              background: "var(--color-hover-bg)",
              color: "var(--color-active-text)",
              border: "1px solid var(--color-active-bg)",
            }}
          >
            💡 {corrections[0].explanation}
          </div>
        )}
      </div>
    </div>
  );
}
