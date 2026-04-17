# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 2 arşivi (tarihsel bağlam): [`docs/_archive/scratchpad-kok-2026-04-17-phase-2.md`](./docs/_archive/scratchpad-kok-2026-04-17-phase-2.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 2 tamamlandı (2026-04-17, Phase 1'le aynı gün içinde tek oturum). Phase 3 başlıyor.
- **Phase 3 — Mock Exam ve Tahminler**: hoca stili + study pack verisiyle simulasyon sınavı üretimi + sonuç analizi. Detay: [`docs/roadmap/phase-3-mock-exams.md`](./docs/roadmap/phase-3-mock-exams.md).

---

## Düşünceler / Keşifler

- Phase 2'de structured output schema (responseSchema) çok işe yaradı — Phase 3 mock exam de aynı pattern'ı izlemeli.
- 22 saniyelik sync generate tolere edildi (step progress + ETA UI ile) ama Phase 3 mock exam daha uzun sürebilir (daha çok soru). Async queue Phase 3'te değerlendirilmeli.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **Dependabot: 24+ vulnerability** — Phase 1'den devam. `npm audit fix` ile toplu değerlendir (Phase 3 başı).
- **Docker server src bind mount eksik** — Phase 1 ve Phase 2'de her schema/kod değişikliğinde `docker compose build` + `cp` workaround'u gerekti. Phase 3 başı iş verimi için ekle (`./server:/app` + `node_modules` override).
- **Analytics kurulumu bekliyor** — Phase 1 ve Phase 2 retro'da da vurgulandı. Phase 3 öncesi (bu hafta) Plausible veya eşdeğer kurulmalı.
- **Rate limit Phase 4 öncesi şart** — Phase 3'te mock exam generation daha pahalı; Gemini cost koruma gerçekten lazım.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-3-mock-exams.md`](./docs/roadmap/phase-3-mock-exams.md)'ı oku — schema + endpoint'ler.
2. [`docs/roadmap/phase-2-study-packs.md`](./docs/roadmap/phase-2-study-packs.md) "Phase 3'e Geçerken Hazır Olanlar" bölümünü oku — altyapı listesi.
3. `docs/tasks/phase-3-breakdown.md` yaz (Phase 1 + Phase 2 breakdown şablonunu takip et).
4. İlk task: `MockExam` + `MockExamSession` Prisma schema + migration.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik `docs/_archive/scratchpad-kok-2026-04-17.md`'ye donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-2.md`'ye donduruldu, Phase 3 için reset. |
