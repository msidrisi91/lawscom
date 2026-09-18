"use client";

import React, { useEffect, useState } from "react";
import { X, BookOpen, Shield, Copy, Check } from "lucide-react";
import { StatuteSection } from "@/lib/types";
import { fetchStatuteSection } from "@/lib/api";

interface BareActDrawerProps {
  act: string | null;
  section: string | null;
  onClose: () => void;
}

export default function BareActDrawer({ act, section, onClose }: BareActDrawerProps) {
  const [data, setData] = useState<StatuteSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (act && section) {
      setLoading(true);
      fetchStatuteSection(act, section)
        .then((res) => setData(res))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [act, section]);

  if (!act || !section) return null;

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(`${data.title}\n\nBare Act:\n${data.bare_act_text}\n\nPlain Meaning:\n${data.layman_explanation}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm transition-opacity animate-fadeIn">
      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-judicial-900 border-t border-slate-200 dark:border-slate-700/80 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col animate-slideUp text-slate-900 dark:text-slate-100">
        
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-750 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-600 dark:text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-gold-600 dark:text-gold-400 font-bold tracking-wider uppercase">
                {act} Section {section}
              </span>
              <h2 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                {data?.title || `Section ${section} of ${act}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Bare Act drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="overflow-y-auto no-scrollbar space-y-4 text-sm pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent mb-2" />
              <p>Fetching official statutory text...</p>
            </div>
          ) : data ? (
            <>
              {/* Official Bare Act Text */}
              <div className="bg-slate-50 dark:bg-judicial-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-gold-500" />
                    Official Statutory Bare Act Text
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 hover:underline font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Text"}</span>
                  </button>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-[13.5px]">
                  "{data.bare_act_text}"
                </p>
              </div>

              {/* Simplified Citizen Explanation */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 tracking-wider uppercase block mb-1">
                  💡 Plain-English Takeaway
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[13.5px]">
                  {data.layman_explanation}
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-6">Could not load bare act text.</p>
          )}
        </div>

        {/* Bottom Done Button */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium py-3 rounded-2xl transition-colors active:scale-98 text-xs font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}
