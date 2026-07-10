"use client";

import { useState, useEffect } from "react";
import type { Plan } from "@/types";
import { api } from "@/lib/api";

type BillingCycle = "monthly" | "annual";

interface TierSelectorProps {
  onSelect: (tier: string, billingCycle: BillingCycle) => void;
  /** If true, the component handles checkout internally (for upgrading from within the app).
   *  If false/omitted, it delegates to onSelect (for signup flow). */
  standalone?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  starter: "var(--color-success)",
  plus: "var(--color-accent)",
  pro: "var(--color-accent-dark)",
};

const TIER_HIGHLIGHT: Record<string, string> = {
  starter: "var(--color-active-bg)",
  plus: "var(--color-active-bg)",
  pro: "var(--color-active-bg)",
};

export default function TierSelector({ onSelect, standalone = false }: TierSelectorProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingTier, setSubmittingTier] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Plan[]>("/payments/plans")
      .then((data) => {
        setPlans(data);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load plans."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function getDisplayPrice(plan: Plan): number {
    if (billingCycle === "annual") {
      return plan.annual_price;
    }
    return plan.monthly_price;
  }

  function getMonthlyEquivalent(plan: Plan): number {
    if (billingCycle === "annual") {
      return Math.round(plan.annual_price / 12);
    }
    return plan.monthly_price;
  }

  function getSavings(plan: Plan): number {
    const annualMonthly = plan.annual_price / 12;
    const monthly = plan.monthly_price;
    return Math.round((1 - annualMonthly / monthly) * 100);
  }

  async function handleSelect(tier: string) {
    if (!standalone) {
      onSelect(tier, billingCycle);
      return;
    }

    setSubmittingTier(tier);
    try {
      const result = await api.post<{ url: string }>("/payments/checkout", {
        tier,
        billing_cycle: billingCycle,
      });
      window.location.href = result.url;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      setSubmittingTier(null);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--color-text-muted)" }}>Loading plans...</p>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--color-error-text)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg p-1" style={{ background: "var(--color-card-bg)" }}>
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? ""
                : "hover:text-slate-300"
            }`}
            style={
              billingCycle === "monthly"
                ? { background: "var(--color-border)", color: "var(--color-text)" }
                : { color: "var(--color-text-muted)" }
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? ""
                : "hover:text-slate-300"
            }`}
            style={
              billingCycle === "annual"
                ? { background: "var(--color-border)", color: "var(--color-text)" }
                : { color: "var(--color-text-muted)" }
            }
          >
            Annual
            <span className="ml-1 text-xs" style={{ color: "var(--color-active-text)" }}>Save up to 25%</span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = getDisplayPrice(plan);
          const monthlyEq = getMonthlyEquivalent(plan);
          const savings = getSavings(plan);
          const isAnnual = billingCycle === "annual";
          const tierColor = TIER_COLORS[plan.tier] || "var(--color-accent)";
          const tierHighlight = TIER_HIGHLIGHT[plan.tier] || "var(--color-active-bg)";

          return (
            <div
              key={plan.tier}
              className="rounded-xl p-6 flex flex-col transition-all duration-200"
              style={{
                background: "var(--color-card-bg)",
                border: `2px solid ${plan.tier === "pro" ? "var(--color-accent-dark)" : "var(--color-border)"}`,
                boxShadow: plan.tier === "pro" ? "0 0 20px var(--color-accent-glow)" : undefined,
              }}
            >
              <div
                className="-mx-6 -mt-6 px-6 py-4 rounded-t-xl mb-4"
                style={{ background: tierHighlight }}
              >
                <h3 className="text-lg font-bold capitalize" style={{ color: "var(--color-text)" }}>
                  {plan.tier}
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                  Levels: {plan.levels.join(", ")}
                </p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                  ${price}
                  <span className="text-base font-normal" style={{ color: "var(--color-text-muted)" }}>
                    {isAnnual ? "/yr" : "/mo"}
                  </span>
                </p>
                {isAnnual && (
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    ${monthlyEq}/mo equivalent
                  </p>
                )}
                {isAnnual && savings > 0 && (
                  <p className="text-sm font-medium" style={{ color: tierColor }}>
                    Save {savings}%
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-success)" }}>
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                disabled={submittingTier !== null}
                onClick={() => handleSelect(plan.tier)}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{
                  color: "var(--color-text)",
                  background:
                    plan.tier === "pro"
                      ? "var(--color-accent-gradient)"
                      : plan.tier === "plus"
                        ? "var(--color-accent-gradient)"
                        : "var(--color-success)",
                  boxShadow: plan.tier === "pro"
                    ? "0 4px 14px var(--color-accent-glow)"
                    : "0 4px 14px rgba(0,0,0,0.2)",
                }}
              >
                {submittingTier === plan.tier
                  ? "Redirecting..."
                  : "Start 7-Day Free Trial"}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          className="mt-4 p-3 rounded-xl text-sm flex items-center gap-3 justify-center"
          style={{
            background: "var(--color-error-bg)",
            border: "1px solid var(--color-error-border)",
            color: "var(--color-error-text)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-error-text)" }} />
          {error}
        </div>
      )}
    </div>
  );
}
