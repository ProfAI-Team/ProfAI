# Hedef Mimari (Phase 5+)

Bu doküman **10K-100K kullanıcı** ölçeğinde hedeflenen mimariyi tanımlar. Mevcut için: [`current-stack.md`](./current-stack.md).

---

## Hedef Diyagram

```
┌─────────────────────────────────────────────┐
│     React SPA + Mobile (React Native)       │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼─────────┬─────────────┬──────────┐
│   API Gateway      │  WebSocket  │   CDN    │
│   (Express + RL)   │ (Socket.io) │ (assets) │
└──────────┬─────────┴──────┬──────┴──────────┘
           │                │
┌──────────▼─────────┐ ┌────▼─────────────────┐
│  Core Services     │ │  AI Pipeline         │
│  - Auth            │ │  - Gemini Provider   │
│  - User/Prof CRUD  │ │  - Prompt Library    │
│  - Exam            │ │  - Cache Layer       │
│  - Notes           │ │  - Cost Tracker      │
│  - StudyPack       │ │  - Quality Monitor   │
│  - MockExam        │ │                      │
│  - Community       │ │                      │
│  - DNA             │ │                      │
└──────────┬─────────┘ └──────────┬───────────┘
           │                      │
           └─────────┬────────────┘
┌────────────────────▼──────────────────────┐
│           PostgreSQL (Prisma)             │
│  + Redis (cache, sessions, rate limiting) │
│  + S3 (file storage, uploads)             │
│  + BullMQ (background jobs, reminders)    │
└───────────────────────────────────────────┘
```

---

## Teknoloji Evrim Tablosu

| Katman | Mevcut (Phase 0) | Phase 2-3 | Phase 4-5 | Phase 6+ |
|--------|------------------|-----------|-----------|----------|
| Frontend | React + Vite | + TanStack Query (opt) | + Zustand (global state) | + React Native |
| Backend | Express | + Zod validation + pino logger | + BullMQ background jobs | + Socket.io, WebRTC |
| Database | Postgres 15 | Same | + Read replicas | Sharding? |
| Cache | Yok | In-process LRU | Redis | Redis Cluster |
| File Storage | Local fs | Local fs | S3 / Cloudflare R2 | S3 multi-region |
| AI | Gemini direct call | + `aiService` abstraction + cache | + Multi-provider (Claude fallback) | + Gemini Live, OCR pipeline |
| Auth | JWT | Same + refresh token | + OAuth (Google) | + SAML (B2B) |
| Payments | — | — | — | iyzico (Phase 7) |
| Monitoring | — | Sentry | Sentry + Plausible | + Datadog |
| CI/CD | GH Actions | + preview deploys | Same | + canary |

---

## Kritik Kararlar ve Nedenleri

### 1. Redis — Ne Zaman?

**Ne zaman:** Phase 3'te ekle.

**Nedenler:**
- Session cache (JWT doğrulamasından önce)
- AI response cache (Gemini call'larını kaç kat azaltır)
- Rate limiting (express-rate-limit-redis)
- BullMQ broker (Phase 4'e kadar InMemory, sonrası Redis)

**Alternatifler:** in-process (tek instance'da yeterli), Memcached (daha basit ama feature eksik).
**Karar:** Redis — çok yönlü, ekosistem güçlü.

---

### 2. File Storage — Local vs S3

**Ne zaman:** Phase 4'te S3/R2'ye geç.

**Nedenler:**
- Production'da birden fazla server instance olacak → local fs shared değil.
- 10K+ sınav = onlarca GB → disk yönetimi zor.
- Cloudflare R2 egress ücretsiz → ucuz.
- Presigned URL'ler ile direct upload/download → backend bypass.

**Geçiş stratejisi:** Yeni yüklenenler R2'ye, eskileri background migration.

---

### 3. Background Jobs — BullMQ

**Ne zaman:** Phase 4.

**Neden BullMQ:**
- Redis tabanlı (zaten gelecek).
- Retry logic, DLQ, priority queue built-in.
- TypeScript'te iyi.
- BullBoard UI ile debug kolay.

**Kullanım:**
- `exam-approval-check` (48h sonra durum)
- `study-group-matcher` (günlük)
- `dna-recompute` (günlük)
- `spaced-repetition-scheduler` (saatlik)
- `gemini-retry-queue` (cost amortization için batch)

---

### 4. Multi-Provider AI

**Ne zaman:** Phase 4+.

**Neden:** Gemini tek nokta arıza. Fiyat değişimi. Kota limitleri.

**Providers:**
- Primary: Gemini 2.5 Flash Lite
- Fallback: Claude Haiku 4.5 (Anthropic)
- Local backup: Llama 3 70B (opsiyonel, on-prem premium için)

**Soyutlama:** `aiService` → `provider.generate()`. Detay: [`ai-pipeline.md`](./ai-pipeline.md).

---

### 5. Mobile — React Native vs PWA

**Ne zaman:** Phase 6.

**Karar açık** — [`../tasks/open-questions.md`](../tasks/open-questions.md)'e taşındı.

**Önerilen:** PWA + React Native hybrid.
- PWA → hemen, mevcut web app'i install edilebilir yap.
- RN → Phase 6'da push notification, ses kaydı için native.

---

### 6. Read Replicas

**Ne zaman:** 10K+ DAU.

**Nedenler:**
- Analytics query'leri ağır (DNA, community stats).
- Read:Write oranı ~20:1.

**İlk:** Hetzner / DigitalOcean managed Postgres read replica. Sharding çok sonra.

---

## Ölçeklenme Aşamaları

| Kullanıcı | Stack Değişiklikleri |
|-----------|----------------------|
| 0-1K | Mevcut (single VPS) |
| 1K-10K | + Redis cache, CDN, query optimization |
| 10K-100K | + Read replicas, Gemini batch API, queue background jobs, S3 |
| 100K+ | Microservices split, K8s, multi-region |

---

## Güvenlik Hedefleri (Phase 5+)

- **Rate limiting:** user + IP bazlı (Redis).
- **CSP + CORS** sıkı policy.
- **Secret rotation** quarterly.
- **Audit log:** her admin action + hassas DB mutation.
- **Penetration test** Phase 5 öncesi (external).
- **KVKK compliance:** export + delete API, DPO, aydınlatma metni.

---

## Observability Hedefleri

- **Sentry** (error tracking) — Phase 1'den itibaren.
- **Plausible** (privacy-friendly analytics) — Phase 2'den itibaren.
- **Pino** logs → CloudWatch / Axiom — Phase 3.
- **Gemini cost dashboard** (per-user, per-feature) — Phase 4.
- **Datadog** — Phase 6+ (APM gerekiyorsa).

---

## İlgili

- Mevcut: [`current-stack.md`](./current-stack.md)
- AI pipeline: [`ai-pipeline.md`](./ai-pipeline.md)
- Data evrimi: [`data-model-evolution.md`](./data-model-evolution.md)
- Performans hedefleri: [`performance-targets.md`](./performance-targets.md)
- Açık sorular: [`../tasks/open-questions.md`](../tasks/open-questions.md)
