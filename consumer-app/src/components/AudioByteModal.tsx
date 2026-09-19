"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, Volume2, FastForward, RotateCcw, AlertCircle, Sparkles, UserCheck } from "lucide-react";
import { SummaryCard, UserMode } from "@/lib/types";

interface AudioByteModalProps {
  card: SummaryCard | null;
  mode: UserMode;
  onClose: () => void;
}

interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
  isFemale: boolean;
}

export default function AudioByteModal({ card, mode, onClose }: AudioByteModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);

  const textToRead = card
    ? `${card.headline}. ${mode === "advocate" ? card.advocate_summary : card.citizen_summary}`
    : "";

  // Helper to check if a voice is an expressive feminine voice
  const isFemaleVoice = (v: SpeechSynthesisVoice): boolean => {
    const name = v.name.toLowerCase();
    return (
      name.includes("heera") ||
      name.includes("zira") ||
      name.includes("aria") ||
      name.includes("jenny") ||
      name.includes("sonia") ||
      name.includes("neerja") ||
      name.includes("samantha") ||
      name.includes("victoria") ||
      name.includes("karen") ||
      name.includes("serena") ||
      name.includes("moira") ||
      name.includes("tessa") ||
      name.includes("female") ||
      name.includes("woman") ||
      (name.includes("google") && (name.includes("uk english female") || name.includes("us english")))
    );
  };

  const getVoiceDisplayName = (v: SpeechSynthesisVoice): string => {
    const name = v.name;
    if (name.includes("Heera")) return "Heera (Warm Indian Female)";
    if (name.includes("Zira")) return "Zira (Clear American Female)";
    if (name.includes("Aria")) return "Aria (Expressive Studio Female)";
    if (name.includes("Jenny")) return "Jenny (Natural Smooth Female)";
    if (name.includes("Sonia")) return "Sonia (British English Female)";
    if (name.includes("Neerja")) return "Neerja (Natural Indian Female)";
    if (name.includes("Samantha")) return "Samantha (Natural US Female)";
    if (name.includes("Victoria")) return "Victoria (British Accent Female)";
    return name.replace("Microsoft ", "").replace("Google ", "").replace(" Desktop", "");
  };

  // Discover and sort available feminine voices
  const populateVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const rawVoices = window.speechSynthesis.getVoices();
    if (rawVoices.length === 0) return;

    // Filter English voices
    const englishVoices = rawVoices.filter((v) => v.lang.startsWith("en") || !v.lang);

    // Sort prioritizing the most natural, appealing feminine voices
    const prioritized: VoiceOption[] = englishVoices.map((v) => ({
      voice: v,
      label: getVoiceDisplayName(v),
      isFemale: isFemaleVoice(v)
    }));

    prioritized.sort((a, b) => {
      // Female voices first
      if (a.isFemale && !b.isFemale) return -1;
      if (!a.isFemale && b.isFemale) return 1;
      // High-tier preferred names
      const score = (name: string) => {
        if (name.includes("Heera")) return 100;
        if (name.includes("Zira")) return 95;
        if (name.includes("Aria")) return 90;
        if (name.includes("Jenny")) return 85;
        if (name.includes("Samantha")) return 80;
        if (name.includes("Neerja")) return 75;
        return 50;
      };
      return score(b.voice.name) - score(a.voice.name);
    });

    setAvailableVoices(prioritized);

    // Check localStorage for saved voice or pick top female voice
    const saved = localStorage.getItem("juris_audio_voice");
    const foundSaved = prioritized.find((opt) => opt.voice.name === saved);
    if (foundSaved) {
      setSelectedVoiceName(foundSaved.voice.name);
    } else {
      const bestFemale = prioritized.find((opt) => opt.isFemale) || prioritized[0];
      if (bestFemale) {
        setSelectedVoiceName(bestFemale.voice.name);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setErrorNotice("Speech audio is not supported in this browser.");
      return;
    }

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [populateVoices]);

  // Start reading when card or selected voice changes
  useEffect(() => {
    if (!card || availableVoices.length === 0) return;

    startSpeaking(speed, selectedVoiceName);

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [card, mode, selectedVoiceName]);

  const startSpeaking = (rate: number, voiceNameOverride?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !textToRead) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate * 0.98; // Comfortable news briefing cadence
    utterance.pitch = 1.10; // Tuned melodic warm feminine pitch

    // Choose voice
    const targetName = voiceNameOverride || selectedVoiceName;
    const targetOpt = availableVoices.find((opt) => opt.voice.name === targetName);
    if (targetOpt) {
      utterance.voice = targetOpt.voice;
      utterance.lang = targetOpt.voice.lang || "en-US";
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
    const approxDurationSec = Math.max(12, Math.floor(textToRead.split(" ").length / 2.6));
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
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

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

  const handleVoiceChange = (newName: string) => {
    setSelectedVoiceName(newName);
    localStorage.setItem("juris_audio_voice", newName);
    startSpeaking(speed, newName);
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
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
        <div className="flex items-center justify-between mb-3">
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
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Reading Mode: {mode === "advocate" ? "Advocate Ratio" : "Citizen Everyday Law"}
          </span>
        </div>

        {/* Female Voice Anchor Selector */}
        {availableVoices.length > 0 && (
          <div className="mb-3 p-2.5 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Voice Anchor:
              </span>
            </div>

            <select
              value={selectedVoiceName}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-white dark:bg-judicial-900 border border-slate-200 dark:border-slate-700/80 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl px-2.5 py-1 focus:outline-none truncate max-w-[190px] shadow-sm cursor-pointer"
              title="Select your preferred reading voice anchor"
            >
              {availableVoices.map((opt) => (
                <option key={opt.voice.name} value={opt.voice.name}>
                  {opt.isFemale ? "✨ " : ""}{opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorNotice && (
          <div className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Dynamic Equalizer Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 my-3 bg-slate-100 dark:bg-judicial-950 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
          {[40, 75, 90, 60, 35, 85, 95, 50, 65, 80, 45, 90, 75, 40].map((baseHeight, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                isPlaying ? "bg-gradient-to-t from-blue-600 to-indigo-400" : "bg-slate-300 dark:bg-slate-700"
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
