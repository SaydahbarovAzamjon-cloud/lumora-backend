# Lumora — Architecture Decision Records

| Field | Value |
|---|---|
| Status | Active source of truth |
| Related | [PROJECT.md](./PROJECT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [MVP.md](./MVP.md) · [MONOREPO.md](./MONOREPO.md) · [SECURITY.md](./SECURITY.md) |

---

## 1. Purpose

This file records **decided** architecture and product choices for Lumora, plus explicitly open questions.

---

## 2. Decision Log

### ADR-001 — Official product name is Lumora

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** The official product name is **Lumora**. Historical docs (including StyleAI) are non-authoritative when they conflict.

---

### ADR-002 — Product category and non-goal

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Lumora is an **AI Personal Stylist** platform. It is **not** an AI image generator.

---

### ADR-003 — Three primary surfaces

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Clarified by | ADR-018 |

**Decision:** Lumora has three primary surfaces: **Next.js frontend**, **NestJS GraphQL backend**, **FastAPI AI service**. Physical repo strategy is multi-repo (ADR-018).

---

### ADR-004 — NestJS mediates all AI access

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Frontend → NestJS GraphQL → FastAPI. Frontend never calls AI directly.

---

### ADR-005 — MongoDB is the application datastore

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** NestJS uses **MongoDB** for application data (users, analyses, recommendation history).

---

### ADR-006 — MediaPipe landmarks on the frontend

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Guided face scan uses **MediaPipe Face Landmarks on the frontend**.

---

### ADR-007 — MVP scope lock

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** MVP includes only: Authentication, Guided Face Scan, MediaPipe Face Landmarks, Face Shape Detection, Hair Recommendation, Recommendation History.

---

### ADR-008 — Tagline

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** **Scan. Analyze. Transform.**

---

### ADR-009 — Authentication providers (final MVP)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Supersedes | Earlier draft that included Kakao and conditional phone |

**Decision:** MVP authentication methods:

| Method | MVP |
|---|---|
| Email + password | Yes |
| Google OAuth | Yes |
| JWT access token via `Authorization: Bearer` | Yes (see ADR-010) |
| Kakao OAuth | **No (out of MVP)** |
| Phone OTP | **No (out of MVP)** |

**Consequences:** User model supports email/password and Google identity linking. Phone and Kakao are future features only.

---

### ADR-010 — Token transport is JWT Bearer

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Use **JWT** with `Authorization: Bearer <token>`.  
**Still open:** refresh-token yes/no and exact TTLs (OPEN-014).

---

### ADR-011 — Landmarks-only analyze payload

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Backend/AI receive **MediaPipe landmarks JSON only**. Original face image is **not** uploaded to backend/AI.

**Reasons:** privacy, speed, small payload.

---

### ADR-012 — Face shape taxonomy

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** AI determines face shape from landmarks using this catalog:

`OVAL`, `ROUND`, `SQUARE`, `HEART`, `OBLONG`, `DIAMOND`, `TRIANGLE`, `OTHER`

---

### ADR-013 — Hybrid hair recommendation + static JSON catalog

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Clarified by | ADR-021 |

**Decision:** Hybrid approach:

1. AI ranks/explains hairstyles from analysis (face shape at minimum)
2. Results are matched to a **static hairstyle catalog**

Pure free-text generation without catalog matching is not the MVP design.

---

### ADR-014 — MVP audience is men

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** MVP is **men-only**.

---

### ADR-015 — Platform is web + mobile web

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Web + mobile web. Native mobile apps are **out of MVP**.

---

### ADR-016 — Locales: English, Korean, Uzbek

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** UI languages: **English**, **Korean**, **Uzbek** (`en`, `ko`, `uz`).

---

### ADR-017 — No Redis/BullMQ in MVP

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Redis / BullMQ are **not used in MVP**.

**Future:** may be added later for background jobs, notifications, and AI queues.

**MVP consequence:** NestJS → FastAPI calls are synchronous request/response.

---

### ADR-018 — Multi-repo (monorepo not used)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Clarifies | ADR-003 |

**Decision:** Lumora uses **multi-repo**. Monorepo is **not used**.

| Repository | Role |
|---|---|
| `lumora-backend` | NestJS GraphQL + platform docs |
| `lumora-frontend` | Next.js |
| `lumora-ai` | FastAPI |

Architecture boundaries still apply across repos.

---

### ADR-019 — NestJS ↔ FastAPI network and auth

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Supersedes | Earlier “dev-only private network; prod open” draft |

**Decision:**

| Environment | Network | Service auth |
|---|---|---|
| Development | Private network | None required |
| Production | Private network | **Shared secret header `X-API-KEY`** |

**Consequences:**

- FastAPI is never a public browser API
- NestJS must send `X-API-KEY` in production
- FastAPI must validate `X-API-KEY` in production

---

### ADR-020 — Retain analysis/history until account deletion

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |

**Decision:** Face analysis and recommendation history are stored until the **user account is deleted**.

Future versions may add time-based retention policies.

---

### ADR-021 — Hairstyle catalog is static JSON (MVP)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-19 |
| Clarifies | ADR-013 |

**Decision:** MVP hairstyle catalog is a **static JSON** file (owned by AI service and/or shared contract as implementation chooses).

**Future:** may migrate to MongoDB.

---

### ADR-022 — Freemium monetization: Guest → Free credits → Pro

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-07-20 |
| Spec | [MONETIZATION.md](./MONETIZATION.md) |

**Context:** Lumora needs a conversion model that lets users experience AI quality before paying, then scales generation access without per-feature hard caps.

**Decision:**

| Tier | Access |
|---|---|
| **Guest** | One hairstyle preview after face analysis; then lock → Create Free Account |
| **Free** | 10 AI Credits / month; unified credit wallet (hair/glasses/beard/hat/palette = 1; outfit = 2) |
| **Pro** | Unlimited credits; HD / no watermark; priority queue; **AI Complete Makeover** exclusive |

**Consequences:**

- Monetization is **post-MVP** (does not expand ADR-007)
- NestJS owns entitlement + credit debit before FastAPI calls
- Guest preview uses the **landmarks-only** pipeline (ADR-011) — no selfie upload
- **Do not** model `UserType = GUEST | USER | PRO`. Guest is unauthenticated (no `users` row). Authenticated accounts use `plan: FREE | PRO`; NestJS derives runtime `AccessTier` (`GUEST` \| `FREE` \| `PRO`)
- Credit costs and paywall copy live in [MONETIZATION.md](./MONETIZATION.md)
- New AI features add a credit cost row; Pro exclusivity only when explicitly decided

---

## 3. Open Decisions (Remaining)

| ID | Topic | Why it matters |
|---|---|---|
| OPEN-004 | Exact MediaPipe landmark JSON field schema | Final GraphQL/FastAPI contract detail |
| OPEN-010 | Deployment topology (Docker Compose, cloud hosts) | Ops |
| OPEN-014 | Refresh token yes/no + JWT TTLs | Auth session UX |
| OPEN-015 | Default locale / language detection | i18n UX |
| OPEN-017 | Account-deletion UX timing (MVP vs fast-follow) | Completes ADR-020 operationally |
| OPEN-018 | Payment provider + Pro billing period (monthly/annual) | Required to implement ADR-022 Pro |
| OPEN-019 | Free credit reset policy (calendar month vs rolling 30 days) | Wallet refill semantics |
| OPEN-020 | Guest abuse controls (rate limit / fingerprint) | Protect one-preview fairness |

---

## 4. Rejected / Out of MVP

| Idea | Status | Notes |
|---|---|---|
| StyleAI as official name | Superseded | Historical only |
| Frontend → AI direct | Rejected | ADR-004 |
| Redis/BullMQ in MVP | Rejected for MVP | ADR-017 (future OK) |
| Physical monorepo | Rejected for project strategy | ADR-018 |
| Face image upload in MVP | Rejected for MVP | ADR-011 |
| Phone OTP in MVP | Rejected for MVP | ADR-009 |
| Kakao OAuth in MVP | Rejected for MVP | ADR-009 |
| Native mobile apps in MVP | Rejected for MVP | ADR-015 |
| MongoDB hairstyle catalog in MVP | Deferred | ADR-021 (static JSON now) |
| Payments / subscriptions in MVP | Deferred | ADR-022 (post-MVP freemium) |
| Per-feature Free caps instead of credits | Rejected | ADR-022 prefers unified wallet |

---

## 5. How to Add a Decision

```markdown
### ADR-00X — Title

| Field | Value |
|---|---|
| Status | Accepted / Proposed / Superseded |
| Date | YYYY-MM-DD |

**Context:** ...
**Decision:** ...
**Consequences:** ...
```

---

## 6. Summary

Final MVP decisions: Email/Password + Google + JWT Bearer; landmarks-only JSON; fixed face-shape catalog; hybrid hair recs matched to **static JSON** catalog; men-only; web + mobile web; `en`/`ko`/`uz`; no Redis/BullMQ; multi-repo (`lumora-backend`, `lumora-frontend`, `lumora-ai`); NestJS↔FastAPI private network (prod adds `X-API-KEY`); retain data until account deletion.

Post-MVP monetization (ADR-022): **Guest → Free (10 credits/mo) → Pro**, unified credit wallet, Complete Makeover Pro-only — see [MONETIZATION.md](./MONETIZATION.md).
