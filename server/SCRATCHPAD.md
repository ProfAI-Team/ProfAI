# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 4 arşivi: [`../docs/_archive/scratchpad-server-2026-04-17-phase-4.md`](../docs/_archive/scratchpad-server-2026-04-17-phase-4.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 4 tamamlandı. Backend tarafında Phase 5 başlıyor.
- **Phase 5 scope (backend):** `AcademicDNA`, `ConfidenceScore`, `GradeRecord`, `SpacedRepetition` tabloları; kullanıcı-başı long-lived vektör; spaced repetition scheduler.

---

## Phase 5 Hazırlık Notları

- **Credit middleware + rule-based economy** aktif — Phase 5'te premium tier'ı bu middleware'a feature flag ekleyerek bağlamak kolay.
- **anonymizedHash + k-anonymity** pattern — Phase 5 `AcademicDNA` cross-feature aggregation'larında aynı hash reuse edilebilir (salted sha256 aynı salt ile).
- **Zod + `parseOrRespond<S extends ZodTypeAny>` helper** olgunlaştı — Phase 5 endpoint'leri baştan Zod'la gelsin.
- **Invalidation hook zinciri** (`Exam.verified = true` → style + pack + mock cache invalidation) — Phase 5 DNA da aynı hook'a takılmalı, yoksa yeni sınav verified olduğunda DNA güncellenmez.
- **BullMQ henüz yok** — node-cron study group matcher yetti. Phase 5 spaced repetition scheduler günlük çalışacaksa BullMQ + Redis şart.

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **vitest 2→4 + vite 5→8 spike:** D1 açık, Phase 5 başında bir gün ayrılmalı. bcrypt 5→6 uyguladık, gerisi test/build breaking riski taşıyor.
- **Per-worker test DB schema:** `singleFork: true` seri çalıştırma şimdilik 1.5sn suite için kabul edilebilir ama 200+ test'e çıkınca yavaşlayacak. Phase 5'te `test_worker_${processId}` schema migration pattern'ı.
- **Error response tutarsızlığı** — Phase 4 endpoint'leri `{ error: { code, message } }` shape'inde; Phase 0/1 endpoint'leri hâlâ `{ error: "..." }` string. Phase 5'te global middleware'da normalize edilmeli.
- **Prisma client regeneration Docker workflow** — host'ta migrate dev çalıştığında container `npx prisma generate` olmadan stale kalıyor. CLAUDE.md'ye dev notu eklenebilir.
- **`pino` logger** — `console.log` dağınık devam ediyor. Phase 5'te structured logging.

---

## AI Pipeline Notları

- **Gemini call'ları Phase 4'te artmadı:** 3 prompt versiyonu aktif (style-summary, study-pack-v1, mock-exam-v1). Phase 5 `reconstructExam` prompt shape hazır (`postExamReportService`'te skeleton) ama çağrı yok; premium tier açılınca opt-in kullanılacak.
- **`gradeClassic` injection pattern** test edilebilirlik için ideal — Phase 5'te DNA prompt'ı için de aynı skeleton.
- **Rate limit quota tablosu güncel:** Phase 4'te 4 yeni limiter eklendi (approval 30/gün, vote 50/gün, report 3/gün, group 5/gün). Phase 5 yeni endpoint'ler aynı factory'ye takılır.

---

## Seed / DB Notları

- Phase 4 fixture seeder: `scripts/seed-phase-4-fixture.ts` (idempotent-ish, `phase4fixture-` prefix'li email + professor'ı temizler). Demo user'ın credit ledger'ı birikiyor — Phase 5 admin reset değerlendirilmeli.
- Post-exam `POST_EXAM_SALT` env'de pin edilmeli (aggregation tutarlılığı sabit hash'e bağlı).

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 5 schema tasarımı: `AcademicDNA` (long-lived vektör), `ConfidenceScore`, `GradeRecord`, `SpacedRepetition`.
2. Prompt versioning pattern — `ACADEMIC_DNA_VERSION` ve `reconstructExam` versiyonu (Phase 4'ten miras shape'i devraldık).
3. BullMQ + Redis karar noktası — spaced repetition scheduler node-cron'la mı BullMQ'yla mı?
4. vitest/vite spike (D1 ertelendi).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik arşive donduruldu, Phase 5 için reset. |
