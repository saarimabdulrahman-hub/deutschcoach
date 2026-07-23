"use client";

import React, { useEffect, useRef } from "react";
import type { EmmaMessage as EmmaMsg } from "./EmmaContext";
import { EmmaMessage } from "./EmmaMessage";
import { EmmaLoading } from "./EmmaLoading";

// Message list with auto-scroll and content-visibility virtualisation (Sprint 13).
// Messages beyond `virtualThreshold` get `content-visibility: auto` so the
// browser skips rendering off-screen items. Zero-dependency.

interface Props {
  messages: EmmaMsg[];
  isTyping: boolean;
  virtualThreshold?: number;  // default: 30 — items beyond this get virtualized
}

export const EmmaConversation = React.memo(function EmmaConversation({ messages, isTyping, virtualThreshold = 30 }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  // Auto-scroll to bottom on new messages or typing
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain" role="log" aria-label="Conversation with Emma" aria-live="polite">
      {isEmpty && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>I'm Emma, your German tutor.</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>I'll explain, give examples, and help you through — without handing you the answer. Try a quick action below.</p>
        </div>
      )}
      {messages.map((msg, i) => {
        const beyond = messages.length > virtualThreshold && i < messages.length - virtualThreshold;
        return (
          <div key={msg.id} style={beyond ? { contentVisibility: "auto", containIntrinsicSize: "auto 60px" } : undefined}>
            <EmmaMessage msg={msg} />
          </div>
        );
      })}
      {isTyping && <EmmaLoading />}
    </div>
  );
});
