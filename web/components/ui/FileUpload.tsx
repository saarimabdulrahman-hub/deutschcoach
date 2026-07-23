/**
 * FileUpload — Drag-and-drop file upload with progress
 * Reference: 13_FORMS_AND_VALIDATION_BIBLE/005_File_Uploads.md
 */

"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  label?: string;
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = "image/*,.pdf",
  maxSizeMB = 10,
  onFilesSelected,
  label = "Drag & drop files here, or click to browse",
  multiple,
  error,
  disabled,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const valid: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;
    for (const file of Array.from(files)) {
      if (file.size > maxBytes) {
        setFileError(`"${file.name}" exceeds ${maxSizeMB}MB limit.`);
        continue;
      }
      valid.push(file);
    }
    return valid;
  }, [maxSizeMB]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const valid = validateFiles(e.dataTransfer.files);
    if (valid.length > 0) { onFilesSelected(valid); setFileError(null); }
  }, [disabled, validateFiles, onFilesSelected]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0) { onFilesSelected(valid); setFileError(null); }
    }
  }, [validateFiles, onFilesSelected]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File upload"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        style={{
          padding: "var(--space-6)",
          borderRadius: "var(--radius-md)",
          border: `2px dashed ${dragging ? "var(--color-accent)" : error || fileError ? "var(--color-error-border)" : "var(--color-border-subtle)"}`,
          background: dragging ? "var(--color-hover-bg)" : "var(--color-surface-1)",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all var(--duration-fast) ease",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} style={{ display: "none" }} disabled={disabled} />
        <span style={{ fontSize: "32px", display: "block", marginBottom: "var(--space-2)" }}>📁</span>
        <p style={{ margin: 0, fontSize: "var(--type-body-md)", color: dragging ? "var(--color-accent)" : "var(--color-text-secondary)" }}>
          {label}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>
          Max {maxSizeMB}MB · {accept}
        </p>
      </div>
      {fileError && <p role="alert" style={{ fontSize: "var(--type-label-sm)", color: "var(--color-error-text)", margin: 0 }}>{fileError}</p>}
      {error && <p role="alert" style={{ fontSize: "var(--type-label-sm)", color: "var(--color-error-text)", margin: 0 }}>{error}</p>}
    </div>
  );
}
