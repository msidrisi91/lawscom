"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function Logo({ className = "", size = 28, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern Minimalist Vector Mark */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-700 p-1 shadow-md shadow-gold-500/20 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-slate-950"
        >
          {/* Central Pillar of Law */}
          <path
            d="M16 4V28"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Dynamic Balanced Scales / Fast-forward Chevrons */}
          <path
            d="M6 10L16 6L26 10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Pan (Precedent) */}
          <path
            d="M6 10V18C6 20.2 7.8 22 10 22C12.2 22 14 20.2 14 18V10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Pan (Justice & Speed) */}
          <path
            d="M18 10V16C18 18.2 19.8 20 22 20C24.2 20 26 18.2 26 16V10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Base Pedestal */}
          <path
            d="M11 28H21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-serif font-black tracking-tight text-slate-900 dark:text-slate-100 text-lg">
              Juris<span className="text-gold-500 dark:text-gold-400">Shorts</span>
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
            60s Legal Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
