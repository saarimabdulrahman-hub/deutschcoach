"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ── Sentence-level speech — for lesson content ───────────────────────

interface SentenceSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  activeIndex: number;
}

export function useSentenceSpeech() {
  const [state, setState] = useState<SentenceSpeechState>({
    isPlaying: false,
    isPaused: false,
    activeIndex: -1,
  });

  const sentencesRef = useRef<string[]>([]);
  const langRef = useRef("de-DE");
  const currentIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  const speakNext = useCallback(() => {
    if (stoppedRef.current) return;
    if (pausedRef.current) return;

    const idx = currentIndexRef.current;
    const sentences = sentencesRef.current;

    if (idx >= sentences.length) {
      // Done — reset
      setState({ isPlaying: false, isPaused: false, activeIndex: -1 });
      currentIndexRef.current = 0;
      return;
    }

    setState({ isPlaying: true, isPaused: false, activeIndex: idx });

    const utterance = new SpeechSynthesisUtterance(sentences[idx]);
    utterance.lang = langRef.current;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      currentIndexRef.current += 1;
      // Small pause between sentences for learners
      setTimeout(() => speakNext(), 200);
    };

    utterance.onerror = (e) => {
      // Ignore "interrupted" errors — they happen on pause/stop
      if (e.error !== "interrupted" && e.error !== "canceled") {
        setState({ isPlaying: false, isPaused: false, activeIndex: -1 });
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speakSentences = useCallback(
    (sentences: string[], lang: string = "de-DE") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      sentencesRef.current = sentences.filter((s) => s.trim().length > 0);
      langRef.current = lang;
      currentIndexRef.current = 0;
      pausedRef.current = false;
      stoppedRef.current = false;
      speakNext();
    },
    [speakNext]
  );

  const pause = useCallback(() => {
    pausedRef.current = true;
    window.speechSynthesis.cancel(); // Stops current utterance
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    stoppedRef.current = false;
    setState((s) => ({ ...s, isPaused: false }));
    // Resume from current index (the one we were on when paused)
    setTimeout(() => speakNext(), 50);
  }, [speakNext]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    pausedRef.current = false;
    window.speechSynthesis.cancel();
    currentIndexRef.current = 0;
    setState({ isPlaying: false, isPaused: false, activeIndex: -1 });
  }, []);

  const replaySentence = useCallback(
    (index: number) => {
      if (index < 0 || index >= sentencesRef.current.length) return;
      stoppedRef.current = false;
      pausedRef.current = false;
      window.speechSynthesis.cancel();
      currentIndexRef.current = index;
      setTimeout(() => speakNext(), 50);
    },
    [speakNext]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    ...state,
    speakSentences,
    pause,
    resume,
    stop,
    replaySentence,
    totalSentences: sentencesRef.current.length,
  };
}

// ── Word/phrase-level speech — for vocab cards, quick reads ──────────

export function useWordSpeech() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string, lang: string = "de-DE", slow: boolean = false, onDone?: () => void) => {
    if (typeof window === "undefined") return;

    // Cancel any in-progress TTS to avoid overlap
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(true);

    // Three-tier fallback chain:
    //   Tier 1 → Pre-generated neural MP3
    //   Tier 2 → Browser SpeechSynthesis (with optional slow mode)
    //   Tier 3 → Graceful degradation

    playNeuralMp3(text, slow)
      .catch(() => playBrowserTts(text, lang, slow))
      .catch(() => {
        // Tier 3 — both sources failed, degrade gracefully (Section 12.13)
        // Audio unavailable — lesson text remains visible, lesson continues
      })
      .finally(() => {
        setSpeaking(false);
        onDone?.();
      });
  }, []);

  return { speak, speaking };
}

// ── Utility: split text into speakable sentences ─────────────────────

export function splitSentences(text: string): string[] {
  if (!text) return [];
  // Split on sentence-ending punctuation followed by space or end-of-string.
  // Handles: . ! ? ... followed by space/capital/newline
  const raw = text
    .replace(/\n+/g, ". ") // Newlines become sentence breaks
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜA-Z])/g);
  return raw
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── Audio filename sanitization (must match scripts/generate_audio.py) ─

export function sanitizeAudioFilename(word: string): string {
  let s = word.toLowerCase();
  s = s.replace(/ß/g, "ss");
  s = s.replace(/ä/g, "ae");
  s = s.replace(/ö/g, "oe");
  s = s.replace(/ü/g, "ue");
  s = s.replace(/\s+/g, "-");
  s = s.replace(/[^a-z\-]/g, "");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-|-$/g, "");
  return s || "unknown";
}

// ── Three-tier audio fallback (with CDN signed URLs, Section 11.1) ─────

function playNeuralMp3(text: string, slow: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const baseName = sanitizeAudioFilename(text);
    const filename = baseName + ".mp3";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const base = typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || (window.location.hostname !== "localhost" ? "https://deutschcoach-hjs0.onrender.com" : "http://localhost:8001"))
      : "http://localhost:8001";

    // Tier 1: Try signed URL from CDN-backed endpoint (with slow variant support)
    const slowParam = slow ? "&slow=true" : "";
    const fetchUrl = `${base}/audio/${filename}?${slowParam}`;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(fetchUrl, { headers })
      .then((res) => res.json())
      .then((data: { url?: string; available?: boolean; source?: string }) => {
        if (data.available && data.url) {
          // Play from CDN via signed URL
          const audio = new Audio(data.url);
          audio.playbackRate = slow ? 0.7 : 1.0;
          let settled = false;
          const done = (err?: Error) => {
            if (settled) return;
            settled = true;
            audio.src = "";
            if (err) reject(err);
            else resolve();
          };
          audio.onerror = () => done(new Error("CDN audio load failed"));
          audio.onended = () => done();
          audio.play().catch((err) => done(new Error(`CDN play failed: ${err.message}`)));
        } else {
          reject(new Error("Native audio unavailable"));
        }
      })
      .catch(() => {
        // Tier 2: Fallback to local MP3 (dev / offline)
        const slowFile = slow ? baseName + "_slow.mp3" : null;
        const tryUrl = slowFile ? `/audio/${slowFile}` : null;
        const playLocal = (url: string) => {
          const audio = new Audio(url);
          audio.playbackRate = slow ? 0.7 : 1.0;
          let settled = false;
          const done = (err?: Error) => {
            if (settled) return;
            settled = true;
            audio.src = "";
            if (err) reject(err);
            else resolve();
          };
          audio.onerror = () => done(new Error("Local MP3 not found"));
          audio.onended = () => done();
          audio.play().catch((err) => done(new Error(`Local MP3 play failed: ${err.message}`)));
        };
        if (tryUrl) {
          // Try slow local variant first, then normal
          const audio = new Audio(tryUrl);
          audio.onerror = () => playLocal(`/audio/${filename}`);
          audio.onended = () => { audio.src = ""; resolve(); };
          audio.play().catch(() => playLocal(`/audio/${filename}`));
        } else {
          playLocal(`/audio/${filename}`);
        }
      });
  });
}

/** Prefer a German voice if available, otherwise use any voice. */
function getGermanVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  // Prefer a German voice (de-DE)
  const germanVoice = voices.find(
    (v) => v.lang.startsWith("de") && v.localService
  );
  return germanVoice || voices.find((v) => v.lang.startsWith("de"));
}

function playBrowserTts(
  text: string,
  lang: string,
  slow: boolean = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("SpeechSynthesis unavailable"));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = slow ? 0.5 : 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Prefer German voice if available
    const germanVoice = getGermanVoice();
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        reject(new Error(`SpeechSynthesis error: ${e.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}
