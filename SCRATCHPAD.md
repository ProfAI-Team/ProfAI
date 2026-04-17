# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 4 arşivi: [`docs/_archive/scratchpad-kok-2026-04-17-phase-4.md`](./docs/_archive/scratchpad-kok-2026-04-17-phase-4.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 4 tamamlandı (2026-04-17, aynı gün içinde 23 task). Phase 5 başlıyor.
- **Phase 5 — Akademik DNA + Persistent Memory**: `AcademicDNA`, confidence score, grade record, spaced repetition. Detay: [`docs/roadmap/phase-5-academic-dna.md`](./docs/roadmap/phase-5-academic-dna.md).

---

## Düşünceler / Keşifler

- Phase 4'te rule-based + opt-in Gemini pattern'ı yine işe yaradı (approval, report aggregation, high-performer — Gemini sıfır call). Phase 5'te `AcademicDNA` da benzer tonda başlamalı.
- Credit economy Serializable tx + `FOR UPDATE` ile race-safe; Phase 5 abonelik tier'ı `requireCredits` middleware'ını reuse edecek.
- `anonymizedHash` pattern Phase 5'e taşınabilir — aynı hash akademik-DNA aggregation'ında reuse edilirse cross-feature analytics temiz çıkar.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **vitest 2→4 + vite 5→8 spike** — D1 olarak açık, Phase 5 başına bir spike günü ayrılmalı; vitest config API (pool/coverage) ve Vite React plugin breaking change riski.
- **Test izolasyonu per-worker schema** — Phase 4'te `singleFork: true` ile serialize ettik; yeni DB-backed unit testler eklendikçe paralelleştirme gerekecek. Phase 5'te test DB migrasyonu (`test_worker_<id>` schema pattern) değerlendirilmeli.
- **Admin credit reset / prod seed demo kullanıcısı birikimi** — fixture seeder demo user'ı temizlemiyor; Phase 5'te admin panel planlanırken "manuel adjustments" endpoint'i gündeme gelebilir.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-5-academic-dna.md`](./docs/roadmap/phase-5-academic-dna.md) oku — scope + schema.
2. [`docs/roadmap/phase-4-community.md`](./docs/roadmap/phase-4-community.md) "Phase 5'e Geçerken Hazır Olanlar" bölümü.
3. `docs/tasks/phase-5-breakdown.md` yaz (Phase 3+4 şablonunu takip et; borçları öne al: vitest/vite spike + per-worker test DB izolasyonu).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik `docs/_archive/scratchpad-kok-2026-04-17.md`'ye donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-2.md`'ye donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-3.md`'ye donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-4.md`'ye donduruldu, Phase 5 için reset. |
