"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Plan } from "@/types";

export function SubscriptionSection() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [portalMsg, setPortalMsg] = useState("");

  const currentTier = user?.subscription_tier || "free";

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await api.get<Plan[]>("/payments/plans");
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-active-bg)",
          border: "1px solid var(--color-badge-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-active-text)" }}>
          You are on the{" "}
          <span className="font-semibold capitalize">{currentTier}</span> plan.
        </p>
      </div>

      {/* Upgrade options (only if free tier) */}
      {currentTier === "free" && (
        <div>
          <h3 className="text-md font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Available Plans
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl animate-pulse"
                  style={{ background: "var(--color-border)" }}
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No plans available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans
                .filter((p) => p.tier !== "free")
                .map((plan) => (
                  <div
                    key={plan.tier}
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--color-page-bg)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div className="font-semibold capitalize mb-2" style={{ color: "var(--color-text)" }}>
                      {plan.tier}
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
                      ${plan.monthly_price}
                      <span className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                        /mo
                      </span>
                    </div>
                    {plan.annual_price > 0 && (
                      <div className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                        ${plan.annual_price}/year
                      </div>
                    )}
                    <ul className="text-xs space-y-1 mb-4" style={{ color: "var(--color-text-muted)" }}>
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span style={{ color: "var(--color-success)" }}>&check;</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        color: "var(--color-text)",
                        background: "var(--color-accent-gradient)",
                        boxShadow: "0 4px 14px var(--color-accent-glow)",
                      }}
                    >
                      Upgrade
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Billing */}
      <div className="pt-4 space-y-3" style={{ borderTop: "1px solid var(--color-border)" }}>
        <button
          onClick={() => setPortalMsg("Stripe Customer Portal will be available once you set up your Stripe keys.")}
          className="text-sm hover:underline"
          style={{ color: "var(--color-active-text)" }}
        >
          Manage Billing →
        </button>
        {portalMsg && (
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{portalMsg}</p>
        )}

        <div>
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-sm hover:text-red-300 underline"
              style={{ color: "var(--color-error-text)" }}
            >
              Cancel Subscription
            </button>
          ) : (
            <div
              className="rounded-xl p-3"
              style={{
                background: "var(--color-error-bg)",
                border: "1px solid var(--color-error-border)",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "var(--color-error-text)" }}>
                Are you sure you want to cancel your subscription?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setPortalMsg("Subscription cancellation will be available once Stripe is configured.");
                  }}
                  className="px-3 py-1 rounded text-xs font-medium transition-colors"
                  style={{ background: "#dc2626", color: "#fff" }}
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{ background: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
