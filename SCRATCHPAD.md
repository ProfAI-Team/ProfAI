# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 7 arşivi: [`docs/_archive/scratchpad-kok-2026-04-19-phase-7.md`](./docs/_archive/scratchpad-kok-2026-04-19-phase-7.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 7 tamamlandı (2026-04-19, 32/32 task). Phase 8 planlaması veya go-to-market reset.
- **Sıradaki:** Phase 8 spec henüz yazılmadı. Olası kapsam:
  - Payment pipeline real-mode (iyzico HTTP + e-Fatura gerçek entegrasyonu)
  - Mobile native (React Native / Expo) — Q5 / T5 kararı
  - In-app messaging (tutoring + topluluk)
  - Auto-moderation (profanity + plagiarism ML)
  - LinkedIn auto-verify (hoca onay)
  - Hard multi-tenancy (enterprise)
  - International expansion (Stripe + English content)

---

## Düşünceler / Keşifler

- Phase 7 sandbox-first payment pattern (7.13) Phase 8'de "real-mode flag on" geçerken sadece HTTP wiring değişecek; abstraction stabil.
- pgvector + embedding service Phase 7 tutor matching + marketplace search ikilisini aynı altyapı ile çözdü; Phase 8 multimodal search refactor da aynı `<=>` cosine operator'u.
- Docker server Prisma generate drift ✅ 2026-04-19 `b7be394` ile kapandı (compose command'a `npx prisma generate &&` prepend; prod runner zaten image'a baked).
- Test infra: Parallel flake'in gerçek kökü pgvector değil, iki DB test suite'inin `contains` cleanup filter'ı cross-match'ti. post-exam-report'un `report-credit-<ts>@...` email'i credit-service'in "credit-" filtresini tetikleyip parallel worker'da kullanıcıyı siliyordu → P2003 FK. `startsWith` prefix anchor (`0e94ab1`) flake'i 14/14 yeşile çıkardı. pgvector migration public qualification (`8a14f82`) future-proof katman. Worker schema isolation silent no-op da kapandı (2026-04-19): root cause vitest'in `.env`'i `process.env`'e auto-load etmemesiydi — globalSetup + setup.ts'e `import "dotenv/config"` + globalSetup'a explicit CREATE SCHEMA + execSync stderr capture; test suite artık 319/319 passed (skipped yok), workers gerçekten `test_worker_1..4`'te koşuyor.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Kapalı open questions (Phase 7 sonu): T1 Redis, T2 R2, İ1 Aydın, H2 free-pilot→lisans, H3 email+manual, T4 multi-provider, D1 vitest, T3 BullMQ, H1 KVKK tur 1 (tur 2 ship öncesi).

Açık kalanlar: Q1 (AI tone), Q2 (free tier), Q3 (hoca opt-out), Q4 (answer key), Q5 (mobile), Q6 (tagline), T5 (mobile stack), T6 (structured output), İ2 (premium fiyat), İ3 (investment), İ4 (co-founder), İ5 (yıllık indirim).

---

## Bir Sonraki Session İçin

1. Phase 8 spec taslağı (`docs/roadmap/phase-8-*.md`) — kapsam + süreç + acceptance criteria.
2. Phase 7 retro'sundan kalan teknik borçlar — **Docker Prisma ✅, /tutors auth gate ✅, credit P2034 retry ✅, parallel test flake ✅, App.tsx mount order ✅, Navbar overflow ✅, worker schema isolation ✅** (2026-04-19, `b7be394` + `2755ce1` + `14a536d` + `0e94ab1` + `8a14f82` + `35fc827` + `9acee03` + worker schema isolation commit); hâlâ açık: Multer → storage.put() pipeline, reconstructExamSummary dışı AI migrations, in-app messaging.
3. Go-to-market hazırlığı düşünülürse: demo video + pitch deck + first 100 user outreach.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1-5 kapanışları aynı günde arşive donduruldu. |
| 2026-04-19 | Phase 6 + Phase 7 aynı gün içinde kapandı; içerik `docs/_archive/scratchpad-kok-2026-04-19-phase-7.md`'ye donduruldu, Phase 8 için reset. |
| 2026-04-19 | Phase 7 retro borçlarından 3 tanesi kapandı (Docker Prisma fix `b7be394`, /tutors public preview `2755ce1`, credit P2034 retry `14a536d`). Yeni retro borç dokümante edildi: pgvector test-schema drift. |
| 2026-04-19 | Parallel test flake gerçek root cause (email prefix collision) bulundu ve kapandı — `0e94ab1` (cleanup startsWith) + `8a14f82` (pgvector public qualification). Yeni retro: worker schema isolation silent no-op. |
| 2026-04-19 | App.tsx mount order retro borç kapandı (`35fc827`) — dnaRoutes per-route auth, mount order artık load-bearing değil. |
| 2026-04-19 | Navbar overflow retro borç kapandı (`9acee03`) — 5 top-level + 2 dropdown (Hazırlık/Araçlar) gruplaması; 1440 + 375 viewport smoke yeşil. |
| 2026-04-19 | Worker schema isolation silent no-op retro borç kapandı — root cause vitest `.env` auto-load yoktu; `dotenv/config` + explicit CREATE SCHEMA + migrate deploy loud-fail; 319/319 passed, skipped yok, test_worker_1..4 gerçekten kullanılıyor. |
