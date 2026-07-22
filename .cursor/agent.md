# Lumora — Agent Operating Manual

This file instructs AI coding agents (including Cursor agents) how to work in the Lumora repository.

Read this before making product, architecture, or implementation changes.

---

## 1. Project Identity

- **Name:** Lumora
- **Tagline:** Scan. Analyze. Transform.
- **Category:** AI Personal Stylist platform
- **Not:** An AI image generator product

Historical brainstorming (including StyleAI) is reference-only. Prefer `docs/` when conflicts exist.

---

## 2. Source of Truth

Consult documents in this order:

1. `docs/DECISIONS.md`
2. Specialized docs (`ARCHITECTURE`, `MVP`, `API`, `AI`, `DATABASE`, `SECURITY`, `MONOREPO`)
3. `docs/PROJECT.md`
4. Root `README.md`
5. Chat history / old notes (lowest priority)

---

## 3. Hard Architecture Rules

| Rule | Detail |
|---|---|
| Monorepo surfaces | Next.js frontend · NestJS GraphQL backend · FastAPI AI |
| Datastore | MongoDB owned by NestJS |
| Landmarks | MediaPipe on the frontend |
| Communication | Frontend → NestJS GraphQL → FastAPI |
| Forbidden | Frontend → FastAPI direct calls |
| Forbidden | Inventing Redis/BullMQ/gateways/etc. as required without an ADR |

---

## 4. MVP Scope Lock

Only these capabilities are MVP:

1. Authentication
2. Guided Face Scan
3. MediaPipe Face Landmarks
4. Face Shape Detection
5. Hair Recommendation
6. Recommendation History

**Do not implement as MVP unless scope is explicitly changed via ADR:**

- Glasses, Beard, Outfit, Wardrobe, Shopping, Virtual Try-On, Chat, Color Analysis

### Confirmed product decisions (do not re-ask casually)

| Topic | Decision |
|---|---|
| Auth | Email/password + Google only (no Kakao/phone in MVP) |
| Tokens | JWT `Authorization: Bearer` |
| Analyze payload | Landmarks JSON only (no face image) |
| Face shapes | OVAL, ROUND, SQUARE, HEART, OBLONG, DIAMOND, TRIANGLE, OTHER |
| Hair recs | Hybrid + static JSON catalog match |
| Audience | Men |
| Client | Web + mobile web |
| Locales | en, ko, uz |
| Redis/BullMQ | Not in MVP |
| Repos | `lumora-backend`, `lumora-frontend`, `lumora-ai` (no monorepo) |
| AI network | Private network; production requires `X-API-KEY` |
| Retention | Until account deletion |

---

## 5. Decision Discipline

If required information is missing:

1. Stop
2. Check `docs/DECISIONS.md` open questions
3. Ask the user for clarification **or** record a proposed ADR for user approval
4. Do **not** silently invent production architecture

Never invent decisions that conflict with confirmed ADRs.

---

## 6. Documentation Duty

When changing contracts or boundaries, update the matching docs in the same change:

| Change | Update |
|---|---|
| Product scope | `PROJECT.md`, `MVP.md`, `ROADMAP.md`, `MONETIZATION.md`, `DECISIONS.md` |
| Access tiers / credits / Pro | `MONETIZATION.md`, `DECISIONS.md` (ADR-022) |
| Mock payments / invoices | `PAYMENTS.md`, `DECISIONS.md` (ADR-023) |
| OTP / password recovery | `VERIFICATION.md`, `DECISIONS.md` (ADR-024) |
| Trust boundaries | `ARCHITECTURE.md`, `SECURITY.md` |
| API contracts | `API.md`, `AI.md` |
| Data model | `DATABASE.md` |
| Delivery status | `TASKS.md`, `PROGRESS.md` |
| New module / deploy-ready phase | `docs/learning/*.md` (Uzbek system-design learning docs) |

Do not write application features while leaving architecture docs knowingly wrong.

### Uzbek learning docs (mandatory with each phase)

Technical `docs/*.md` stay **English**. Personal learning docs live in `docs/learning/` and are **Uzbek**.

When implementing a new module or finishing a deploy-ready phase, add/update the matching learning file in this order inside each file:

1. Why this module exists
2. What problem it solves
3. Workflow
4. Controller / Resolver / Service
5. Important methods / code
6. Summary

Keep `docs/learning/README.md` reading order updated. Technical English docs and Uzbek learning docs are both required; do not skip learning docs when shipping a phase.

---

## 7. Coding Expectations

Follow `docs/CODING_STANDARDS.md` and `docs/DEVELOPMENT_RULES.md`.

- Prefer clear, typed, focused changes
- Keep AI HTTP client inside NestJS
- Scope all history/analysis reads by authenticated user
- Never commit secrets
- Avoid drive-by refactors unrelated to the task

---

## 8. Preferred Implementation Sequence

When asked to build MVP without a more specific plan:

1. Auth foundation
2. GraphQL schema for analysis/history
3. FastAPI analyze endpoint
4. NestJS orchestration + MongoDB persistence
5. Frontend guided scan + MediaPipe
6. History UI
7. Hardening / tests at boundaries

Track work in `docs/TASKS.md` and milestones in `docs/PROGRESS.md`.

---

## 9. Response Behavior for Agents

- Be direct and concise with the user
- Prefer implementing against docs over re-litigating architecture in chat
- If the user asks for a forbidden pattern (e.g. browser calling FastAPI), refuse and cite `docs/ARCHITECTURE.md` / ADR-004
- If the user expands MVP casually, warn and require an explicit decision update

---

## 10. Quick Links

- Product: `docs/PROJECT.md`
- Architecture: `docs/ARCHITECTURE.md`
- MVP: `docs/MVP.md`
- Monetization: `docs/MONETIZATION.md`
- Payments: `docs/PAYMENTS.md`
- Verification: `docs/VERIFICATION.md`
- Decisions: `docs/DECISIONS.md`
- Docs index: `docs/README.md`

---

## 11. One-Line Mandate

Build Lumora as a NestJS-mediated personal stylist pipeline — scan, analyze, recommend — without inventing out-of-scope architecture or breaking the frontend↔AI boundary.
