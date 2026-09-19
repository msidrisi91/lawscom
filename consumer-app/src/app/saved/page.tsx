"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Copy, Check, Trash2, ArrowRight } from "lucide-react";
import { fetchFeed } from "@/lib/api";
import { SummaryCard } from "@/lib/types";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function SavedPage() {
  const [savedCards, setSavedCards] = useState<SummaryCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("briefcase_ids");
      const ids: string[] = stored ? JSON.parse(stored) : [];
      fetchFeed().then((all) => {
        setSavedCards(all.filter((c) => ids.includes(c.id)));
      });
    } catch {}
  }, []);

  const handleRemove = (id: string) => {
    const updated = savedCards.filter((c) => c.id !== id);
    setSavedCards(updated);
    try {
      localStorage.setItem("briefcase_ids", JSON.stringify(updated.map((c) => c.id)));
    } catch {}
  };

  const handleCopyCitation = (card: SummaryCard) => {
    if (card.citation) {
      navigator.clipboard.writeText(`${card.headline} (${card.citation})`);
      setCopiedId(card.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col bg-white dark:bg-judicial-950 px-5 pt-8 pb-24 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-current" />
          <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Courtroom Briefcase
          </h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Saved offline for courtroom arguments, commute reading, and moot research.
      </p>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
        {savedCards.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">
            <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-sm">Your briefcase is empty</p>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
              Tap the bookmark ribbon on any brief to save it here for offline reference.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95"
            >
              <span>Explore Latest Briefs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          savedCards.map((card) => (
            <div
              key={card.id}
              className="bg-slate-50 dark:bg-judicial-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative"
            >
              <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 mb-1">
                <span className="font-semibold">{card.court_name}</span>
                {card.citation && <span className="font-mono text-slate-500">{card.citation}</span>}
              </div>

              <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
                {card.headline}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                {card.advocate_summary}
              </p>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-xs">
                <button
                  onClick={() => handleCopyCitation(card)}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-bold"
                >
                  {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === card.id ? "Copied" : "Copy Citation"}</span>
                </button>

                <button
                  onClick={() => handleRemove(card.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                  aria-label="Remove from briefcase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
