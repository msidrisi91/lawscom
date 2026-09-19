"use client";

import React, { useState, useEffect } from "react";
import { Scale, Users, CheckCircle, ArrowRight } from "lucide-react";
import { UserMode } from "@/lib/types";

interface PersonaOnboardingModalProps {
  currentMode: UserMode;
  onSelectMode: (mode: UserMode) => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function PersonaOnboardingModal({
  currentMode,
  onSelectMode,
  forceOpen = false,
  onClose
}: PersonaOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<UserMode>(currentMode);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const saved = localStorage.getItem("juris_user_mode");
    if (!saved) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleConfirm = () => {
    onSelectMode(selected);
    localStorage.setItem("juris_user_mode", selected);
    document.cookie = `juris_user_mode=${selected}; path=/; max-age=31536000`;
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-judicial-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 animate-scaleUp">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold tracking-tight mb-1">
            Choose Your Reading Lens
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Personalize your 60-word daily docket. You can switch lenses anytime.
          </p>
        </div>

        {/* 2 Options */}
        <div className="space-y-3 mb-6">
          
          {/* Option A: Advocate Mode */}
          <button
            type="button"
            onClick={() => setSelected("advocate")}
            className={`w-full text-left p-4 rounded-2xl border transition-all relative flex items-start gap-3.5 ${
              selected === "advocate"
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-slate-950 dark:text-slate-100 ring-2 ring-blue-500/30 shadow-md"
                : "bg-slate-50 dark:bg-judicial-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              selected === "advocate" ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              <Scale className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Advocate & Student</span>
                {selected === "advocate" && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />}
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug">
                Ratio Decidendi, Coram Bench, statutory sections, and formal court citations.
              </p>
            </div>
          </button>

          {/* Option B: Citizen Mode */}
          <button
            type="button"
            onClick={() => setSelected("citizen")}
            className={`w-full text-left p-4 rounded-2xl border transition-all relative flex items-start gap-3.5 ${
              selected === "citizen"
                ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-slate-950 dark:text-slate-100 ring-2 ring-sky-500/30 shadow-md"
                : "bg-slate-50 dark:bg-judicial-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              selected === "citizen" ? "bg-sky-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              <Users className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Citizen & General Public</span>
                {selected === "citizen" && <CheckCircle className="w-4 h-4 text-sky-500 fill-current" />}
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-snug">
                Plain English, everyday takeaways, zero legal jargon, and real-life rights awareness.
              </p>
            </div>
          </button>

        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
        >
          <span>Continue Reading</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
