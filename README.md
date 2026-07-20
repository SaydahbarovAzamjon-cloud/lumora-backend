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

Create a `.env` file in the repository root. At minimum for local backend work:

```env
PORT=4000
MONGODB_URI=
JWT_SECRET=
```

Additional environment variables for AI service URLs, auth providers, and deployment will be documented in [`docs/`](./docs/) as those decisions are recorded.

---

## Project Status

Documentation is being established **before** full implementation. Product and architecture decisions are recorded in `docs/`; do not treat older README drafts or StyleAI brainstorming as authoritative when they conflict with Lumora docs.

| Area | Status |
|---|---|
| Product definition | In progress (`docs/`) |
| NestJS project scaffold | Present |
| MVP feature implementation | Not complete |
| FastAPI AI service | Separate service; not in this README’s runtime steps |

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
