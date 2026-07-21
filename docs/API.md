# Lumora — API Design

| Field | Value |
|---|---|
| Status | Active source of truth (contract intent) |
| Public API | NestJS GraphQL |
| Internal AI API | FastAPI (NestJS only) |
| Related | [ARCHITECTURE.md](./ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [AI.md](./AI.md) · [SECURITY.md](./SECURITY.md) · [MVP.md](./MVP.md) |

---

## 1. Purpose

This document defines the API surface for Lumora MVP:

1. **Public GraphQL API** consumed by the Next.js frontend
2. **Internal AI HTTP API** consumed only by NestJS

Exact schema field names may be refined during implementation, but ownership, operations, and boundaries in this document are binding.

---

## 2. API Boundaries

```text
Browser / Next.js
       │
       │  GraphQL (public)
       ▼
   NestJS API
       │
       │  Internal HTTP (private)
       ▼
   FastAPI AI
```

| API | Consumers | Protocol |
|---|---|---|
| Public application API | Next.js only (product clients) | GraphQL over HTTPS |
| Internal AI API | NestJS only | HTTP (FastAPI) |

**Forbidden:** Frontend → FastAPI

---

## 3. Public GraphQL API (NestJS)

### 3.1 Design principles

| Principle | Meaning |
|---|---|
| Auth-first | Analysis and history require authentication |
| Thin client | Frontend sends scan/landmark data; NestJS orchestrates AI |
| Explicit mutations for side effects | Scan/analyze persists history via mutation |
| Stable errors | Failures are structured and safe for clients |

### 3.2 Logical GraphQL modules

| Module | Operations |
|---|---|
| Auth | Register, login, optionally refresh/logout |
| User | Current user profile |
| Analysis | Submit scan/landmarks, receive face shape + recommendations |
| History | List prior recommendations |

### 3.3 Suggested types (logical)

```graphql
enum FaceShape {
  OVAL
  ROUND
  SQUARE
  HEART
  OBLONG
  DIAMOND
  TRIANGLE
  OTHER
}

enum RecommendationCategory {
  HAIR
}

type User {
  id: ID!
  email: String
  displayName: String
  createdAt: DateTime!
}

type RecommendationItem {
  key: String
  title: String!
  description: String
  score: Float
}

type Recommendation {
  id: ID!
  category: RecommendationCategory!
  faceShape: FaceShape!
  items: [RecommendationItem!]!
  createdAt: DateTime!
  faceAnalysisId: ID!
}

type FaceAnalysisResult {
  id: ID!
  faceShape: FaceShape!
  recommendations: Recommendation!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String
  user: User!
}
```

> Exact `FaceShape` enum values are product/AI decisions and may be adjusted when the AI taxonomy is finalized in [AI.md](./AI.md) / [DECISIONS.md](./DECISIONS.md).

### 3.4 Suggested queries

| Query | Auth | Purpose |
|---|---|---|
| `me` | Required | Current user |
| `recommendationHistory` | Required | List current user’s recommendations |
| `recommendation(id)` | Required | Single history item owned by current user |

Logical signatures:

```graphql
type Query {
  me: User!
  recommendationHistory(limit: Int = 20, cursor: String): RecommendationConnection!
  recommendation(id: ID!): Recommendation
}
```

### 3.5 Suggested mutations

| Mutation | Auth | Purpose |
|---|---|---|
| `register` | Public | Create account |
| `login` | Public | Obtain tokens / session |
| `logout` | Required | Invalidate session/refresh if applicable |
| `analyzeFace` | Required | Submit landmarks/scan payload; run AI; persist; return result |

Logical signatures:

```graphql
input FaceLandmarkInput {
  # Normalized MediaPipe landmark payload — exact shape TBD with frontend/AI
  points: [LandmarkPointInput!]!
  meta: FaceScanMetaInput
}

input AnalyzeFaceInput {
  landmarks: FaceLandmarkInput!
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  analyzeFace(input: AnalyzeFaceInput!): FaceAnalysisResult!
}
```

### 3.6 `analyzeFace` behavior contract

1. Require authenticated user
2. Validate landmark payload
3. Call FastAPI internal analyze endpoint
4. On success: persist `face_analyses` + `recommendations`
5. Return face shape + hair recommendation items
6. On AI/upstream failure: return controlled GraphQL error; do not create a successful recommendation record

### 3.7 Error expectations

| Case | Client expectation |
|---|---|
| Unauthenticated | Unauthorized error |
| Invalid landmarks | Bad user input error |
| AI unavailable | Upstream/service unavailable error |
| Not owner of history id | Not found or forbidden (do not leak existence across users) |

Exact GraphQL error code enum is an open implementation detail; must remain consistent once chosen.

---

## 4. Internal AI HTTP API (FastAPI)

Consumed **only** by NestJS. Not a public product API.

### 4.1 Suggested endpoints (MVP)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness for api↔ai ops |
| `POST` | `/v1/analyze/face` | Face shape + hair recommendations |

### 4.2 `POST /v1/analyze/face` (logical contract)

**Request (JSON):**

```json
{
  "requestId": "optional-correlation-id",
  "landmarks": {
    "points": [{ "x": 0.0, "y": 0.0, "z": 0.0, "index": 0 }],
    "meta": { "source": "mediapipe", "version": "string" }
  }
}
```

**Success response (JSON):**

```json
{
  "faceShape": "OVAL",
  "recommendations": {
    "category": "hair",
    "items": [
      {
        "key": "short-textured-crop",
        "title": "Textured Crop",
        "description": "Works well with your face shape.",
        "score": 0.92
      }
    ]
  }
}
```

**Error response (JSON):**

```json
{
  "error": {
    "code": "INVALID_LANDMARKS",
    "message": "Landmark payload incomplete"
  }
}
```

### 4.3 Internal auth

| Environment | Decision |
|---|---|
| Development | Private network; no service auth required (ADR-019) |
| Production | Private network + NestJS sends `X-API-KEY`; FastAPI validates it (ADR-019) |

---

## 5. Versioning

| Surface | MVP approach |
|---|---|
| GraphQL | Prefer additive schema evolution; avoid breaking renames |
| FastAPI | Path prefix `/v1`; breaking changes require `/v2` |

---

## 6. What the API Must Not Expose

| Forbidden exposure | Reason |
|---|---|
| FastAPI URLs to browsers | Breaks architecture trust boundary |
| Other users’ history | Security / privacy |
| Password hashes | Security |
| Raw AI stack traces to clients | Security / UX |
| Post-MVP domains (wardrobe, chat, shopping) | Scope control |

---

## 7. Confirmed Auth API Rules

| Topic | Decision |
|---|---|
| Access token | JWT via `Authorization: Bearer <token>` (ADR-010) |
| Providers | Email/password + Google OAuth only (ADR-009) |
| Analyze input | Landmarks JSON only — no image upload (ADR-011) |
| Face shapes | Fixed enum in Section 3.3 (ADR-012) |

Auth mutations cover email register/login plus Google OAuth. Kakao and phone are out of MVP.

---

## 8. Open API Decisions

| Decision | Status |
|---|---|
| Exact MediaPipe landmark GraphQL input shape | OPEN-004 (provisional `LandmarkPointInput` shipped; may refine) |
| Pagination style (`cursor` vs `offset`) | Open (provisional cursor connection type shipped) |
| Refresh token strategy / TTLs | OPEN-014 |
| GraphQL playground exposure in production | Open (default: disabled when `NODE_ENV=production`) |
| OAuth callback / redirect details | Open (implementation) |

---

## 9. Implementation Mapping (NestJS GraphQL)

Code-first GraphQL types live under `src/schema/`. A reference SDL snapshot is kept at `src/schema/schema.gql`.

| API.md concept | Code location |
|---|---|
| Enums (`FaceShape`, `RecommendationCategory`, `VerificationChannel`, `VerificationPurpose`) | `src/common/enums/`, `src/verification/` |
| Auth + user types | `src/schema/types/`, `src/auth/` |
| Shared OTP | `src/verification/verification.service.ts` |
| Module wiring | `AppModule` + `AuthModule` + `VerificationModule` |

### Auth & verification operations

| Operation | Auth | Status |
|---|---|---|
| `register` / `confirmEmail` / `resendVerificationCode` | Public | Implemented (ADR-023/024) |
| `login` / `loginWithGoogle` / `logout` / `me` | Mixed | Implemented |
| `forgotPassword` / `verifyPasswordResetOtp` / `resetPassword` | Public | Implemented (ADR-024) |
| `requestAccountVerification` / `confirmAccountVerification` | Required | Implemented (OTP only; payment/2FA/delete side-effects later) |
| `recommendationHistory` / `recommendation` | Required | Stub (T-106) |
| `analyzeFace` | Required | Stub (T-105) |

HTTP `GET /health` remains available for process liveness (non-GraphQL).

---

## 10. Cross-References

| Concern | Document |
|---|---|
| Who calls whom | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Persistence after mutations | [DATABASE.md](./DATABASE.md) |
| AI behavior details | [AI.md](./AI.md) |
| Authn/z rules | [SECURITY.md](./SECURITY.md) |

---

## 11. Summary

Lumora’s public API is **NestJS GraphQL** with **JWT Bearer** auth, email confirmation, forgot-password recovery, and a shared VerificationService for sensitive account OTPs. Analysis/history mutations remain next (T-105 / T-106).
