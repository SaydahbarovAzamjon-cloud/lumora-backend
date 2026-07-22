# 04 — Health System Design

> Maqsad: **operability** ni business API dan ajratib ko‘rish.

---

## 1. Nima uchun bu modul bor

System design da faqat feature emas — **ishlatish** ham bor:

- Container orchestration restart qiladimi?
- Load balancer traffic beradimi?

Buning uchun eng arzon signal: health endpoint.

## 2. Qanday muammoni yechadi

| Muammo | Health |
|---|---|
| `/graphql` og‘ir / auth talab | oddiy `GET /health` |
| Deploy “upmi?” bilmaydi | `{ status: "ok" }` |
| Hello World chalkashligi | aniq probe path |

## 3. Workflow (tasavvur qil)

```text
Docker / K8s / Compose healthcheck
        │
        ▼
   GET /health
        │
        ▼
 HealthController ──► 200 { status: "ok" }
```

Hozirgi holat = **liveness** (process tirik).

Keyingi hardening (Phase 3) da readiness ajralishi mumkin:

```text
/health          → process alive
/health/ready    → Mongo ping OK (misol)
```

## 4. Controller / Service

| Qism | Rol |
|---|---|
| `HealthController` | Ops interface |
| Service | Hozir kerak emas |

Bu — domain emas, **platform concern**.

## 5. Muhim methodlar / kod

`src/health/health.controller.ts` → `check()`.

E2E ham shu path’ni tekshiradi (`test/app.e2e-spec.ts`).

## 6. Summary

Health = tizimning “yurak urishi” sensori.  
Feature chizmasiga aralashtirma — alohida ops qutisi.
