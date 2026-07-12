"use client";

// Production audio engine (Sprint 15). Manages an HTML5 <audio> element with
// caching, queuing, speed control, and TTS fallback. The engine is imperative
// — call play(url)/pause()/resume()/setSpeed(). State is read from the engine's
// event-driven callbacks. Designed to be driven by AudioProvider.

import type { AudioState } from "./types";
import type { PlaybackSpeed } from "./useAudioEngine";

export type { AudioState };

export interface AudioEngineEvents {
  onStateChange: (state: AudioState, currentUrl: string | null) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onEnded: (url: string) => void;
  onError: (url: string, message: string) => void;
}

const CACHE = new Map<string, HTMLAudioElement>();

function loadAudio(url: string): HTMLAudioElement {
  const cached = CACHE.get(url);
  if (cached) return cached;
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = url;
  CACHE.set(url, audio);
  return audio;
}

export function preloadUrls(urls: string[]): void {
  for (const url of urls) loadAudio(url);
}

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private _state: AudioState = "idle";
  private _speed: PlaybackSpeed = 1;
  private _currentUrl: string | null = null;
  private _events: AudioEngineEvents;
  private _progressRaf: number | null = null;
  private _queue: string[] = [];
  private _synth: SpeechSynthesisUtterance | null = null;

  constructor(events: AudioEngineEvents) {
    this._events = events;
  }

  get state() { return this._state; }
  get speed() { return this._speed; }
  get currentUrl() { return this._currentUrl; }
  get queue() { return [...this._queue]; }

  // ── Playback ───────────────────────────────────────────────────────

  play(url: string): void {
    this.stop();
    this._state = "loading";
    this._currentUrl = url;
    this._events.onStateChange("loading", url);

    this.audio = loadAudio(url);
    this.audio.playbackRate = this._speed;
    this.audio.currentTime = 0;

    const onCanPlay = () => {
      this.audio?.removeEventListener("canplay", onCanPlay);
      this.audio?.play().catch(() => { /* autoplay blocked — user tap required */ });
      this._state = "playing";
      this._currentUrl = url;
      this._events.onStateChange("playing", url);
    };
    this.audio.addEventListener("canplay", onCanPlay);

    this.audio.addEventListener("ended", () => {
      this._state = "completed";
      this._events.onStateChange("completed", url);
      this._events.onEnded(url);
      this._stopProgress();
      this._playNext();
    }, { once: true });

    this.audio.addEventListener("error", () => {
      this._state = "error";
      this._events.onStateChange("error", url);
      this._events.onError(url, "Failed to load audio");
      this._stopProgress();
    }, { once: true });

    this._startProgress();
    this.audio.load();
  }

  pause(): void {
    this.audio?.pause();
    this._state = "paused";
    this._events.onStateChange("paused", this._currentUrl);
    this._stopProgress();
  }

  resume(): void {
    this.audio?.play().catch(() => {});
    this._state = "playing";
    this._events.onStateChange("playing", this._currentUrl);
    this._startProgress();
  }

  replay(): void {
    if (this._currentUrl) this.play(this._currentUrl);
  }

  stop(): void {
    this._stopProgress();
    this.audio?.pause();
    if (this.audio) { this.audio.currentTime = 0; this.audio = null; }
    this._state = "idle";
    this._currentUrl = null;
    this._events.onStateChange("idle", null);
  }

  // ── Speed ──────────────────────────────────────────────────────────

  setSpeed(s: PlaybackSpeed): void {
    this._speed = s;
    if (this.audio) this.audio.playbackRate = s;
  }

  // ── Queue ──────────────────────────────────────────────────────────

  enqueue(urls: string[]): void {
    this._queue.push(...urls);
    if (this._state === "idle" || this._state === "completed") this._playNext();
  }

  clearQueue(): void { this._queue = []; }

  private _playNext(): void {
    const next = this._queue.shift();
    if (next) this.play(next);
  }

  // ── TTS fallback (browser speechSynthesis — demo / no-real-audio path) ──

  speak(text: string, lang = "de-DE"): void {
    this.stop();
    if (!("speechSynthesis" in window)) { this._events.onError("tts", "TTS not supported"); return; }
    window.speechSynthesis.cancel();
    this._synth = new SpeechSynthesisUtterance(text);
    this._synth.lang = lang;
    this._synth.rate = this._speed;
    this._synth.onstart = () => { this._state = "playing"; this._events.onStateChange("playing", "tts"); };
    this._synth.onend = () => { this._state = "completed"; this._events.onStateChange("completed", "tts"); this._events.onEnded("tts"); };
    this._synth.onerror = () => { this._state = "error"; this._events.onError("tts", "TTS error"); };
    this._state = "loading";
    this._events.onStateChange("loading", "tts");
    window.speechSynthesis.speak(this._synth);
  }

  // ── Progress ───────────────────────────────────────────────────────

  private _startProgress(): void {
    this._stopProgress();
    const tick = () => {
      if (this.audio && this._state === "playing") {
        this._events.onProgress(this.audio.currentTime, this.audio.duration || 0);
        this._progressRaf = requestAnimationFrame(tick);
      }
    };
    this._progressRaf = requestAnimationFrame(tick);
  }

  private _stopProgress(): void {
    if (this._progressRaf != null) { cancelAnimationFrame(this._progressRaf); this._progressRaf = null; }
  }

  // ── Teardown ───────────────────────────────────────────────────────

  destroy(): void {
    this.stop();
    this.clearQueue();
    window.speechSynthesis?.cancel();
  }
}
