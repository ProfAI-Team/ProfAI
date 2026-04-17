# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 2 arşivi: [`../docs/_archive/scratchpad-client-2026-04-17-phase-2.md`](../docs/_archive/scratchpad-client-2026-04-17-phase-2.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- Phase 2 tamamlandı. Frontend tarafında Phase 3'e geçiş bekleniyor.
- **Phase 3 scope (frontend kısmı):** mock exam generate sayfası, timed exam UI (zamanlayıcı + soru navigasyonu), mock exam result sayfası (genel skor + bölüm analizi + soru-bazlı dönüt).

---

## Phase 3 Hazırlık Notları

- **Tabs component** — Phase 2'de yazıldı, mock exam result'ta yeniden kullanılır (genel skor / bölüm / soru analizi tab'ları).
- **Markdown render** — `react-markdown` + `remark-gfm` + `@tailwindcss/typography` Phase 2'de eklendi, mock exam soru açıklamaları için hazır.
- **Zamanlayıcı UI** — yeni component. `Timer` component'i lazım; tick + warning state + pause.
- **Navigasyon iskeleti** — soru × soru gezinme, flag (şüpheli) işaretleme, mock exam submit dialog.
- **State yönetimi** — Phase 3'te birden fazla sayfa arası mock exam session state var. TanStack Query eklemeyi ciddi değerlendir (client/SCRATCHPAD phase-2 arşivinde de önerilmişti).

---

## Düşünceler / Keşifler

- Phase 2 StudyPackPage + UploadNotesPage pattern'ları kuruldu — Phase 3 aynı yapı: service + types + page. Hızlı gelecek.
- `PracticeQuestionCard` yeniden kullanılabilir — mock exam'ın soru UI'ı bunun biraz genişlemiş versiyonu olabilir (timer + flag + nav).

---

## UI Borçları (Geçmiş Fazlardan — Phase 3+ değerlendir)

- **TanStack Query yok**, `useEffect + useState` devam. Phase 3 mock exam session state için gerçekten lazım olabilir.
- **Route-level code split** yok. Phase 3 sonu bundle büyüyünce değerlendir.
- **Recharts** hâlâ yüklü — mock exam result grafiklerinde kullanılabilir.

---

## Performans Notları

- Phase 2 StudyPackPage cold 22sn (Gemini) · cache hit 14ms. UI tarafı <200ms.
- Phase 3 mock exam generation muhtemelen 30-60sn sürecek — async job queue veya streaming düşünülebilir.
- Bundle analiz hâlâ yapılmadı — Phase 3 sonu öncelik.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 3 breakdown'da frontend işlerinin sırası: muhtemelen 3.7+ (backend önce).
2. `Timer` component pattern belirle (pause/resume, warning threshold).
3. TanStack Query eklemeye karar ver.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
