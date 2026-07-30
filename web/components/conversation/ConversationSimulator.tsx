"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWordSpeech } from "@/hooks/useSpeech";
import { useRecorder } from "@/components/audio/useRecorder";
import { SCENES, type ConversationScene } from "./conversationScenes";

// Conversation Simulator (Section 11.2). Emma role-play with predefined
// real-world scenarios. Supports typed and spoken responses with feedback.

interface Exchange {
  speaker: "emma" | "learner";
  text: string;
  feedback?: string;
}

export function ConversationSimulator() {
  const { speak, speaking } = useWordSpeech();
  const recorder = useRecorder(30);
  const inputRef = useRef<HTMLInputElement>(null);

  const [scene, setScene] = useState<ConversationScene | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startScene = useCallback((s: ConversationScene) => {
    setScene(s);
    setExchanges([{ speaker: "emma", text: s.openingLine }]);
    setInput("");
    setFeedback(null);
    speak(s.openingLine, "de-DE");
  }, [speak]);

  const sendResponse = useCallback(async (text: string) => {
    if (!scene || !text.trim() || waiting) return;

    setInput("");
    setWaiting(true);
    const newExchanges: Exchange[] = [...exchanges, { speaker: "learner", text }];
    setExchanges(newExchanges);

    // Generate Emma's response + feedback via the chat API
    try {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ reply: string }>("/emma/chat", {
        message: text,
        context: {
          lesson_title: `Conversation: ${scene.title}`,
          stage: "conversation",
          stage_label: scene.title,
          vocabulary: [],
          grammar_pattern: null,
        },
        history: newExchanges.slice(-10).map((e) => ({
          role: e.speaker === "emma" ? "emma" : "learner",
          text: e.text,
        })),
        prompt_version: "conversation-v1",
      });

      // Parse Emma-generated feedback from "Tip:" marker
      const tipIdx = res.reply.lastIndexOf("Tip:");
      let reply: string;
      let fb: string | undefined;
      if (tipIdx >= 0) {
        reply = res.reply.slice(0, tipIdx).trim();
        fb = res.reply.slice(tipIdx + 4).trim();
      } else {
        reply = res.reply;
        fb = generateLocalTip(text, scene);
      }

      setExchanges((prev) => [...prev, { speaker: "emma", text: reply, feedback: fb }]);
      setFeedback(fb || null);
      speak(reply, "de-DE");
    } catch {
      // Local fallback (API unavailable)
      const reply = generateLocalReply(text, scene);
      const fb = generateLocalTip(text, scene);
      setExchanges((prev) => [...prev, { speaker: "emma", text: reply, feedback: fb }]);
      setFeedback(fb);
      speak(reply, "de-DE");
    }
    setWaiting(false);
  }, [scene, exchanges, waiting, speak]);

  const handleRecord = useCallback(() => {
    if (recorder.phase === "recording") {
      recorder.stopRecording();
    } else {
      recorder.startRecording();
    }
  }, [recorder]);

  useEffect(() => {
    if (recorder.phase === "review" && recorder.blob) {
      const url = URL.createObjectURL(recorder.blob);
      const audio = new Audio(url);
      audio.play();
      // Transcribe is simulated — use the last input or a default
      const spokenText = input || "Ich habe gesprochen";
      sendResponse(spokenText);
      recorder.reset();
    }
  }, [recorder.phase, recorder.blob, input, sendResponse, recorder]);

  if (!scene) {
    return (
      <div className="max-w-lg mx-auto py-4">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
          Conversation Practice 🎭
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Choose a scenario to practice realistic German conversations with Emma.
        </p>
        <div className="space-y-2">
          {SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => startScene(s)}
              className="w-full text-left p-4 rounded-xl transition-all border cursor-pointer hover:scale-[1.01]"
              style={{ background: "var(--color-card-bg)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    Role: {s.role} · {s.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{scene.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{scene.title}</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Role: {scene.role}</p>
        </div>
        <button
          onClick={() => { setScene(null); setExchanges([]); setFeedback(null); }}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
          style={{ color: "var(--color-text-muted)" }}
        >
          ✕ Exit
        </button>
      </div>

      {/* Conversation */}
      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
        {exchanges.map((ex, i) => (
          <div key={i}>
            <div className={`flex ${ex.speaker === "emma" ? "justify-start" : "justify-end"}`}>
              <div
                className="rounded-xl px-4 py-2.5 max-w-[80%]"
                style={{
                  background: ex.speaker === "emma" ? "rgba(168,85,247,0.08)" : "var(--color-card-bg)",
                  border: `1px solid ${ex.speaker === "emma" ? "rgba(168,85,247,0.15)" : "var(--color-border)"}`,
                }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: ex.speaker === "emma" ? "var(--color-accent-light)" : "var(--color-text-muted)" }}>
                  {ex.speaker === "emma" ? `Emma (${scene.role})` : "You"}
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{ex.text}</p>
              </div>
            </div>
            {/* Feedback after Emma's responses */}
            {ex.speaker === "emma" && ex.feedback && (
              <div className="mt-1 mx-2">
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{ex.feedback}</p>
              </div>
            )}
          </div>
        ))}
        {waiting && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-2.5" style={{ background: "rgba(168,85,247,0.06)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Emma is thinking…</p>
            </div>
          </div>
        )}
      </div>

      {/* Feedback display */}
      {feedback && !waiting && (
        <div className="rounded-xl p-3 mb-3" style={{ background: "var(--color-hover-bg)", border: "1px solid var(--color-badge-bg)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-accent-light)" }}>
            💡 Improvement Tip
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{feedback}</p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) sendResponse(input); }}
          placeholder="Type your response in German…"
          disabled={waiting}
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
          style={{ background: "var(--color-page-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
        />
        <button
          onClick={() => input.trim() && sendResponse(input)}
          disabled={waiting || !input.trim()}
          className="min-h-[44px] px-4 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-40"
          style={{ background: "var(--color-accent-gradient)", color: "#fff" }}
        >
          Send
        </button>
        <button
          onClick={handleRecord}
          className="min-h-[44px] w-[44px] rounded-xl flex items-center justify-center border-none cursor-pointer"
          style={{ background: recorder.phase === "recording" ? "rgba(255,71,87,0.15)" : "var(--color-card-bg)", color: recorder.phase === "recording" ? "#FF6B77" : "var(--color-text-muted)" }}
          aria-label={recorder.phase === "recording" ? "Stop recording" : "Record speech"}
        >
          {recorder.phase === "recording" ? "⏹" : "🎤"}
        </button>
      </div>
      <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-muted)" }}>
        Type in German or tap 🎤 to speak. Emma will respond and give feedback.
      </p>
    </div>
  );
}

