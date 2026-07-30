"use client";

import { useMemo, useState, useCallback } from "react";
import type { VocabEntry } from "@/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";
import { ClickableText } from "@/components/ui/ClickableText";
import { ComprehensionCheck } from "@/components/ui/ComprehensionCheck";
import { ListenBeforeRead } from "@/components/ui/ListenBeforeRead";

interface LessonViewerProps {
  content: string;
  vocabulary?: VocabEntry[];
}

interface Section {
  title: string;
  body: string;
}

function parseSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split("\n");

  let currentTitle = "Introduction";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentBody.length > 0 || currentTitle !== "Introduction") {
        sections.push({
          title: currentTitle,
          body: currentBody.join("\n").trim(),
        });
      }
      currentTitle = line.replace(/^##\s+/, "").trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0 || currentTitle !== "Introduction") {
    sections.push({
      title: currentTitle,
      body: currentBody.join("\n").trim(),
    });
  }

  if (sections.length === 0 && markdown.trim()) {
    sections.push({ title: "", body: markdown.trim() });
  }

  return sections;
}

function renderInline(text: string, vocabulary?: VocabEntry[]): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)\*(?!\*)|(?<!_)_(?!_)(.+?)_(?!_)|`(.+?)`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<ClickableText key={`t-${lastIndex}`} text={text.slice(lastIndex, match.index)} vocabulary={vocabulary} />);
    }

    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold" style={{ color: "var(--color-text)" }}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<strong key={match.index} className="font-semibold" style={{ color: "var(--color-text)" }}>{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={match.index} style={{ color: "var(--color-active-text)" }}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(<em key={match.index} style={{ color: "var(--color-active-text)" }}>{match[5]}</em>);
    } else if (match[6]) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: "var(--color-page-bg)", color: "var(--color-active-text)" }}>
          {match[6]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<ClickableText key={`t-${lastIndex}`} text={text.slice(lastIndex)} vocabulary={vocabulary} />);
  }

  return parts.length > 0 ? parts : <ClickableText text={text} vocabulary={vocabulary} />;
}

function isTable(text: string): boolean {
  const lines = text.trim().split("\n");
  return lines.length >= 2 && lines[0].includes("|") && lines[1].includes("|") && lines[1].includes("-");
}

function parseTable(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split("\n").filter(l => l.includes("|"));
  const parseRow = (line: string) => line.split("|").map(c => c.trim()).filter(Boolean);
  const headers = parseRow(lines[0]);
  const dataLines = lines.filter((_, i) => i === 0 || !lines[i].includes("---"));
  const rows = dataLines.slice(1).map(parseRow);
  return { headers, rows };
}

