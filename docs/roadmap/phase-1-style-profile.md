# Phase 1 — Hoca-Merkezli Stil Profili 🎯

**Süre:** 1 hafta
**Statü:** 🎯 Aktif — 11/12 task tamam (~%92)
**Hedef:** Ürünün **gerçek vizyonunu** ortaya çıkar — hoca sayfasını "sınav listesi"nden "stil profili"ne çevir.

## İlerleme (Task Bazlı)

Detay: [`../tasks/phase-1-breakdown.md`](../tasks/phase-1-breakdown.md).

- ✅ **1.1** — Prisma schema + migration (`ProfessorStyleProfile`, `AICallLog`, `AIFeedback`) · commit `3aed21b`
- ✅ **1.2** — Aggregation servisi (`professorStyleService.ts`) · commit `846e4fe`
- ✅ **1.3** — Gemini style summary prompt + call + `AICallLog` tracking
- ✅ **1.4** — `GET /api/professors/:id/style-profile` endpoint + client `getStyleProfile()`
- ✅ **1.5** — Cache invalidasyon hook (`examController` → `invalidateStyleProfile`)
- ✅ **1.6** — Vitest + Supertest altyapısı, 7 unit + 4 integration test, CI entegrasyonu
- ✅ **1.7** — `StyleHero` + `MetricsCards` componentleri + `chartColors` helper + skeleton'lar + i18n TR/EN + ProfessorDetailPage preview wire-up
- ✅ **1.8** — `EvolutionChart` (dual-axis line) + `TopicBadges` (frequency-tinted chips) + skeleton'lar + i18n
- ✅ **1.9** — ProfessorDetailPage tam rebuild: slim identity hero + style profile block + collapsible per-exam details + rating pill + full skeleton set
- ✅ **1.10** — Hybrid tone guide + paralel agent sweep (44 TR + 38 EN edit, 3 dead key temizliği), her iki locale 164 key eşleşiyor
- ✅ **1.11** — Playwright MCP ile visual smoke (390/1440 × light/dark × ready/insufficient) → 3 bug yakalandı + düzeltildi (index title, hero badge i18n, legacy collapsible koşulu)
- ⏳ **1.12** — Phase doc "gerçekleşen" bölümü
- ⏳ 1.12 — Phase doc "gerçekleşen" bölümü

---

## Neden Bu Faz

Mevcut UX hâlâ "ders/sınav merkezli". Asıl mesaj **hocanın stili** olmalı. Bu faz olmadan diğer hiçbir şey anlam kazanmaz:

- Phase 2 (study pack) hoca stiline dayanır.
- Phase 3 (mock exam) hocanın soru profilinden üretilir.
- Phase 5 (DNA) hocanın dersi-öğrenci uyum skorunda kullanılır.

Bu faz **aggregate stil profili + cache altyapısı**dır.

---

## Kapsam (DAHİL)

### 1. ProfessorDetailPage Rebuild (UI)

- **Hero bölümü:** "Hocanın Stili" başlığı altında aggregate pie + bar chart (tek görsel, tüm sınavların birleşimi).
- **4 ana metric kartı:** Toplam sınav, Ortalama zorluk, Ortalama soru sayısı, Baskın soru tipi.
- **"Hocanın Tarzı" özeti:** Gemini ile üretilen 3-4 cümlelik insan dili özet.
- **Top 10 konu rozet listesi:** kümülatif olarak en sık çıkan konular.
- **Hoca evrim grafiği:** son 5 yılın soru tipi / zorluk trendi (line chart).
- **Per-exam liste:** collapsible, sayfanın altında opsiyonel detay.
- **Courses:** minor section (şu an hero).

### 2. Backend — Yeni Endpoint ve Servis

- `GET /api/professors/:id/style-profile`
  - Response: `{ aggregated, styleSummary, evolution, topTopics, metrics }`
  - Cache-first: `ProfessorStyleProfile` tablosunda varsa dön.
  - Cache miss → aggregate + Gemini call → kaydet → dön.
- Yeni servis: `server/src/services/professorStyleService.ts`
  - Aggregation logic (questionTypes, topics, difficulty birleştirme)
  - Gemini ile natural language özet üretimi
- Yeni Prisma modeli: `ProfessorStyleProfile` (aşağıda detaylı).

### 3. Cache ve İnvalidasyon

- Her yeni exam analiz edildiğinde hocanın `ProfessorStyleProfile` **stale** olarak işaretlenir (yumuşak invalidasyon — `isStale: true`).
- Stale profile üzerinde `GET` yapıldığında regenerate tetiklenir.
- İlk ziyarette lazy generate (4500 hoca için hepsini öncelemeyiz).

---

## Kapsam DIŞI

