"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
        <h1 style={{ fontSize: "var(--type-heading-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>Invalid link</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--type-body-md)" }}>
          This reset link is invalid or has expired.
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      visualPanel={<AuthVisualPanel />}
      formPanel={
        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "var(--space-4)", color: "var(--color-text-muted)" }}>Loading...</div>
        }>
          <ResetPasswordInner />
        </Suspense>
      }
    />
  );
}
