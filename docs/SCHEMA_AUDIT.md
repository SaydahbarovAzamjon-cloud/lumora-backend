# Lumora — Backend Schema Audit (2026-07-20)

| Field | Value |
|---|---|
| Scope | MongoDB models + GraphQL SDL foundation |
| Related | [DATABASE.md](./DATABASE.md) · [API.md](./API.md) · [ER_MODELING.md](./ER_MODELING.md) · [DECISIONS.md](./DECISIONS.md) · [TASKS.md](./TASKS.md) |
| Outcome | **Pass with noted opens** — safe to proceed to Auth (T-101) |

---

## 1. Checklist vs docs/ADRs

| Requirement | Status | Evidence |
|---|---|---|
| Collections: users, face_analyses, recommendations | Pass | Mongoose schemas + collection names |
| No wardrobe/shopping/chat collections | Pass | Not created |
| No face images stored (ADR-011) | Pass | Landmarks object only |
| Face shape taxonomy (ADR-012) | Pass | Shared `FaceShape` enum |
| Auth providers email + google only (ADR-009) | Pass | `AuthProviderType`; no Kakao/phone |
| Locales en/ko/uz (ADR-016) | Pass | `UserLocale` on user |
| passwordHash never GraphQL-exposed | Pass | `select: false` + omitted from `UserType` |
| History user scoping indexes | Pass | `{ userId, createdAt }` indexes |
| Hair category MVP | Pass | DB `hair` / GraphQL `HAIR` |
| refresh_tokens deferred (OPEN-014) | Pass | Not created |
| GraphQL ops from API.md | Pass | Declared; logic stubs throw |
| Redis/BullMQ absent (ADR-017) | Pass | Not added |

---

## 2. Gaps / accepts for later

| Item | Severity | Notes |
|---|---|---|
| OPEN-004 landmark shape | Low | Provisional `points[]` + meta; refine with frontend/AI |
| OPEN-014 refresh tokens | Low | `refreshToken` nullable on `AuthPayload`; no collection yet |
| Resolver stubs | Expected | T-101 / T-105 / T-106 own implementations |
| `_schemaHealth` temporary field | Low | Remove when domain resolvers replace foundation |
| `rawAiResponse` retention | Open | Field exists; production keep/drop still open in DATABASE.md |
| Live Mongo bootstrap in CI | Low | App connect needs running Mongo; unit tests do not require it yet |

---

## 3. Verdict

Schema foundation matches MVP docs. **Next:** implement Auth module (T-101) on top of `User` schema and protect declared queries/mutations.
