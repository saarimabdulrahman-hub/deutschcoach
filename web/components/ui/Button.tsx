/**
 * Button — Canonical primitive component
 * Variants: Primary, Secondary, Tertiary, Ghost, Destructive, Icon-only
 * States: Default, Hover, Active, Focus-visible, Disabled, Loading, Success
 * Sizes: Small (32px), Medium (40px), Large (48px)
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/001_Button.md
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  success?: boolean;
  /** Icon-only mode — shows only the icon child, no label needed */
  icon?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--color-accent-gradient)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 14px var(--color-accent-glow)",
  },
  secondary: {
    background: "var(--color-surface-1)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-subtle)",
  },
  tertiary: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "none",
  },
  destructive: {
    background: "var(--color-error-bg)",
    color: "var(--color-error-text)",
    border: "1px solid var(--color-error-border)",
  },
  icon: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "none",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: "40px", padding: "0 16px", fontSize: "var(--type-label-md)", gap: "8px", minWidth: "40px" },
  md: { height: "44px", padding: "0 20px", fontSize: "var(--type-body-md)", gap: "8px", minWidth: "44px" },
  lg: { height: "48px", padding: "0 24px", fontSize: "var(--type-body-md)", gap: "8px" },
};

const iconSizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { width: "32px", height: "32px", padding: "0" },
  md: { width: "40px", height: "40px", padding: "0" },
  lg: { width: "48px", height: "48px", padding: "0" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, success, icon, disabled, children, style, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all var(--duration-fast) ease-out",
          outline: "none",
          whiteSpace: "nowrap",
          ...(icon ? iconSizeStyles[size] : sizeStyles[size]),
          ...variantStyles[variant],
          ...(loading ? { opacity: 0.7, pointerEvents: "none" as const } : {}),
          ...(success ? { background: "var(--color-success)", boxShadow: "none" } : {}),
          ...(isDisabled ? { opacity: 0.4 } : {}),
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = "2px solid var(--color-border-focus)";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        onMouseEnter={(e) => {
          if (!isDisabled && variant !== "primary") {
            e.currentTarget.style.background = "var(--color-hover-bg)";
          }
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant !== "primary") {
            e.currentTarget.style.background = variantStyles[variant].background as string;
          }
          e.currentTarget.style.transform = "translateY(0)";
        }}
        onMouseDown={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(0) scale(0.97)";
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        {...props}
      >
        {loading ? (
          <span
            style={{
              width: size === "sm" ? "14px" : "18px",
              height: size === "sm" ? "14px" : "18px",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
