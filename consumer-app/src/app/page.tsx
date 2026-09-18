"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchFeed } from "@/lib/api";
import { SummaryCard, UserMode } from "@/lib/types";
import LegalCard from "@/components/LegalCard";
import BareActDrawer from "@/components/BareActDrawer";
import AudioByteModal from "@/components/AudioByteModal";
import PersonaOnboardingModal from "@/components/PersonaOnboardingModal";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { RefreshCw, ChevronDown } from "lucide-react";

export default function HomeFeed() {
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("advocate");
  const [showModeModal, setShowModeModal] = useState(false);
  
  // Drawer & Audio States
  const [activeStatute, setActiveStatute] = useState<{ act: string; section: string } | null>(null);
  const [audioCard, setAudioCard] = useState<SummaryCard | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved mode from localStorage or cookie
    const savedMode = localStorage.getItem("juris_user_mode") as UserMode | null;
    if (savedMode) {
      setMode(savedMode);
    }

    // Load saved briefcase IDs
    try {
      const stored = localStorage.getItem("briefcase_ids");
      if (stored) setSavedIds(JSON.parse(stored));
    } catch {}

    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    const data = await fetchFeed();
    setCards(data);
    setLoading(false);
  };

  const handleModeChange = (newMode: UserMode) => {
    setMode(newMode);
    localStorage.setItem("juris_user_mode", newMode);
    document.cookie = `juris_user_mode=${newMode}; path=/; max-age=31536000`;
  };

  const handleToggleSave = (cardId: string) => {
    setSavedIds((prev) => {
      const updated = prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId];
      try {
        localStorage.setItem("briefcase_ids", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const height = window.innerHeight;
      if (e.key === "ArrowDown") {
        containerRef.current.scrollBy({ top: height, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        containerRef.current.scrollBy({ top: -height, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-white dark:bg-judicial-950 text-slate-800 dark:text-slate-200 transition-colors">
        <div className="mb-4">
          <Logo size={44} showText={false} />
        </div>
        <span className="font-serif font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
          Juris<span className="text-gold-500">Shorts</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Loading 60s Daily Judicial Docket...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-slate-50 dark:bg-judicial-950 overflow-hidden transition-colors">
      
      {/* Top Header Bar */}
      <header className="fixed top-2.5 inset-x-0 max-w-md mx-auto z-30 px-4 flex items-center justify-between pointer-events-none">
        {/* Modern Vector Logo */}
        <div className="pointer-events-auto bg-white/90 dark:bg-judicial-900/90 border border-slate-200 dark:border-slate-800 rounded-full pl-2 pr-3 py-1 backdrop-blur-md shadow-md flex items-center gap-2">
          <Logo size={22} showText={false} />
          <span className="font-serif font-extrabold text-slate-900 dark:text-slate-100 text-xs tracking-tight">
            Juris<span className="text-gold-500">Shorts</span>
          </span>

          {/* Quick Lens Switcher Pill */}
          <button
            onClick={() => setShowModeModal(true)}
            className="flex items-center gap-1 ml-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors active:scale-95"
            title="Click to switch between Advocate and Citizen mode"
          >
            <span>{mode === "advocate" ? "⚖️ Advocate" : "💡 Citizen"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Right Tools: Theme Switcher & Refresh */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <ThemeToggle />

          <button
            onClick={loadCards}
            className="p-2 bg-white/90 dark:bg-judicial-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full backdrop-blur-md hover:text-gold-500 active:scale-90 transition-all shadow-md"
            aria-label="Refresh briefs"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Snap-Scrolling Vertical Deck Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar"
      >
        {cards.map((card) => (
          <div key={card.id} className="w-full h-[100dvh] snap-start flex-shrink-0">
            <LegalCard
              card={card}
              mode={mode}
              onSectionClick={(act, section) => setActiveStatute({ act, section })}
              onAudioPlay={(c) => setAudioCard(c)}
              isSaved={savedIds.includes(card.id)}
              onToggleSave={handleToggleSave}
            />
          </div>
        ))}
      </div>

      {/* Interactive Bare Act Bottom Sheet */}
      {activeStatute && (
        <BareActDrawer
          act={activeStatute.act}
          section={activeStatute.section}
          onClose={() => setActiveStatute(null)}
        />
      )}

      {/* Real Speech Synthesis Audio Docket Player */}
      {audioCard && (
        <AudioByteModal
          card={audioCard}
          mode={mode}
          onClose={() => setAudioCard(null)}
        />
      )}

      {/* First-time / Configurable Persona Lens Modal */}
      <PersonaOnboardingModal
        currentMode={mode}
        onSelectMode={handleModeChange}
        forceOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
      />

    </div>
  );
}
