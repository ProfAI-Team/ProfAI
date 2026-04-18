# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 6 arşivi: [`../docs/_archive/scratchpad-server-2026-04-19-phase-6.md`](../docs/_archive/scratchpad-server-2026-04-19-phase-6.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 6 tamamlandı. Backend tarafında Phase 7 başlıyor.
- **Phase 7 scope (backend):** `Tutor` + `TutoringSession` + `MarketplaceItem` + `Payment` + `UniversityAccount` tabloları, Stripe/İyzico payment webhook, üniversite admin paneli, tutor matching engine, B2B analytics dashboard.

---

## Phase 7 Hazırlık Notları

- **Multi-provider registry** (6.3) hazır — Phase 7 tutor matching'de Gemini/Claude rotatif kullanılabilir.
- **BullMQ + Redis** altyapısı — payment webhook retry + marketplace indexing doğrudan aynı `registerWorker` + `scheduleRepeating` pattern.
- **Premium flag registry** (6.9) — Phase 7 `TUTOR_MATCHING`, `MARKETPLACE_PRO`, `UNIVERSITY_ADMIN` gibi flag'ler eklenerek gated.
- **pino logger + request_id** (6.4) — B2B multi-tenant log ayrıştırma için `featureLogger.child({ tenant })` hazır.
- **anonymizedHash + k-anonymity** — tutor performans metrikleri + marketplace popülarite için reuse.
- **Zod + parseOrRespond + AppError + asyncHandler** — Phase 7 endpoint'leri baştan doğru stack.

---

## Test Suite Flake (Phase 7'de Keşfedildi, 2026-04-19)

- **Semptom:** `credit-service.test.ts` "history is returned newest-first" + `post-exam-report-service.test.ts` "refuses to disclose aggregates below k-anonymity" test'leri 2/3 oranında `PrismaClientKnownRequestError: Transaction failed due to a write conflict or a deadlock` ile düşüyor (4 worker paralel çalıştığında).
- **Kaynak:** Serializable isolation + aynı worker'a denk düşen iki DB-backed test seed collision. Per-worker schema isolation (6.1) farklı worker'lar için tutarsızlığı önlüyor ama aynı worker'da ardışık test'ler arası cleanup eksik.
- **Durum:** 7.3 öncesinden geliyor (git stash ile kontrol edildi, 2/3 flake oranı aynı). Phase 7 işimi blokluyor değil; backend test yeşil olması beklenen durumlarda tek tek re-run yeterli.
- **Çözüm önerisi:** `beforeEach` içinde seed'den etkilenen tabloları deleteMany ile temizle, ya da her test kendi user ID'sini üretsin. Phase 7 7.19 (backend test) sırasında ele alınabilir veya Phase 8'e ayrı borç olarak taşınabilir.

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **T1 cache strategy** — in-process LRU vs Redis kararı Phase 7 başında verilecek. Mevcut BullMQ connection Redis'e bağlı; cache için de aynı instance kullanılabilir.
- **T2 file storage** — local fs (/uploads) Phase 6 sonu OCR görsel + lecture audio + exam PDF kalıcı depoluyor. Phase 7 S3/R2 migration şart (disk şişiyor, B2B ölçekte imkansız).
- **pgvector upgrade** — multimodal search (6.13) pg_trgm + MockExam.questions JSONB ILIKE ile çalışıyor; Phase 7'de vektör benzerlik için pgvector.
- **MockExam JSONB ILIKE raw SQL** (6.13) — tek tırnak escape'li ama raw query; Phase 7 pgvector refactor'ı bu path'i tamamen temizleyecek.
- **Hesap silme endpoint** — KVKK taslağında referans verildi ama implemente edilmedi; Phase 7 avukat review sonrası aktif olacak.

---

## AI Pipeline Notları

- **Phase 6'da 4 yeni AI call sitesi:** OCR multimodal (`ocr-multimodal`), voice tutor (live, Gemini Live WebSocket), lecture transcribe (`lecture-transcribe`), multimodal search describe (`multimodal-search`). Hepsi `AICallLog.provider` + `fallbackUsed` telemetrisinde.
- **providerRegistry** (6.3) — `withFallback` wrapper + lazy Claude SDK. İlk migrated call `generateStyleSummary`; Phase 7'de tutor matching + marketplace özetleme aynı wrapper'dan geçer.
- **Rate limit quota** güncel: voice 20 start/gün + 30dk toplam, OCR 20/gün, lecture 2/gün, multimodal 10/gün. Phase 7 tutor matching için yeni limiter'lar aynı factory'de.

---

## Seed / DB Notları

- Phase 6 fixture seeder: `scripts/seed-phase-6-fixture.ts` (idempotent, phase6fixture-prefix'li OCR + lecture; reset-demo-user öncelik çağırıyor). Demo user pushOptIn=true, subscriptionTier=premium.
- `scripts/reset-demo-user.ts` — Phase 5'ten devam; Phase 6 için değişiklik yok (fixture seeder çağırıyor).
- Migration: `20260418202608_phase_6_multimodal` — 4 yeni tablo + User.pushOptIn + AICallLog.fallbackUsed.
- Docker volume drift Phase 6 içinde 2 kez denendi (BullMQ artığı + pino eksikliği), `./scripts/rebuild-volumes.sh` ikisini de çözdü.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 7 schema tasarımı: `Tutor` (profile + availability), `TutoringSession` (booking), `MarketplaceItem` (listing), `Payment` (Stripe/İyzico webhook), `UniversityAccount` (B2B tenant).
2. Payment gateway — Stripe Connect vs İyzico (TR ödeme için).
3. Tutor matching engine — DNA + compatibility (Phase 5) pattern'i öğrenci ↔ tutor yönüne genişletme.
4. Multi-tenancy — UniversityAccount tenant_id kolonu tüm tablolarda mı, ayrı schema mı? Phase 7 başı karar.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1-5 kapanışları arşive donduruldu. |
| 2026-04-19 | Phase 6 kapanışı — içerik arşive donduruldu, Phase 7 için reset. |
