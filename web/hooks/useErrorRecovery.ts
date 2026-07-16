/**
 * useErrorRecovery — Centralized error categorization + retry with exponential backoff
 * Reference: 14_ENTERPRISE_UX_PATTERNS/007_Autosave_Recovery.md
 */

"use client";

import { useState, useCallback, useRef } from "react";

export type ErrorCategory = "network" | "validation" | "server" | "auth" | "unknown";

interface ErrorState {
  message: string;
  category: ErrorCategory;
  retryCount: number;
}

export function useErrorRecovery(maxRetries = 3) {
  const [error, setError] = useState<ErrorState | null>(null);
  const [recovering, setRecovering] = useState(false);
  const retryCountRef = useRef(0);

  const categorizeError = useCallback((err: any): ErrorCategory => {
    if (!err) return "unknown";
    if (err instanceof TypeError && err.message === "Failed to fetch") return "network";
    if (err?.status === 401 || err?.status === 403) return "auth";
    if (err?.status && err.status >= 500) return "server";
    if (err?.status === 422 || err?.status === 400) return "validation";
    if (err?.message?.includes("network") || err?.message?.includes("fetch")) return "network";
    return "unknown";
  }, []);

  const handleError = useCallback((err: any) => {
    const category = categorizeError(err);
    const message = err?.message || err?.detail || "An unexpected error occurred.";
    retryCountRef.current = 0;
    setError({ message, category, retryCount: 0 });
  }, [categorizeError]);

  const retry = useCallback(async (fn: () => Promise<any>): Promise<any> => {
    if (!error) return;
    setRecovering(true);
    retryCountRef.current += 1;

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = Math.min(1000 * Math.pow(2, error.retryCount), 8000);
    await new Promise((r) => setTimeout(r, delay));

    try {
      const result = await fn();
      setError(null);
      setRecovering(false);
      retryCountRef.current = 0;
      return result;
    } catch (newErr: any) {
      const nextRetryCount = error.retryCount + 1;
      if (nextRetryCount >= maxRetries) {
        setError({ ...error, retryCount: nextRetryCount });
        setRecovering(false);
        return null;
      }
      setError({ ...error, retryCount: nextRetryCount });
      setRecovering(false);
      // Auto-retry with backoff
      return retry(fn);
    }
  }, [error, maxRetries]);

  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, []);

  return {
    error,
    recovering,
    handleError,
    retry,
    clearError,
    canRetry: error !== null && error.retryCount < maxRetries,
  };
}