function TableBlock({ text, vocabulary }: { text: string; vocabulary?: VocabEntry[] }) {
  const { headers, rows } = useMemo(() => parseTable(text), [text]);

  return (
    <div className="my-4 rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--color-page-bg)" }}>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--color-border)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2" style={{ color: "var(--color-text-secondary)" }}>
                  {renderInline(cell, vocabulary)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isDialogue(text: string): boolean {
  const lines = text.split("\n");
  const dialogueLines = lines.filter(
    (l) => l.match(/^(?:\*\*)?[A-Za-z]+:/) || l.match(/^[—–-]\s/) || l.match(/^[""]/)
  );
  return dialogueLines.length >= lines.length * 0.5 && lines.length >= 2;
}

function DialogueBlock({ text, vocabulary }: { text: string; vocabulary?: VocabEntry[] }) {
  const { speak, speaking } = useWordSpeech();
  const [practiceMode, setPracticeMode] = useState(false);
  const [revealedLines, setRevealedLines] = useState<Set<number>>(new Set());
  const [slowPlayback, setSlowPlayback] = useState(false);

  // Parse dialogue lines
  const lines = text.split("\n").filter(l => l.trim());
  const parsed = lines.map((line, i) => {
    const speakerMatch = line.match(/^(?:\*\*)?(\w[\w\s]*?):\*{0,2}\s*(.+)/);
    if (speakerMatch) {
      return { id: i, speaker: speakerMatch[1].trim(), text: speakerMatch[2].trim(), type: "spoken" as const };
    }
    const cleanText = line.replace(/^[—–-]\s*/, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
    return { id: i, speaker: "", text: cleanText, type: "narrative" as const };
  });

  const uniqueSpeakers = [...new Set(parsed.filter(l => l.type === "spoken").map(l => l.speaker))];
  const isSpeakerA = (speaker: string) => uniqueSpeakers.indexOf(speaker) === 0 || uniqueSpeakers.indexOf(speaker) % 2 === 0;

  const togglePractice = () => {
    setPracticeMode((p) => !p);
    setRevealedLines(new Set());
  };

  const handleRevealLine = (id: number) => {
    setRevealedLines((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Comprehension questions derived from dialogue content
  const comprehensionQuestions = [
    {
      question: `Who are the speakers in this dialogue?`,
      options: [...new Set(parsed.filter(l => l.type === "spoken").map(l => l.speaker)), "I don't know"],
      correctIndex: 0,
    },
    {
      question: "What is the main topic of this conversation?",
      options: ["Grammar rules", "A casual conversation", "Directions", "Shopping"],
      correctIndex: 1,
    },
  ];

  return (
    <div className="my-6 rounded-2xl overflow-hidden" style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3" style={{ background: "var(--color-page-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden style={{ color: "var(--color-accent)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Dialogue</span>
        <div className="flex-1" />
        <button
          onClick={togglePractice}
          className="text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer transition-all"
          style={{
            background: practiceMode ? "rgba(168,85,247,0.12)" : "transparent",
            color: practiceMode ? "var(--color-accent-light)" : "var(--color-text-muted)",
            border: `1px solid ${practiceMode ? "rgba(168,85,247,0.2)" : "transparent"}`,
          }}
          title="Practice mode: hide and reveal speaker lines"
        >
          {practiceMode ? "📝 Practice" : "🎭 Practice"}
        </button>
        <button
          onClick={() => setSlowPlayback((s) => !s)}
          className="text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer transition-all"
          style={{
            background: slowPlayback ? "rgba(168,85,247,0.1)" : "transparent",
            color: slowPlayback ? "var(--color-accent-light)" : "var(--color-text-muted)",
            borderColor: slowPlayback ? "rgba(168,85,247,0.2)" : "var(--color-border)",
          }}
          aria-label="Toggle slow speed"
        >
          0.5×
        </button>
        <button
          onClick={() => !speaking && speak(parsed.filter(l => l.type === "spoken").map(l => `${l.speaker}: ${l.text}`).join(". "), "de-DE", slowPlayback)}
          disabled={speaking}
          className="text-xs font-medium px-2.5 py-1 rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-30"
          style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
          title="Read entire dialogue"
        >
          <SpeakIcon size={16} />
          Play all
        </button>
      </div>

      {/* Dialogue lines */}
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="flex-1 space-y-3 min-w-0">
          {parsed.length === 0 && (
            <p className="text-sm italic" style={{ color: "var(--color-text-muted)" }}>Read the conversation aloud.</p>
          )}
          {parsed.map((line) => {
          if (line.type === "narrative") {
            return (
              <p key={line.id} className="text-xs italic leading-relaxed text-center" style={{ color: "var(--color-text-muted)" }}>
                {line.text}
              </p>
            );
          }
          const isA = isSpeakerA(line.speaker);
          const isHidden = practiceMode && !revealedLines.has(line.id);

          if (isHidden) {
            return (
              <div key={line.id} className="flex items-start gap-2 py-1.5">
                <span className="flex-shrink-0 text-sm" style={{ color: isA ? "#A855F7" : "#EC4899", opacity: 0.4 }}>
                  {isA ? "🔴" : "🟠"}
                </span>
                <button
                  onClick={() => handleRevealLine(line.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer border-none"
                  style={{ background: "rgba(168,85,247,0.06)", color: "var(--color-text-muted)" }}
                  aria-label={`Reveal ${line.speaker}'s line`}
                >
                  Tap to reveal {line.speaker}'s line
                </button>
              </div>
            );
          }

          return (
            <DialogueLineItem
              key={line.id}
              speaker={line.speaker}
              text={line.text}
              accentColor={isA ? "#A855F7" : "#EC4899"}
              vocabulary={vocabulary}
            />
          );
        })}
        </div>

        {/* Decorative waveform */}
        <div className="hidden sm:flex flex-col items-center justify-center w-[80px] flex-shrink-0">
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none" aria-hidden style={{ opacity: 0.25 }}>
            {[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56].map((x, i) => {
              const h = 20 + Math.sin(i * 0.7) * 15 + Math.cos(i * 0.3) * 8;
              return <rect key={x} x={x} y={(120 - h) / 2} width="3" height={h} rx="1.5" fill={i % 3 === 0 ? "#A855F7" : i % 3 === 1 ? "#EC4899" : "#8B5CF6"} />;
            })}
          </svg>
          <p className="text-[8px] mt-2 font-medium uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Audio</p>
        </div>
      </div>

      {/* Comprehension check */}
      <ComprehensionCheck questions={comprehensionQuestions} />
    </div>
  );
}

function DialogueLineItem({ speaker, text, accentColor, vocabulary }: { speaker: string; text: string; accentColor: string; vocabulary?: VocabEntry[] }) {
  const { speak, speaking } = useWordSpeech();

  return (
    <div className="flex items-start gap-2 py-1.5">
      <button
        onClick={() => !speaking && speak(text, "de-DE")}
        disabled={speaking}
        className="flex-shrink-0 mt-0.5 border-none cursor-pointer disabled:opacity-30 transition-opacity"
        style={{ color: accentColor, background: "transparent", fontSize: "16px", lineHeight: 1 }}
        title={`Listen to ${speaker}`}
        aria-label={`Listen to ${speaker}: ${text}`}
      >
        🔊
      </button>
      <div className="min-w-0">
        <span className="text-sm font-semibold" style={{ color: accentColor }}>{speaker}: </span>
        <span className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {renderInline(text, vocabulary)}
        </span>
      </div>
    </div>
  );
}

function renderParagraphs(text: string, vocabulary?: VocabEntry[]): React.ReactNode {
  if (isDialogue(text)) {
    return <DialogueBlock text={text} vocabulary={vocabulary} />;
  }

  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p, i) => {
      if (isTable(p)) {
        return <TableBlock key={i} text={p} vocabulary={vocabulary} />;
      }
      return (
        <p key={i} className="leading-relaxed mb-4 last:mb-0" style={{ color: "var(--color-text-secondary)" }}>
          {renderInline(p, vocabulary)}
        </p>
      );
    });
}

const SECTION_EMOJI: Record<string, string> = {
  introduction: "👋",
  dialogue: "💬",
  vocabulary: "📚",
  grammar: "📐",
  exercise: "✍️",
  practice: "🎯",
  pronunciation: "🎤",
  summary: "📝",
};

function getSectionEmoji(title: string): string {
  for (const [key, emoji] of Object.entries(SECTION_EMOJI)) {
    if (title.toLowerCase().includes(key)) return emoji;
  }
  return "📖";
}

function SectionHeader({ title, sectionText, onListenBeforeRead, isLbrActive }: {
  title: string; sectionText: string;
  onListenBeforeRead?: () => void; isLbrActive?: boolean;
}) {
  const { speak, speaking } = useWordSpeech();
  const emoji = getSectionEmoji(title);

  return (
    <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "rgba(168,85,247,0.08)" }}>
        <span className="text-base" aria-hidden>{emoji}</span>
      </span>
      <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
        {title}
      </h2>
      <div className="flex-1" />
      {onListenBeforeRead && !isLbrActive && (
        <button
          onClick={onListenBeforeRead}
          className="text-xs font-medium px-2.5 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition-all"
          style={{ background: "rgba(168,85,247,0.06)", color: "var(--color-text-muted)" }}
          title="Listen before reading this section"
        >
          🎧 LBR
        </button>
      )}
      <button
        onClick={() => !speaking && speak(sectionText, "de-DE")}
        disabled={speaking}
        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-30"
        style={{ background: "rgba(168,85,247,0.08)", color: "var(--color-accent-light)" }}
        title="Read section aloud"
      >
        <SpeakIcon size={16} />
        Listen
      </button>
    </div>
  );
}

export function LessonViewer({ content, vocabulary }: LessonViewerProps) {
  const sections = useMemo(() => parseSections(content), [content]);
  const [lbrSection, setLbrSection] = useState<number | null>(null);

  if (!content) {
    return (
      <div className="italic" style={{ color: "var(--color-text-muted)" }}>No lesson content available.</div>
    );
  }

  return (
    <div className="max-w-none prose prose-invert">
      {sections.map((section, i) => {
        const isLbr = lbrSection === i;
        return (
        <div key={i} className="p-5 mb-6 last:mb-0 rounded-xl" style={{ background: "var(--color-card-bg)", border: `1px solid ${isLbr ? "rgba(168,85,247,0.25)" : "var(--color-border)"}` }}>
          {section.title ? (
            <SectionHeader title={section.title} sectionText={section.body}
              onListenBeforeRead={isLbr ? undefined : () => setLbrSection(i)}
              isLbrActive={isLbr}
            />
          ) : null}
          {isLbr ? (
            <ListenBeforeRead text={section.body} onDone={() => setLbrSection(null)}>
              {renderParagraphs(section.body, vocabulary)}
            </ListenBeforeRead>
          ) : (
            renderParagraphs(section.body, vocabulary)
          )}
        </div>
        );
      })}
    </div>
  );
}
