---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
---

# Frontend Design: Distinctive & Intentional Engineering

Approach frontend development as a senior design lead at a world-class studio. Avoid generic "AI slop" (repetitive purple gradients, warm cream `#F4F1EA` clichés, cookie-cutter templates, random hover animations, and isolated colored words in headlines).

## 1. Ground Design in the Subject Matter (Legal & Judicial Context)
- **Aesthetic Direction for Legal Tech**: "Dignified Authority & High-Speed Editorial Clarity".
  - Clean, high-contrast typography reflecting judicial gravitas and editorial precision.
  - Type pairing: Authority Serif (e.g., *Newsreader*, *Playfair*, or *Merriweather*) for legal case headings & holdings, paired with a ultra-crisp, neutral sans-serif (*Inter* / *Geist*) for 60-word micro-reading.
  - Color Tokens: Deep Judicial Navy (`#0F172A`), Slate Charcoal (`#1E293B`), Parchment Card Background (`#FFFFFF` / `#090D16`), Muted Gold/Brass (`#D97706` / `#B45309`) for citations and verified seals, and Crimson (`#DC2626`) for urgent breaking rulings.
  - Zero emoji-as-icons: Always use crisp, clean SVG icons (Lucide React / Feather).

## 2. Visual Structure is Information
- Outlines, borders, section badges, and pill tags encode real legal hierarchy:
  - Court Badges: Blue for Supreme Court, Amber for High Courts, Purple for Tribunals.
  - Status Indicators: Emerald Green for *Allowed*, Crimson for *Dismissed*, Blue for *Disposed/Remanded*.
  - Bare Act Section Pills: Tap targets formatted with exact statutory numbers (e.g., `BNS § 103`, `CrPC § 482`).

## 3. Purposeful Motion & Touch Ergonomics
- Only animate in response to direct user interaction (vertical snap swipe, drawer reveal, dual-mode flip switch).
- Never use gratuitous floating animations or unprompted entrances.
- Touch Targets: Strictly minimum 44×44px for all buttons and interactive pills.
- Mobile Viewport: 100dvh snap-scrolling without horizontal overflow.
