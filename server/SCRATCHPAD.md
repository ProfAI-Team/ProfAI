# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- **Phase 1 Task 1.1 tamamlandı (2026-04-16)**: 3 model + migration + FK'lar.
- **Phase 1 Task 1.2 tamamlandı (2026-04-16)**: `professorStyleService.ts` aggregation + cache + concurrency lock.
- **Phase 1 Task 1.3 tamamlandı (2026-04-16)**: `prompts/style-summary.ts` (v1) + `aiCallTracker.ts` + `geminiProvider.generateStyleSummary`. Smoke: 3.9sn latency (sonraki 1.5sn), 470+151 tokens, $0.000081 projeksiyonu (free tier — gerçek $0). Özet kalitesi good. Fallback: Gemini fail → "fallback-v0" + isStale=true.
- **AICallLog freeTier flag eklendi (2026-04-16)**: migration `20260416201038_add_ai_call_free_tier_flag`. `GEMINI_FREE_TIER=true` env default. `costUsd` paid-tier projeksiyonu olarak devam ediyor; rapor query'leri ai-pipeline.md'de.
- Sıradaki: Task 1.4 — `GET /api/professors/:id/style-profile` endpoint.

---

## Phase 1 Hazırlık Notları

- **Migration adı:** `phase_1_style_profile` — üç model birlikte (`ProfessorStyleProfile`, `AICallLog`, `AIFeedback`).
- **Servis dizini:** `server/src/services/professorStyleService.ts` yeni.
- **Prompt dizini:** `server/src/prompts/style-summary.ts` yeni (prompt library Phase 1'de başlatılıyor).
- **Cache strategy Phase 1:** in-process LRU yeterli. 500 entry cap. Phase 3'te Redis.
- **Concurrency lock:** Aynı profId için paralel `getOrBuildStyleProfile` → tek Gemini call olmalı. Basit `Map<profId, Promise>` pattern.
- **Lazy generate:** 4500 hoca × Gemini call = $$$. Sadece ziyaret edilende üret.

---

## Düşünceler / Keşifler

- **Zod eksik**: Input validation elle yapılıyor. Phase 1'de Zod ekle (yeni endpoint yazarken alışkanlık kur).
- **Error response tutarsız**: Bazı endpoint `{ error: "..." }`, bazı `{ message: "..." }`. Phase 1'de konsolide etme fırsatı.
- **Prisma singleton**: Hot-reload'da yeniden kurulabiliyor. `server/src/lib/prisma.ts` içinde `globalThis.prisma` pattern'i ekle.
- **Gemini structured output**: Response schema ile JSON garantisi iyi; Zod post-parse ek güvence (defensive).

---

## Teknik Borç (Phase 1'de Değerlendir)

- `pino` logger yerleştirme — `console.log` scatter.
- Rate limit yok — Phase 1 için blocker değil ama Phase 4 öncesi şart.
- JWT refresh token yok — Phase 5 kapsamında.
- CORS dev'de açık, production'da sıkılaştır.
- Multer dosya temizlik job'u yok — `uploads/` klasörü zamanla şişer.
- **Docker dev workflow**: `docker-compose.yml` server source'u volume olarak mount etmiyor, build'e baked. Prisma migrate çalıştırmak için `docker compose cp` ile schema'yı container'a atıp inner run + migration'ı geri çekmek gerekti. Phase 1 içinde `server/`'a bind mount eklemek (`./server:/app` + `node_modules` override) değerlendir — hot reload + migrate workflow profesyonelleşir. Task 1.1'de bu workaround ile ilerlendi.

---

## AI Pipeline Notları

- **Model:** `gemini-2.5-flash-lite` stabil; `flash` 503 veriyordu.
- **Structured output:** `responseMimeType: "application/json"` + `responseSchema` çalışıyor.
- **Cost tracking:** Phase 1'de `AICallLog` tablosu + `geminiProvider.ts` wrap.
- **Retry:** 503 için 2 retry (exponential backoff 500ms, 1500ms). Daha fazlası fallback.
- **Prompt versioning:** Her prompt file'da `version: 'v1'` field'ı. Cache key'de kullanılır.

---

## Seed / DB Notları

- Seed çalıştırma **destructive**: production'da ASLA. Sadece dev.
- Phase 1 sonrası seed'e `ProfessorStyleProfile` seed data ekleme? → Hayır, lazy generate yeterli; integration test sırasında inline insert.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 1 Task 1.1 — Prisma schema migration (en öncelikli).
2. Öncesi kısa audit: mevcut `analysisService.ts` prompt'u `prompts/` dizinine taşımak yararlı mı? (refactor window).
3. Vitest kurulum kararı — Task 1.6'yı önce yapmak mı test-first için daha iyi?
4. KVKK aydınlatma metni backend tarafı: `/api/privacy-policy` + kullanıcı onay log'u (Phase 1 kapsamında düşünülmeli).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
