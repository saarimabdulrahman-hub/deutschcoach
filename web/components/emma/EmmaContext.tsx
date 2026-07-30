"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

// The lesson context Emma receives — she always knows this.

export interface EmmaLessonContext {
  lessonTitle: string;
  stage: string;             // current stage key (e.g. "dialogue", "vocabulary")
  stageLabel: string;        // human label ("Dialogue", "Vocabulary")
  vocabulary?: string[];     // word list
  weakWords?: string[];      // learner's weakest words (Phase 4 adaptive hints)
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

  // Analytics: fire event when Emma panel is opened
  const handleSetOpen = useCallback((v: boolean) => {
    setOpen(v);
    if (v) {
      api.post("/analytics/event", {
        event_type: "emma_opened",
        stage: context.stage || undefined,
        payload: { lesson_title: context.lessonTitle },
      }).catch(() => {});
    }
  }, [context.stage, context.lessonTitle]);

  const send = useCallback((text: string) => {
    const now = Date.now();
    setMessages((prev) => [...prev, { id: `u-${now}`, role: "learner", text, timestamp: now }]);
    setIsTyping(true);

    // Analytics: track Emma hint/question with source context
    api.post("/analytics/event", {
      event_type: "emma_question",
      stage: context.stage || undefined,
      payload: {
        question_preview: text.slice(0, 120),
        lesson_title: context.lessonTitle,
        stage_label: context.stageLabel,
      },
    }).catch(() => {});

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
    <EmmaContext.Provider value={{ open, setOpen: handleSetOpen, context, setContext, messages, send, clear, isTyping }}>
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

  if (lower.includes("learning tip") || lower.includes("proactive") || lower.includes("tip for me")) {
    const stage = ctx.stageLabel || "this lesson";
    const tips: Record<string, string> = {
      "welcome": "Take a moment to read the objectives — knowing what you'll learn helps your brain prepare. 🧠",
      "listen": "Don't worry about understanding every word. Focus on the rhythm and sounds of German. Your ear needs training too!",
      "dialogue": "Read each line aloud after you hear it. Moving your mouth helps lock in the pronunciation. 🗣️",
      "vocabulary": "Try making a mental image for each word. Visual associations are stronger than translations. 🖼️",
      "grammar": "Look for patterns instead of memorizing rules. German grammar is logical — once you see the pattern, it sticks. 🔍",
      "pronounce": "Record yourself and compare. Your ears hear differences your brain might miss at first. 🎤",
      "practice": "Mistakes are part of learning. Each wrong answer teaches your brain what to look for next time. 💪",
    };
    const tip = tips[ctx.stage] ?? tips[stage.toLowerCase()] ?? `Keep going! You're building your German skills one step at a time. 🌱`;
    return `Here's a tip for the **${ctx.stageLabel}** stage:\n\n${tip}`;
  }

  if (lower.includes("pronunciation tip") || lower.includes("pronounce better")) {
    const word = ctx.vocabulary?.[0] ?? "German words";
    return `Great question about pronunciation! Here are some tips for **${word}**:\n\n1. **Listen first** — hear the word before trying to say it.\n2. **Break it down** — say each syllable slowly.\n3. **Exaggerate** — German sounds are clearer than English. Make your mouth move!\n4. **Practice in front of a mirror** — watch your lip shape.\n\nThe German \"ch\" sound (like in *ich*) is made with your tongue near the roof of your mouth — almost like a cat hiss. 🐱`;
  }

  if (lower.includes("adaptive") || lower.includes("focus on") || lower.includes("what should i review")) {
    const weak = ctx.weakWords ?? [];
    if (weak.length > 0) {
      const top3 = weak.slice(0, 3);
      return `Based on your progress, here are the words to focus on:\n\n${top3.map((w) => `• **${w}**`).join("\n")}\n\nThese words need extra practice. Try creating a sentence with each one, or ask me for an example. I'll help you with any of them! 🎯`;
    }
    if (ctx.vocabulary && ctx.vocabulary.length > 0) {
      const pick = ctx.vocabulary[Math.floor(Math.random() * ctx.vocabulary.length)];
      return `Let's review **${pick}** — try using it in a sentence! If you're unsure, I can give you an example. 💪`;
    }
    return "Keep reviewing the words from this lesson. Spaced repetition is key — a few minutes of review each day is more effective than cramming. 📚";
  }

  if (lower.includes("practice conversation") || lower.includes("talk to me") || lower.includes("conversation partner")) {
    const topics = ctx.vocabulary?.slice(0, 3).join(", ") ?? "the lesson topic";
    return `Let's practice! I'll start a conversation. You respond in German, and I'll keep going.\n\n**Emma:** Hallo! Wie geht es dir? 🎭\n\nNow you answer me in German — say something like "Mir geht es gut!" or whatever you'd like to say. I'll respond to whatever you write!`;
  }

  // Phase 4 — Adaptive hint: reference learner's weak words in any response when available
  if (ctx.weakWords && ctx.weakWords.length > 0 && lower.includes("hint")) {
    const word = ctx.weakWords[Math.floor(Math.random() * ctx.weakWords.length)];
    return `Since "${word}" is one of your words to practice, let's focus on that:\n\nThink about how you'd use "${word}" in a sentence from today's lesson. Try saying it out loud — the more you use a word, the stronger the memory becomes. 🔁`;
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

  // fallback — Emma guides, never answers out of nowhere (Section 12.13)
  return `Try looking at the word endings. 🌱`;
}

function breakSyllables(word: string): string {
  return word.replace(/([aeiouäöü])/gi, "$1·").replace(/·$/, "");
}
