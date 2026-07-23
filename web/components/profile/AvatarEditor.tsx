/**
 * AvatarEditor — Upload/crop/remove avatar with fallback initials
 */

"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface AvatarEditorProps {
  currentSrc?: string;
  name: string;
  onSave: (file: File) => void;
  onRemove: () => void;
}

export function AvatarEditor({ currentSrc, name, onSave, onRemove }: AvatarEditorProps) {
  const [preview, setPreview] = useState<string | undefined>(currentSrc);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onSave(file);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <Avatar src={preview} initials={name.charAt(0)} size="xl" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label style={{ cursor: "pointer", display: "inline-flex" }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
            height: "32px", padding: "0 16px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)", cursor: "pointer",
            fontSize: "var(--type-label-md)", fontWeight: 600,
            color: "var(--color-text-primary)", background: "var(--color-surface-1)",
          }}>
            Change photo
          </span>
        </label>
        {preview && (
          <Button variant="ghost" size="sm" onClick={() => { setPreview(undefined); onRemove(); }}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
