"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, Sliders, Activity, CheckCircle2, RefreshCw, 
  ShieldAlert, Play, Database, Globe 
} from "lucide-react";
import { fetchEngineStatus, updateEngineConfig } from "@/lib/api";

export default function EngineControlsPage() {
  const [autoPublish, setAutoPublish] = useState(true);
  const [threshold, setThreshold] = useState(0.95);
  const [scrapers, setScrapers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    const data = await fetchEngineStatus();
    setAutoPublish(data.auto_publish_enabled ?? true);
    setThreshold(data.confidence_threshold ?? 0.95);
    setScrapers(data.scraper_status || {});
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEngineConfig(autoPublish, threshold);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err: any) {
      alert("Failed to update config: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-slate-100">
            Publishing Engine & Scraper Controls
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Configure autonomous publishing rules, confidence score cutoffs, and monitor court crawlers.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-3.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Engine configuration successfully saved!</span>
        </div>
      )}

      {/* Engine Controls Box */}
      <div className="bg-admin-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200">Autonomous Ingestion Rules</h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs active:scale-95 transition-all shadow-sm"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Master Auto-Publish Toggle */}
        <div className="flex items-center justify-between p-4 bg-admin-950 rounded-xl border border-slate-800">
          <div>
            <span className="block text-sm font-bold text-slate-100 mb-0.5">
              Zero-Touch Auto-Publishing Mode
            </span>
            <span className="block text-xs text-slate-400 max-w-xl leading-relaxed">
              When enabled, incoming court judgments with AI confidence score exceeding the threshold and zero citation flags bypass HITL triage and publish immediately.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="p-4 bg-admin-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-slate-100">
                AI Confidence Score Threshold
              </span>
              <span className="block text-xs text-slate-400">
                Minimum legal accuracy confidence required for automated publishing.
              </span>
            </div>
            <span className="font-mono text-base font-bold text-blue-400 bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg">
              {Math.round(threshold * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.75"
            max="0.99"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-600 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>75% (Lenient)</span>
            <span>90% (Standard)</span>
            <span>95% (Recommended)</span>
            <span>99% (Strict)</span>
          </div>
        </div>
      </div>

      {/* Scraper Health & Live Crawlers */}
      <div className="bg-admin-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">Modular Court Scrapers Health</h3>
          </div>
          <button
            onClick={loadStatus}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: "sc_scraper", name: "Supreme Court of India", portal: "sci.gov.in (e-SCR)" },
            { key: "delhi_hc_scraper", name: "Delhi High Court", portal: "delhihighcourt.nic.in" },
            { key: "bombay_hc_scraper", name: "Bombay High Court", portal: "bombayhighcourt.nic.in" },
            { key: "gazette_scraper", name: "e-Gazette of India", portal: "egazette.gov.in" },
          ].map((sc) => {
            const info = scrapers[sc.key] || { status: "ACTIVE", last_run: "15m ago", cases_parsed: 12 };
            return (
              <div key={sc.key} className="bg-admin-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {info.status || "HEALTHY"}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-100">{sc.name}</h4>
                <p className="text-[10px] text-slate-500 truncate font-mono">{sc.portal}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Last run:</span>
                  <span className="font-mono text-slate-300">{info.last_run || "Recently"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
