"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, BookMarked, Compass, Sparkles } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Briefs", href: "/", icon: Newspaper },
    { label: "Daily Law", href: "/daily-law", icon: Sparkles },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Briefcase", href: "/saved", icon: BookMarked },
  ];

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-40 bg-white/95 dark:bg-judicial-950/95 border-t border-slate-200 dark:border-slate-850 backdrop-blur-xl px-3 py-1.5 flex items-center justify-around select-none transition-colors"
      aria-label="Main application navigation"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`min-w-[56px] min-h-[44px] flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-90 ${
              isActive 
                ? "text-blue-600 dark:text-blue-400 font-bold" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"

            }`}
            aria-label={tab.label}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.3]" : "stroke-[1.7]"}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
