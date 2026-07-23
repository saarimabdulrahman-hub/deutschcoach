/**
 * VocabPanel — Vocabulary sidebar panel for lesson pages
 *
 * Wraps VocabCard components in a scrollable sidebar with header,
 * word count, read-all audio, and empty state. Designed for the
 * curriculum lesson page's sticky sidebar.
 *
 * Reference: DeutschFlow Design Bible — Vocabulary Card Redesign
 */

"use client";

import { useCallback } from "react";
import type { VocabEntry } from "@/types";
import { VocabCard, type CardStatus } from "./VocabCard";
import { useWordSpeech } from "@/hooks/useSpeech";
import { SpeakIcon } from "@/components/ui/SpeakIcon";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Map part_of_speech to display category labels */
const CATEGORY_LABEL: Record<string, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  pronoun: "Pronoun",
  preposition: "Preposition",
  conjunction: "Conjunction",
  greeting: "Greeting",
  phrase: "Phrase",
  expression: "Expression",
};

function getCategory(pos: string | null): string | undefined {
  if (!pos) return undefined;
  return CATEGORY_LABEL[pos.toLowerCase()] ?? pos;
}

/** Generate IPA — simplified mapping for common German words */
function getIpa(german: string): string | undefined {
  // This is a simplified placeholder. A real implementation would use
  // a dictionary lookup or an API. Common patterns are mapped here.
  const known: Record<string, string> = {
    "Hallo": "haˈloː",
    "Guten Morgen": "ˈɡuːtən ˈmɔʁɡən",
    "Guten Tag": "ˈɡuːtən taːk",
    "Guten Abend": "ˈɡuːtən ˈaːbənt",
    "Tschüss": "tʃʏs",
    "Haus": "haʊs",
    "Auto": "ˈaʊtoː",
    "Tisch": "tɪʃ",
    "Blume": "ˈbluːmə",
    "Katze": "ˈkatsə",
    "Hund": "hʊnt",
    "Stuhl": "ʃtuːl",
    "Buch": "buːx",
    "Schule": "ˈʃuːlə",
    "Wasser": "ˈvasɐ",
    "Brot": "broːt",
    "Name": "ˈnaːmə",
    "danke": "ˈdaŋkə",
    "bitte": "ˈbɪtə",
    "ja": "jaː",
    "nein": "naɪn",
    "vielen Dank": "ˈfiːlən daŋk",
    "Entschuldigung": "ɛntˈʃʊldɪɡʊŋ",
    "der": "deːɐ",
    "die": "diː",
    "das": "das",
    "ein": "aɪn",
    "eine": "ˈaɪnə",
    "und": "ʊnt",
    "oder": "ˈoːdɐ",
    "aber": "ˈaːbɐ",
    "Mann": "man",
    "Frau": "fʁaʊ",
    "Kind": "kɪnt",
    "Mädchen": "ˈmɛːtçən",
    "Junge": "ˈjʊŋə",
    "gut": "ɡuːt",
    "schlecht": "ʃlɛçt",
    "groß": "ɡʁoːs",
    "klein": "klaɪn",
  };
  return known[german.trim()];
}

/** Generate beginner pronunciation guide */
function getBeginnerPron(german: string): string | undefined {
  const known: Record<string, string> = {
    "Hallo": "HAH-loh",
    "Guten Morgen": "GOO-ten MOR-gen",
    "Guten Tag": "GOO-ten TAHK",
    "Guten Abend": "GOO-ten AH-bent",
    "Tschüss": "chooss",
    "Haus": "houss",
    "Auto": "OW-toh",
    "Tisch": "tish",
    "Blume": "BLOO-muh",
    "Katze": "KAT-suh",
    "Hund": "hoont",
    "Stuhl": "shtool",
    "Buch": "bookh",
    "Schule": "SHOO-luh",
    "Wasser": "VAH-suh",
    "Brot": "broht",
    "Name": "NAH-muh",
    "danke": "DAHN-kuh",
    "bitte": "BIT-tuh",
    "ja": "yah",
    "nein": "nine",
    "vielen Dank": "FEE-len dahnk",
    "Entschuldigung": "ent-SHOOL-di-goong",
    "der": "dair",
    "die": "dee",
    "das": "dahs",
    "ein": "ine",
    "eine": "EYE-nuh",
    "und": "oont",
    "oder": "OH-duh",
    "aber": "AH-buh",
    "Mann": "mahn",
    "Frau": "frou",
    "Kind": "kint",
    "Mädchen": "MAYT-chen",
    "Junge": "YOONG-uh",
    "gut": "goot",
    "schlecht": "shlekht",
    "groß": "grohss",
    "klein": "kline",
  };
  return known[german.trim()];
}

// ── Props ──────────────────────────────────────────────────────────────────

export interface VocabPanelProps {
  vocabulary: VocabEntry[];
  /** Callback fired when user clicks Practice on a word */
  onPractice?: (word: string) => void;
}

// ── Header ─────────────────────────────────────────────────────────────────

function VocabPanelHeader({
  count,
  onReadAll,
  speaking,
}: {
  count: number;
  onReadAll: () => void;
  speaking: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2
        className="text-sm font-semibold flex items-center gap-2"
        style={{ color: "var(--color-text)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Vocabulary
        <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
          {count} {count === 1 ? "word" : "words"}
        </span>
      </h2>
      <button
        onClick={onReadAll}
        disabled={speaking || count === 0}
        aria-label="Read all words aloud"
        title="Read all aloud"
        className="min-h-[36px] px-2.5 rounded-lg border-none cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-30"
        style={{
          background: speaking ? "rgba(168,85,247,0.08)" : "transparent",
          color: "var(--color-text-muted)",
        }}
      >
        <SpeakIcon size={18} />
        <span className="text-[11px] font-medium">Read all</span>
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function VocabPanel({ vocabulary, onPractice }: VocabPanelProps) {
  const { speak, speaking } = useWordSpeech();

  const handleReadAll = useCallback(() => {
    if (speaking || vocabulary.length === 0) return;
    const text = vocabulary.map((v) => v.german).join(". ");
    speak(text, "de-DE");
  }, [vocabulary, speak, speaking]);

  // Empty state
  if (vocabulary.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--color-card-bg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <VocabPanelHeader count={0} onReadAll={handleReadAll} speaking={speaking} />
        <div className="text-center py-8">
          <span className="text-2xl block mb-2">📝</span>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            No vocabulary for this lesson
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 sticky top-24"
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <VocabPanelHeader
        count={vocabulary.length}
        onReadAll={handleReadAll}
        speaking={speaking}
      />
      <div className="space-y-3">
        {vocabulary.map((v) => (
          <VocabCard
            key={v.id}
            german={v.german}
            english={v.english}
            ipa={getIpa(v.german)}
            beginnerPron={getBeginnerPron(v.german)}
            category={getCategory(v.part_of_speech)}
            status="new"
            onPractice={onPractice}
            // Future: wire bookmark state from API when available
            bookmarked={false}
            onBookmarkToggle={() => {
              // Future: call API to toggle bookmark
            }}
          />
        ))}
      </div>
    </div>
  );
}
