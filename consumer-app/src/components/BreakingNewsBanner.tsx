"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Flame, X, ArrowRight, ShieldCheck } from "lucide-react";
import { getLatestPush } from "@/lib/api";

interface BreakingItem {
  id: string;
  title: string;
  body: string;
  is_breaking?: boolean;
  card_id?: string;
  dispatched_at?: string;
}

export default function BreakingNewsBanner() {
  const [alertItem, setAlertItem] = useState<BreakingItem | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissedIdsRef = useRef<Set<string>>(new Set());

  // Synthesize soft alert chime via Web Audio API without external file dependency
  const playAlertChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  const handleNewAlert = (item: BreakingItem) => {
    if (!item || !item.id || dismissedIdsRef.current.has(item.id)) return;

    // Check if dismissed previously in sessionStorage
    const sessionDismissed = sessionStorage.getItem("dismissed_broadcast_" + item.id);
    if (sessionDismissed) return;

    setAlertItem(item);
    setVisible(true);
    playAlertChime();

    // Trigger native browser notification if granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(item.title, {
          body: item.body,
          icon: "/icons/icon-192x192.png",
          tag: "juris_broadcast_" + item.id
        });
      } catch (err) {
        console.warn("Notification error:", err);
      }
    }
  };

  useEffect(() => {
    // 1. Cross-tab instant 0ms sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("juris_broadcast");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "NEW_BROADCAST") {
          handleNewAlert(event.data.payload);
        }
      };
    }

    // 2. Cross-tab fallback via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "juris_cross_tab_push" && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          handleNewAlert(payload);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Polling fallback to backend /api/v1/push/latest every 4 seconds
    const pollLatest = async () => {
      try {
        const latest = await getLatestPush();
        if (latest) {
          handleNewAlert(latest);
        }
      } catch {}
    };

    pollLatest();
    const interval = setInterval(pollLatest, 4000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = () => {
    if (alertItem) {
      dismissedIdsRef.current.add(alertItem.id);
      sessionStorage.setItem("dismissed_broadcast_" + alertItem.id, "true");
    }
    setVisible(false);
  };

  const handleView = () => {
    if (alertItem?.card_id) {
      const el = document.getElementById(`card-${alertItem.card_id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    handleDismiss();
  };

  if (!visible || !alertItem) return null;

  return (
    <aside 
      aria-label="Breaking Judicial Alert"
      role="alert"
      className="fixed top-3 inset-x-3 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-top duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 border border-blue-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 text-slate-100 ring-1 ring-blue-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Flame className="w-3 h-3 text-red-400 animate-pulse" />
              Breaking Alert
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live Docket</span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Dismiss breaking alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug">
            {alertItem.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {alertItem.body}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="text-[10px] text-blue-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Verified Judicial Docket
          </span>

          <button
            onClick={handleView}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>Read Ruling</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