- Pratik soru üretimi → Phase 2
- Konu materyali yükleme → Phase 2
- Mock exam → Phase 3
- "Bu hocadan A alanların stratejisi" → Phase 4

---

## Acceptance Criteria

- [ ] Hoca sayfası açıldığında ilk görünen **stil profili** (hero), sınav listesi değil.
- [ ] "Hocanın Tarzı" özeti her hoca için Gemini ile **bir kez** üretilir, cache'lenir.
- [ ] Evrim grafiği son 5 yılı gösterir; <2 yıl veri varsa grafik gizlenir, mesaj gösterilir.
- [ ] Mobile responsive (375px - 1920px test).
- [ ] Empty state (sınav yoksa) anlamlı mesaj gösterir.
- [ ] İlk yüklemede skeleton/loading state var.
- [ ] TR + EN + light + dark çalışır.
- [ ] `GET /api/professors/:id/style-profile` P95 < 2sn (cache hit), < 15sn (cache miss — Gemini dahil).

---

## Teknik Değişiklikler

### Prisma Schema (eklenecek)

```prisma
model ProfessorStyleProfile {
  id              String    @id @default(uuid())
  professorId     String    @unique
  professor       Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)

  aggregatedData  Json      // { questionTypes, topicDistribution, difficulty }
  geminiSummary   String    @db.Text
  topTopics       Json      // [{topic, frequency}]
  evolution       Json      // [{year, questionTypes, difficulty}]
  metrics         Json      // { totalExams, avgDifficulty, avgQuestionCount, dominantType }

  examSourceCount Int
  geminiVersion   String    // e.g. "gemini-2.5-flash-lite-20260315"
  isStale         Boolean   @default(false)

  generatedAt     DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([professorId])
  @@index([isStale])
}
```

### Migration

```bash
cd server
npx prisma migrate dev --name add_professor_style_profile
```

### Invalidation Hook

`server/src/services/analysisService.ts` içinde analiz kaydetme sonrası:

```ts
await prisma.professorStyleProfile.updateMany({
  where: { professorId: exam.professorId },
  data: { isStale: true },
})
```

### Yeni Servis İskeleti

```ts
// server/src/services/professorStyleService.ts
export async function getOrBuildStyleProfile(professorId: string) {
  const cached = await prisma.professorStyleProfile.findUnique({
    where: { professorId },
  })
  if (cached && !cached.isStale) return cached

  const aggregated = await aggregateFromExams(professorId)
  const styleSummary = await buildStyleSummaryWithGemini(aggregated)
  return await upsertProfile(professorId, aggregated, styleSummary)
}
```

### Frontend Değişiklikleri

- `client/src/pages/ProfessorDetailPage.tsx` — tam yeniden yazma.
- Yeni komponent: `client/src/components/StyleHero.tsx` (hero bölümü).
- Yeni komponent: `client/src/components/EvolutionChart.tsx` (Recharts line).
- Yeni komponent: `client/src/components/TopicBadges.tsx`.
- `client/src/services/professorService.ts` — `getStyleProfile(id)` method.
- i18n anahtarları: `professor.style.*`.

---

## Çıktılar

- Yenilenmiş hoca detay sayfası — **"wow" ilk izlenim.**
- Stil profili cache sistemi — gelecek fazlarda (study pack, mock exam) kullanılacak.
- "Hocanın Tarzı" özeti — paylaşılabilir karta dönüşebilir (viral potansiyel).
- Gemini kullanım loglaması ilk versiyon (cost tracking hazırlığı).

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| Gemini özeti hatalı/generic | Orta | Orta | Prompt iteration, "examples" with few-shot |
| 4500 hoca için mass generate → cost patlaması | Düşük (lazy) | Yüksek | Lazy generate sadece ziyaret edilende; sadece gerçek kullanıcı traffic'i |
| Cache invalidasyon bug — stale data gösterme | Düşük | Orta | Integration test; manual `/invalidate-style-profile` admin endpoint |
| Az sınav olan hoca → anlamsız profil | Yüksek | Düşük | `examSourceCount < 3` → "Yeterli veri yok" state |
| Evrim grafiği dar veri aralığında garip | Orta | Düşük | `<2 yıl` → grafik gizlenir |

Genel risk matrisi: [`../operations/risks.md`](../operations/risks.md).

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Hoca sayfası bounce rate | < %30 |
| Avg time on page | > 60 saniye |
| "Hocanın Tarzı" özeti okuma (scroll depth > %50) | %80 |
| Style profile endpoint P95 latency (cache miss) | < 15sn |
| Style profile endpoint P95 latency (cache hit) | < 500ms |

---

## Task Breakdown

Detaylı sprint task'ları: [`../tasks/phase-1-breakdown.md`](../tasks/phase-1-breakdown.md).

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın (v1 master'dan türetildi) |
