"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, Send, Smartphone, History, Flame, Users, CheckCircle2, AlertCircle 
} from "lucide-react";
import { broadcastPush, fetchBroadcastHistory } from "@/lib/api";

export default function PushCenterPage() {
  const [title, setTitle] = useState("SC Grants Bail In High-Profile PMLA Case");
  const [body, setBody] = useState("Supreme Court holds prolonged detention violates Article 21 speedy trial rights, overriding strict twin bail conditions.");
  const [targetRole, setTargetRole] = useState("all");
  const [isBreaking, setIsBreaking] = useState(true);
  
  const [history, setHistory] = useState<any[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await fetchBroadcastHistory();
    setHistory(data);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setBroadcasting(true);
    try {
      const res = await broadcastPush(title, body, undefined, targetRole, isBreaking);
      setSuccessNotice(`Successfully broadcasted to ${res.subscribers_notified} active subscribers!`);
      loadHistory();
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert("Broadcast failed: " + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-gold-400" />
          <h1 className="text-xl font-bold text-slate-100">
            Push Notification Broadcast Console
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Dispatch instant breaking news alerts and daily docket briefings to mobile and PWA subscribers.
        </p>
      </div>

      {successNotice && (
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-sm p-4 rounded-xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Grid: Composer on Left, Live Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Broadcast Form (2 Cols) */}
        <form onSubmit={handleBroadcast} className="lg:col-span-2 bg-admin-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Compose Broadcast Payload</h3>
            
            {/* Breaking Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-slate-400 font-medium">Breaking News Priority:</span>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 rounded text-gold-500 focus:ring-gold-400"
              />
              <span className={`text-xs font-bold ${isBreaking ? "text-red-400" : "text-slate-500"}`}>
                {isBreaking ? "🚨 HIGH PRIORITY" : "NORMAL"}
              </span>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 7-Judge SC Bench Delivers Ruling On Arbitration"
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Summary Snippet (Body)
              </label>
              <span className={`text-[11px] font-mono ${wordCount <= 35 ? "text-slate-400" : "text-amber-400"}`}>
                {wordCount} words (Recommended: &lt; 35 for lockscreen)
              </span>
            </div>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter brief 1-2 sentence core message..."
              className="w-full bg-admin-950 border border-slate-700/80 rounded-xl p-3 text-xs leading-relaxed text-slate-200 focus:outline-none focus:border-gold-500 resize-none font-sans"
              required
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Target Audience Segment
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "all", label: "All Subscribers", desc: "Broadcast to all mobile & web" },
                { id: "advocate", label: "Advocates Only", desc: "Practitioners & Law firms" },
                { id: "citizen", label: "Citizens Only", desc: "General public awareness" },
              ].map((role) => (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => setTargetRole(role.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetRole === role.id
                      ? "bg-gold-500/10 border-gold-500/60 text-gold-300"
                      : "bg-admin-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block text-xs font-bold mb-0.5">{role.label}</span>
                  <span className="block text-[10px] text-slate-500">{role.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={broadcasting}
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-gold-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{broadcasting ? "Broadcasting..." : "Broadcast Push Notification Now"}</span>
            </button>
          </div>
        </form>

        {/* Live Mobile Notification Preview (1 Col) */}
        <div className="bg-admin-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-gold-400" />
              <span>Live Lock-Screen Preview</span>
            </div>

            {/* Simulated Phone Notification Banner */}
            <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-gold-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
                    JS
                  </div>
                  <span className="font-semibold text-slate-200">JurisShorts</span>
                  <span className="text-[10px] text-slate-500">• now</span>
                </div>
                {isBreaking && (
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    🚨 URGENT
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-100 leading-snug mb-1">
                {isBreaking ? `🚨 BREAKING: ${title}` : title}
              </h4>

              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {body}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-gold-400 font-medium">
                <span>Tap to read 60-sec brief</span>
                <span>🔊 30s Audio</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-admin-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <p><strong>Note:</strong> High-priority alerts trigger instant audible chime and vibration on registered mobile devices.</p>
          </div>
        </div>

      </div>

      {/* Broadcast History Table */}
      <div className="bg-admin-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-slate-200">Recent Push Dispatches Audit Log</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No broadcasts dispatched yet in this session.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-mono">
                <tr>
                  <th className="pb-2">Dispatch ID</th>
                  <th className="pb-2">Headline</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Recipients</th>
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((h) => (
                  <tr key={h.id} className="text-slate-300">
                    <td className="py-2.5 font-mono text-slate-500">{h.id}</td>
                    <td className="py-2.5 font-medium text-slate-200 max-w-xs truncate">{h.title}</td>
                    <td className="py-2.5 capitalize">{h.target_role}</td>
                    <td className="py-2.5 font-mono text-emerald-400">{h.recipient_count} devices</td>
                    <td className="py-2.5">
                      {h.is_breaking ? (
                        <span className="text-red-400 font-bold">Breaking</span>
                      ) : (
                        <span className="text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{new Date(h.dispatched_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
