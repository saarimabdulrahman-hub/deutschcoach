/**
 * Stepper — Multi-step form wizard with progress indicator
 * Reference: 13_FORMS_AND_VALIDATION_BIBLE/004_Multi_Step_Forms.md
 */

"use client";

import type { ReactNode } from "react";

interface Step {
  key: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  canNext?: boolean;
  loading?: boolean;
}

export function Stepper({
  steps, currentStep, children, onNext, onBack,
  isFirst, isLast, canNext = true, loading,
}: StepperProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <style>{`@media (max-width: 639px) { .stepper-label { display: none; } }`}</style>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {steps.map((step, i) => {
          const completed = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: i < steps.length - 1 ? 1 : undefined }}>
              <div
                aria-current={active ? "step" : undefined}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--type-label-sm)", fontWeight: 700, flexShrink: 0,
                  background: completed ? "var(--color-accent)" : active ? "var(--color-accent-gradient)" : "var(--color-surface-1)",
                  color: completed || active ? "#fff" : "var(--color-text-muted)",
                  border: completed || active ? "none" : "1px solid var(--color-border-subtle)",
                  transition: "all var(--duration-normal) ease",
                }}
              >
                {completed ? "✓" : i + 1}
              </div>
              <span className="stepper-label" style={{
                fontSize: "var(--type-label-sm)", fontWeight: active ? 600 : 400,
                color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
              }}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: completed ? "var(--color-accent)" : "var(--color-border-subtle)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border-subtle)" }}>
        {!isFirst ? (
          <button onClick={onBack} disabled={loading}
            style={{
              padding: "10px 20px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-subtle)", background: "transparent",
              color: "var(--color-text-secondary)", fontSize: "var(--type-body-md)",
              fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.4 : 1,
            }}>
            ← Back
          </button>
        ) : <div />}

        <button onClick={onNext} disabled={!canNext || loading}
          style={{
            padding: "10px 24px", borderRadius: "var(--radius-md)",
            border: "none", background: canNext && !loading ? "var(--color-accent-gradient)" : "var(--color-surface-1)",
            color: canNext && !loading ? "#fff" : "var(--color-text-muted)",
            fontSize: "var(--type-body-md)", fontWeight: 600,
            cursor: canNext && !loading ? "pointer" : "not-allowed", opacity: canNext ? 1 : 0.4,
            boxShadow: canNext && !loading ? "0 4px 14px var(--color-accent-glow)" : "none",
          }}>
          {isLast ? "Complete" : loading ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}
