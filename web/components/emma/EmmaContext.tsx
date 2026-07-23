"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// The lesson context Emma receives — she always knows this.

export interface EmmaLessonContext {
  lessonTitle: string;
  stage: string;             // current stage key (e.g. "dialogue", "vocabulary")
  stageLabel: string;        // human label ("Dialogue", "Vocabulary")
  vocabulary?: string[];     // word list
  grammarPattern?: string;   // pattern name (e.g. "ich heiße / du heißt")
  currentExercise?: string;  // current exercise question or item front
  progressStep?: number;     // current step number
  progressTotal?: number;    // total steps
}

export interface EmmaMessage {
  id: string;
  role: "learner" | "emma";
  text: string;
  timestamp: number;
}

interface EmmaContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  context: EmmaLessonContext;
  setContext: (ctx: EmmaLessonContext) => void;
  messages: EmmaMessage[];
  send: (text: string) => void;
  clear: () => void;
  isTyping: boolean;
}

const EmmaContext = createContext<EmmaContextValue | null>(null);

export function EmmaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<EmmaLessonContext>({ lessonTitle: "", stage: "", stageLabel: "" });
  const [messages, setMessages] = useState<EmmaMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const clear = useCallback(() => setMessages([]), []);

  const send = useCallback((text: string) => {
    const now = Date.now();
    setMessages((prev) => [...prev, { id: `u-${now}`, role: "learner", text, timestamp: now }]);
    setIsTyping(true);
    // v1: local response (streaming-ready — the delay simulates network latency
    // and provides the hook point for a real streamed LLM response).
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: `e-${Date.now()}`, role: "emma",
        text: generateEmmaResponse(text, context),
        timestamp: Date.now(),
      }]);
    }, 800);
  }, [context]);

  return (
    <EmmaContext.Provider value={{ open, setOpen, context, setContext, messages, send, clear, isTyping }}>
      {children}
    </EmmaContext.Provider>
  );
}

export function useEmma() {
  const ctx = useContext(EmmaContext);
  if (!ctx) throw new Error("useEmma must be used within EmmaProvider");
  return ctx;
}

// ── v1 Response Generator (local, no LLM — Emma voice, hint-ladder aware) ──

function generateEmmaResponse(userText: string, ctx: EmmaLessonContext): string {
  const lower = userText.toLowerCase();

  if (lower.includes("explain this") || lower.includes("explain grammar")) {
    if (ctx.grammarPattern) {
      const name = ctx.grammarPattern;
      return `**${name}** — let me break it down.\n\nYou use this when you want to say your name. The verb *heißen* changes depending on *who* is speaking:\n\n- **ich heiße** = I am called (talking about yourself)\n- **du heißt** = you are called (asking someone else)\n\nThink of it like a tiny switch: *ich* takes **-e**, *du* takes **-t**. You'll see this same switch on many German verbs. Today, these two are enough. 👍`;
    }
    return "Right now there isn't a specific grammar pattern for this stage. But I'm here — ask me anything about German and I'll help you through it.";
  }

  if (lower.includes("give another example") || lower.includes("example")) {
    const words = (ctx.vocabulary ?? []).slice(0, 2).join(", ");
    const pattern = ctx.grammarPattern ?? "the pattern from this lesson";
    if (ctx.stage === "vocabulary" || ctx.stage === "grammar") {
      return `Here's another way to use ${words || "today's words"}:\n\n> **"Anna, wie heißt du?"**  \n> **"Ich heiße Anna. Freut mich!"**\n\nTry swapping in your own name. The shape is always *Ich heiße …* — the verb comes second.`;
    }
    return `Here's another example with ${pattern}:\n\n> **"Guten Tag! Ich heiße Ben. Wie heißt du?"**\n> **"Hallo! Ich heiße [your name]."**\n\nTry it — drop your name after *heiße*. There's no wrong name!`;
  }

  if (lower.includes("pronounce") || lower.includes("say this")) {
    const w = ctx.vocabulary?.[0] ?? "Hallo";
    return `Let's say **${w}**:\n\n*${breakSyllables(w)}*\n\n- The **${w[0]}** is clear — don't skip it.\n- Keep your mouth relaxed.\n\nTry it out loud. Even if it feels funny — that's how your mouth learns the new shape. Every German speaker started here.`;
  }

  if (lower.includes("why is this correct") || lower.includes("why correct")) {
    return "Great question — asking *why* is how you really learn.\n\nIf you just answered an exercise and got it right, it's because you applied the pattern correctly. If you're unsure which pattern, tap **Explain grammar** and I'll walk you through it.";
  }

  if (lower.includes("stuck") || lower.includes("help") || lower.includes("hint")) {
    if (ctx.currentExercise) {
      return `No worries — let's look at it together.\n\nThe question is: *${ctx.currentExercise}*\n\nThink about the verb… it changes with *who* is speaking:\n- **ich** → -e\n- **du** → -t\n\nGive it a try — I'll wait. 🙂`;
    }
    return `Take a breath. You're at the **${ctx.stageLabel}** stage. ${ctx.stage === "vocabulary" ? "Just meet the words — no pressure to memorise yet. Tap to flip each card." : "Look for the pattern you already saw in the dialogue — you've got this."}`;
  }

  if (lower.includes("translate")) {
    const sample = ctx.vocabulary?.[0];
    if (sample) return `**${sample}** — it means "${ctx.vocabulary?.join?.(" / ") ?? sample}".\n\nEvery word in today's lesson is from the dialogue you just read. Flip any card to see its meaning.`;
    return "Type a German word from today's lesson and I'll translate it for you — with an example.";
  }

  // fallback — Emma guides, never answers out of nowhere
  return `I'm here to help. You're working on **${ctx.lessonTitle}** (${ctx.stageLabel}).\n\nTry one of the quick actions below, or tell me what you're wondering about. I'll always nudge you toward the answer rather than handing it over. 🌱`;
}

function breakSyllables(word: string): string {
  return word.replace(/([aeiouäöü])/gi, "$1·").replace(/·$/, "");
}
