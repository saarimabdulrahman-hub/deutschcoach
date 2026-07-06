"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CommandBarProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  key: string;
  description: string;
  action: (arg: string, router: ReturnType<typeof useRouter>) => void;
}

const COMMANDS: Command[] = [
  {
    key: "quiz",
    description: "Start a quiz on a topic",
    action: (arg, router) =>
      router.push(`/quiz?topic=${encodeURIComponent(arg)}`),
  },
  {
    key: "translate",
    description: "Look up a word",
    action: (arg, router) =>
      router.push(`/grammar?q=${encodeURIComponent(arg)}`),
  },
  {
    key: "grammar",
    description: "Jump to grammar topic",
    action: (arg, router) =>
      router.push(
        `/grammar/${encodeURIComponent(arg.toLowerCase().replace(/\s+/g, "-"))}`
      ),
  },
  {
    key: "review",
    description: "Start SRS review session",
    action: (_, router) => router.push("/review"),
  },
  {
    key: "lesson",
    description: "Jump to curriculum",
    action: (_, router) => router.push("/curriculum"),
  },
];

export function CommandBar({ open, onClose }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Reset query when opened
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  // Keyboard shortcut handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const commandKey = query.split(" ")[0].toLowerCase();
  const matchingCommands = COMMANDS.filter((c) =>
    c.key.startsWith(commandKey)
  );

  if (!open) return null;

  function handleCommandClick(cmd: Command) {
    const arg = query.split(" ").slice(1).join(" ");
    cmd.action(arg, router);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command... (quiz, translate, grammar, review, lesson)"
          className="w-full text-lg p-4 border-0 outline-none placeholder:text-neutral-300"
        />
        {query && (
          <div className="border-t">
            {matchingCommands.length > 0 ? (
              matchingCommands.map((cmd) => (
                <button
                  key={cmd.key}
                  onClick={() => handleCommandClick(cmd)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                >
                  <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {cmd.key}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {cmd.description}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-400">
                No matching commands.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
