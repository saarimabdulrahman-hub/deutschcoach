/**
 * Pronunciation lookup — loads the build-time generated pronunciation map.
 *
 * Provides typed access to IPA and beginner-friendly pronunciation
 * for all vocabulary words. Replaces the previous hardcoded lookup
 * tables in VocabPanel.
 */

// Import the build-time generated JSON (resolveJsonModule must be enabled)
import _raw from "../public/pronunciation-map.json";

export interface PronunciationEntry {
  ipa: string;
  beginnerPron: string;
}

export type PronunciationMap = Record<string, PronunciationEntry>;

/** The full pronunciation map keyed by German word/phrase. */
export const pronunciationMap = _raw as PronunciationMap;

/** Look up IPA for a German word. Returns undefined if not found. */
export function lookupIpa(german: string): string | undefined {
  return pronunciationMap[german.trim()]?.ipa || undefined;
}

/** Look up beginner-friendly pronunciation for a German word. Returns undefined if not found. */
export function lookupBeginnerPron(german: string): string | undefined {
  return pronunciationMap[german.trim()]?.beginnerPron || undefined;
}
