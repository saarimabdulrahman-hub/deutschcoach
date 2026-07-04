"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import SignupForm from "@/components/auth/SignupForm";
import TierSelector from "@/components/auth/TierSelector";

type SignupStep = "register" | "tiers";

export default function SignupPage() {
  const { user, isLoading, signup } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<SignupStep>("register");
  const [signupData, setSignupData] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Step 1: Collect name/email/password ONLY (do not create account yet)
  function handleRegister(name: string, email: string, password: string) {
    setSignupData({ name, email, password });
    setStep("tiers");
  }

  // Step 2: On tier select, create account then redirect to Stripe checkout
  async function handleTierSelect(tier: string, billingCycle: string) {
    if (!signupData) return;
    setTierError(null);
    try {
      // Create the account first
      await signup(signupData.name, signupData.email, signupData.password);

      // Then initiate Stripe checkout
      const result = await api.post<{ url: string }>("/payments/checkout", {
        tier,
        billing_cycle: billingCycle,
      });
      window.location.href = result.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setTierError(message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  // If already logged in, show nothing while redirecting
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-neutral-950 pointer-events-none" />

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {step === "register" ? "Create your account" : "Choose your plan"}
        </h1>
        <p className="text-neutral-400 text-center mb-8">
          {step === "register"
            ? "Start your free 7-day trial. No credit card required."
            : "All plans include a 7-day free trial. Cancel anytime."}
        </p>

        {/* Register step */}
        {step === "register" && (
          <div className="max-w-md mx-auto bg-neutral-900/80 backdrop-blur-sm rounded-xl p-8 border border-neutral-800 shadow-2xl">
            <SignupForm onComplete={handleRegister} />

            <p className="text-neutral-400 text-center mt-6 text-sm">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        )}

        {/* Tier selection step */}
        {step === "tiers" && (
          <div>
            {tierError && (
              <p className="text-red-400 text-sm text-center mb-4" role="alert">
                {tierError}
              </p>
            )}
            <TierSelector onSelect={handleTierSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
