# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 6 arşivi: [`docs/_archive/scratchpad-kok-2026-04-19-phase-6.md`](./docs/_archive/scratchpad-kok-2026-04-19-phase-6.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 6 tamamlandı (2026-04-19, 27/27 task). Phase 7 başlıyor.
- **Phase 7 — B2B + Marketplace**: Üniversite partnerlikleri, tutor marketplace, payment pipeline. Detay: [`docs/roadmap/phase-7-b2b-marketplace.md`](./docs/roadmap/phase-7-b2b-marketplace.md).

---

## Düşünceler / Keşifler

- Phase 6 voice tutor + OCR doğrudan AI'ya bağlandı — rule-based default pattern kırıldı ama multi-provider registry (6.3) + premium gating (6.9) kombini Phase 7'de B2B tutor matching için de aynı şekilde kullanılabilir.
- Vite 8 + vitest 4 (6.1) 4x paralel test kapasitesi açtı; Phase 7'de tahmini 100+ ek test comfortably scale edecek.
- KVKK draft (6.25) avukat review bekliyor — Phase 7 B2B onboarding'de üniversite × öğrenci veri akışı için ikinci tur gerekecek.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **T1 cache strategy** (in-process LRU vs Redis) — Phase 7 başında karar.
- **T2 file storage** (local fs → R2/S3) — OCR + lecture audio persistence için kritik.
- **pgvector vs pg_trgm** — multimodal search (6.13) MVP keyword overlap; Phase 7'de vector upgrade.
- **İ1 ilk hedef üniversite** — Phase 7 B2B pilot için.
- **Avukat review H1** — Phase 7 ship öncesi.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-7-b2b-marketplace.md`](./docs/roadmap/phase-7-b2b-marketplace.md) oku — scope + marketplace + payment detayları.
2. [`docs/roadmap/phase-6-multimodal.md`](./docs/roadmap/phase-6-multimodal.md) "Phase 7'ye Geçerken Hazır Olanlar" bölümü.
3. `docs/tasks/phase-7-breakdown.md` yaz (Phase 6 ritmini takip et; borçları öne al: T1 cache + T2 storage + pgvector spike + avukat review follow-up).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1-5 kapanışları aynı günde arşive donduruldu. |
| 2026-04-19 | Phase 6 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-19-phase-6.md`'ye donduruldu, Phase 7 için reset. |
