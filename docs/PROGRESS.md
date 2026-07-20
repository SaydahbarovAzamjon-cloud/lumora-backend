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
| NestJS scaffold | **Schema foundation done** | Mongoose models + GraphQL types/inputs declared; auth/orchestration pending |
| FastAPI AI service | Not started in this repo snapshot | Sibling repo `lumora-ai` |
| Next.js frontend | Not in this backend-only hosting state | Sibling repo `lumora-frontend` |
| MVP end-to-end demo | Not started | Blocked on auth + AI + frontend scan |

**Overall phase:** Phase 1 (MVP Engineering) — backend schema complete; next is Auth (T-101).

---

## 3. Completed

### 2026-07-20 — Backend schema foundation

- Added Mongoose models: `users`, `face_analyses`, `recommendations` (indexes + embedded provider/items)
- Declared GraphQL enums/types/inputs matching `API.md` (code-first under `src/schema/`)
- Wired `ConfigModule`, `MongooseModule`, `GraphQLModule` (Apollo) in `AppModule`
- Added `.env.example` with `MONGODB_URI` and future auth/AI placeholders
- Documented implementation mapping in `DATABASE.md` §10 and `API.md` §9
- Stub Query/Mutation resolvers throw until T-101 / T-105 / T-106

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

## 4. In Progress

| Item | Owner | Notes |
|---|---|---|
| T-101 Auth module | Backend | Next engineering milestone after schema |

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

Documentation Phase 0 is complete. Backend **schema foundation** (T-102, T-103, T-108) is in place. Next meaningful progress entries should reflect **auth (T-101)**, then AI contract + NestJS orchestration, then frontend scan integration.
