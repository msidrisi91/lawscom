"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, Volume2, Bookmark, Share2, Copy, 
  Scale, ArrowUpRight, Flame, Check, BookOpen, Clock 
} from "lucide-react";
import { SummaryCard, UserMode } from "@/lib/types";

interface LegalCardProps {
  card: SummaryCard;
  mode: UserMode;
  onSectionClick: (act: string, section: string) => void;
  onAudioPlay: (card: SummaryCard) => void;
  isSaved?: boolean;
  onToggleSave?: (cardId: string) => void;
}

export default function LegalCard({
  card,
  mode,
  onSectionClick,
  onAudioPlay,
  isSaved = false,
  onToggleSave
}: LegalCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyCitation = () => {
    if (card.citation) {
      navigator.clipboard.writeText(`${card.headline} (${card.citation})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const shareText = `⚖️ ${card.headline}\n\n${mode === "advocate" ? card.advocate_summary : card.citizen_summary}\n\nRead more on JurisShorts (60s Legal News)`;
    if (navigator.share) {
      navigator.share({ title: card.headline, text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-md mx-auto flex flex-col justify-between bg-white dark:bg-judicial-950 border-x border-slate-200 dark:border-slate-800/80 px-5 pt-14 pb-24 select-none transition-colors duration-200">
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          {/* Court Badge */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-full px-3 py-1 text-xs text-slate-700 dark:text-slate-300">
            <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-semibold truncate max-w-[170px]">{card.court_name}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>

          {/* Published Time / Relative */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3 h-3" />
            <span>Today</span>
          </div>
        </div>

        {/* Breaking & Category Metadata */}
        <div className="flex items-center gap-2 mb-3">
          {card.is_breaking && (
            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-400 text-[10.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              <Flame className="w-3 h-3 text-red-500 fill-current" />
              Breaking
            </span>
          )}
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            {card.category}
          </span>
          {card.citation && (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-auto bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              {card.citation}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="font-serif text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight mb-4">
          {card.headline}
        </h1>

        {/* 60-Word Micro Summary Body (Mode-specific) */}
        <div className="relative">
          <div className="text-slate-700 dark:text-slate-300 text-[15.5px] sm:text-[16.5px] leading-relaxed font-sans min-h-[140px]">
            {mode === "advocate" ? (
              <p className="animate-fadeIn font-normal">
                {card.advocate_summary}
              </p>
            ) : (
              <p className="animate-fadeIn text-slate-800 dark:text-blue-50/95 font-normal">
                {card.citizen_summary}
              </p>
            )}
          </div>

          {/* Subtle Mode Lens Indicator */}
          <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 font-medium">
            <span>
              {mode === "advocate" ? "⚖️ Advocate Legal Ratio" : "💡 Citizen Practical Takeaway"}
            </span>
            {card.bench && mode === "advocate" && (
              <span className="truncate max-w-[190px] font-mono text-slate-500">
                Bench: {card.bench}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area: Bare Acts & Action Toolbar */}
      <div>
        {/* Bare Act Section Pills */}
        {card.related_sections && card.related_sections.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Cited Bare Acts (Tap to read full section):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {card.related_sections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => onSectionClick(sec.act, sec.section)}
                  className="inline-flex items-center gap-1 bg-blue-50 dark:bg-slate-850 hover:bg-blue-100 dark:hover:bg-slate-800 active:scale-95 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 text-xs font-mono font-medium px-2.5 py-1 rounded-lg transition-all shadow-sm"
                  aria-label={`View Bare Act section ${sec.section} of ${sec.act}`}
                >
                  <span>{sec.act} § {sec.section}</span>
                  <ArrowUpRight className="w-3 h-3 text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
          
          {/* Audio 30s Speech Button */}
          <button
            onClick={() => onAudioPlay(card)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 active:scale-95 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-full transition-all shadow-sm"
            aria-label="Listen to audio briefing"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Listen Audio</span>
          </button>

          {/* Copy Citation */}
          {card.citation && (
            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 active:scale-90 p-2 transition-colors"
              title="Copy official citation"
              aria-label="Copy citation"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span className="text-[11px] hidden sm:inline">{copied ? "Copied" : "Cite"}</span>
            </button>
          )}

          {/* Save / Bookmark */}
          <button
            onClick={() => onToggleSave && onToggleSave(card.id)}
            className={`p-2 transition-colors active:scale-90 ${isSaved ? "text-blue-600 dark:text-blue-400 fill-current" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
            aria-label="Save to briefcase"
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold px-3.5 py-2 rounded-full transition-all"
            aria-label="Share legal card"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shared ? "Copied!" : "Share"}</span>
          </button>
        </div>

        {/* Swipe Up Navigation Hint */}
        <div className="text-center mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 tracking-wider uppercase font-semibold">
          Swipe Up For Next Ruling ↑
        </div>
      </div>

    </div>
  );
}
