---
name: ui-ux-pro-max
description: UI/UX design intelligence for web, mobile, and PWA applications. Covers accessibility (WCAG 2.1 AA), touch & interaction ergonomics, mobile snap-scroll physics, typography scales, dark mode contrast, and responsive layout standards.
---

# UI/UX Pro Max - Design & Ergonomics Standards

## Priority 1: Accessibility (WCAG 2.1 AA) - CRITICAL
- Minimum text contrast ratio: 4.5:1 for normal body text, 3:1 for large display titles (18pt+ / 24px+).
- Every interactive element (audio play, bookmark, copy citation, share, mode toggle) must have an explicit `aria-label`.
- Visible focus rings with high-contrast outline on keyboard tab navigation (`focus-visible:ring-2`).

## Priority 2: Touch & Mobile Ergonomics - CRITICAL
- Minimum touch target: **44×44px** on all mobile clickable targets (buttons, pills, tabs).
- Minimum spacing between actionable items: **8px**.
- Mobile safe areas: Always pad for bottom home indicators and notch (`pb-safe`, `pt-safe`, `env(safe-area-inset-bottom)`).
- Provide immediate visual tactile feedback on tap (`active:scale-98` or `active:bg-slate-100`).

## Priority 3: Visual Performance & Layout - HIGH
- Zero Cumulative Layout Shift (CLS < 0.1): Fixed aspect ratio for court emblems, reserved height for bottom sheets.
- Mobile-first breakpoints: 375px (iPhone mini/SE), 390px (iPhone 14/15), 412px (Pixel/Samsung Galaxy).
- Strictly no horizontal scrolling on mobile viewports (`overflow-x-hidden`).

## Priority 4: Typography Hierarchy for Legal Readers
- Base body text: 15px - 16px with line-height 1.55 (24px) for rapid 60-word reading without eye strain.
- Case title: 18px - 20px semi-bold / bold serif with tight letter spacing (`tracking-tight`).
- Metadata & Citations: 12px - 13px mono or medium-weight sans-serif for numbers, benches, and dates.
