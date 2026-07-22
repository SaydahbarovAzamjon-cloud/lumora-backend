# Lumora Documentation

**Scan. Analyze. Transform.**

This folder is the authoritative documentation set for the Lumora AI Personal Stylist platform.

If older brainstorming (including StyleAI materials) conflicts with these documents, **these documents win**.

---

## Start Here

| Order | Document | Why |
|---|---|---|
| 1 | [PROJECT.md](./PROJECT.md) | What Lumora is and is not |
| 2 | [ARCHITECTURE.md](./ARCHITECTURE.md) | System boundaries and request flow |
| 3 | [MVP.md](./MVP.md) | What we are building first |
| 4 | [DECISIONS.md](./DECISIONS.md) | Accepted and open decisions |
| 5 | [TASKS.md](./TASKS.md) / [PROGRESS.md](./PROGRESS.md) | What to do next |

Agent rules: [`../.cursor/agent.md`](../.cursor/agent.md)

---

## Document Index

| Document | Description |
|---|---|
| [PROJECT.md](./PROJECT.md) | Product definition, journey, scope |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Runtime architecture and hard integration rules |
| [MONOREPO.md](./MONOREPO.md) | Monorepo package ownership and boundaries |
| [MVP.md](./MVP.md) | MVP capabilities and acceptance criteria |
| [DATABASE.md](./DATABASE.md) | MongoDB logical data model |
| [API.md](./API.md) | GraphQL public API + internal FastAPI contract |
| [AI.md](./AI.md) | FastAPI AI service responsibilities |
| [SECURITY.md](./SECURITY.md) | Trust boundaries, authz, data protection |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Language and code conventions |
| [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | Process and decision discipline |
| [ROADMAP.md](./ROADMAP.md) | Phased plan beyond MVP |
| [MONETIZATION.md](./MONETIZATION.md) | Guest → Free → Pro, credits, paywalls |
| [PAYMENTS.md](./PAYMENTS.md) | Mock Pro checkout, provider swap, invoices |
| [VERIFICATION.md](./VERIFICATION.md) | Shared OTP, password recovery |
| [DECISIONS.md](./DECISIONS.md) | ADR log + open questions |
| [TASKS.md](./TASKS.md) | Execution backlog |
| [PROGRESS.md](./PROGRESS.md) | Milestone log |
| [learning/](./learning/) | **Uzbek** system-design learning docs (auth, users, …) |

---

## Confirmed Platform (Quick Reference)

```text
Next.js (MediaPipe)
      → NestJS GraphQL + MongoDB
      → FastAPI AI
```

| Rule | Detail |
|---|---|
| Product | AI Personal Stylist (not an image generator); MVP audience = men |
| MVP | Auth, guided scan, MediaPipe landmarks-only, face shape, hybrid hair recs, history |
| Auth | Email/password + Google; JWT Bearer |
| Locales | en / ko / uz · Client = web + mobile web |
| Repos | `lumora-backend`, `lumora-frontend`, `lumora-ai` (no monorepo) |
| AI prod auth | Private network + `X-API-KEY` |
| Hair catalog | Static JSON (MVP) |
| Monetization | Guest → Free (10 credits/mo) → Pro; mock checkout + shared OTP (ADR-022…024) |
| Hard rule | Frontend never calls AI directly |

---

## Folder Tree

```text
docs/
├── README.md                 ← you are here
├── PROJECT.md
├── ARCHITECTURE.md
├── MONOREPO.md
├── MVP.md
├── DATABASE.md
├── API.md
├── AI.md
├── SECURITY.md
├── CODING_STANDARDS.md
├── DEVELOPMENT_RULES.md
├── ROADMAP.md
├── MONETIZATION.md
├── PAYMENTS.md
├── VERIFICATION.md
├── DECISIONS.md
├── TASKS.md
└── PROGRESS.md
```

---

## How to Change Docs

1. Update the specialized document
2. If it is an architecture/product choice, add/update an ADR in [DECISIONS.md](./DECISIONS.md)
3. Reflect delivery impact in [TASKS.md](./TASKS.md) / [PROGRESS.md](./PROGRESS.md) when relevant
4. Keep the root [`../README.md`](../README.md) consistent for high-level statements

---

## Summary

These docs exist so a senior engineer can join Lumora and understand the product, architecture, MVP boundary, and next work without relying on chat history or outdated README drafts.
