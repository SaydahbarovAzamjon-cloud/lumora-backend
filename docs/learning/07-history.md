# 07 — Recommendation History System Design

> Maqsad: **read model** / user-scoped history ni tasavvur qilish.

---

## 1. Nima uchun bu modul bor

User oldingi soch tavsiyalarini ko‘rishi kerak.  
Bu alohida “History module” emas — `AnalysisService` read path’i, lekin system design da alohida quti.

## 2. Qanday muammoni yechadi

| Muammo | Yechim |
|---|---|
| Boshqa user history | `userId` majburiy filter |
| Ko‘p yozuv | `limit` + `cursor` |
| IDOR | not found / null (leak qilmaydi) |

## 3. Workflow (tasavvur qil)

```text
recommendationHistory(limit, cursor?)
  → find recommendations where userId = me
  → sort createdAt desc
  → return items + nextCursor

recommendation(id)
  → find by id AND userId
  → null / NotFound if missing or not owner
```

## 4. Controller / Service

| GraphQL | Service |
|---|---|
| `recommendationHistory` | `AnalysisService.recommendationHistory` |
| `recommendation(id)` | `AnalysisService.recommendation` |

## 5. Muhim methodlar / kod

Cursor = oxirgi ko‘rilgan recommendation `id`.  
Keyingi page: `createdAt < cursor.createdAt` (stable sort `_id` bilan).

## 6. Summary

History = **user-scoped read model**. Write faqat muvaffaqiyatli `analyzeFace` dan keyin.
