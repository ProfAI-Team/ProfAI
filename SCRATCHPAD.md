# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 5 arşivi: [`docs/_archive/scratchpad-kok-2026-04-17-phase-5.md`](./docs/_archive/scratchpad-kok-2026-04-17-phase-5.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 5 tamamlandı (2026-04-17, aynı gün içinde 25 task). Phase 6 başlıyor.
- **Phase 6 — Multimodal + Live AI Tutor**: Voice tutor, OCR pipeline, mobile-friendly multimodal inputs. Detay: [`docs/roadmap/phase-6-multimodal.md`](./docs/roadmap/phase-6-multimodal.md).

---

## Düşünceler / Keşifler

- Phase 5'te rule-based + opt-in Gemini pattern 5. kez geçerli — DNA, learning style, confidence, GPA, course advisor hiçbiri Gemini'ye basmadı. Phase 6'da voice tutor + OCR doğrudan AI'ya bağımlı olacak, pattern burada değişir ama tier gating aynı kalır.
- Vite 8'in daha iyi tree-shake'i Phase 4 sonu 177KB → Phase 5 sonu 40KB gzipped başlangıç chunk'ı verdi. Phase 6'da voice/audio component'leri bu iyileşmeyi tüketmeye başlayacak.
- BullMQ + Redis altyapısı Phase 6'nın voice session queue ve OCR background processing ihtiyacına hazır.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **vitest 2→4 upgrade** — D1 kısmen kapatıldı (vite 8 uygulandı, vitest Phase 6'ya ertelendi). 6 test refactor + per-worker schema mode flip ayrı spike.
- **Phase 0/1 error shape migration** — 5.3'te infra kuruldu, 50+ `res.json({ error: "..." })` call'ı Phase 6 temizlik listesinde.
- **Style-profile cache-hit test** — 5.2'de skip edildi, 5.16'da TODO olarak bırakıldı. Cache warmup hook'uyla Phase 6'da geri açılacak.
- **T4 multi-provider AI stratejisi** — Phase 6 voice tutor ile birlikte değerlendirilmeli; Gemini + Claude fallback için iyi bir yer.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-6-multimodal.md`](./docs/roadmap/phase-6-multimodal.md) oku — scope + voice/OCR detayları.
2. [`docs/roadmap/phase-5-academic-dna.md`](./docs/roadmap/phase-5-academic-dna.md) "Phase 6'ya Geçerken Hazır Olanlar" bölümü.
3. `docs/tasks/phase-6-breakdown.md` yaz (Phase 4+5 şablonunu takip et; borçları öne al: vitest 2→4 + per-worker flip + Phase 0/1 error shape migration + .dockerignore).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik `docs/_archive/scratchpad-kok-2026-04-17.md`'ye donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-2.md`'ye donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-3.md`'ye donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-4.md`'ye donduruldu, Phase 5 için reset. |
| 2026-04-17 | Phase 5 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-5.md`'ye donduruldu, Phase 6 için reset. |
