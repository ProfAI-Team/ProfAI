# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 1 arşivi (tarihsel bağlam): [`docs/_archive/scratchpad-kok-2026-04-17.md`](./docs/_archive/scratchpad-kok-2026-04-17.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 1 tamamlandı (2026-04-17). Phase 2 başlıyor.
- **Phase 2 — Kişiselleştirilmiş Çalışma Materyalleri**: konu materyali yükleme + AI study pack + pratik sorular. Detay: [`docs/roadmap/phase-2-study-packs.md`](./docs/roadmap/phase-2-study-packs.md).

---

## Düşünceler / Keşifler

- (Phase 2 başlangıcı — henüz yok)

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **Dependabot: 24 vulnerability** (15 high, 9 moderate) — GitHub push sırasında raporlandı. `https://github.com/ProfAI-Team/ProfAI/security/dependabot` → liste. Phase 2'de `npm audit fix` ile toplu değerlendir.
- **Phase 1 bulgusu — hardcoded UI string'ler:** bazı yerler (`index.html` title, home hero badge) i18n'e bağlı değildi. Phase 2'de lint kuralı veya test ile bunu yakalamak iyi olur.
- **Phase 1 bulgusu — Docker server src mount eksik:** Prisma migrate için `docker compose cp` workaround gerekti. Phase 2'de `./server:/app` bind mount ekleme değerlendir.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-2-study-packs.md`](./docs/roadmap/phase-2-study-packs.md)'ı yeniden oku — schema + endpoint'ler.
2. `docs/tasks/phase-2-breakdown.md` yaz (Phase 1 breakdown şablonunu takip et).
3. İlk task: `StudentNote` + `StudyPack` Prisma schema + migration.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik `docs/_archive/scratchpad-kok-2026-04-17.md`'ye donduruldu, Phase 2 için reset. |
