---
name: security-audit
description: Security guidance and vulnerability review for codebases, APIs, auth boundaries, database queries, and background workers. Use to audit codebases against OWASP Top 10, CWE Top 25, prompt injection, input validation, and unauthorized data leakage.
---

# Security Audit: Source-First Defensive Review

Find and prevent vulnerabilities that violate trust boundaries across APIs, databases, authentication, AI pipelines, and client apps.

## Priority Checkpoints for JurisShorts Architecture

### 1. Authentication & Role-Based Access Control (Admin vs Consumer Decoupling)
- Consumer APIs (`/api/v1/feed`, `/api/v1/statutes`, `/api/v1/bookmarks`, `/api/v1/notifications/subscribe`) must be completely isolated from Admin APIs (`/api/v1/admin/*`).
- Admin endpoints require strict Bearer Token / JWT authentication + constant-time API key verification (`secrets.compare_digest`).
- Consumer endpoints must never leak draft, rejected, or unverified judgments.
- Never expose internal database IDs or AI internal confidence prompts to public unauthenticated endpoints.

### 2. Injection & Database Query Safety
- Use SQLAlchemy ORM / parameterized queries exclusively. Strictly reject any raw string concatenation into SQL queries.
- Validate and sanitize all scraper inputs before ingestion to prevent SQL injection and Stored XSS in the card markdown renderer.

### 3. AI Pipeline & Prompt Injection Defense
- Scraped raw court judgments and gazettes must be treated as untrusted input.
- Wrap scraped text inside designated XML tags `<raw_judgment_text>` with system prompt guardrails preventing court judgment text from overriding system instructions.
- Validate LLM structured JSON output with strict Pydantic schemas; reject unexpected fields or malformed payloads.

### 4. Push Notification & Rate Limiting Guardrails
- Protect push subscription endpoints with IP-based rate limiting (Redis token bucket).
- Admin broadcast push endpoints must require an explicit confirmation token to prevent accidental spam blasts.
- Sanitize notification payloads (`title`, `body`, `url`) to prevent malicious deep-link redirection.

### 5. CORS & Content Security Policy (CSP)
- Consumer App and Admin App run on separate origins / domains:
  - Consumer Origin: e.g., `http://localhost:3000` (Production: `https://app.jurisshorts.com`)
  - Admin Origin: e.g., `http://localhost:3001` (Production: `https://admin.jurisshorts.com`)
- Backend FastAPI must strictly whitelist allowed origins in `CORSMiddleware`.
- Enforce secure headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict CSP.
