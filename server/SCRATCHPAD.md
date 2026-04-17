# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 5 arşivi: [`../docs/_archive/scratchpad-server-2026-04-17-phase-5.md`](../docs/_archive/scratchpad-server-2026-04-17-phase-5.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 5 tamamlandı. Backend tarafında Phase 6 başlıyor.
- **Phase 6 scope (backend):** Voice session tablosu + transcript aggregation, OCR pipeline + result cache, multi-provider AI (T4 kararı), push notification altyapısı.

---

## Phase 6 Hazırlık Notları

- **BullMQ + Redis altyapı** Phase 5'te kuruldu. Phase 6 voice session async processing + OCR batch queue doğrudan aynı `registerWorker` + `scheduleRepeating` + inline test mode pattern'ını kullanır.
- **Premium tier gating** (`requirePremium` + `PREMIUM_FEATURES` registry) — Phase 6 voice tutor / multimodal `VOICE_TUTOR` / `OCR_PRO` flag'leri ekleyerek anında gated.
- **anonymizedHash + k-anonymity** pattern — voice transcript aggregation'ı için reuse edilebilir (hoca × konu bazlı anonim trend).
- **Zod + `parseOrRespond<S>`** + AppError — Phase 6 endpoint'leri baştan bu stack'le yazılır.
- **Invalidation hook zinciri** (`Exam.verified → style + pack + mock + DNA`) — Phase 6 voice/OCR tetikli değilse gerek yok ama yeni cache'lere aynı pattern.

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **vitest 2→4 upgrade:** Phase 5'te ertelendi. 6 test refactor (`vi.mock` factory API değişti, singleFork paralellik). Phase 6 başı ayrı spike.
- **Per-worker test DB schema** opt-in olarak hazır (`VITEST_WORKER_COUNT=4`); default singleFork. vitest 4 ile birlikte default'a flip edilir.
- **Error response Phase 0/1 migration:** 5.3'te infra + middleware kuruldu, 50+ `res.json({ error: "..." })` call'ı 6 Phase 0/1 controller'ında (auth/professor/course/note/rating/exam) bekliyor.
- **Docker volume node_modules drift** — 5.24'te BullMQ + ioredis için volume silinip recreate gerekti. `.dockerignore` + rebuild script standardize edilmeli.
- **Prisma JSON field typing** — `select` içine nested relation alınca JsonValue dönüyor; 3 yerde `as unknown as X` cast gerekti (DNA, confidence, course advisor). Zod parse edilirse temizlenebilir.
- **Style-profile cache-hit integration test** — 5.2'de skip + TODO; cache warmup hook yazılınca açılacak.
- **`pino` logger** — hâlâ `console.log` + `console.warn`. Phase 6 voice/OCR structured logging gerektirince fırsat.

---

## AI Pipeline Notları

- **Gemini call'ları Phase 5'te sadece 1 yeni yerde:** `reconstructExamSummary` (premium-gated). Base DNA + confidence + advisor rule-based → 0 Gemini call; `DNA_NARRATIVE_GEMINI` flag'ı `enabled: false` (Phase 6'da açılacak).
- **`getClient` artık public** — geminiProvider.ts'den export edildi (5.14). `reconstructExamSummary` bunu kullanarak Gemini call yaptı. Phase 6 voice tutor + OCR için aynı shared client.
- **Rate limit quota tablosu güncel:** Phase 5'te 3 yeni limiter (dnaRecompute 10/gün, gradeWrite 30/gün, advisor 20/gün). Phase 6 voice session + OCR için yeni limiter'lar aynı factory'ye takılır.

---

## Seed / DB Notları

- Phase 5 fixture seeder: `scripts/seed-phase-5-fixture.ts` (idempotent, phase5fixture- prefix'li mock exam'ları temizler; demo user DNA + grade + review'ları wipe eder). Demo user subscriptionTier="premium" flip ediyor.
- `scripts/reset-demo-user.ts` — idempotent temizleme, fixture öncesi çalıştırılır.
- Post-exam `POST_EXAM_SALT` env'de pin — aggregation tutarlılığı sabit hash'e bağlı.
- `User.reviewFrequency` default "daily" — migration `phase_5_review_frequency`.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 6 schema tasarımı: `VoiceSession` (transcript, audio URL, duration), `OCRResult` (extracted text, confidence, source image).
2. Multi-provider AI (T4 açık karar) — Gemini + Claude fallback. Geminiprovider'a interface soyutlaması.
3. Push notification altyapısı — FCM / APNs? Phase 5 spaced rep scheduler log yazıyor, gerçek delivery kanalı Phase 6'da.
4. vitest 2→4 spike (Phase 5'ten ertelendi).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik arşive donduruldu, Phase 5 için reset. |
| 2026-04-17 | Phase 5 kapanışı — içerik arşive donduruldu, Phase 6 için reset. |
