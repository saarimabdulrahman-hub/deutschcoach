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
  starter: "border-emerald-600",
  plus: "border-blue-600",
  pro: "border-purple-600",
};

const TIER_HIGHLIGHT: Record<string, string> = {
  starter: "bg-emerald-600/10",
  plus: "bg-blue-600/10",
  pro: "bg-purple-600/10",
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
      // Delegate to parent (e.g., signup flow which calls signup first, then checkout)
      onSelect(tier, billingCycle);
      return;
    }

    // Standalone mode: handle checkout internally (e.g., upgrading from settings)
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
        <p className="text-neutral-400">Loading plans...</p>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-neutral-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            Annual
            <span className="ml-1 text-emerald-400 text-xs">Save up to 25%</span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = getDisplayPrice(plan);
          const monthlyEq = getMonthlyEquivalent(plan);
          const savings = getSavings(plan);
          const isAnnual = billingCycle === "annual";

          return (
            <div
              key={plan.tier}
              className={`rounded-xl border-2 ${TIER_COLORS[plan.tier] || "border-neutral-700"} bg-neutral-900 p-6 flex flex-col`}
            >
              <div
                className={`-mx-6 -mt-6 px-6 py-4 rounded-t-xl ${TIER_HIGHLIGHT[plan.tier] || "bg-neutral-800"} mb-4`}
              >
                <h3 className="text-lg font-bold text-white capitalize">
                  {plan.tier}
                </h3>
                <p className="text-neutral-400 text-sm mt-1">
                  Levels: {plan.levels.join(", ")}
                </p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">
                  ${price}
                  <span className="text-base font-normal text-neutral-400">
                    {isAnnual ? "/yr" : "/mo"}
                  </span>
                </p>
                {isAnnual && (
                  <p className="text-sm text-neutral-400">
                    ${monthlyEq}/mo equivalent
                  </p>
                )}
                {isAnnual && savings > 0 && (
                  <p className="text-sm text-emerald-400 font-medium">
                    Save {savings}%
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="text-neutral-300 text-sm flex items-start gap-2"
                  >
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">
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
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                  plan.tier === "pro"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : plan.tier === "plus"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
        <p className="text-red-400 text-sm text-center mt-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
