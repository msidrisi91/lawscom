"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Judicial Insignia */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-1.5 shadow-lg shadow-blue-500/20 shrink-0 ring-1 ring-white/20"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Central Apex & Pillar */}
          <path
            d="M16 4V28"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Crossbeam of Balance */}
          <path
            d="M5 10L16 6L27 10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Equity Basin */}
          <path
            d="M5 10L8 18C8.5 20 10.5 21 12 21C13.5 21 15.5 20 16 18L16 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Velocity Basin */}
          <path
            d="M16 10L16 18C16.5 20 18.5 21 20 21C21.5 21 23.5 20 24 18L27 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Precision Foundation */}
          <path
            d="M10 28H22"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="16" cy="6" r="2" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight">
            <span className="font-sans font-black text-slate-950 dark:text-white text-lg tracking-tight">
              JURIS<span className="text-blue-600 dark:text-blue-400">SHORTS</span>
            </span>
          </div>
          <span className="text-[8.5px] font-sans font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            60s Legal Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
