# Lumora — Repository Strategy

| Field | Value |
|---|---|
| Status | Active source of truth |
| Related | [PROJECT.md](./PROJECT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) · [DECISIONS.md](./DECISIONS.md) |
| Note | Filename kept as `MONOREPO.md` for doc index stability; **strategy is multi-repo** (ADR-018). |

---

## 1. Purpose

This document defines how Lumora code is split across repositories, ownership boundaries, and dependency rules.

**Monorepo is not used** (ADR-018).

---

## 2. Confirmed Repositories

| Repository | Technology | Responsibility |
|---|---|---|
| `lumora-backend` | NestJS + GraphQL + MongoDB | Auth, orchestration, persistence, public API, platform docs |
| `lumora-frontend` | Next.js | Guided scan, MediaPipe, UI, i18n |
| `lumora-ai` | FastAPI (Python) | Face analysis, hybrid hair recommendation |

```text
lumora-frontend ──GraphQL──► lumora-backend ──HTTP + X-API-KEY (prod)──► lumora-ai
                                   │
                                   └──► MongoDB
```

---

## 3. Hard Dependency Rules

| Allowed | Forbidden |
|---|---|
| `lumora-frontend` → `lumora-backend` | `lumora-frontend` → `lumora-ai` |
| `lumora-backend` → `lumora-ai` | Browser → `lumora-ai` |
| `lumora-backend` → MongoDB | Frontend → MongoDB |

---

## 4. What Lives Where

### `lumora-frontend`

- Auth UX (email/password, Google)
- Guided face scan
- MediaPipe landmark extraction
- Results + history UI
- i18n (`en`, `ko`, `uz`)
- Responsive web + mobile web

### `lumora-backend`

- GraphQL schema and resolvers
- JWT auth guards
- AI HTTP client (`X-API-KEY` in production)
- MongoDB models (users, analyses, recommendations)
- Platform documentation in `/docs` (current home)

### `lumora-ai`

- `POST /v1/analyze/face`
- Face shape detection from landmarks
- Hybrid ranking/explanation against **static JSON** hairstyle catalog
- Production validation of `X-API-KEY`

---

## 5. Local Development Order

1. Start MongoDB
2. Start `lumora-ai`
3. Start `lumora-backend` (AI base URL + optional `X-API-KEY` for prod-like local)
4. Start `lumora-frontend` (GraphQL endpoint only)

---

## 6. Environment Boundaries

| Variable class | Repository |
|---|---|
| Public GraphQL URL | `lumora-frontend` |
| MongoDB URI, JWT secret, Google OAuth secrets, AI base URL, AI `X-API-KEY` | `lumora-backend` |
| Model/runtime config, expected `X-API-KEY` | `lumora-ai` |

Never put AI base URLs intended for browser use into the frontend.

---

## 7. Documentation Placement

Platform docs currently live in **`lumora-backend/docs`**. Other repos may keep short runbooks, but must not contradict these docs.

---

## 8. Open Decisions

| Decision | Status |
|---|---|
| Deployment topology across three repos | OPEN-010 |
| Shared contract package across repos | Open |

---

## 9. Summary

Lumora is **multi-repo**: `lumora-frontend`, `lumora-backend`, `lumora-ai`. Monorepo is not part of the strategy. The frontend talks only to the backend; the backend talks to AI on a private network (with `X-API-KEY` in production).
