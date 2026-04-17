# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 2 arşivi: [`../docs/_archive/scratchpad-server-2026-04-17-phase-2.md`](../docs/_archive/scratchpad-server-2026-04-17-phase-2.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 2 tamamlandı. Backend tarafında Phase 3 başlıyor.
- **Phase 3 scope (backend):** `MockExam` + `MockExamSession` schema, `prompts/mock-exam.ts`, `mockExamService.ts`, `POST /api/mock-exam/generate` + `POST /:id/submit` + `GET /:id/result`.

---

## Phase 3 Hazırlık Notları

- **Mock exam generation:** Phase 2 study pack pattern'ını birebir izle — cache-first (`userId + professorId + noteHash + promptVersion` benzeri), `aiCallTracker` `feature: "mock-exam"` flag'iyle, advisory lock veya unique-constraint-race-safe upsert.
- **Gemini prompt:** Phase 2 study pack prompt'u iyi bir şablon. Tek fark: mock exam daha çok soru (15-25), opsiyonel süre limiti, puanlama için answer key detaylı lazım.
- **Structured output schema:** `{ title, duration, questions: [...], scoring: { totalPoints, passingThreshold } }`. Question shape Phase 2'deki `PracticeQuestion`'ın supersetidir.
- **Submit/scoring:** Client'tan gelen cevapları backend doğrular; rule-based puanlama (MC/TF kesin, CLASSIC için Gemini'den skor iste). `MockExamSession` tablosuna kaydet.
- **Session state:** Timed exam için start/end timestamp'leri + per-question timing metrics. Dashboard için kullanışlı.

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **Zod yok**: Input validation elle. Phase 3'te yeni endpoint'ler yazarken Zod eklemek için iyi fırsat.
- **Error response tutarsız**: Bazı endpoint `{ error: "..." }`, bazı `{ status: ..., reason: ... }`. Phase 3'te union response'larda standardize et.
- **Prisma singleton**: Hot-reload'da yeniden kurulabilir. `server/src/lib/prisma.ts` içinde `globalThis.prisma` pattern'i ekle (küçük refactor).
- **`pino` logger yerleştirme** — `console.log` scatter devam ediyor.
- **Rate limit yok** — Phase 3'te mock exam generation daha pahalı; Gemini cost koruma gerçekten lazım. **Phase 3 başı prioritize edilmeli.**
- **Docker dev workflow bind mount** — Phase 1 + Phase 2'de her code/schema değişikliğinde `docker compose build` + `docker compose cp` gerekti. Phase 3 başı iş verimi için `./server:/app` + `node_modules` override ekle.

---

## AI Pipeline Notları (Phase 1+2'den kalan + Phase 3 ekleri)

- **Model:** `gemini-2.5-flash-lite` stabil. Phase 3'te mock exam için aynı model; daha uzun çıktı ama schema bağlayıcı.
- **Free tier flag** (`GEMINI_FREE_TIER=true`) runtime'da. Phase 3 mock exam `costUsd` projection de otomatik hesaplanır (aynı `aiCallTracker`).
- **Retry:** 503/429 için 3 retry (exponential backoff). Phase 3 mock exam de aynı.
- **Prompt versioning:** `MOCK_EXAM_VERSION = "mock-exam-v1"` — Phase 2'deki `STUDY_PACK_VERSION` pattern'ını izle.
- **Cache key:** `(userId, professorId, noteHash, promptVersion)` yeterli mi, yoksa session-bazlı (tek seferlik)? — Mock exam cache'lenmeyebilir (her session unique); önce karar ver.

---

## Seed / DB Notları

- Phase 3'te seed'e mock exam fixture gerekmiyor — user-generated session, test'te inline oluştur.
- Mevcut seed 30sn, `StudentNote` + `StudyPack` + `MockExam*` tabloları boş duracak.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 3 schema: `MockExam` + `MockExamSession` modelleri, migration.
2. `prompts/mock-exam.ts` — structured output schema + hibrit ton.
3. `mockExamService.ts` — generate + submit + score flow.
4. Rate limit middleware (en azından mock exam endpoint'inde).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
