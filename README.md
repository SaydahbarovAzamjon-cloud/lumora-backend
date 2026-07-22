# Lumora

**Scan. Analyze. Transform.**

Lumora is an AI Personal Stylist platform.

It is **not** an AI image generator.

This repository currently hosts the **NestJS GraphQL backend** for Lumora. Full platform documentation lives in [`docs/`](./docs/).

---

## What Lumora Does

Lumora guides a user through a face scan, analyzes facial landmarks, detects face shape, and returns personalized styling recommendations — starting with hair.

### Core Workflow

```text
User
  → Guided Face Scan
  → MediaPipe Face Landmarks
  → NestJS GraphQL Backend
  → FastAPI AI Service
  → Face Analysis
  → Personalized Recommendations
```

### Communication Rule

```text
Frontend (Next.js)
        │
        ▼
Backend (NestJS + GraphQL + MongoDB)
        │
        ▼
AI Service (FastAPI)
```

The frontend **never** communicates directly with the AI service. All AI traffic goes through the NestJS GraphQL backend.

---

## Official Architecture

Lumora uses **multi-repo** (monorepo not used):

| Surface | Repository | Technology | Responsibility |
|---|---|---|---|
| Frontend | `lumora-frontend` | Next.js | Guided face scan, MediaPipe landmarks, UI |
| Backend | `lumora-backend` | NestJS, GraphQL, MongoDB | Auth, orchestration, persistence |
| AI Service | `lumora-ai` | FastAPI (Python) | Face analysis + hybrid hair recommendations |

Production NestJS → FastAPI calls use private network + `X-API-KEY`.

Older brainstorming materials (including StyleAI notes) are historical only. **Lumora** is the official project name and decision source.

---

## Current MVP

| Capability | Description |
|---|---|
| Authentication | Email/password + Google OAuth; JWT Bearer (no phone/Kakao in MVP) |
| Guided Face Scan | Structured capture flow (web + mobile web) |
| MediaPipe Face Landmarks | Landmarks JSON only (no face image upload) |
| Face Shape Detection | Fixed taxonomy (oval/round/square/heart/oblong/diamond/triangle/other) |
| Hair Recommendation | Hybrid + static JSON catalog (men-focused) |
| Recommendation History | Persisted until account deletion |

MVP audience: **men**. Locales: **en / ko / uz**.

---

## Future Features

These are **out of scope for MVP**:

- Glasses recommendation
- Beard recommendation
- Outfit recommendation
- Wardrobe
- Shopping
- Virtual try-on
- Chat
- Color analysis
- Guest → Free credits → Lumora Pro monetization ([`docs/MONETIZATION.md`](./docs/MONETIZATION.md))
- Mock Pro checkout + shared OTP / password recovery ([`docs/PAYMENTS.md`](./docs/PAYMENTS.md), [`docs/VERIFICATION.md`](./docs/VERIFICATION.md))

See [`docs/ROADMAP.md`](./docs/ROADMAP.md).

---

## Repository Role

| Item | Value |
|---|---|
| Product | Lumora |
| This repo | `lumora-backend` — NestJS GraphQL + platform docs |
| Sibling repos | `lumora-frontend`, `lumora-ai` |
| API style | GraphQL + JWT Bearer |
| Database | MongoDB |
| Downstream AI | FastAPI private network; prod uses `X-API-KEY` |

Backend concerns for MVP include authentication, accepting scan/landmark payloads, calling the AI service, returning recommendations, and storing recommendation history.

---

## Documentation

Authoritative project documentation lives in `docs/`:

```text
docs/
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
├── PROGRESS.md
└── README.md
```

Agent guidance: [`.cursor/agent.md`](./.cursor/agent.md).

Start with [`docs/README.md`](./docs/README.md).

---

## Tech Stack (Confirmed)

| Layer | Stack |
|---|---|
| Frontend | Next.js |
| Backend | NestJS, GraphQL, MongoDB |
| AI | FastAPI (Python) |
| Face landmarks | MediaPipe (frontend) |

---

## Getting Started (This Backend Repo)

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB instance

### Install

```bash
npm install
```

### Run (development)

```bash
npm run start:dev
```

### Environment

Copy [`.env.example`](./.env.example) to `.env` and fill in values:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/lumora
JWT_SECRET=change-me-to-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
AI_SERVICE_URL=http://127.0.0.1:8000
AI_API_KEY=
AI_TIMEOUT_MS=15000
CORS_ORIGINS=http://localhost:3001
```

GraphQL endpoint: `http://localhost:3000/graphql` · Health: `GET /health`

Auth mutations: `register`, `login`, `loginWithGoogle`. Protected: `me`, `logout`, `analyzeFace`, history queries (Bearer JWT).

Generated GraphQL SDL is committed at [`src/schema.gql`](./src/schema.gql) (NestJS `autoSchemaFile`) so the public contract is reviewable without running the app. Do not gitignore it; regenerate by starting the API when schema classes change.

---

## Project Status

Phase 0 docs are complete. Phase 1 NestJS MVP API (auth + analyzeFace + history) is implemented. Product decisions live in `docs/`.

| Area | Status |
|---|---|
| Product definition | Complete (`docs/`) |
| NestJS project scaffold | Present |
| Auth (email/password + Google + JWT) | Done |
| Analyze + recommendation history | Done (needs `lumora-ai` for real AI) |
| MVP feature implementation | Backend API ready; AI + frontend remaining |
| FastAPI AI service | Sibling `lumora-ai` |

---

## Related Documents

| Document | Purpose |
|---|---|
| [`docs/PROJECT.md`](./docs/PROJECT.md) | Product definition |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System architecture |
| [`docs/MVP.md`](./docs/MVP.md) | MVP scope and acceptance |
| [`docs/API.md`](./docs/API.md) | GraphQL / backend API |
| [`docs/AI.md`](./docs/AI.md) | FastAPI AI service |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | Architecture Decision Records |

---

## License

This project is licensed under the MIT License.
