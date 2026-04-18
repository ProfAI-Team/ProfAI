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
- Docker server Prisma generate drift (7.31 bug) → Dockerfile'a `RUN npx prisma generate` eklenmeli, CI'da aynı tuzak.

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
2. Phase 7 retro'sundan gelen teknik borçlar (Docker Prisma, /tutors auth gate, test flake) — Phase 8 borç tablosuna alınacak.
3. Go-to-market hazırlığı düşünülürse: demo video + pitch deck + first 100 user outreach.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1-5 kapanışları aynı günde arşive donduruldu. |
| 2026-04-19 | Phase 6 + Phase 7 aynı gün içinde kapandı; içerik `docs/_archive/scratchpad-kok-2026-04-19-phase-7.md`'ye donduruldu, Phase 8 için reset. |
