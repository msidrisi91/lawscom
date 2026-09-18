# JurisShorts ("Inshorts for Legal Intelligence")

[![GitHub Repo](https://img.shields.io/badge/GitHub-msidrisi91%2Flawscom-blue?logo=github)](https://github.com/msidrisi91/lawscom)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/PWA-iOS%20%7C%20Android%20%7C%20Web-gold)](https://github.com/msidrisi91/lawscom)

A modular, multi-jurisdiction micro-reader for breaking judicial rulings, bare acts, and everyday legal awareness. Built with a completely decoupled architecture, push-notification delivery engine, and strict editorial guardrails.

**Repository URL**: [https://github.com/msidrisi91/lawscom](https://github.com/msidrisi91/lawscom)

---

## Architecture Overview

```
lawscom/
├── .agents/skills/             # Installed AI & UX Skills
│   ├── frontend-design/        # Anthropic Official Design Skill
│   ├── ui-ux-pro-max/          # UI/UX Ergonomics & Accessibility Standards
│   └── security-audit/         # Cloudflare Source-First Security Audit Playbook
│
├── backend/                    # Python FastAPI Core (:8000)
│   ├── app/
│   │   ├── main.py             # ASGI entrypoint with CORS & DB migrations
│   │   ├── config.py           # Decoupled origins & settings
│   │   ├── core/               # Database engine & constant-time auth
│   │   ├── models/             # Multi-jurisdiction models (SC, HCs, BNS, Cards)
│   │   ├── schemas/            # Strict Pydantic v2 validation schemas
│   │   ├── agents/             # Multi-agent AI summarizer & guardrails
│   │   ├── services/           # WebPush & FCM notification dispatcher
│   │   ├── seed/               # Verified landmark Indian rulings & BNS sections
│   │   └── api/v1/             # Isolated Consumer vs Admin API routers
│   └── tests/                  # Pytest automated test suite (8/8 passing)
│
├── consumer-app/               # Mobile-First Inshorts PWA (:3000)
│   ├── 60fps vertical snap card deck with keyboard & swipe navigation
│   ├── Dual-Mode Toggle: Advocate Mode (Ratio & Coram) vs Citizen Mode (Plain English)
│   ├── Tap-to-view Bare Act bottom sheet drawer (BNS, BNSS, NI Act, PMLA)
│   ├── 30-second audio docket player with dynamic waveform
│   ├── "Know Your Rights" daily flashcard & interactive quiz
│   └── PWA Web App Manifest (`manifest.webmanifest`) for trusted app feel
│
└── admin-app/                  # Dedicated Admin Command Center (:3001)
    ├── Human-In-The-Loop (HITL) Triage Desk with 1-click publishing
    ├── Push Notification Broadcast Console with live lock-screen preview
    ├── Autonomous Publishing Engine controls & confidence threshold slider
    └── Manual Card Composer with AI Ingestion Co-Pilot
```

---

## Quick Start Guide

### 1. Start the Backend API (Port 8000)
```powershell
cd backend
venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Start the Consumer PWA (Port 3000)
```powershell
cd consumer-app
npm run dev
```
- Consumer App URL: `http://localhost:3000`

### 3. Start the Decoupled Admin Dashboard (Port 3001)
```powershell
cd admin-app
npm run dev
```
- Admin Command Center URL: `http://localhost:3001`
- Authenticates automatically using `X-Admin-Key: juris_admin_secret_key_2026`.

---

## Running Automated Tests
```powershell
cd backend
venv\Scripts\python -m pytest tests/test_backend.py -v
```
All 8 backend tests pass, verifying:
- 60-word micro-format constraints (Advocate <= 65 words, Citizen <= 50 words)
- Bare act lookups (`BNS § 103`)
- Constant-time admin authentication security
- Triage approval & push notification dispatch
- Anti-hallucination guardrail validation
