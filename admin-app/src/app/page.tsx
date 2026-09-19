"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, Bell, XCircle, AlertTriangle, ShieldCheck, 
  Scale, RefreshCw, Sparkles, Filter 
} from "lucide-react";
import { fetchTriageQueue, processTriageAction } from "@/lib/api";

export default function AdminTriagePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("IN_REVIEW");
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    loadTriage();
  }, [statusFilter]);

  const loadTriage = async () => {
    setLoading(true);
    const data = await fetchTriageQueue(statusFilter);
    setItems(data);
    setLoading(false);
  };

  const handleAction = async (cardId: string, action: "APPROVE" | "REJECT", broadcastPush: boolean = false) => {
    setActingId(cardId);
    try {
      await processTriageAction(cardId, action, { broadcast_push: broadcastPush });
      
      if (action === "APPROVE" && typeof window !== "undefined") {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("juris_broadcast");
          bc.postMessage({ type: "NEW_CARD_PUBLISHED", payload: { cardId } });
          bc.close();
        }
        localStorage.setItem("juris_cross_tab_new_card", JSON.stringify({ cardId, ts: Date.now() }));
      }

      // Remove from list or refresh
      setItems((prev) => prev.filter((item) => item.id !== cardId));
    } catch (err) {
      alert("Action failed: " + err);
    } finally {
      setActingId(null);
    }
  };

  const handleTextChange = (cardId: string, field: string, val: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === cardId ? { ...item, [field]: val } : item))
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-100">
              Human-in-the-Loop (HITL) Triage Desk
            </h1>
            <span className="bg-blue-950/80 text-blue-400 border border-blue-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {items.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Review, verify statutory citations, tweak 60-word micro-summaries, and 1-click publish or broadcast push alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex bg-admin-950 p-1 rounded-xl border border-slate-800 text-xs">
            {["IN_REVIEW", "PUBLISHED", "ALL"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s === "IN_REVIEW" ? "Pending Triage" : s === "PUBLISHED" ? "Live Feed" : "All Records"}
              </button>
            ))}
          </div>

          <button
            onClick={loadTriage}
            className="p-2 bg-admin-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Triage Cards List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Loading triage queue...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-admin-900/50 border border-slate-800 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">Queue is Clear!</h3>
          <p className="text-xs text-slate-400">All incoming court documents have been reviewed or auto-published.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((card) => {
            const advWords = (card.advocate_summary || "").trim().split(/\s+/).filter(Boolean).length;
            const citWords = (card.citizen_summary || "").trim().split(/\s+/).filter(Boolean).length;
            const isProcessing = actingId === card.id;

            return (
              <div
                key={card.id}
                className="bg-admin-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-200">{card.court_name}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400 font-medium">{card.category}</span>
                    {card.citation && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-400">{card.citation}</span>
                      </>
                    )}
                    {card.holding && (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {card.holding}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Confidence Indicator */}
                    <div className="flex items-center gap-1.5 text-xs bg-admin-950 border border-slate-800 px-3 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-400">AI Confidence:</span>
                      <span className={`font-mono font-bold ${card.confidence_score >= 0.95 ? "text-emerald-400" : "text-sky-400"}`}>
                        {Math.round(card.confidence_score * 100)}%
                      </span>
                    </div>

                    {card.is_breaking && (
                      <span className="bg-red-950/80 border border-red-500/40 text-red-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Breaking
                      </span>
                    )}
                  </div>
                </div>

                {/* Flag Reason Notice */}
                {card.flag_reason && (
                  <div className="flex items-center gap-2 bg-red-950/30 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span><strong>Review Note:</strong> {card.flag_reason}</span>
                  </div>
                )}

                {/* Headline Input */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={card.headline}
                    onChange={(e) => handleTextChange(card.id, "headline", e.target.value)}
                    className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-serif font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Side-by-Side Dual-Mode Editor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Advocate Summary */}
                  <div className="bg-admin-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                        ⚖️ Advocate Summary (Legal Ratio)
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        advWords <= 65 ? "bg-slate-800 text-slate-300" : "bg-red-950 text-red-300 font-bold"
                      }`}>
                        {advWords} / 65 words
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={card.advocate_summary}
                      onChange={(e) => handleTextChange(card.id, "advocate_summary", e.target.value)}
                      className="w-full bg-admin-950 border border-slate-700/60 rounded-lg p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-sans"
                    />
                  </div>

                  {/* Citizen Summary */}
                  <div className="bg-admin-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                        💡 Citizen Summary (Plain English)
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        citWords <= 50 ? "bg-slate-800 text-slate-300" : "bg-red-950 text-red-300 font-bold"
                      }`}>
                        {citWords} / 50 words
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={card.citizen_summary}
                      onChange={(e) => handleTextChange(card.id, "citizen_summary", e.target.value)}
                      className="w-full bg-admin-950 border border-slate-700/60 rounded-lg p-3 text-xs leading-relaxed text-sky-100/90 focus:outline-none focus:border-sky-500 resize-none font-sans"
                    />
                  </div>
                </div>

                {/* Ratio & Sections Info */}
                {card.ratio_decidendi && (
                  <div className="text-xs text-slate-400 bg-admin-950 p-3 rounded-xl border border-slate-800/80">
                    <strong className="text-slate-300">Extracted Ratio:</strong> {card.ratio_decidendi}
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(card.id, "REJECT")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Approve & Publish */}
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(card.id, "APPROVE", false)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approve & Publish</span>
                    </button>

                    {/* Approve & Broadcast Push Alert */}
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(card.id, "APPROVE", true)}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Approve & Push Alert 🚨</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
