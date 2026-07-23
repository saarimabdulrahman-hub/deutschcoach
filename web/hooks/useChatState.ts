/**
 * useChatState — 6-state chat state machine
 * States: Idle → Typing → Streaming → Tool Running → Complete → Retry
 * Reference: AI Chat Atlas — 26_PATTERN_ATLAS/06_AI_CHAT_ATLAS.md
 */

"use client";

import { useState, useCallback, useRef } from "react";

export type ChatState = "idle" | "typing" | "streaming" | "tool-running" | "complete" | "retry";

interface ChatStateMachine {
  state: ChatState;
  isIdle: boolean;
  isStreaming: boolean;
  isComplete: boolean;
  isRetry: boolean;
  isToolRunning: boolean;
  send: () => void;
  streamStart: () => void;
  streamChunk: (chunk: string) => void;
  streamComplete: () => void;
  toolStart: (name: string) => void;
  toolComplete: (result: string) => void;
  error: (message: string) => void;
  retry: () => void;
  setTyping: (isTyping: boolean) => void;
  currentTool: string | null;
  errorMessage: string | null;
  partialContent: string;
}

export function useChatState(): ChatStateMachine {
  const [state, setState] = useState<ChatState>("idle");
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [partialContent, setPartialContent] = useState("");
  const contentRef = useRef("");

  const send = useCallback(() => setState("streaming"), []);
  const streamStart = useCallback(() => { contentRef.current = ""; setPartialContent(""); setState("streaming"); }, []);

  const streamChunk = useCallback((chunk: string) => {
    contentRef.current += chunk;
    setPartialContent(contentRef.current);
  }, []);

  const streamComplete = useCallback(() => {
    contentRef.current = "";
    setPartialContent("");
    setState("complete");
  }, []);

  const toolStart = useCallback((name: string) => {
    setCurrentTool(name);
    setState("tool-running");
  }, []);

  const toolComplete = useCallback((_result: string) => {
    setCurrentTool(null);
    setState("streaming");
  }, []);

  const error = useCallback((message: string) => {
    setErrorMessage(message);
    setState("retry");
  }, []);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setState("streaming");
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    if (isTyping && state === "idle") setState("typing");
    if (!isTyping && state === "typing") setState("idle");
  }, [state]);

  return {
    state,
    isIdle: state === "idle",
    isStreaming: state === "streaming",
    isComplete: state === "complete",
    isRetry: state === "retry",
    isToolRunning: state === "tool-running",
    send, streamStart, streamChunk, streamComplete,
    toolStart, toolComplete, error, retry, setTyping,
    currentTool, errorMessage, partialContent,
  };
}
