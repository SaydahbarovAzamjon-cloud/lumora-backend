# Lumora Learning Docs — Qanday o‘qish kerak

Bu papka **system design mashg‘uloti**. Oddiy “kod izohi” emas.

O‘qiyotganda har doim buni tasavvur qil:

```text
[Client] → [API qatlami] → [Business qatlami] → [Data / External]
```

Har faylda:

1. **Big picture** — qayerdasan (qaysi quti)
2. **Muammo** — nima uchun bu quti kerak
3. **Oqim** — so‘rov qanday yuradi (sequence)
4. **Qismlar** — kim nima qiladi
5. **Kod ankori** — real fayl/method
6. **Summary** — 3 jumlada eslab qol

**O‘qish tartibi (majburiy):**

| # | Fayl | System design savoli |
|---|---|---|
| 0 | [00-platform.md](./00-platform.md) | Butun tizim qanday qutilarga bo‘lingan? |
| 1 | [01-app-bootstrap.md](./01-app-bootstrap.md) | Process qanday start bo‘ladi? |
| 2 | [02-users.md](./02-users.md) | Identity qayerda saqlanadi? |
| 3 | [03-auth.md](./03-auth.md) | Trust qanday hosil bo‘ladi? |
| 4 | [04-health.md](./04-health.md) | Ops tizimni qanday kuzatadi? |

Keyingi phase’larda: analysis → AI client → history → docker/ci.

Texnik English docs: [`../`](../) — source of truth.  
Bu papka: **o‘rganish + system design tasavvuri**.
