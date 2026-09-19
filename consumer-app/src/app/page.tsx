"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { fetchFeed } from "@/lib/api";
import { SummaryCard, UserMode } from "@/lib/types";
import LegalCard from "@/components/LegalCard";
import BareActDrawer from "@/components/BareActDrawer";
import AudioByteModal from "@/components/AudioByteModal";
import PersonaOnboardingModal from "@/components/PersonaOnboardingModal";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { RefreshCw, ChevronDown, CheckCheck, History, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

export default function HomeFeed() {
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<UserMode>("advocate");
  const [showModeModal, setShowModeModal] = useState(false);
  const [readCardIds, setReadCardIds] = useState<string[]>([]);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  
  // Drawer & Audio States
  const [activeStatute, setActiveStatute] = useState<{ act: string; section: string } | null>(null);
  const [audioCard, setAudioCard] = useState<SummaryCard | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Prevent browser native scroll restoration on refresh so we can precisely control unread positioning
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

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
    setIsPositioned(false);
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
  };

  // Position scroll at the first unread card before browser paint
  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (loading || cards.length === 0) return;

    if (firstUnreadIndex > 0 && containerRef.current) {
      const height = containerRef.current.clientHeight || window.innerHeight;
      containerRef.current.scrollTop = firstUnreadIndex * height;
      
      const unreadCard = cards[firstUnreadIndex];
      if (unreadCard && cardRefs.current[unreadCard.id]) {
        cardRefs.current[unreadCard.id]?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }

    const timer = requestAnimationFrame(() => {
      setIsPositioned(true);
    });

    return () => cancelAnimationFrame(timer);
  }, [loading, firstUnreadIndex, cards]);

  // Track active card on scroll to reliably mark as read
  const handleContainerScroll = () => {
    if (!containerRef.current || cards.length === 0) return;
    const height = containerRef.current.clientHeight || window.innerHeight;
    const scrollPos = containerRef.current.scrollTop;
    const activeIdx = Math.round(scrollPos / height);
    if (cards[activeIdx]) {
      markAsRead(cards[activeIdx].id);
    }
  };

  // Secondary IntersectionObserver to record cards as read when viewed
  useEffect(() => {
    if (!containerRef.current || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const cardId = entry.target.getAttribute("data-card-id");
            if (cardId) {
              markAsRead(cardId);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
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

  const handleResetHistory = () => {
    localStorage.removeItem("juris_read_cards");
    setReadCardIds([]);
    setReviewMode(false);
    loadCards([]);
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

  // All Caught Up condition: user has read all available cards
  const allCaughtUp = cards.length > 0 && cards.every((c) => readCardIds.includes(c.id));

  // If user refreshed or opened app after reading all cards, show the All Caught Up screen directly!
  if (allCaughtUp && !reviewMode) {
    return (
      <div className="relative w-full h-[100dvh] bg-slate-50 dark:bg-judicial-950 overflow-hidden transition-colors flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <header className="fixed top-2.5 inset-x-0 max-w-md mx-auto z-30 px-4 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-white/95 dark:bg-judicial-900/95 border border-slate-200 dark:border-slate-800 rounded-full pl-2 pr-3 py-1 backdrop-blur-md shadow-md flex items-center gap-2">
            <Logo size={24} showText={false} />
            <span className="font-sans font-black text-slate-900 dark:text-white text-xs tracking-tight">
              JURIS<span className="text-blue-600 dark:text-blue-400">SHORTS</span>
            </span>

            <button
              onClick={() => setShowModeModal(true)}
              className="flex items-center gap-1 ml-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors active:scale-95"
              title="Click to switch between Advocate and Citizen mode"
            >
              <span>{mode === "advocate" ? "⚖️ Advocate" : "💡 Citizen"}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

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

        {/* Centered All Caught Up Hero Screen */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto my-auto animate-fadeIn">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-judicial-950">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 mb-2">
            <Sparkles className="w-3 h-3" />
            Daily Docket Complete
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            You're All Caught Up!
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mt-2 leading-relaxed">
            You've completed reading all {readCardIds.length} rulings in today's legal docket. There are no pending unread judgments.
          </p>

          {/* Action CTAs */}
          <div className="w-full space-y-2.5 mt-6">
            <button
              onClick={() => setReviewMode(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
            >
              <History className="w-4 h-4" />
              <span>Review Past Rulings ({readCardIds.length})</span>
            </button>

            <button
              onClick={handleResetHistory}
              className="w-full bg-white dark:bg-judicial-900 hover:bg-slate-100 dark:hover:bg-judicial-800 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-2xl text-xs tracking-wider border border-slate-200 dark:border-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Reading History</span>
            </button>

            <button
              onClick={() => loadCards()}
              className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1.5 pt-2 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check for breaking judgments</span>
            </button>
          </div>
        </div>

        {/* Configurable Persona Lens Modal */}
        <PersonaOnboardingModal
          currentMode={mode}
          onSelectMode={handleModeChange}
          forceOpen={showModeModal}
          onClose={() => setShowModeModal(false)}
        />

      </div>
    );
  }

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

      {/* Review Mode Banner if user is reviewing read cards */}
      {reviewMode && (
        <div className="fixed top-14 inset-x-0 max-w-xs mx-auto z-30 flex justify-center pointer-events-auto animate-fadeIn">
          <button
            onClick={() => setReviewMode(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-semibold backdrop-blur-md shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span>Reviewing Read Rulings • Return</span>
          </button>
        </div>
      )}

      {/* Snap-Scrolling Vertical Deck Container */}
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className={`w-full h-full overflow-y-scroll snap-y-mandatory no-scrollbar transition-opacity duration-150 ${isPositioned ? "opacity-100" : "opacity-0"}`}
      >
        {cards.map((card) => {
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-medium text-slate-300 backdrop-blur-sm shadow-sm">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    Read
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Caught-up Snap Card at the bottom of the feed */}
        <div className="w-full h-[100dvh] snap-start flex-shrink-0 flex flex-col items-center justify-center px-6 text-center bg-slate-50 dark:bg-judicial-950">
          <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/30 mb-4 text-blue-500">
            <CheckCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            You're all caught up!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
            You've read all the latest Supreme Court and High Court rulings. Scroll up to review past judgments or check back for breaking updates.
          </p>
          <div className="flex flex-col gap-2 mt-5 w-full max-w-xs">
            <button
              onClick={handleResetHistory}
              className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              Reset Reading History
            </button>
            <button
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="w-full px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all active:scale-95"
            >
              Scroll to Top
            </button>
          </div>
        </div>
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
