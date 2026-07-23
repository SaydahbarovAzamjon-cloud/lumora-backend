# Postman — Lumora Backend GraphQL

Quick local test guide for the NestJS GraphQL API.

## Prerequisites

1. MongoDB running locally (`mongodb://127.0.0.1:27017/lumora`)
2. Backend on branch with auth + `analyzeFace` (e.g. PR #3)
3. `.env` in repo root:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/lumora
JWT_SECRET=change-me-in-development
JWT_EXPIRES_IN=1d
AI_MOCK=true
```

4. Start API:

```bash
npm install
npm run start:dev
```

Playground (optional): `http://localhost:3000/graphql`

## Import collection

1. Open Postman → **Import**
2. Select [`Lumora-Backend-GraphQL.postman_collection.json`](./Lumora-Backend-GraphQL.postman_collection.json)
3. Collection variables:
   - `baseUrl` = `http://localhost:3000`
   - `email` / `password` / `displayName`
   - `otpCode` — paste from Nest logs after `register`
   - `accessToken` — filled automatically by `confirmEmail` / `login`

## Test order

| # | Request | Auth | What to check |
|---|---|---|---|
| 0 | `GET /health` | No | `200` |
| 1 | `register` | No | `verificationRequired: true` |
| 2 | `confirmEmail` | No | OTP from logs → JWT saved |
| 4 | `me` | Bearer | Current user |
| 5 | `analyzeFace` | Bearer | `faceShape` + hair `items` |
| 6 | `recommendationHistory` | Bearer | Includes last result |
| 7 | `recommendation` | Bearer | Same id, owner-only |

### OTP (dev)

SMTP unset bo‘lsa, Nest console da shunga o‘xshash log chiqadi:

```text
[DEV] Email signup code for tester@example.com: 482913
```

Shu kodni collection variable `otpCode` ga qo‘ying, keyin **2. confirmEmail** ni yuboring.

### Auth header

Bearer token kerak bo‘lgan requestlarda Postman:

```http
Authorization: Bearer {{accessToken}}
```

(`confirmEmail` / `login` test scriptlari tokenni o‘zi yozadi.)

## Common failures

| Symptom | Fix |
|---|---|
| Mongo connection error | MongoDB ishga tushganini tekshiring |
| `Email already registered` | Yangi email yoki DB ni tozalang |
| `Invalid confirmation code` | OTP muddati 2 daqiqa; `resendVerificationCode` yoki qayta `register` |
| `Unauthorized` | `accessToken` bo‘sh / eskirgan |
| `AI_UNAVAILABLE` | `.env` da `AI_MOCK=true` yoki `lumora-ai` ni `AI_BASE_URL` da ishga tushiring |

## Note

Barcha GraphQL chaqiriqlar **bitta endpoint**ga ketadi:

```http
POST {{baseUrl}}/graphql
Content-Type: application/json
```

REST emas — Postman body mode: **GraphQL**.
