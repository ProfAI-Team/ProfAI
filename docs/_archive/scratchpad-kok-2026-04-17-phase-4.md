# Scratchpad — Kök (Genel)

Bu dosya **yaşayan çalışma defteridir.** Cross-cutting işler, proje geneli düşünceler, session arası hafıza.

> Frontend'e özel notlar → [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md)
> Backend'e özel notlar → [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md)
> Faz 3 arşivi (tarihsel bağlam): [`docs/_archive/scratchpad-kok-2026-04-17-phase-3.md`](./docs/_archive/scratchpad-kok-2026-04-17-phase-3.md)

---

## Kullanım Kuralları

- **Her session başında** üç scratchpad'i de kontrol et (bu + client + server).
- **Her session sonunda** üzerinde çalıştığın alanın scratchpad'ini güncelle.
- Open question'a döndüğünde: scratchpad'den `docs/tasks/open-questions.md`'e taşı.
- Karar netleştiğinde: scratchpad'den ilgili `docs/` dosyasına taşı, scratchpad'den sil.
- Milestone / faz sonunda: `docs/_archive/scratchpad-kok-YYYY-MM-DD.md` olarak dondur, yenisini aç.

---

## Şu An Üzerinde Çalışılan

- Phase 3 tamamlandı (2026-04-17, Phase 1+2'yle aynı gün içinde tek oturum). Phase 4 başlıyor.
- **Phase 4 — Topluluk Katmanı**: paylaşım, oylama, exam approval, credit sistemi, post-exam report. Detay: [`docs/roadmap/phase-4-community.md`](./docs/roadmap/phase-4-community.md).

---

## Düşünceler / Keşifler

- Phase 3'te rule-based karar (grading, prediction, panic plan) Gemini-only yaklaşımdan daha kontrollü + hızlı + ucuz çıktı. Phase 4'te paylaşım akışları için de rule-based defaults + opt-in Gemini upgrade pattern'ını sürdür.
- Mock exam flow (generate → session → submit → result) Phase 2 study pack flow'undan daha karmaşık — localStorage draft + timer + sanitize edilmiş question shape + auto-submit gibi yeni primitive'ler ortaya çıktı. Phase 4 paylaşım UX'inde yeniden kullanılır.

---

## Blocker

- Yok.

---

## Açık Soruların Hızlı Takibi

Sadece "yeni ortaya çıkan" açık sorular buraya. Olgunlaştığında [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md)'e taşı.

- **Bundle size 348KB gzipped** — Phase 2 retrosunda ve Phase 3 retrosunda da vurgulandı. Phase 4 başında route-level code split şart, çünkü Phase 4 paylaşım UI daha fazla component ekleyecek.
- **Breaking npm audit kalanları** — bcrypt 5→6, vitest 2→4, vite 5→8. Phase 4 başında değerlendir; auth + test + build açısından her biri ayrı risk.
- **TanStack Query kararı** — Phase 3'te gerekmedi, Phase 4 paylaşım + oylama state'inde tekrar bakıl.
- **Zod eksik** — Phase 3 controller'larda elle validation yeterli oldu ama Phase 4 paylaşım endpoint'lerinde daha agresif input validation şart olacak.

---

## Bir Sonraki Session İçin

1. [`docs/roadmap/phase-4-community.md`](./docs/roadmap/phase-4-community.md)'ı oku — scope + schema.
2. [`docs/roadmap/phase-3-mock-exams.md`](./docs/roadmap/phase-3-mock-exams.md) "Phase 4'e Geçerken Hazır Olanlar" bölümünü oku.
3. `docs/tasks/phase-4-breakdown.md` yaz (Phase 2+3 breakdown şablonunu takip et).
4. İlk iş: Phase 4 schema değerlendirmesi (UserCredit, ExamApproval, QuestionVote, PostExamReport, StudyGroup — beş yeni tablo).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu; doc restructure tamam + Phase 1 planı hazır. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik `docs/_archive/scratchpad-kok-2026-04-17.md`'ye donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-2.md`'ye donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik `docs/_archive/scratchpad-kok-2026-04-17-phase-3.md`'ye donduruldu, Phase 4 için reset. |
