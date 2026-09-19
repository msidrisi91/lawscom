"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Volume2, FastForward, RotateCcw, AlertCircle } from "lucide-react";
import { SummaryCard, UserMode } from "@/lib/types";

interface AudioByteModalProps {
  card: SummaryCard | null;
  mode: UserMode;
  onClose: () => void;
}

export default function AudioByteModal({ card, mode, onClose }: AudioByteModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const textToRead = card
    ? `${card.headline}. ${mode === "advocate" ? card.advocate_summary : card.citizen_summary}`
    : "";

  useEffect(() => {
    if (!card) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setErrorNotice("Speech audio is not supported in this browser.");
      return;
    }

    // Cancel any previous audio
    window.speechSynthesis.cancel();
    startSpeaking(1.0);

    return () => {
      window.speechSynthesis.cancel();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [card, mode]);

  const startSpeaking = (rate: number) => {
    if (!("speechSynthesis" in window) || !textToRead) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = "en-IN"; // English (India) or default English

    // Select natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => (v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US")) && !v.name.includes("whisper")
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      trackProgress();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const trackProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
    const approxDurationSec = Math.max(12, Math.floor(textToRead.split(" ").length / 2.5));
    const intervalMs = 200;
    const step = (intervalMs / (approxDurationSec * 1000)) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + step;
      });
    }, intervalMs);
  };

  const togglePlayPause = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        startSpeaking(speed);
      }
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : 1.0;
    setSpeed(nextSpeed);
    startSpeaking(nextSpeed);
  };

  const handleRestart = () => {
    startSpeaking(speed);
  };

  const handleClose = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    onClose();
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-judicial-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-bounce" : ""}`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Legal Audio Docket (Web Audio)
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close audio player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Title */}
        <h3 className="font-serif font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 line-clamp-2 leading-snug">
          {card.headline}
        </h3>

        {/* Mode Tag */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Reading Mode: {mode === "advocate" ? "Advocate Ratio" : "Citizen Everyday Law"}
          </span>
        </div>

        {errorNotice && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Dynamic Equalizer Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 my-4 bg-slate-100 dark:bg-judicial-950 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
          {[40, 75, 90, 60, 35, 85, 95, 50, 65, 80, 45, 90, 75, 40].map((baseHeight, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                isPlaying ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-300 dark:bg-slate-700"
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (baseHeight * (0.6 + Math.random() * 0.4)))}%` : "20%",
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSpeedChange}
            className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speed}x</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90"
              title="Restart audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="p-4 bg-blue-600 hover:bg-blue-500 text-white active:scale-95 rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
              aria-label={isPlaying ? "Pause audio reading" : "Play audio reading"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {isPlaying ? "Speaking..." : progress >= 100 ? "Finished" : "Paused"}
          </span>
        </div>

      </div>
    </div>
  );
}
