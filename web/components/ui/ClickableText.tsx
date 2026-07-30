/**
 * ClickableText — renders text with clickable German words.
 *
 * Automatically detects German words using a regex pattern and wraps them
 * in clickable spans. When vocabulary data is available, clicking a word
 * opens an inline popover with translation, IPA, audio, and example sentence.
 *
 * Designed for use inside renderInline in LessonViewer.
 */

"use client";

import { useCallback, useState, useRef } from "react";
import type { VocabEntry } from "@/types";
import { useWordSpeech } from "@/hooks/useSpeech";
import { WordPopover } from "./WordPopover";
import { api } from "@/lib/api";

// Regex matches German words:
//   - Uppercase-starting words (nouns):      [A-ZÄÖÜ][a-zäöüß]+
//   - Lowercase German words of 2+ chars:    [a-zäöüß]{2,}
const GERMAN_WORD = /([A-ZÄÖÜ][a-zäöüß]+|[a-zäöüß]{2,})/g;

/** Build a fast lookup from a vocabulary array. */
function buildVocabMap(vocab?: VocabEntry[]): Record<string, VocabEntry> {
  const map: Record<string, VocabEntry> = {};
  if (!vocab) return map;
  for (const entry of vocab) {
    map[entry.german.toLowerCase()] = entry;
  }
  return map;
}

interface ClickableTextProps {
  text: string;
  vocabulary?: VocabEntry[];
}

export function ClickableText({ text, vocabulary }: ClickableTextProps) {
  const { speak, speaking } = useWordSpeech();
  const [popoverWord, setPopoverWord] = useState<string | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const vocabMap = useRef(buildVocabMap(vocabulary));

  // Rebuild lookup if vocabulary changes
  if (vocabulary) {
    vocabMap.current = buildVocabMap(vocabulary);
  }

  const handleClick = useCallback(
    (word: string, el: HTMLElement) => {
      if (speaking) return;

      const vocabEntry = vocabMap.current[word.toLowerCase()];
      if (vocabEntry) {
        // Show popover for known vocabulary words
        setPopoverWord(popoverWord === word ? null : word);
        setPopoverAnchor(popoverWord === word ? null : el);
        // Fire-and-forget analytics — record the word interaction
        api.post("/vocab/lookup", { words: [word] }).catch(() => {});
      } else {
        // Unknown word: just speak it
        speak(word, "de-DE");
      }
    },
    [speak, speaking, popoverWord]
  );

  const closePopover = useCallback(() => {
    setPopoverWord(null);
    setPopoverAnchor(null);
  }, []);

  // Split text into segments
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(GERMAN_WORD.source, GERMAN_WORD.flags);

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }

    const word = match[0];
    const isActive = popoverWord === word;

    segments.push(
      <span
        key={`${match.index}-${word}`}
        className="german-word"
        data-word={word}
        onClick={(e) => handleClick(word, e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(word, e.currentTarget);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={vocabulary ? `Click for details on ${word}` : `Listen to ${word}`}
        style={isActive ? { borderBottomColor: "rgba(168,85,247,0.6)", background: "rgba(168,85,247,0.08)" } : undefined}
      >
        {word}
        {isActive && popoverAnchor && (
          <WordPopover
            word={word}
            vocabEntry={vocabMap.current[word.toLowerCase()]}
            onClose={closePopover}
            anchorEl={popoverAnchor}
          />
        )}
      </span>
    );

    lastIndex = match.index + word.length;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  if (segments.length === 1 && typeof segments[0] === "string") {
    return <>{text}</>;
  }

  return <>{segments}</>;
}
