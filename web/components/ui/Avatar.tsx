/**
 * Avatar — Canonical primitive component
 * Sizes: XS (24px), SM (32px), MD (40px), LG (48px), XL (64px)
 * Variants: Image, Initials, Icon, Group, Presence
 * States: Default, Loading, Online, Offline, Busy, Disabled
 *
 * Reference: DeutschFlow Design Bible 02_COMPONENTS/016_Avatar.md
 */

import type { CSSProperties } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type PresenceStatus = "online" | "offline" | "busy";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const presenceColors: Record<PresenceStatus, string> = {
  online: "#22c55e",
  offline: "var(--color-text-muted)",
  busy: "var(--color-warning)",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  presence,
  disabled,
  className = "",
  style,
}: AvatarProps) {
  const px = sizeMap[size];
  const fontSize = px * 0.4;

  const containerStyle: CSSProperties = {
    width: px,
    height: px,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: src ? "transparent" : "var(--color-accent-gradient)",
    color: "#fff",
    fontWeight: 600,
    fontSize,
    flexShrink: 0,
    position: "relative",
    opacity: disabled ? 0.4 : 1,
    ...style,
  };

  return (
    <div className={className} style={containerStyle} role="img" aria-label={alt || initials || "Avatar"}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
            (e.currentTarget.parentElement as HTMLElement).style.background = "var(--color-accent-gradient)";
          }}
        />
      ) : (
        <span>{initials || getInitials(alt)}</span>
      )}

      {presence && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: px * 0.3,
            height: px * 0.3,
            borderRadius: "50%",
            background: presenceColors[presence],
            border: "2px solid var(--color-background-primary)",
            boxShadow: presence === "online" ? `0 0 4px ${presenceColors[presence]}` : undefined,
          }}
        />
      )}
    </div>
  );
}
