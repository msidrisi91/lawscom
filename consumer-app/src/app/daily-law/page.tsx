"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, XCircle, Award, Flame, BookOpen } from "lucide-react";
import { fetchDailyLaw } from "@/lib/api";
import { DailyLaw } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

export default function DailyLawPage() {
  const [law, setLaw] = useState<DailyLaw | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchDailyLaw().then((res) => setLaw(res));
  }, []);

  if (!law) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
        Loading Law of the Day...
      </div>
    );
  }

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
    setSubmitted(true);
  };

  const isCorrect = selectedOption === law.correct_option_index;

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col justify-between bg-white dark:bg-judicial-950 px-5 pt-8 pb-24 overflow-y-auto no-scrollbar text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Legal Awareness</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 px-2.5 py-1 rounded-full text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>5 Day Streak</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Date & Topic */}
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mb-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
          {law.headline}
        </h1>

        {/* Knowledge Flashcard */}
        <div className="bg-slate-50 dark:bg-judicial-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl mb-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-bold">
            <BookOpen className="w-4 h-4" />
            <span>{law.statute_reference || "Statutory Ground Truth"}</span>
          </div>

          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-sans">
            {law.explanation}
          </p>

          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block mb-1">
              🛡️ Practical Legal Remedy
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
              {law.practical_tip}
            </p>
          </div>
        </div>

        {/* Daily Micro Quiz */}
        {law.quiz_question && (
          <div className="bg-slate-50 dark:bg-judicial-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              <Award className="w-4 h-4 text-blue-500" />
              <span>Test Your Legal Awareness:</span>
            </div>

            <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold mb-3">
              {law.quiz_question}
            </p>

            <div className="space-y-2">
              {law.quiz_options.map((opt, idx) => {
                let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750";
                if (submitted) {
                  if (idx === law.correct_option_index) {
                    btnStyle = "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                  } else if (selectedOption === idx) {
                    btnStyle = "bg-red-50 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-200";
                  } else {
                    btnStyle = "bg-slate-100/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left text-xs p-3.5 rounded-2xl border transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {submitted && idx === law.correct_option_index && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {submitted && selectedOption === idx && idx !== law.correct_option_index && (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-3.5 text-xs p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {isCorrect ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎉 Correct! </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-bold">Incorrect. </span>
                )}
                Under Article 22(2) and BNSS, police must produce anyone arrested before a magistrate within 24 hours.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
