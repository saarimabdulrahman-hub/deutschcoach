/**
 * OnboardingWizard — Multi-step onboarding for new users
 * Steps: Profile → Placement → Goals → Complete
 * Reference: 05_INTERACTION_PATTERNS/002_Onboarding_Flow.md
 */

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";

const STEPS = [
  { key: "profile", label: "Profile" },
  { key: "placement", label: "Level" },
  { key: "goals", label: "Goals" },
];

const LEVELS = [
  { key: "A1", label: "A1 - Beginner", desc: "No prior knowledge" },
  { key: "A2", label: "A2 - Elementary", desc: "Basic phrases and expressions" },
  { key: "B1", label: "B1 - Intermediate", desc: "Can handle everyday situations" },
  { key: "B2", label: "B2 - Upper Intermediate", desc: "Fluent in familiar contexts" },
  { key: "C1", label: "C1 - Advanced", desc: "Near-native proficiency" },
];

const GOAL_MINUTES = [5, 10, 15, 30];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File[]>([]);
  const [level, setLevel] = useState<string>("");
  const [dailyGoal, setDailyGoal] = useState(10);
  const [loading, setLoading] = useState(false);

  const canNext = step === 0 ? name.trim().length > 0
    : step === 1 ? level !== ""
    : true;

  const handleComplete = useCallback(async () => {
    setLoading(true);
    try {
      // Save onboarding preferences via API
      // await api.post("/onboarding/complete", { name, level, dailyGoal });
      // For now, just redirect
      router.push("/dashboard");
    } catch {
      // Fallback — still let them through
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [name, level, dailyGoal, router]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleComplete();
  }, [step, handleComplete]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--type-heading-md)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Tell us about yourself</h2>
            <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: 0 }}>We'll personalise your learning experience.</p>

            <FileUpload
              accept="image/*"
              maxSizeMB={5}
              onFilesSelected={setAvatarFile}
              label="Upload a profile photo (optional)"
              multiple={false}
            />

            <Input
              label="Your name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        );

      case 1:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--type-heading-md)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>What's your German level?</h2>
            <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: 0 }}>Don't worry — you can change this anytime.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {LEVELS.map((l) => (
                <button key={l.key} onClick={() => setLevel(l.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                    padding: "14px 16px", borderRadius: "var(--radius-md)",
                    border: level === l.key ? "1px solid var(--color-accent)" : "1px solid var(--color-border-subtle)",
                    background: level === l.key ? "var(--color-hover-bg)" : "var(--color-surface-1)",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "all var(--duration-fast) ease",
                  }}
                >
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    border: level === l.key ? "6px solid var(--color-accent)" : "2px solid var(--color-border-subtle)",
                    flexShrink: 0,
                    transition: "all var(--duration-fast) ease",
                  }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "var(--type-body-md)", fontWeight: 600, color: "var(--color-text-primary)" }}>{l.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontSize: "var(--type-heading-md)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Set your daily goal</h2>
            <p style={{ fontSize: "var(--type-body-md)", color: "var(--color-text-secondary)", margin: 0 }}>How much time can you commit each day?</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
              {GOAL_MINUTES.map((m) => (
                <button key={m} onClick={() => setDailyGoal(m)}
                  style={{
                    padding: "var(--space-4) var(--space-2)",
                    borderRadius: "var(--radius-md)",
                    border: dailyGoal === m ? "1px solid var(--color-accent)" : "1px solid var(--color-border-subtle)",
                    background: dailyGoal === m ? "var(--color-hover-bg)" : "var(--color-surface-1)",
                    cursor: "pointer", textAlign: "center",
                    transition: "all var(--duration-fast) ease",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "var(--type-heading-lg)", fontWeight: 700, color: dailyGoal === m ? "var(--color-accent-text)" : "var(--color-text-primary)" }}>{m}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "var(--type-label-sm)", color: "var(--color-text-muted)" }}>min/day</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "var(--space-6)" }}>
      <Stepper
        steps={STEPS}
        currentStep={step}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={step === 0}
        isLast={step === STEPS.length - 1}
        canNext={canNext}
        loading={loading}
      >
        {renderStep()}
      </Stepper>
    </div>
  );
}
