"use client";

import React, { useState, useEffect } from "react";
import { Search, Scale, ChevronRight } from "lucide-react";
import { fetchFeed } from "@/lib/api";
import { SummaryCard } from "@/lib/types";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function ExplorePage() {
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const courts = ["All", "Supreme Court", "Delhi HC", "Bombay HC", "NCLAT"];
  const categories = ["All", "Criminal Law", "Commercial / NI Act", "Criminal Procedure", "Corporate / Arbitration"];

  useEffect(() => {
    fetchFeed(
      selectedCourt !== "All" ? selectedCourt : undefined,
      selectedCategory !== "All" ? selectedCategory : undefined
    ).then((res) => setCards(res));
  }, [selectedCourt, selectedCategory]);

  const filteredCards = cards.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.headline.toLowerCase().includes(term) ||
      c.advocate_summary.toLowerCase().includes(term) ||
      (c.citation && c.citation.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col bg-white dark:bg-judicial-950 px-5 pt-8 pb-24 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Explore Judgments
        </h1>
        <ThemeToggle />
      </div>

      {/* Search Bar */}
      <div className="relative mb-3 shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by keyword, judge, citation (e.g. 2026 INSC)..."
          className="w-full bg-slate-50 dark:bg-judicial-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      {/* Court Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 shrink-0">
        {courts.map((court) => (
          <button
            key={court}
            onClick={() => setSelectedCourt(court)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCourt === court
                ? "bg-gold-500 text-slate-950 shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {court}
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40"
                : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 border border-slate-200 dark:border-slate-850"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
        {filteredCards.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No matching judgments found.
          </div>
        ) : (
          filteredCards.map((card) => (
            <Link
              key={card.id}
              href={`/#card-${card.id}`}
              className="block bg-slate-50 dark:bg-judicial-900 hover:bg-slate-100 dark:hover:bg-judicial-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between text-[11px] text-gold-600 dark:text-gold-400 mb-1">
                <span className="font-semibold">{card.court_name}</span>
                {card.citation && <span className="font-mono text-slate-500">{card.citation}</span>}
              </div>
              <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-slate-100 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2 mb-1.5">
                {card.headline}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {card.advocate_summary}
              </p>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
