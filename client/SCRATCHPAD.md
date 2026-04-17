# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)
> Faz 4 arşivi: [`../docs/_archive/scratchpad-client-2026-04-17-phase-4.md`](../docs/_archive/scratchpad-client-2026-04-17-phase-4.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- Phase 4 tamamlandı. Frontend tarafında Phase 5'e geçiş bekleniyor.
- **Phase 5 scope (frontend kısmı):** Akademik DNA dashboard, confidence radar, spaced repetition calendar, grade record tracker.

---

## Phase 5 Hazırlık Notları

- **Bundle size durumu:** initial ~172KB gzipped (Phase 4 sonu). Code split + lazy routes hâlâ etkili; Phase 5'te radar/calendar için Recharts aktif kullanılacak — dynamic import şart, yoksa initial chunk yine büyür.
- **TanStack Query olgunlaştı:** Phase 4'te `useMockExam`, `useQuery(['credits','balance'])`, vote optimistic pattern, approval queue invalidation — Phase 5 mutation'ları aynı pattern'da kolayca eklenir.
- **Shared components hazır:** `VoteButtons` (optimistic + rollback), `CreditBadge`, `VerifiedBadge`, `Tabs`, `ScoreGauge`, `PredictionBand`, `ExternalLinkModal`, `AggregatedExamInsights`.
- **i18n envanteri:** `community.*` namespace 109 key, parity TR↔EN 447↔447. Phase 5 `dna.*` / `spacedRepetition.*` için sweeper pattern hazır.

---

## Düşünceler / Keşifler

- Phase 4'te post-exam form + study group external link modal'da native `<input>` + `form.requestSubmit()` pattern Playwright MCP fill_form tool'uyla iyi çalışıyor (controlled component state'leri set Input prototype setter ile senkronize tutuluyor). Phase 5'te daha uzun formlarda react-hook-form değerlendirilebilir.
- ReportedTopicsEditor dynamic list pattern (add/remove/update closure'ları) Phase 5 spaced repetition card listesinde ve confidence radar editöründe reuse olur.
- Approval wall optimistic delete pattern (`setQueryData` → filter out → invalidate on settle) Phase 5 review queue'da direkt kullanılabilir.

---

## UI Borçları (Geçmiş Fazlardan)

- **TanStack Query session page entegrasyonu** — Phase 3'teki `MockExamSessionPage` hâlâ localStorage + useState ile gidiyor (Phase 4 migration'ı sadece result page'i aldı). Phase 5'te dokunulursa migrate edilebilir; şu an regresyon riski taşımıyor.
- **Recharts dynamic import** Phase 2+3+4 boyunca eklenmedi — Phase 5 dashboard ilk Recharts heavy sayfa olacak, lazy zorunlu.
- **ProfessorDetailPage yüklü (440KB gzipped 117KB)** — içinde EvolutionChart + Recharts var. Phase 5'te chart'ları `React.lazy` + `Suspense` wrap + tab-bazlı koşullu render değerlendirilebilir.

---

## Performans Notları

- Phase 4 sonu initial chunk ~172KB gzipped (Phase 3'ten 348KB'den düşüş). Code split + TanStack Query dev yalnızca ~10KB ekledi.
- Playwright visual smoke 8 senaryo, 0 bug.
- Credit balance query 30sn stale; her sayfa değişiminde yeni fetch yok.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 5 breakdown'da frontend işlerinin sırası (muhtemelen 5.14+).
2. Recharts dynamic import patternı Phase 5 başında uygulanmalı.
3. TanStack Query mutation cache invalidation hiyerarşisi genişletilmeli (Phase 5 DNA sub-queries için).

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
| 2026-04-17 | Phase 1 kapanışı — eski içerik arşive donduruldu, Phase 2 için reset. |
| 2026-04-17 | Phase 2 kapanışı — içerik arşive donduruldu, Phase 3 için reset. |
| 2026-04-17 | Phase 3 kapanışı — içerik arşive donduruldu, Phase 4 için reset. |
| 2026-04-17 | Phase 4 kapanışı — içerik arşive donduruldu, Phase 5 için reset. |
