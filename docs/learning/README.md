# Lumora Learning Docs — Qanday o‘qish kerak

Bu papka **system design mashg‘uloti**. Oddiy “kod izohi” emas.

O‘qiyotganda har doim buni tasavvur qil:

```text
[Client] → [API qatlami] → [Business qatlami] → [Data / External]
```

Har faylda:

1. **Nima uchun bor**
2. **Qanday muammo**
3. **Workflow**
4. **Controller / Service**
5. **Muhim methodlar / kod**
6. **Summary**

---

## O‘qish tartibi

| # | Fayl | System design savoli |
|---|---|---|
| 0 | [00-platform.md](./00-platform.md) | Butun tizim qutilari? |
| 1 | [01-app-bootstrap.md](./01-app-bootstrap.md) | Process qanday start? |
| 2 | [02-users.md](./02-users.md) | Identity qayerda? |
| 3 | [03-auth.md](./03-auth.md) | Trust qanday? |
| 4 | [04-health.md](./04-health.md) | Ops qanday kuzatadi? |
| 5 | [05-analysis.md](./05-analysis.md) | Analyze orkestratsiyasi? |
| 6 | [06-ai-client.md](./06-ai-client.md) | Nest → AI eshigi? |
| 7 | [07-history.md](./07-history.md) | History qanday himoyalangan? |

**Keyingi (Phase 3+):** hardening, docker, ci.

Texnik English docs: [`../`](../).
