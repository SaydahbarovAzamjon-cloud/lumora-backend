# Lumora — Coding Standards

| Field | Value |
|---|---|
| Status | Active source of truth |
| Related | [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [MONOREPO.md](./MONOREPO.md) · [SECURITY.md](./SECURITY.md) |

---

## 1. Purpose

This document defines coding standards across Lumora’s three surfaces: Next.js (TypeScript), NestJS (TypeScript), and FastAPI (Python).

Standards prioritize clarity, boundary safety, and reviewability over cleverness.

---

## 2. Universal Standards

| Rule | Expectation |
|---|---|
| Language | Prefer TypeScript for web/api; Python for AI |
| Clarity | Names describe domain intent (`analyzeFace`, not `doStuff`) |
| Boundaries | Do not call FastAPI from frontend code |
| Secrets | Never commit secrets, tokens, or private keys |
| Scope | Do not implement post-MVP domains “while here” |
| Docs sync | Behavior changes that affect contracts update `docs/` |
| Small diffs | Prefer focused changes over drive-by refactors |

---

## 3. TypeScript (Next.js + NestJS)

### 3.1 General

| Topic | Standard |
|---|---|
| Typing | Avoid `any` unless isolated and justified |
| Nullability | Be explicit; prefer narrow types at boundaries |
| Async | Use `async/await`; handle errors intentionally |
| Imports | Prefer path aliases if configured; keep import order consistent |
| Comments | Explain why for non-obvious logic; do not narrate obvious code |

### 3.2 NestJS

| Topic | Standard |
|---|---|
| Modules | One domain module owns its resolvers/services |
| Business logic | Prefer services over fat resolvers |
| Validation | Validate GraphQL inputs before AI calls |
| AI client | Isolate FastAPI HTTP client in a dedicated provider/service |
| Auth | Guards on sensitive resolvers/mutations |
| Persistence | Repository/model access through NestJS data layer only |
| Errors | Map upstream AI failures to safe GraphQL errors |

### 3.3 Next.js

| Topic | Standard |
|---|---|
| Data access | GraphQL client to NestJS only |
| MediaPipe | Keep landmark extraction in clearly named client modules |
| Env | Public env vars only for GraphQL endpoint and public config |
| UI state | Keep scan flow state understandable; avoid hidden global magic |
| Auth tokens | Follow the chosen auth transport; never log tokens |

---

## 4. Python (FastAPI)

| Topic | Standard |
|---|---|
| API models | Use Pydantic models for request/response contracts |
| Versioning | Keep MVP routes under `/v1` |
| Pure logic | Separate route handlers from analysis functions where practical |
| Errors | Return structured error codes/messages |
| Typing | Type hints on public functions |
| Dependencies | Pin versions in the AI environment lock strategy once chosen |
| Side effects | No writes to Lumora MongoDB from AI service in default architecture |

---

## 5. GraphQL Standards

| Topic | Standard |
|---|---|
| Naming | `camelCase` fields; explicit mutation names (`analyzeFace`) |
| Nullability | Required fields use `!` intentionally |
| Evolution | Prefer additive changes |
| Docs | Public operations should match [API.md](./API.md) intent |

---

## 6. MongoDB / Data Standards

| Topic | Standard |
|---|---|
| Ownership | All product writes via NestJS |
| User scoping | Queries for history/analysis include `userId` from auth context |
| Passwords | Store hashes only |
| Indexes | Add indexes for `userId` + `createdAt` history paths |
| Collections | No wardrobe/shopping collections in MVP |

See [DATABASE.md](./DATABASE.md).

---

## 7. Testing Standards

| Layer | Minimum expectation |
|---|---|
| NestJS | Unit tests for auth guards/services critical paths; e2e for analyze + history when feasible |
| FastAPI | Contract tests for `/v1/analyze/face` success and validation failures |
| Frontend | Critical scan flow smoke coverage as tooling allows |

Do not block MVP on perfect coverage percentages that were never decided. Prefer high-value boundary tests.

---

## 8. Formatting & Lint

| Area | Policy |
|---|---|
| Formatter/linter choice | Follow existing repo config when present |
| Consistency | Do not mix formatting styles in one PR |
| Generated files | Do not hand-edit generated GraphQL types if codegen is adopted |

Exact ESLint/Prettier/Ruff/Black choices are open if not already established in each package.

---

## 9. Code Review Checklist (Author)

- [ ] No frontend → AI calls
- [ ] No secrets committed
- [ ] MVP scope respected
- [ ] User-scoped data access enforced
- [ ] Public/internal API contracts still accurate
- [ ] Errors are safe for clients

---

## 10. Summary

Write clear, typed, boundary-respecting code. NestJS owns orchestration and persistence; FastAPI owns analysis contracts; Next.js owns guided scan UX and MediaPipe — and never talks to AI directly.
