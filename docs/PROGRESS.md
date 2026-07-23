# Lumora — Progress Log

| Field | Value |
|---|---|
| Status | Living document |
| Related | [TASKS.md](./TASKS.md) · [MVP.md](./MVP.md) · [ROADMAP.md](./ROADMAP.md) |

---

## 1. Purpose

Track what has been completed, what is in progress, and what is blocked. Update this file at meaningful milestones.

---

## 2. Snapshot

| Area | Status | Notes |
|---|---|---|
| Product documentation set | **Complete (initial)** | All planned `docs/` files + `.cursor/agent.md` |
| Root README | **Aligned** | Lumora source-of-truth |
| NestJS backend | **Auth + analyzeFace + history** | T-101…T-108 done in this repo |
| FastAPI AI service | Sibling `lumora-ai` still needed for non-mock | `AI_MOCK=true` unblocks Nest local demos |
| Next.js frontend | Not in this repo | Sibling `lumora-frontend` |
| MVP end-to-end demo | Partial | Backend path ready; needs real AI + frontend scan |

**Overall phase:** Phase 1 (MVP Engineering) — NestJS orchestration ready; next is `lumora-ai` (T-120+) and frontend scan (T-140+).

---

## 3. Completed

### 2026-07-22 — analyzeFace orchestration (T-104 / T-105 / T-106 / T-107)

- Added `AiService` FastAPI client (`POST /v1/analyze/face`, `X-API-KEY` in prod, timeouts)
- Added `AI_MOCK` path for local development without `lumora-ai`
- Implemented `analyzeFace`: validate landmarks → pending analysis → AI → succeed/fail → hair recommendation
- Implemented `recommendationHistory` + `recommendation` (cursor pagination, owner-scoped / no IDOR leak)
- Mapped AI failures to safe GraphQL errors (`AI_UNAVAILABLE`, `INVALID_LANDMARKS`)

### 2026-07-21 — Auth + VerificationService (T-101)

- Email/password + Google JWT auth, signup OTP, password recovery, shared verification challenges

### 2026-07-20 — Backend schema foundation

- Mongoose models + GraphQL types/inputs; ER modeling docs

### 2026-07-19 — Documentation foundation + MVP ADR freeze

- Full `docs/` suite; auth/landmarks/hair/catalog/multi-repo decisions locked

---

## 4. In Progress

| Item | Owner | Notes |
|---|---|---|
| T-120 FastAPI skeleton | AI repo | Required for non-mock analyze |

---

## 5. Blocked / Waiting on Decisions

| Item | Blocker | Reference |
|---|---|---|
| Exact landmark JSON field schema | Contract detail (provisional points input exists) | OPEN-004 |
| Refresh/session UX | Refresh + TTLs | OPEN-014 |
| Default locale strategy | i18n | OPEN-015 |
| Account-deletion UX timing | MVP vs fast-follow | OPEN-017 |
| Deployment topology | Ops | OPEN-010 |

---

## 6. Next Milestones

| Milestone | Exit signal |
|---|---|
| M1 — Auth works | ✅ Register/login + protected GraphQL |
| M2 — AI stub/real analyze endpoint | `POST /v1/analyze/face` in `lumora-ai` |
| M3 — Orchestration | ✅ NestJS `analyzeFace` calls AI and persists history |
| M4 — Scan UX | Guided scan + MediaPipe + GraphQL submit |
| M5 — MVP demo | Full checklist in [MVP.md](./MVP.md) Section 4 |

---

## 7. Progress Update Template

```markdown
### YYYY-MM-DD — Short title

- Completed: ...
- In progress: ...
- Blockers: ...
- Decisions made: ADR-00X ...
```

---

## 8. Summary

NestJS Phase 1 core path is implemented: auth, FastAPI client, `analyzeFace` persistence, and recommendation history. Remaining MVP work is primarily **`lumora-ai` (T-120+)** and **frontend scan/auth UI (T-140+)**.
