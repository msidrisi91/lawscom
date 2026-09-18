"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { subscribePush } from "@/lib/api";

export default function PushPrompt() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Show after 3 seconds on first visit
    const dismissed = localStorage.getItem("push_prompt_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await subscribePush({ endpoint: "browser_vapid_" + Date.now() }, "all");
        }
      } else {
        await subscribePush({ endpoint: "simulated_push_" + Date.now() }, "all");
      }
      setSubscribed(true);
      setTimeout(() => {
        setShow(false);
        localStorage.setItem("push_prompt_dismissed", "true");
      }, 1500);
    } catch {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("push_prompt_dismissed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed top-3 inset-x-3 max-w-md mx-auto z-40 animate-slideDown">
      <div className="bg-judicial-800/95 border border-gold-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">Breaking Judicial Alerts</h4>
            <p className="text-[11px] text-slate-300">Instant push for Supreme Court verdicts & new laws.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleEnable}
            disabled={subscribed}
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1"
          >
            {subscribed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Subscribed!</span>
              </>
            ) : (
              "Enable"
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-200"
            aria-label="Dismiss alert prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
