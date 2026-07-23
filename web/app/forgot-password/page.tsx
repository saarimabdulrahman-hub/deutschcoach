"use client";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      visualPanel={<AuthVisualPanel />}
      formPanel={<ForgotPasswordForm />}
    />
  );
}
