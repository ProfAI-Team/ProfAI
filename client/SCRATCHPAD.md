# Scratchpad — Frontend

Frontend'e özel yaşayan çalışma defteri. UI, component, i18n, theme, performans notları.

> Kök / cross-cutting notlar → [`../SCRATCHPAD.md`](../SCRATCHPAD.md)
> Backend notları → [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md)
> Genel frontend rehberi → [`./CLAUDE.md`](./CLAUDE.md)

---

## Kullanım Kuralları

- Sadece **frontend-spesifik** notlar buraya. Backend'i etkileyen karar → kök scratchpad.
- Yeni component / sayfa başlarken: "Şu An Üzerinde Çalışılan"a yaz.
- Design system değişikliği → not al, sonra `client/CLAUDE.md` design system bölümünü güncelle.
- Tasarım kararı netleştiğinde: ilgili `docs/architecture/` veya `client/CLAUDE.md`'ye taşı.

---

## Şu An Üzerinde Çalışılan

- **Phase 1 Task 1.7 tamamlandı (2026-04-16)**: `StyleHero` + `MetricsCards` + skeleton'lar + `chartColors.ts` + i18n `professor.style.*` + ProfessorDetailPage preview wire.
- **Phase 1 Task 1.8 tamamlandı (2026-04-16)**: `EvolutionChart` + `TopicBadges` + skeleton'lar.
- **Phase 1 Task 1.9 tamamlandı (2026-04-16)**: ProfessorDetailPage tam rebuild. Yeni yapı: back-link → slim identity hero (avatar + ad + bölüm + üni + isteğe bağlı rating pill) → style profile block (MetricsCards → StyleHero → TopicBadges → EvolutionChart) → Courses compact → collapsible `<details>` "Sınav bazlı detaylar" → rating form + listesi. Legacy stats grid kaldırıldı (metrics kartları zaten var). Insufficient_data durumunda auth'luya "sınav yükle" CTA. Loading skeleton tüm blokları içeriyor. i18n: `professor.detail.{backToList, coursesTitle, perExamTitle, perExamHint, contributeExam}` + `professors.detail.ratingsCount` (plural) TR + EN.
- Sıradaki: Task 1.10 — i18n copy sweep (eski keyler + yeni keylerin tonu tutarlı mı, boş key var mı).

---

## Phase 1 Hazırlık Notları

- **StyleHero** komponenti: Recharts Pie + Bar yan yana. Grid: `grid-cols-1 md:grid-cols-2`.
- **MetricsCards**: 4 kart, `grid-cols-2 md:grid-cols-4`. Icon + value + label yapısı.
- **EvolutionChart**: Recharts LineChart. Yıl ekseni, soru tipi yüzdesi çoklu çizgi.
- **TopicBadges**: Flex wrap chip listesi. Frequency'ye göre renk tonu (heavy → primary-700, light → primary-300).
- i18n key namespace: `professor.style.*` — planlı, henüz locale dosyasında yok.

---

## Düşünceler / Keşifler

- **TanStack Query eksikliği**: Phase 1'de hâlâ `useEffect + useState`. ProfessorDetailPage'de 2-3 ayrı API call gerekecek → race condition riski. Phase 2 öncesi TanStack Query değerlendir.
- **Theme CSS variables pattern**: Recharts default renkleri override etmek için `CSS variable → chart prop` mapping yapan bir helper gerekecek (`client/src/lib/chartColors.ts`).
- **Framer Motion + Recharts**: Chart render edilirken Framer Motion wrapper kullanma, çakışıyor. Fade-in sadece kart container'ına.

---

## UI Borçları (Phase 1'de Düzeltilecek)

- ProfessorDetailPage şu anki layout sınav merkezli — **tam rebuild** gerekli.
- Loading state yok birçok sayfada — skeleton component pattern eksik.
- Empty state mesajları generic ("Veri yok") — kişiselleştirilmiş copy gerekli.

---

## Performans Notları

- Bundle analiz henüz yapılmadı. Phase 1 sonu: `npm run build -- --mode=analyze` ile görselleştir.
- Recharts ağır (~80KB gzip). Phase 2+'da lazy-load değerlendir.
- BoringAvatars client-side SVG üretiyor — render sayısı yüksekse memoize et.

---

## Blocker

- Yok.

---

## Bir Sonraki Session İçin (Frontend)

1. Phase 1 Task 1.7 öncesi: `chartColors.ts` helper yaz.
2. StyleHero skeleton component.
3. i18n key'leri TR + EN için drafte al — copywriting iteration başlat.

---

## Versiyon Geçmişi

| Tarih | Değişiklik |
|-------|------------|
| 2026-04-16 | Kuruldu. |
