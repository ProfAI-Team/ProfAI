# Phase 1 — Task Breakdown

**Faz:** [Hoca-Merkezli Stil Profili](../roadmap/phase-1-style-profile.md)
**Toplam tahmini süre:** 1 hafta (5 iş günü)
**Hedef PR sayısı:** 6-8 ayrı PR (küçük, review'u kolay)

---

## Öncelik Sırası (Sprint Order)

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 1.1 | Prisma schema + migration (ProfessorStyleProfile + AICallLog + AIFeedback) | 2 saat | — | ✅ Tamam | `3aed21b` |
| 1.2 | Style aggregation servisi (Gemini hariç, saf TS) | 4 saat | 1.1 | ✅ Tamam | `846e4fe` |
| 1.3 | Gemini style summary prompt + provider call | 4 saat | 1.2 | ✅ Tamam | `ba0ccd9` |
| 1.4 | `GET /api/professors/:id/style-profile` endpoint | 2 saat | 1.2, 1.3 | ✅ Tamam | bu commit |
| 1.5 | Cache invalidasyon hook (analysisService → isStale) | 1 saat | 1.1 | ⏳ Sıradaki | — |
| 1.6 | Backend unit + integration testler | 3 saat | 1.1-1.5 | Planlı | — |
| 1.7 | Frontend: StyleHero + metrics kartları | 4 saat | 1.4 | Planlı | — |
| 1.8 | Frontend: EvolutionChart + TopicBadges | 3 saat | 1.7 | Planlı | — |
| 1.9 | ProfessorDetailPage tam rebuild + empty/loading state | 4 saat | 1.7, 1.8 | Planlı | — |
| 1.10 | i18n TR + EN key'leri + copy iteration | 2 saat | 1.9 | Planlı | — |
| 1.11 | Mobile responsive test + light/dark test | 2 saat | 1.9 | Planlı | — |
| 1.12 | Dokümantasyon update (phase-1-style-profile "gerçekleşen") | 1 saat | Hepsi | Planlı | — |

**Toplam:** ~32 saat çalışma süresi (5 tam iş günü). **İlerleme:** 4/12 task tamam (~12 saat).

---

## Detaylı Task'lar

### 1.1 — Prisma Schema + Migration ✅ `3aed21b`

**Dosyalar:**
- `server/prisma/schema.prisma` (üç yeni model ekle)

**İş:**
- `ProfessorStyleProfile`, `AICallLog`, `AIFeedback` modelleri.
- `Professor` modeline `styleProfile ProfessorStyleProfile?` back-relation.
- Migration çalıştır: `npx prisma migrate dev --name phase_1_style_profile`.

**Test:**
- `npx prisma migrate status` clean.
- Seed çalıştır, yeni tablolar boş olmalı.

**PR:** "Add Phase 1 Prisma schema — style profile + AI call logs"

---

### 1.2 — Style Aggregation Servisi ✅ `846e4fe`

**Yeni dosya:**
- `server/src/services/professorStyleService.ts`

**İş:**
- `aggregateFromExams(professorId): AggregatedData`
  - Tüm `ExamAnalysis`'leri topla.
  - questionTypes birleştir (weighted avg).
  - topicDistribution birleştir, top 10 çıkar.
  - difficulty ortalaması.
  - year bazlı evolution.
- `getOrBuildStyleProfile(professorId)` — cache miss → aggregate + Gemini.
- Upsert logic.

**Test:**
- Unit test: 5 sample `ExamAnalysis` → doğru aggregation.
- Edge case: 0 exam → null döner.
- Edge case: 1 exam → evolution boş array.

**PR:** "Add professor style aggregation service"

---

### 1.3 — Gemini Style Summary ✅

**Yeni dosya:**
- `server/src/prompts/style-summary.ts`

**Değişen dosya:**
- `server/src/services/llm/geminiProvider.ts` (cost tracking + AICallLog insertion ekle)

**İş:**
- Prompt template yaz (3-4 cümle özet, samimi + akademik ton).
- `generateStyleSummary(aggregated): Promise<string>`
- `AICallLog` kaydı otomatik.
- Retry logic (Gemini 503 → 2 kere dene).

**Test:**
- Unit test: Mock Gemini response → doğru string döner.
- Integration test: Real Gemini call (CI optional, gated).

**PR:** "Add style summary Gemini prompt + cost logging"

---

### 1.4 — Style Profile Endpoint ✅

**Değişen dosyalar:**
- `server/src/routes/professorRoutes.ts` — yeni route.
- `server/src/controllers/professorController.ts` — yeni handler.

**İş:**
- `GET /api/professors/:id/style-profile`
- Response:
  ```ts
  {
    professor: { id, name, department, university },
    aggregated: { questionTypes, topicDistribution, difficulty },
    styleSummary: string,
    topTopics: [{topic, frequency}],
    evolution: [{year, ...}],
    metrics: { totalExams, avgDifficulty, ... },
    generatedAt: ISO8601
  }
  ```
- Empty state: `examSourceCount < 3` → `{ status: "insufficient_data", message, count }`

**Test:**
- Integration: cache miss → cache hit.
- 404 nonexistent professor.

**PR:** "Add GET /api/professors/:id/style-profile endpoint"

---

### 1.5 — Cache Invalidasyon Hook

**Değişen dosya:**
- `server/src/services/analysisService.ts`

**İş:**
- Exam analiz kaydedildikten sonra hocanın `ProfessorStyleProfile.isStale = true`.

**Test:**
- Integration: yeni exam upload → hocanın style profile isStale.

**PR:** "Invalidate style profile cache on new exam analysis"

---

### 1.6 — Backend Test Altyapısı

**Yeni dosyalar:**
- `server/vitest.config.ts`
- `server/test/setup.ts`
- `server/src/services/llm/__mocks__/geminiProvider.ts`
- Test dosyaları: `*.test.ts`

**İş:**
- Vitest kurulum.
- Test DB config (in-memory veya ayrı postgres schema).
- Gemini mock.
- CI'ye `npm test` ekle.

**PR:** "Bootstrap backend test infrastructure (Vitest + Supertest)"

---

### 1.7 — Frontend StyleHero + Metrics

**Yeni dosyalar:**
- `client/src/components/StyleHero.tsx`
- `client/src/components/MetricsCards.tsx`

**İş:**
- Hero layout (aggregate pie + bar yan yana).
- "Hocanın Tarzı" özet kartı (Gemini çıktısı).
- 4 metric kart (Toplam sınav, Avg zorluk, Avg soru sayısı, Baskın tip).
- Framer Motion fade-in.

**Test:**
- Storybook / manual render: empty state, with data, loading.

**PR:** "Add StyleHero + MetricsCards components for professor detail"

---

### 1.8 — EvolutionChart + TopicBadges

**Yeni dosyalar:**
- `client/src/components/EvolutionChart.tsx` (Recharts LineChart)
- `client/src/components/TopicBadges.tsx` (top 10 chip list)

**İş:**
- Son 5 yılın soru tipi + zorluk trend'i.
- `<2 yıl data → component null render.
- Topic badges frequency'ye göre sıralı.

**PR:** "Add evolution chart + topic badges components"

---

### 1.9 — ProfessorDetailPage Rebuild

**Değişen dosya:**
- `client/src/pages/ProfessorDetailPage.tsx`

**İş:**
- Yeni layout: Hero + StyleHero + MetricsCards + EvolutionChart + TopicBadges.
- Per-exam liste collapsible (default kapalı).
- Courses minor section.
- Ratings mevcut pozisyonda.
- Loading skeleton.
- Empty state ("yeterli veri yok").

**PR:** "Rebuild ProfessorDetailPage with style-first layout"

---

### 1.10 — i18n Copy

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni key'ler: `professor.style.*`
- Copy iteration — samimi + akademik ton.
- EN TR senkron.

**PR:** "Add Phase 1 i18n copy (style profile)"

---

### 1.11 — Responsive + Theme Test

**İş:**
- Chrome DevTools: 375×667, 768×1024, 1440×900, 1920×1080.
- Light + dark toggle her breakpoint'te test.
- TR + EN toggle her durumda test.
- Bug varsa fix PR.

**PR:** "Fix responsive + theme bugs in professor detail"

---

### 1.12 — Doc Update

**Değişen dosya:**
- `docs/roadmap/phase-1-style-profile.md` — "Gerçekleşen" bölümü ekle.
- Versiyon geçmişine kayıt.

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark).
- [ ] PR açıldı, review aldı (self-review minimum).
- [ ] Merged to `main`.
- [ ] Acceptance criteria ✅.

---

## Riskler (Uygulama Sırasında)

- **Gemini prompt iteration** gerekecek — kalite düşükse 1-2 iterasyon sür.
- **Cache lazy-generate logic** edge case: concurrent request aynı hoca → 2 Gemini call. Lock/mutex.
- **4500 hoca için bulk re-generate** gerekir mi? → Hayır, lazy.

---

## İlgili

- Faz detay: [`../roadmap/phase-1-style-profile.md`](../roadmap/phase-1-style-profile.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- Acceptance criteria: [`../roadmap/phase-1-style-profile.md#acceptance-criteria`](../roadmap/phase-1-style-profile.md#acceptance-criteria)
- Açık sorular: [`open-questions.md`](./open-questions.md)
