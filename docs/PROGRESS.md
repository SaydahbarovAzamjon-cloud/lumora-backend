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
| Root README | **Aligned** | Lumora source-of-truth; Nest boilerplate removed |
| NestJS scaffold | Present | Feature modules for MVP not complete |
| FastAPI AI service | Not started in this repo snapshot | Planned as `apps/ai` |
| Next.js frontend | Not in this backend-only hosting state | Planned as `apps/web` |
| MVP end-to-end demo | Not started | Blocked on implementation + open decisions |

**Overall phase:** Phase 0 (Documentation) complete → Phase 1 (MVP Engineering) ready to start.

---

## 3. Completed

### 2026-07-19 — Documentation foundation

- Replaced outdated root `README.md` with Lumora platform/backend entrypoint
- Created full `docs/` suite + `.cursor/agent.md`
- Recorded initial ADRs (identity, architecture boundaries, MVP scope)

### 2026-07-19 — Product decisions closed (user answers)

Initial ADR-009…ADR-020 draft recorded from first answers.

### 2026-07-19 — Final MVP ADR freeze

User finalized MVP decisions. Docs updated to:

- Auth: **Email/Password + Google only** (Phone & Kakao out of MVP)
- JWT Bearer
- Landmarks-only JSON (no face image)
- Face shape catalog confirmed
- Hybrid hair recs + **static JSON** catalog
- Men-only; web + mobile web; `en`/`ko`/`uz`
- No Redis/BullMQ in MVP (future queues OK)
- Multi-repo: `lumora-backend`, `lumora-frontend`, `lumora-ai` (monorepo not used)
- NestJS↔FastAPI: private network; **prod adds `X-API-KEY`**
- Retain until **account deletion**

---

### 2026-07-20 — Monetization strategy documented

- Completed: `docs/MONETIZATION.md` (Guest → Free credits → Pro, paywalls, Makeover)
- Decisions made: **ADR-022** freemium + unified credit wallet
- Updated: README index, PROJECT, MVP, ROADMAP (Phase 2b), TASKS, DECISIONS opens OPEN-018…020
- Note: Monetization remains **post-MVP**; guest “selfie upload” wording reconciled to landmarks-only (ADR-011)
- Clarified schema: **Guest ≠ User**; accounts use `plan: FREE | PRO` (not `UserType = GUEST|USER|PRO`)

### 2026-07-20 — Mock payments + shared verification documented

- Completed: `docs/PAYMENTS.md` (ADR-023), `docs/VERIFICATION.md` (ADR-024)
- Mock checkout: pricing → card → OTP → Pro → invoice → admin Telegram
- Shared OTP for payment + password reset; password policy + session kill
- Opens: OPEN-021 (Google-only reset UX), OPEN-022 (admin Telegram ops)

---

## 4. In Progress

| Item | Owner | Notes |
|---|---|---|
| — | — | Ready for Phase 1 engineering |

---

## 5. Blocked / Waiting on Decisions

| Item | Blocker | Reference |
|---|---|---|
| Exact landmark JSON field schema | Contract detail | OPEN-004 |
| Refresh/session UX | Refresh + TTLs | OPEN-014 |
| Default locale strategy | i18n | OPEN-015 |
| Account-deletion UX timing | MVP vs fast-follow | OPEN-017 |
| Deployment topology | Ops | OPEN-010 |

---

## 6. Next Milestones

| Milestone | Exit signal |
|---|---|
| M1 — Auth works | Register/login + protected GraphQL |
| M2 — AI stub/real analyze endpoint | `POST /v1/analyze/face` returns contract-shaped JSON |
| M3 — Orchestration | NestJS `analyzeFace` calls AI and persists history |
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

Documentation Phase 0 is complete. Engineering Phase 1 has not started. The next meaningful progress entries should reflect auth, AI contract, orchestration, and frontend scan integration — not new out-of-scope features.
