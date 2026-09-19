"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Bell, Cpu, PenTool, ExternalLink, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { useAdminAuth } from "@/components/AdminAuthGuard";

export default function AdminHeader() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const navLinks = [
    { label: "HITL Triage Desk", href: "/", icon: CheckSquare },
    { label: "Push Broadcast", href: "/push", icon: Bell },
    { label: "Engine & Scrapers", href: "/engine", icon: Cpu },
    { label: "Manual & AI Co-Pilot", href: "/compose", icon: PenTool },
  ];

  return (
    <header className="w-full bg-admin-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <Logo size={32} />
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Decoupled Desk (:3001)</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-1 bg-admin-950 p-1 rounded-xl border border-slate-800">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick External Link & Log Out */}
      <div className="flex items-center gap-4">
        <a
          href="https://lawscom.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
        >
          <span>Open Consumer App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-700/60"
          title="Sign out of admin session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
