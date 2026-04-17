# Scratchpad — Backend

Backend'e özel yaşayan çalışma defteri. API, servis, Prisma, AI pipeline, migration notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Frontend notları → [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md)
> Genel backend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 3 arşivi: [`../docs/_archive/scratchpad-server-2026-04-17-phase-3.md`](../docs/_archive/scratchpad-server-2026-04-17-phase-3.md)

---

## Kullanım Kuralları

- Sadece **backend-spesifik** notlar buraya. Frontend'i etkileyen karar → kök scratchpad.
- Yeni servis / endpoint başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Schema değişikliği kararı netleştiğinde: `docs/architecture/data-model-evolution.md`'ye taşı.
- AI prompt iteration notları: her Gemini call karar detayı buraya, olgunlaştığında `docs/architecture/ai-pipeline.md`'ye.

---

## Şu An Üzerinde Çalışılan

- Phase 3 tamamlandı. Backend tarafında Phase 4 başlıyor.
- **Phase 4 scope (backend):** 5 yeni tablo (`UserCredit`, `ExamApproval`, `QuestionVote`, `PostExamReport`, `StudyGroup`); paylaşım + oylama endpoint'leri; exam approval workflow; credit economy.

---

## Phase 4 Hazırlık Notları

- **Rate limit middleware kurulu** — Phase 4 paylaşım + oylama endpoint'lerine aynı factory ile quota ver (muhtemelen daha yüksek: paylaşım günde 10, oy günde 50 gibi).
- **Prompt versioning pattern hazır** — Phase 4'te Gemini "exam approval summary" veya "post-exam aggregation" call'ları olursa aynı `VERSION` constant + cache key pattern'ı.
- **Invalidation hook mock exam'a ekli** — Phase 4'te yeni kaynak (approved exam, voted question) eklendiğinde benzer şekilde style profile + study pack + mock exam cache'leri invalidate et.
- **Zod entegrasyonu** — Phase 4 paylaşım endpoint'lerinin input şeması karmaşıklaşacak (post-exam report çok alanlı), Zod eklemek için ideal an.

---

## Teknik Borç (Geçmiş Fazlardan Kalan)

- **Zod yok**: Phase 4'te eklemek için iyi fırsat.
- **Error response tutarsız**: Phase 3'te `{ error: { code, message } }` tercih edildi bazı yerlerde, eski endpoint'ler hâlâ `{ error: "..." }` string. Phase 4 endpoint'lerinde standart union response'a geç.
- **Prisma singleton**: `server/src/lib/prisma.ts` hâlâ global pattern'i yok. Phase 4 scope'una sığar.
- **`pino` logger**: `console.log` scatter devam ediyor.
- **bcrypt 5 → 6 major bump** — rate limit + audit borcu Phase 3'te non-breaking kısmı halloldu, bcrypt + vitest + vite upgradeleri kaldı. Phase 4 başında değerlendir.

---

## AI Pipeline Notları (Phase 1+2+3'ten kalan + Phase 4 ekleri)

- **Model:** `gemini-2.5-flash-lite` stabil. Phase 4'te yeni Gemini use case çok değil (paylaşım summary olabilir).
- **Free tier flag** çalışıyor; Phase 4 analytics ile cost gerçek sayılar gelecek.
- **Retry/backoff** her yeni provider fonksiyonunda aynı pattern — Phase 4'te yeni eklenecek ise aynı skeleton.
- **Prompt versioning:** 3 versiyon aktif — `STYLE_SUMMARY_VERSION`, `STUDY_PACK_VERSION="study-pack-v1"`, `MOCK_EXAM_VERSION="mock-exam-v1"`. Phase 4'te 4. eklenebilir.

---

## Seed / DB Notları

- Phase 4 fixture: topluluk paylaşım mock data Phase 4 entegrasyon testinde inline. Seed'e ekleme zorunda değil — kullanıcı gerçekleştirdikçe oluşur.
- Mock exam + study pack + student note tabloları production'da boş duracak (user-generated).

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Backend)

1. Phase 4 schema tasarımı: 5 tablo (UserCredit / ExamApproval / QuestionVote / PostExamReport / StudyGroup).
2. Prompt versioning pattern'ı için 4. versiyon yeri (gerekliyse).
3. Zod introduction — paylaşım endpoint'leri input validation için.
4. Rate limit factory'ye Phase 4 quota'larını ekle.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
