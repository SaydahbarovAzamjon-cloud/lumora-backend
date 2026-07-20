# Lumora — Tasks

| Field | Value |
|---|---|
| Status | Active working backlog |
| Related | [MVP.md](./MVP.md) · [PROGRESS.md](./PROGRESS.md) · [ROADMAP.md](./ROADMAP.md) · [DECISIONS.md](./DECISIONS.md) |

---

## 1. Purpose

Executable backlog for Lumora. Tasks are grouped by phase and surface. This is a planning instrument, not a substitute for your issue tracker if you add one later.

**Status legend:** `todo` · `in_progress` · `blocked` · `done`

---

## 2. Phase 0 — Documentation

| ID | Task | Status | Notes |
|---|---|---|---|
| T-000 | Create root README aligned to Lumora | done | |
| T-001 | Write `docs/PROJECT.md` | done | |
| T-002 | Write `docs/ARCHITECTURE.md` | done | |
| T-003 | Write `docs/MONOREPO.md` | done | |
| T-004 | Write `docs/MVP.md` | done | |
| T-005 | Write `docs/DATABASE.md` | done | |
| T-006 | Write `docs/API.md` | done | |
| T-007 | Write `docs/AI.md` | done | |
| T-008 | Write `docs/SECURITY.md` | done | |
| T-009 | Write `docs/CODING_STANDARDS.md` | done | |
| T-010 | Write `docs/DEVELOPMENT_RULES.md` | done | |
| T-011 | Write `docs/ROADMAP.md` | done | |
| T-012 | Write `docs/DECISIONS.md` | done | |
| T-013 | Write `docs/TASKS.md` | done | |
| T-014 | Write `docs/PROGRESS.md` | done | |
| T-015 | Write `docs/README.md` | done | |
| T-016 | Write `.cursor/agent.md` | done | |
| T-017 | Resolve remaining opens (OPEN-004, 010, 014, 015, 017) as needed | todo | See DECISIONS.md |

---

## 3. Phase 1 — MVP Engineering

### 3.1 Backend (`apps/api` / NestJS)

| ID | Task | Status | Depends on |
|---|---|---|---|
| T-100 | Auth approach decided (email/password + Google + JWT Bearer) | done | ADR-009, ADR-010 |
| T-101 | Implement auth module (email/password + Google + JWT Bearer guards) | todo | T-100 |
| T-102 | Define GraphQL schema for user/analysis/history | done | T-100; OPEN-004 provisional inputs |
| T-103 | Implement MongoDB models for users/analyses/recommendations | done | DATABASE.md; NestJS+Mongoose |
| T-104 | Implement FastAPI client in NestJS (`X-API-KEY` in production) | todo | ADR-019 |
| T-105 | Implement `analyzeFace` orchestration + persistence | todo | T-102, T-103, T-104, T-120 |
| T-106 | Implement recommendation history queries | todo | T-103, T-105 |
| T-107 | Map AI/upstream errors to safe GraphQL errors | todo | T-105 |
| T-108 | Add `.env.example` for API | done | |

### 3.2 AI (`apps/ai` / FastAPI)

| ID | Task | Status | Depends on |
|---|---|---|---|
| T-120 | Create FastAPI service skeleton + `/health` | todo | |
| T-121 | Decide model/rules approach for face shape | todo | OPEN-006 related / model open |
| T-122 | Implement `POST /v1/analyze/face` | todo | T-120, OPEN-004 |
| T-123 | Return hair recommendation items for MVP | todo | T-122 |
| T-124 | Contract tests for success + validation errors | todo | T-122 |

### 3.3 Frontend (`apps/web` / Next.js)

| ID | Task | Status | Depends on |
|---|---|---|---|
| T-140 | Auth screens wired to GraphQL | todo | T-101 |
| T-141 | Guided face scan UX | todo | |
| T-142 | MediaPipe landmark extraction integration | todo | T-141 |
| T-143 | Call `analyzeFace` via GraphQL only | todo | T-105, T-142 |
| T-144 | Results UI (face shape + hair recs) | todo | T-143 |
| T-145 | History UI | todo | T-106 |

### 3.4 Integration & Hardening

| ID | Task | Status | Depends on |
|---|---|---|---|
| T-160 | End-to-end local path: web → api → ai → db | todo | T-105, T-122, T-143 |
| T-161 | Verify user-scoped history (no IDOR) | todo | T-106, T-145 |
| T-162 | Confirm no frontend→AI coupling in code review | todo | T-160 |
| T-163 | Update PROGRESS.md at MVP demo readiness | todo | T-160 |

---

## 4. Phase 2+ (Not MVP)

Do not pull these into Phase 1 unless scope is explicitly changed via ADR:

| ID | Task | Phase |
|---|---|---|
| T-200 | Glasses recommendation | 2 |
| T-201 | Beard recommendation | 2 |
| T-202 | Color analysis | 2 |
| T-300 | Outfit recommendation | 3 |
| T-301 | Wardrobe | 3 |
| T-302 | Shopping | 3 |
| T-400 | Virtual try-on | 4 |
| T-401 | Chat | 4 |

---

## 5. Operating Rules for This File

- Move tasks to `done` only when acceptance-level work is finished
- If blocked on an open decision, set `blocked` and reference `OPEN-00X`
- Prefer updating this file when task status changes meaningfully
- Detailed day-to-day notes can go in [PROGRESS.md](./PROGRESS.md)

---

## 6. Summary

Phase 0 documentation tasks are complete. Phase 1 implementation starts with auth decisions, FastAPI analyze contract, NestJS orchestration, MediaPipe scan UX, and history — in that architectural spirit.
