# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 3 arşivi: [`../docs/_archive/scratchpad-client-2026-04-17-phase-3.md`](../docs/_archive/scratchpad-client-2026-04-17-phase-3.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- Phase 3 tamamlandı. Frontend tarafında Phase 4'e geçiş bekleniyor.
- **Phase 4 scope (frontend kısmı):** topluluk paylaşım UI (mock exam / study pack share sayfaları), soru oylama UI, exam approval wall, post-exam report form, study group index.

---

## Phase 4 Hazırlık Notları

- **Route-level code split şart** — bundle 348KB gzipped (Phase 3 sonu). `React.lazy` ile pages/**.tsx lazy import'a çevrilecek; Phase 4 yeni sayfalar da baştan lazy.
- **TanStack Query'ye tekrar bak** — Phase 4 paylaşım feed'i + oylama gerçek-zamanlı update isteyecek. `useEffect + useState + optimistic update` ile gidilebilir ama mutation + invalidation fayda sağlar.
- **Reusable component'ler hazır:** Tabs (yeniden), ExamQuestionCard (public view mode lazım), ScoreGauge (profile page'te dashboard için), Tabs pattern, PracticeQuestionCard.
- **Analytics events kayıtlı:** `share_*`, `vote_*` event isimlerini AnalyticsEvents sabitine ekle (Phase 3'te register etmedim).

---

## Düşünceler / Keşifler

- Phase 3 session page'in localStorage draft + beforeunload + auto-submit pattern'ı, Phase 4 topluluk "taslak yorum" akışlarında yeniden kullanılabilir.
- `useCountdown` Phase 4 study group timer'larında veya "oy verme süresi dolmadan" UX'inde kullanılabilir.
- ReactMarkdown + `prose` her yerde — Phase 4 post-exam report markdown içerik için hazır.

---

## UI Borçları (Geçmiş Fazlardan — Phase 4+ değerlendir)

- **TanStack Query** — Phase 3'te `useEffect + useState + localStorage` ile gittik; Phase 4 paylaşım feed'i + oylama mutation için daha uygun.
- **Route-level code split** yok → Phase 4 başında öncelikli.
- **Recharts** hâlâ yüklü ama Phase 3'te kullanılmadı — Phase 4 topluluk dashboard'u için kullanılabilir. Dynamic import et.

---

## Performans Notları

- Phase 3 generate cold Gemini-bağımlı (30-60sn beklenti); cache hit 14ms (Phase 2 ile aynı profil).
- Bundle 348KB gzipped — build uyarı veriyor, code split gerek.
- Playwright smoke 8 senaryo, 0 bug.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 4 breakdown'da frontend işlerinin sırası (muhtemelen 4.X+).
2. `React.lazy` + route-level code split tercihli olarak Phase 4 başında.
3. TanStack Query eklemeye bu fazda karar ver.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
