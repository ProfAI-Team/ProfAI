# Phase 1 — Hoca-Merkezli Stil Profili ✅

**Süre:** 1 hafta (tahmin) → 1 gün (2026-04-16 tek oturum, tahmin abartılıydı)
**Statü:** ✅ Tamamlandı (2026-04-17)
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
- ✅ **1.12** — Phase kapanış + archive + scratchpad reset
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

- [x] Hoca sayfası açıldığında ilk görünen **stil profili** (hero), sınav listesi değil.
- [x] "Hocanın Tarzı" özeti her hoca için Gemini ile **bir kez** üretilir, cache'lenir (`ProfessorStyleProfile` + `isStale` invalidasyon).
- [x] Evrim grafiği son 5 yılı gösterir; <2 yıl veri varsa grafik gizlenir (`EvolutionChart` null render).
- [x] Mobile responsive — Playwright MCP ile 390 + 1440'ta doğrulandı.
- [x] Empty state — `insufficient_data` yolu samimi ton + "sınav ekle" CTA ile.
- [x] İlk yüklemede skeleton/loading state var (MetricsCardsSkeleton + StyleHeroSkeleton + TopicBadgesSkeleton + EvolutionChartSkeleton).
- [x] TR + EN + light + dark çalışır — visual smoke'da her kombinasyon test edildi.
- [x] `GET /api/professors/:id/style-profile` P95 cache hit 2-5ms (hedef <500ms, 100× marj), cache miss 1.44s (hedef <15s, 10× marj).

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

## Gerçekleşen Sonuçlar (2026-04-17)

### Shipped

**Backend (7 commit):**
- Schema: `ProfessorStyleProfile` (aggregated data + Gemini summary cache, `isStale` + `regenerationStartedAt` advisory lock), `AICallLog` (cost + token telemetry, `freeTier` flag), `AIFeedback` (user rating ready).
- Migrations: `phase_1_style_profile`, `add_ai_call_free_tier_flag`.
- `professorStyleService`: `computeAggregation` (pure, questionCount-weighted), `aggregateFromExams`, `getOrBuildStyleProfile` (cache-first + 5min lock), `invalidateStyleProfile`.
- `llm/geminiProvider.generateStyleSummary` + `aiCallTracker.recordAICall` — every call logged with projected-paid cost (AI Studio free tier runtime).
- Prompt library: `prompts/style-summary.ts` (v1). 3-4 sentence Türkçe output, no professor name, ends with study tip.
- Endpoint: `GET /api/professors/:id/style-profile` — union response (`ready` / `insufficient_data` / 404).
- Invalidation hook in `examController.uploadExam` after every `examAnalysis.create`.

**Frontend (5 commit):**
- `StyleHero` + `MetricsCards` + `EvolutionChart` + `TopicBadges` with skeletons.
- `chartColors` shared palette (CSS-variable-vs-Recharts interop fix).
- `ProfessorDetailPage` full rebuild — slim identity hero, style profile block, collapsible per-exam fallback (insufficient only), rating pill, cross-breakpoint skeleton.
- Client service `getStyleProfile()` with full TS types (`StyleProfileResponse` union).

**Tests + tooling (2 commit):**
- Vitest + Supertest infrastructure. 7 unit (aggregation) + 4 integration (endpoint) tests. CI runs `npm test`; integration self-skips when `DATABASE_URL` missing.
- `test-style-service.ts` + `test-invalidation-hook.ts` — dev smoke scripts.
- Playwright MCP project-scoped, nvm-aware bash wrapper so non-login subshells still find npx.

**Copy / i18n (1 commit, parallel-agent sweep):**
- `docs/operations/copy-tone-guide.md` — hybrid samimi+akademik+ciddi tone reference for all future copy (incl. Gemini prompts).
- 44 TR + 38 EN string revisions, 3 dead keys removed. `siz → sen`, `profesör → hoca` selective, passive → active, marketing clichés stripped. 164 parallel keys.

### Metrics (end of phase)

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Style profile endpoint P95 cache hit | < 500ms | **2-5ms** (100× marj) |
| Style profile endpoint P95 cache miss | < 15s | **1.44s** (10× marj) |
| Gemini style summary latency | N/A | 1.5-3.9s (cold vs warm) |
| Gemini cost / style summary call | free tier | **$0** actual / **$0.000081** projected |
| Unit test pass | > 60% coverage | 7/7 pass (aggregation) |
| Integration test pass | — | 4/4 pass |
| i18n key parity TR↔EN | 100% | **164↔164** |
| Acceptance criteria met | 8/8 | **8/8** ✓ |

