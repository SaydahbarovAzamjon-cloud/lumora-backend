# Lumora — Development Rules

| Field | Value |
|---|---|
| Status | Active source of truth |
| Related | [CODING_STANDARDS.md](./CODING_STANDARDS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [MVP.md](./MVP.md) · [DECISIONS.md](./DECISIONS.md) · [TASKS.md](./TASKS.md) |

---

## 1. Purpose

This document defines how engineers work on Lumora: decision discipline, scope control, documentation duty, and collaboration rules.

If a practice conflicts with architecture boundaries, architecture wins.

---

## 2. Source of Truth Hierarchy

When information conflicts, use this order:

1. Latest recorded decision in [DECISIONS.md](./DECISIONS.md)
2. Specialized docs (`ARCHITECTURE`, `MVP`, `API`, `AI`, `DATABASE`, `SECURITY`)
3. [PROJECT.md](./PROJECT.md)
4. Root `README.md`
5. Historical brainstorming (StyleAI, old notes) — reference only

Older names and drafts are not authoritative.

---

## 3. Non-Negotiable Engineering Rules

| Rule ID | Rule |
|---|---|
| DEV-01 | Frontend never calls FastAPI |
| DEV-02 | NestJS is the only public application API |
| DEV-03 | MVP scope is limited to auth, guided scan, MediaPipe landmarks, face shape, hair recommendation, history |
| DEV-04 | Do not invent architecture (Redis, queues, gateways, etc.) without a decision record |
| DEV-05 | Do not expand MVP with future features “for convenience” |
| DEV-06 | Secrets never enter git |
| DEV-07 | User data access is always scoped to the authenticated user |

---

## 4. Decision Rule

If a required fact is missing:

1. Stop implementing the ambiguous part
2. Add or request an entry in [DECISIONS.md](./DECISIONS.md)
3. Update the relevant specialized doc
4. Then implement

Do not silently choose production architecture in a PR without documenting it.

---

## 5. Branch & Change Workflow (Practical)

Exact Git branching names are open if not already set. Minimum expectations:

| Practice | Expectation |
|---|---|
| Focused changes | One concern per PR when practical |
| Docs with contracts | API/DB/AI behavior changes update docs in the same PR |
| Task tracking | Reflect major work in [TASKS.md](./TASKS.md) / [PROGRESS.md](./PROGRESS.md) |
| Review | Call out boundary-sensitive changes (auth, AI client, data access) |

---

## 6. Implementation Order (Recommended)

For MVP delivery, prefer this sequence:

1. Auth foundation (NestJS + frontend)
2. GraphQL skeleton for protected operations
3. FastAPI `/health` + `/v1/analyze/face` stub/real
4. NestJS AI client + `analyzeFace` orchestration
5. MongoDB persistence for analyses/recommendations
6. Frontend guided scan + MediaPipe
7. End-to-end wiring
8. History UI + queries
9. Hardening (validation, errors, security checks)

See [TASKS.md](./TASKS.md).

---

## 7. Local Development Rules

| Rule | Detail |
|---|---|
| Run AI locally for integration | NestJS should target a local/internal AI URL |
| Frontend env | GraphQL endpoint only for API access |
| `.env` | Keep local; provide `.env.example` without secrets |
| Demo data | Never use real production user face data in fixtures committed to git |

---

## 8. Documentation Rules

| Change type | Docs to update |
|---|---|
| Product scope | `PROJECT.md`, `MVP.md`, `ROADMAP.md`, `DECISIONS.md` |
| Trust boundaries | `ARCHITECTURE.md`, `SECURITY.md`, `DECISIONS.md` |
| GraphQL/AI contracts | `API.md`, `AI.md` |
| Collections/fields | `DATABASE.md` |
| Completed work | `PROGRESS.md`, `TASKS.md` |

Do not leave docs knowingly wrong.

---

## 9. Agent / AI-Assistant Rules

Cursor agents and coding assistants must follow [`.cursor/agent.md`](../.cursor/agent.md):

- Prefer docs over inventing architecture
- Respect MVP boundaries
- Ask/record decisions instead of guessing critical infrastructure
- Never introduce frontend→AI coupling

---

## 10. Definition of Ready (Feature Work)

A feature is ready to implement when:

- [ ] It is in MVP scope or explicitly approved post-MVP work
- [ ] Owning package is clear (`web` / `api` / `ai`)
- [ ] API/data impact is identified
- [ ] Open decisions blocking it are resolved or explicitly deferred with a safe default

---

## 11. Definition of Done (Feature Work)

A feature is done when:

- [ ] Acceptance criteria met
- [ ] Boundary rules respected
- [ ] Relevant docs updated
- [ ] Sensible tests for the risk level added
- [ ] [PROGRESS.md](./PROGRESS.md) updated for meaningful milestones

---

## 12. Summary

Develop Lumora with decision discipline: **docs-first for boundaries, MVP-first for scope, NestJS-mediated AI always**. When unsure, record a decision — do not invent the platform in code.
