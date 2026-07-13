"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--color-hover-bg)" }}>
          <img src="/emma-avatar.webp" alt="Emma" className="w-10 h-10 rounded-xl object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Emma · Your German Tutor</h1>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Explain, correct, practice — Emma guides you through German, one question at a time</p>
        </div>
      </div>
      <ChatInterface />
    </div>
  );
}