### Kullanıcı dönüşümü metrikleri

Canlı traffic yok — Phase 1 sonunda ölçüm placeholder:

| Metrik | Hedef | Durum |
|--------|-------|-------|
| Bounce rate | < %30 | Canlı traffic bekleniyor |
| Avg time on page | > 60s | Canlı traffic bekleniyor |
| Summary scroll depth | %80 | Canlı traffic bekleniyor |

Phase 2'ye geçmeden önce Plausible veya eşdeğer analytics kurulmalı.

---

## Öğrenilenler (Retro)

### İyi Giden

- **Test-first mindset ödedi.** Pure `computeAggregation` ayırmak → Vitest için mocking yok, 7 test 400ms'de geçti. Refactor hızlandırıcı oldu.
- **`freeTier` flag erken eklendi.** Kullanıcı "ücretsiz kullanalım ama rapor kalsın" dedi → bir saatlik schema revizyonu ile paid projeksiyon + real spend ayrımı kuruldu. Phase 7'de (B2B) aynı tablo iş yapacak.
- **Paralel agent sweep i18n tone için işe yaradı.** TR + EN için ayrı agent → 2 paralel koşu, 82 edit önerisi, konsolidasyon kolay. Rehber önce yazılması agent'ların tutarlı çıktı vermesini sağladı.
- **Playwright MCP visual smoke 3 bug yakaladı** kod gözle kaçan (title, hardcoded string, yanlış count). Manuel tarayıcı test'e göre net upgrade.
- **Fallback yolu (Gemini fail → placeholder + `isStale=true`)** UI'nin hiçbir zaman hata göstermemesini sağladı. Kullanıcıya güven veriyor.

### Zor / Sorunlu

- **Docker server container src mount yok** → Prisma migrate için `docker compose cp` workaround. Phase 2'de `server/`'a bind-mount eklenmeli (server/SCRATCHPAD.md'de borç).
- **Ephemeral Node container ile Playwright** çalışmadı (alpine musl + debian openssl1.1 her ikisi de libssl problem). `node:20` full image + nvm ile çözüldü. Gelecekte resmi Playwright image kullanalım.
- **Claude Code Bash tool non-login subshell** — `.zshrc`/`.profile` source'lamıyor. MCP binary için `bash -c 'source nvm.sh; exec …'` wrapper gerekti (root CLAUDE.md'ye documented).
- **i18n key'leri bazı yerlerde hardcoded kalmış** (`index.html` title, hero badge). Task 1.10'da "grep edip bul" yerine tüm component'lerde `t()` çağrısı olup olmadığını tarayan bir lint kuralı eklemeli — Phase 2'ye aday.
- **Legacy `/api/professors/:id/analysis` endpoint** stil profili ile çakışıyor ama geriye uyumluluk için silinmedi. Phase 2 sonunda kaldırma gereksinimi yeniden değerlendirilmeli.

### Scope'a Eklenen / Çıkarılan

**Eklenen (scope creep):**
- `AICallLog` + `AIFeedback` telemetri (scope'ta stub olarak, tam schema geldi) — kalıcı değer, doğru karar.
- `copy-tone-guide.md` — faz sonu kararıyla eklendi, Phase 2+ için yüksek ROI.
- Playwright MCP kurulumu — Task 1.11'den doğdu, gelecek faz'lar için altyapı.

**Çıkarılan:**
- `AnalysisCard` legacy list → sadece fallback (insufficient_data) — aggregated data'yı "per-exam" diye göstermek yanıltıcıydı, doğru karar.

### Süre / Tahmin

Tahmini: 32 saat (1 hafta). Gerçekleşen: yaklaşık **1 tam gün** tek oturum. Tahminler kasten yüksek tutulmuştu (öğrenciler için realistic) — aynı hız devam ederse Phase 2-7 tahmini de muhtemelen 2-3× düşürülebilir.

### Phase 2'ye Geçerken Hazır Olanlar

- Stil profili cache altyapısı — Phase 2 study pack'ı input olarak kullanacak
- `AICallLog` schema — Phase 2 study pack cost tracking aynı tabloya yazacak
- Copy tone guide — Phase 2 UI + Gemini prompt'ları aynı tonu korur
- Test altyapısı — Phase 2 için yeni Vitest cases eklemek düşük sürtünme
- Playwright MCP — Phase 2 UI'ı geliştirirken smoke test akışı aktif

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın (v1 master'dan türetildi) |
| 1.1 | 2026-04-17 | Faz tamamlandı — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri |
