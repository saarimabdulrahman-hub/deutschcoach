"use client";

import { useCallback, useMemo, useState } from "react";
import type { InteractionControllerConfig, InteractionItem, InteractionPhase } from "./types";

// State machine for any interactive lesson stage (Vocabulary, Grammar, Practice,
// Mini Review). One hook replaces the bespoke index-flip-reveal logic that each
// stage previously duplicated. Configuration-driven — no branched if-else by type.

export interface InteractionController {
  // Data
  items: InteractionItem[];
  current: InteractionItem;
  index: number;
  total: number;
  phase: InteractionPhase;

  // Navigation
  goNext: () => void;
  goPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Interaction
  reveal: () => void;
  retry: () => void;
  skip: () => void;
  submit: () => void;
  requestHint: () => void;

  // Completion
  isLast: boolean;
  isDone: boolean;          // true when all items revealed / completed
  completedCount: number;
  finish: () => void;

  // Internal
  setIndex: (i: number) => void;
}

export function useInteractionController(config: InteractionControllerConfig): InteractionController {
  const { items, mode, initialIndex = 0, onComplete, onReveal, onSkip } = config;
  const [index, setIndex] = useState(initialIndex);
  const [phases, setPhases] = useState<InteractionPhase[]>(() => items.map(() => "idle"));
  const [done, setDone] = useState(false);

  const setPhase = useCallback((i: number, p: InteractionPhase) => {
    setPhases((prev) => { const n = [...prev]; n[i] = p; return n; });
  }, []);

  const current = items[index] ?? items[0];
  const phase = phases[index] ?? "idle";
  const total = items.length;
  const isLast = index >= total - 1 || done;

  const completedCount = phases.filter((p) => p === "completed" || p === "revealed").length;
  const canGoNext = phase === "completed" || phase === "revealed" || phase === "skipped";
  const canGoPrev = index > 0;

  const reveal = useCallback(() => {
    setPhase(index, "revealed");
    onReveal?.(index);
    // flashcard/expand also count as revealed
  }, [index, setPhase, onReveal]);

  const retry = useCallback(() => {
    setPhase(index, "idle");
  }, [index, setPhase]);

  const skip = useCallback(() => {
    setPhase(index, "skipped");
    onSkip?.(index);
  }, [index, setPhase, onSkip]);

  const submit = useCallback(() => {
    setPhase(index, "completed");
    onComplete?.(index);
  }, [index, setPhase, onComplete]);

  const requestHint = useCallback(() => {
    setPhase(index, "hint");
  }, [index, setPhase]);

  const finish = useCallback(() => setDone(true), []);

  const goNext = useCallback(() => {
    if (isLast) { finish(); return; }
    setIndex((i) => i + 1);
  }, [isLast, finish]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  return useMemo(() => ({
    items, current, index, total, phase,
    goNext, goPrev, canGoNext, canGoPrev,
    reveal, retry, skip, submit, requestHint,
    isLast, isDone: done, completedCount, finish,
    setIndex,
  }), [items, current, index, total, phase, goNext, goPrev, canGoNext, canGoPrev, reveal, retry, skip, submit, requestHint, isLast, done, completedCount, finish, setIndex]);
}
