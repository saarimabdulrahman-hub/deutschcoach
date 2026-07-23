"use client";

import React, { useEffect, useRef } from "react";

// Live microphone waveform (Sprint 16). Drives bar heights from a Web Audio
// AnalyserNode. While recording, the bars animate to the mic input. Idle = flat.

interface Props { analyser: AnalyserNode | null; active: boolean; bars?: number; }

export const RecordingWaveform = React.memo(function RecordingWaveform({ analyser, active, bars = 20 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const w = canvas.width;
    const h = canvas.height;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, w, h);
      const barW = (w / bars) * 0.7;
      const gap = (w / bars) * 0.3;
      for (let i = 0; i < bars; i++) {
        const val = dataArray[Math.floor((i / bars) * dataArray.length)] / 255;
        const barH = Math.max(2, val * h);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;
        ctx.fillStyle = `rgba(139, 92, 246, ${0.4 + val * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, analyser, bars]);

  // Canvas dimensions via a resize observer for responsiveness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.offsetWidth * devicePixelRatio; canvas.height = canvas.offsetHeight * devicePixelRatio; };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas ref={canvasRef}
      className="w-full h-14 rounded-xl"
      style={{ background: "var(--color-card-bg)", border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)" }}
      aria-label={active ? "Live microphone waveform" : "Waveform (idle)"}
      role="img" />
  );
});
