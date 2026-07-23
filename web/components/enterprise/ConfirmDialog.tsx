/**
 * ConfirmDialog — Destructive action confirmation wrapper
 * Reference: 14_ENTERPRISE_UX_PATTERNS/006_Conflict_Resolution.md
 */

"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "destructive" | "warning";
}

export function ConfirmDialog({
  open, onClose, onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  loading,
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      variant="confirmation"
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: variant === "destructive" ? "destructive" : "primary",
        loading,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
    />
  );
}
