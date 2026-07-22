# 06 — AI Client System Design

> Maqsad: NestJS ichidagi **anti-corruption / outbound adapter** ni tushunish.

---

## 1. Nima uchun bu modul bor

FastAPI boshqa process. NestJS undan HTTP orqali gaplashadi.

`AiClientService` — yagona chiqish nuqtasi (frontend hech qachon chaqirmaydi).

## 2. Qanday muammoni yechadi

| Muammo | Yechim |
|---|---|
| AI URL qayerda? | `AI_SERVICE_URL` |
| Prod auth? | `AI_API_KEY` → `X-API-KEY` |
| Timeout / down | `ServiceUnavailableException` (safe message) |
| Stack trace sizib chiqmasin | Logger warn + generic client error |

## 3. Workflow (tasavvur qil)

```text
AnalysisService
    │
    ▼
AiClientService.analyzeFace(body)
    │
    ├─ headers: Content-Type, optional X-API-KEY
    ├─ POST {AI_SERVICE_URL}/v1/analyze/face
    │
    └─ success JSON | throw ServiceUnavailableException
```

## 4. Controller / Service

Controller yo‘q — faqat service adapter.

| Qism | Rol |
|---|---|
| `AiModule` + `HttpModule` | DI wiring |
| `AiClientService` | Outbound port |

## 5. Muhim methodlar / kod

`analyzeFace(request)` — yagona public method.

Env: `AI_SERVICE_URL`, `AI_API_KEY`, `AI_TIMEOUT_MS`.

Kod: `src/ai/ai.client.ts`.

## 6. Summary

AI Client = tashqi dunyoga **bitta eshik**. Domain bu eshikdan tashqariga chiqmasin.
