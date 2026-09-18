"use client";

import React, { useState } from "react";
import { PenTool, Sparkles, Send, Bell, CheckCircle2, Scale } from "lucide-react";
import { aiAssistDraft, createCardManual } from "@/lib/api";

export default function ComposePage() {
  const [rawText, setRawText] = useState("");
  const [courtName, setCourtName] = useState("Supreme Court of India");
  const [category, setCategory] = useState("Criminal Law");
  const [headline, setHeadline] = useState("");
  const [advocateSummary, setAdvocateSummary] = useState("");
  const [citizenSummary, setCitizenSummary] = useState("");
  const [citation, setCitation] = useState("2026 INSC ");
  const [bench, setBench] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [broadcastPush, setBroadcastPush] = useState(false);

  const [assisting, setAssisting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAIAssist = async () => {
    if (!rawText) {
      alert("Please paste some court order or reporter text first.");
      return;
    }

    setAssisting(true);
    try {
      const draft = await aiAssistDraft(rawText, courtName);
      setHeadline(draft.headline || "");
      setAdvocateSummary(draft.advocate_summary || "");
      setCitizenSummary(draft.citizen_summary || "");
      if (draft.bench) setBench(draft.bench);
    } catch (err: any) {
      alert("AI Co-Pilot failed: " + err.message);
    } finally {
      setAssisting(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline || !advocateSummary || !citizenSummary) return;

    setPublishing(true);
    try {
      await createCardManual({
        court_name: courtName,
        category: category,
        headline: headline,
        advocate_summary: advocateSummary,
        citizen_summary: citizenSummary,
        citation: citation,
        bench: bench,
        is_breaking: isBreaking,
        broadcast_push: broadcastPush
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRawText("");
        setHeadline("");
        setAdvocateSummary("");
        setCitizenSummary("");
      }, 2500);
    } catch (err: any) {
      alert("Publish failed: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const advWords = advocateSummary.trim().split(/\s+/).filter(Boolean).length;
  const citWords = citizenSummary.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PenTool className="w-5 h-5 text-gold-400" />
          <h1 className="text-xl font-bold text-slate-100">
            Manual Card Composer & AI Co-Pilot
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Paste raw court orders or hearing notes and let the AI Co-Pilot structure 60-word dual-mode summaries.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-sm p-4 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Card published successfully to live consumer feed!</span>
        </div>
      )}

      {/* AI Co-Pilot Input Box */}
      <div className="bg-admin-900 border border-gold-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="text-sm font-bold text-slate-200">AI Co-Pilot Ingestion Assistant</h3>
          </div>
          <button
            type="button"
            onClick={handleAIAssist}
            disabled={assisting || !rawText}
            className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all shadow-md shadow-gold-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{assisting ? "AI Synthesizing..." : "✨ Auto-Generate Micro Summaries"}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste raw judgment paragraphs, causelist outcome, or reporter notes here..."
          className="w-full bg-admin-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-gold-500 resize-none font-mono"
        />
      </div>

      {/* Publishing Form */}
      <form onSubmit={handlePublish} className="bg-admin-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Court Name
            </label>
            <input
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Legal Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100"
            >
              <option>Criminal Law</option>
              <option>Constitutional Law</option>
              <option>Commercial / NI Act</option>
              <option>Corporate / Arbitration</option>
              <option>Taxation / GST</option>
              <option>Consumer Rights</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Official Citation
            </label>
            <input
              type="text"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="e.g. 2026 INSC 450"
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Card Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline of the ruling..."
            className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-serif font-bold text-slate-100 focus:outline-none focus:border-gold-500"
            required
          />
        </div>

        {/* Dual Mode Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gold-400">⚖️ Advocate Summary (Ratio)</span>
              <span className={`font-mono text-[11px] ${advWords <= 65 ? "text-slate-400" : "text-red-400 font-bold"}`}>
                {advWords} / 65 words
              </span>
            </div>
            <textarea
              rows={5}
              value={advocateSummary}
              onChange={(e) => setAdvocateSummary(e.target.value)}
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-gold-500 resize-none font-sans"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-sky-400">💡 Citizen Summary (Simple)</span>
              <span className={`font-mono text-[11px] ${citWords <= 50 ? "text-slate-400" : "text-red-400 font-bold"}`}>
                {citWords} / 50 words
              </span>
            </div>
            <textarea
              rows={5}
              value={citizenSummary}
              onChange={(e) => setCitizenSummary(e.target.value)}
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl p-3 text-xs leading-relaxed text-sky-100 focus:outline-none focus:border-sky-500 resize-none font-sans"
              required
            />
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-gold-500"
              />
              <span className="text-slate-300 font-medium">Mark as Breaking</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={broadcastPush}
                onChange={(e) => setBroadcastPush(e.target.checked)}
                className="w-4 h-4 rounded text-gold-500"
              />
              <span className="text-gold-400 font-bold flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Broadcast Push Alert 🚨</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={publishing}
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-gold-500/20"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? "Publishing..." : "Publish to Live Feed"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
