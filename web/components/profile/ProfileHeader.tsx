/**
 * ProfileHeader — Avatar + name + level badge + member since
 */

"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface ProfileHeaderProps {
  name: string;
  level?: string;
  avatarSrc?: string;
  memberSince?: string;
}

export function ProfileHeader({ name, level = "A1", avatarSrc, memberSince }: ProfileHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <Avatar src={avatarSrc} initials={name.charAt(0)} size="xl" />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
          <h2 style={{ margin: 0, fontSize: "var(--type-heading-md)", fontWeight: 700, color: "var(--color-text-primary)" }}>{name}</h2>
          <Badge variant="accent" size="sm">{level}</Badge>
        </div>
        {memberSince && (
          <p style={{ margin: 0, fontSize: "var(--type-body-sm)", color: "var(--color-text-muted)" }}>
            Member since {memberSince}
          </p>
        )}
      </div>
    </div>
  );
}
