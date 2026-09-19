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
import { RefreshCw, ChevronDown, CheckCheck, History } from "lucide-react";

export default function HomeFeed() {
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("advocate");
  const [showModeModal, setShowModeModal] = useState(false);
  const [readCardIds, setReadCardIds] = useState<string[]>([]);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState(0);
  
  // Drawer & Audio States
  const [activeStatute, setActiveStatute] = useState<{ act: string; section: string } | null>(null);
  const [audioCard, setAudioCard] = useState<SummaryCard | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // 1. Load saved mode from localStorage / cookie
    const savedMode = localStorage.getItem("juris_user_mode") as UserMode | null;
    if (savedMode) {
      setMode(savedMode);
    }

    // 2. Load saved briefcase IDs
    try {
      const stored = localStorage.getItem("briefcase_ids");
      if (stored) setSavedIds(JSON.parse(stored));
    } catch {}

    // 3. Load persistent read card IDs from localStorage
    let storedReadIds: string[] = [];
    try {
      const readRaw = localStorage.getItem("juris_read_cards");
      if (readRaw) storedReadIds = JSON.parse(readRaw);
      setReadCardIds(storedReadIds);
    } catch {}

    loadCards(storedReadIds);
  }, []);

  const loadCards = async (currentReadIds: string[] = readCardIds) => {
    setLoading(true);
    const data = await fetchFeed();

    // Partition cards into [read cards above, unread cards below]
    // The user opens directly onto the first unread card; scrolling UP reveals read cards!
    const unread = data.filter((c) => !currentReadIds.includes(c.id));
    const read = data.filter((c) => currentReadIds.includes(c.id));

    let finalOrdered: SummaryCard[];
    let initialIndex = 0;

    if (unread.length > 0 && read.length > 0) {
      finalOrdered = [...read, ...unread];
      initialIndex = read.length; // Start on the first unread card
    } else {
      finalOrdered = data;
      initialIndex = 0;
    }

    setCards(finalOrdered);
    setFirstUnreadIndex(initialIndex);
    setLoading(false);

    // Position scroll at the first unread card after DOM mounts
    setTimeout(() => {
      if (containerRef.current && initialIndex > 0) {
        const height = containerRef.current.clientHeight || window.innerHeight;
        containerRef.current.scrollTop = initialIndex * height;
      }
    }, 100);
  };

  // IntersectionObserver to record cards as read when viewed
  useEffect(() => {
    if (!containerRef.current || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const cardId = entry.target.getAttribute("data-card-id");
            if (cardId) {
              markAsRead(cardId);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    cards.forEach((card) => {
      const el = cardRefs.current[card.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [cards]);

  const markAsRead = (cardId: string) => {
    setReadCardIds((prev) => {
      if (prev.includes(cardId)) return prev;
      const updated = [...prev, cardId];
      try {
        localStorage.setItem("juris_read_cards", JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-50 dark:bg-judicial-950 text-slate-800 dark:text-slate-200 transition-colors">
        <div className="mb-4">
          <Logo size={48} showText={false} />
        </div>
        <span className="font-sans font-black text-xl tracking-tight text-slate-900 dark:text-white">
          JURIS<span className="text-blue-600 dark:text-blue-400">SHORTS</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Loading 60s Daily Judicial Docket...
        </span>
      </div>
    );
  }

  const allCaughtUp = cards.length > 0 && cards.every((c) => readCardIds.includes(c.id));

  return (
    <div className="relative w-full h-[100dvh] bg-slate-50 dark:bg-judicial-950 overflow-hidden transition-colors">
      
      {/* Top Header Bar */}
      <header className="fixed top-2.5 inset-x-0 max-w-md mx-auto z-30 px-4 flex items-center justify-between pointer-events-none">
        {/* Modern Vector Logo */}
        <div className="pointer-events-auto bg-white/95 dark:bg-judicial-900/95 border border-slate-200 dark:border-slate-800 rounded-full pl-2 pr-3 py-1 backdrop-blur-md shadow-md flex items-center gap-2">
          <Logo size={24} showText={false} />
          <span className="font-sans font-black text-slate-900 dark:text-white text-xs tracking-tight">
            JURIS<span className="text-blue-600 dark:text-blue-400">SHORTS</span>
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
            onClick={() => loadCards()}
            className="p-2 bg-white/95 dark:bg-judicial-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full backdrop-blur-md hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all shadow-md"
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
        {/* Upper Scroll-Up Catchup Pill if there are read cards above */}
        {firstUnreadIndex > 0 && (
          <div className="w-full max-w-md mx-auto pt-16 pb-2 text-center snap-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-[10px] font-semibold text-slate-600 dark:text-slate-300 backdrop-blur-sm">
              <History className="w-3 h-3 text-blue-500" />
              <span>Scroll up to review previously read rulings</span>
            </span>
          </div>
        )}

        {cards.map((card, idx) => {
          const isRead = readCardIds.includes(card.id);
          return (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[card.id] = el; }}
              data-card-id={card.id}
              className="w-full h-[100dvh] snap-start flex-shrink-0 relative"
            >
              <LegalCard
                card={card}
                mode={mode}
                onSectionClick={(act, section) => setActiveStatute({ act, section })}
                onAudioPlay={(c) => setAudioCard(c)}
                isSaved={savedIds.includes(card.id)}
                onToggleSave={handleToggleSave}
              />
              {/* Subtle visual badge if card is already read */}
              {isRead && (
                <div className="absolute top-14 right-4 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/50 text-[9px] font-medium text-slate-400 backdrop-blur-sm">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    Read
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Caught-up End State */}
        {allCaughtUp && (
          <div className="w-full h-[100dvh] snap-start flex flex-col items-center justify-center px-6 text-center bg-slate-50 dark:bg-judicial-950">
            <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 mb-4">
              <CheckCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              You're all caught up!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
              You've read all the latest Supreme Court and High Court rulings. Scroll up to review past judgments or check back for breaking updates.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("juris_read_cards");
                setReadCardIds([]);
                loadCards([]);
              }}
              className="mt-5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              Reset Reading History
            </button>
          </div>
        )}
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
