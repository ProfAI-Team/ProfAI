# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 7 arşivi: [`../docs/_archive/scratchpad-server-2026-04-19-phase-7.md`](../docs/_archive/scratchpad-server-2026-04-19-phase-7.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 7 tamamlandı. Backend tarafında Phase 8'e geçiş bekleniyor.
- **Phase 8 scope (backend, taslak):** iyzico real HTTP + e-Fatura; in-app messaging servisi; SSO gerçek (SAML SP↔IdP); hard multi-tenancy (enterprise); auto-moderation (ML-based); LinkedIn auto-verify; Payment anonymization (KVKK tur 2 sonrası); Stripe international aktivasyon.

---

## Teknik Borç (Phase 7 retro'dan gelen)

- **Docker server Prisma generate drift** — migration sonrası container'daki `@prisma/client` güncellenmiyor. Dockerfile `RUN npx prisma generate` eklenmeli; CI'da da aynı sorun. Phase 8 başı 1 saatlik iş.
- **App.tsx route mount order** — dnaRoutes + multimodalRoutes global `router.use(authenticate)` nedeniyle mount sırası kritik. Phase 8'de router-level auth yerine endpoint-level authenticate middleware çağrısı daha temiz olabilir.
- **Parallel test flake** (credit-service + post-exam-report) — Phase 6 retro'dan devam; 2/3 flake. beforeEach cleanup düzeltilmeli ya da DB-backed unit'ler singleFork'a alınmalı. Phase 8 başı.
- **reconstructExamSummary dışı AI call site'lar** — DNA narrative, course advisor, study pack, mock exam, grading hâlâ Gemini-only. Claude structured output API olgunlaşınca Phase 8'de migrate.
- **`enableOfflineQueue: false`** (`lib/cache.ts`) — Redis bağlantı kopmasında cache write'ları silent drop; get hatası logla + null dön (implicit miss). Production'da Redis uptime monitoring ile birleşik Phase 8'de değerlendirmeli.
- **Multer memory storage** — upload middleware disk storage'a yazıyor, R2 provider'a stream etmiyor; `lib/storage.ts` abstraction var ama existing controller'lar local path kullanıyor. Phase 8'de Multer → memory storage → storage.put(buffer) pipeline'ı aktifleştir.

## Phase 7 Kapanışındaki Test Suite Durumu

- 266 passed / 47 skipped / 1 pre-existing flake (credit-service) / 0 new failure.
- Phase 7 eklemeleri: 58 unit + 9 integration = 67 yeni test (7.19 hedef 95; yetersiz ama kapsam geniş).
- 4 worker paralel suite ~3s; Phase 8'de 350+ test'e çıkarken pattern korunabilir.

---

## AI Pipeline Notları (Phase 7 sonu)

- `withFallback` wrapper 2 call site'ta aktif: `generateStyleSummary` (6.3) + `reconstructExamSummary` (7.8). Phase 8 hedef 4+ call.
- `embeddingService.embedText` Gemini text-embedding-004 (768-dim); fallback yok, null döner. Phase 8'de Claude embedding veya OpenAI text-embedding-3 eklenebilir (aynı boyut şart).
- `AICallLog.feature` yeni Phase 7 değerleri: `"tutor-embedding"` (7.14), `"tutor-match-query"` (7.14), `"marketplace-embedding"` (7.15), `"marketplace-search"` (7.15), `"exam-reconstruct"` (7.8 migrate).

---

## Seed / DB Notları (Phase 7 sonu)

- `scripts/seed-phase-7-fixture.ts` → Phase 6 fixture'ı önce çalıştırır, sonra Phase 7 rolleri + tutor + marketplace + payment + tenant + session. İdempotent.
- Migration: `20260419003000_pgvector_extension` (extension only) + `20260419004500_phase_7_b2b_marketplace` (5 tablo + enum + User kolonları + vector kolonları + ivfflat indeksleri).
- Docker volume drift Phase 7'de 3 kez yaşandı: pgvector image switch (db volume drop gerekti), server container prisma generate race, client container cache (no-cache rebuild gerekti). `./scripts/rebuild-volumes.sh` tüm senaryoları çözdü.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 8 spec taslağı.
2. Docker Prisma generate CI/Dockerfile fix (Phase 7 retro borç).
3. Multer → storage.put() pipeline (Phase 7 retro borç).
4. Test flake cleanup (Phase 6/7 retro).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1-5 kapanışları arşive donduruldu. |
| 2026-04-19 | Phase 6 + Phase 7 kapanışı — içerik arşive donduruldu, Phase 8 için reset. |
