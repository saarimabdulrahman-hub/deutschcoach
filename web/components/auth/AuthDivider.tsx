/**
 * AuthDivider — "or" divider between social login and form
 */

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", margin: "var(--space-4) 0" }}>
      <div style={{ flex: 1, height: "1px", background: "var(--color-border-subtle)" }} />
      <span style={{ fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "var(--color-border-subtle)" }} />
    </div>
  );
}