// ── Local fallback responses ────────────────────────────────────────────

function generateLocalReply(text: string, scene: ConversationScene): string {
  const replies: Record<string, string[]> = {
    "ordering-food": [
      "Sehr gute Wahl! Möchtest du auch etwas zu trinken?",
      "Natürlich! Kommt sofort. Noch etwas?",
      "Gerne! Ich bringe es dir gleich.",
    ],
    "buying-ticket": [
      "Einzelfahrt oder Hin- und Rückfahrt?",
      "Das kostet 12 Euro. Erste oder zweite Klasse?",
      "Hier ist dein Ticket. Gute Reise!",
    ],
    "introducing-yourself": [
      "Schön, dich kennenzulernen! Woher kommst du?",
      "Freut mich! Was machst du beruflich?",
      "Das ist interessant! Magst du Deutsch lernen?",
    ],
    "asking-directions": [
      "Geh geradeaus und dann links. Es ist nur fünf Minuten entfernt.",
      "Ja, das ist ganz in der Nähe. Biegen Sie rechts ab.",
      "Nimm die U-Bahn bis zum Hauptbahnhof. Von dort sind es zwei Minuten zu Fuß.",
    ],
  };
  const randomReply = (replies[scene.id] ?? ["Interessant! Erzähl mir mehr."])[Math.floor(Math.random() * 3)];
  return randomReply;
}

function generateLocalTip(_text: string, _scene: ConversationScene): string {
  return "Try to use complete sentences with the verb in the second position. Pay attention to noun genders (der, die, das).";
}
