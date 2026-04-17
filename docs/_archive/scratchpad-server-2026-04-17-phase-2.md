# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 1 arşivi: [`../docs/_archive/scratchpad-server-2026-04-17.md`](../docs/_archive/scratchpad-server-2026-04-17.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 1 tamamlandı. Backend tarafında Phase 2 başlıyor.
- **Phase 2 scope (backend):** `StudentNote` + `StudyPack` schema, `pdf-parse`/`mammoth` entegrasyonu (mevcut `analysisService` pattern'ini takip), `POST /api/notes/upload`, `POST /api/study-pack/generate`, `GET /api/study-pack/:id`.

---

## Phase 2 Hazırlık Notları

- **File extraction:**
  - PDF → `pdf-parse` (mevcut, sınav upload için kullanılıyor).
  - DOCX → `mammoth` (yeni dep).
  - TXT → plain read.
  - Foto OCR → Phase 6 (şimdi placeholder OK).
- **Gemini prompt:** `prompts/study-pack.ts` yeni dosya. Structured output (JSON): `{ topicSummaries, practiceQuestions, profStylePatterns }`. Style-summary pattern'ini takip et.
- **Study pack cache:** Phase 1 `ProfessorStyleProfile` gibi ama TTL'li (24h). Key: `userId + noteHash + professorId + version`.
- **Cost tracking:** `aiCallTracker.recordAICall` feature="study-pack" ile. Aynı altyapı, değişiklik yok.
- **Input kalite:** `StudentNote.wordCount < 500` → UI warning. Service'te hard reject yok, soft reject (generate it ama düşük kalite uyarısı).

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **Zod yok**: Input validation elle. Phase 2'de yeni endpoint'ler yazarken Zod eklemek için iyi fırsat.
- **Error response tutarsız**: Bazı endpoint `{ error: "..." }`, bazı `{ message: "..." }`. Yeni endpoint'lerde standardize et.
- **Prisma singleton**: Hot-reload'da yeniden kurulabilir. `server/src/lib/prisma.ts` içinde `globalThis.prisma` pattern'i ekle (küçük refactor).
- **`pino` logger yerleştirme** — `console.log` scatter devam ediyor.
- **Rate limit yok** — Phase 4 öncesi şart. Phase 2 study pack generation pahalı, rate limit gerçekten lazım (Gemini cost koruma).
- **Docker dev workflow** — `docker-compose.yml` server source'u volume mount etmiyor, build'e baked. Phase 1'de `docker compose cp` ile workaround. Phase 2'de `./server:/app` bind mount + `node_modules` override ekle — hot reload + migrate workflow profesyonelleşir.

---

## AI Pipeline Notları (Phase 1'den kalan + Phase 2 ekleri)

- **Model:** `gemini-2.5-flash-lite` stabil. Structured output (`responseMimeType: application/json`) çalışıyor.
- **Free tier flag** (`GEMINI_FREE_TIER=true`) runtime'da. `costUsd` projeksiyon olarak devam, `freeTier` kolonunda rapor ayrımı.
- **Retry:** 503/429 için 2 retry (exponential backoff 500ms, 1.5s). Study pack de aynı.
- **Prompt versioning:** Her prompt file `version` field'ı tutar. Cache key'de kullan.

---

## Seed / DB Notları

- Phase 2'de seed'e study pack fixture gerekmiyor — user-generated content, test'te inline oluştur.
- Mevcut seed 30sn, `StudentNote` + `StudyPack` tabloları boş duracak.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 2 schema: `StudentNote` + `StudyPack` modelleri, migration.
2. `POST /api/notes/upload` — Multer + pdf-parse/mammoth extraction.
3. `studyPackService.ts` + `prompts/study-pack.ts`.
4. KVKK aydınlatma metni — öğrenci notları kişisel içerik; Phase 2 launch öncesi metin hazır olmalı.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
