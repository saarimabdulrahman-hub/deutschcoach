// Shared audio UI state model (Sprint 6.2C). Presentational only — a future
// audio engine (later sprint) will drive these states; nothing here plays audio.

export type AudioState =
  | "idle"        // ready, not started
  | "loading"     // fetching the clip
  | "playing"
  | "paused"
  | "completed"   // finished playing
  | "buffering"   // stalled mid-play
  | "disabled"    // no audio available for this item
  | "error"       // failed to load
  | "offline";    // no connection

export const AUDIO_STATE_LABEL: Record<AudioState, string> = {
  idle: "Ready",
  loading: "Loading audio",
  playing: "Playing",
  paused: "Paused",
  completed: "Played",
  buffering: "Buffering",
  disabled: "Audio unavailable",
  error: "Audio failed to load",
  offline: "Offline — audio unavailable",
};

/** Loading-ish states where controls should show a spinner and disable input. */
export const isAudioBusy = (s: AudioState) => s === "loading" || s === "buffering";

/** States where the item simply cannot be played. */
export const isAudioBlocked = (s: AudioState) => s === "disabled" || s === "offline" || s === "error";
