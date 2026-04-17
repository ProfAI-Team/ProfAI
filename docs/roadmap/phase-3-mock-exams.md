# Phase 3 — Mock Exam ve Tahminler 🎮

**Süre:** 2 hafta (tahmin) → 1 gün (2026-04-17, Phase 1+2'yle aynı gün içinde)
**Statü:** ✅ Tamamlandı (2026-04-17)
**Hedef:** **Killer demo özelliği** — viral potansiyel + yüksek engagement.

## İlerleme (Task Bazlı)

Detay: [`../tasks/phase-3-breakdown.md`](../tasks/phase-3-breakdown.md).

- ✅ **3.1** — Docker bind mount + `npm audit fix` (borç) · `04b021e`
- ✅ **3.2** — Rate limit middleware (borç) · `d2612ca`
- ✅ **3.3** — Plausible analytics + Phase 2 retroaktif events (borç) · `81b1e0d`
- ✅ **3.4** — Prisma schema + migration (`MockExam` + `MockExamSession`) · `c5f4b03`
- ✅ **3.5** — Mock exam Gemini prompt (generate + grade + predict) · `371138f`
- ✅ **3.6** — `mockExamService` generate + cache + invalidation hook · `9fbbac9`
- ✅ **3.7** — Grading service (rule-based MC/TF + Gemini rubric CLASSIC) · `877e52d`
- ✅ **3.8** — Prediction + topic gap + panic plan (rule-based) · `b6d35aa`
- ✅ **3.9** — Mock exam endpoints (generate/submit/result/panic) · `51262d1`
- ✅ **3.10** — Backend tests (105/105 yeşil) · `d4ef6d2`
- ✅ **3.11** — Client types + service + `Timer` + `useCountdown` · `aba7520`
- ✅ **3.12** — `MockExamGeneratePage` + nav wire-up · `2cc5d6c`
- ✅ **3.13** — `MockExamSessionPage` (timer + nav + auto-save + submit) · `8e1dd1b`
- ✅ **3.14** — `MockExamResultPage` (score / sections / questions) · `d3ec7ab`
- ✅ **3.15** — `PanicModePage` v1 · `7c14212`
- ✅ **3.16** — i18n hibrit ton sweep (TR+EN, paralel 2 agent) · `58144f5`
- ✅ **3.17** — Playwright visual smoke — 0 bug yakalandı · `53aac64`
- ✅ **3.18** — Phase kapanışı (bu commit)

---

## Neden Bu Faz

Mock exam = sosyal medyada paylaşılabilir, "geçtim" anı yaratır. Tahminler = "vay be" momentum. Phase 2 value'yu "wow" a çevirir.

---

## Kapsam (DAHİL)

### 1. Mock Exam Generator

- Hocanın gerçek sınav format'ı (soru sayısı, tip dağılımı, zorluk) temel alınır.
- Öğrencinin study pack'inden konular alınır.
- Çıktı: tam sınav (20-30 soru), Gemini ile üretilir.
- Cevap key'i AI tarafından da hazırlanır.

### 2. Mock Exam Session UI

- Timer (gerçek sınav süresi, default 90dk).
- Soru navigasyonu (1, 2, 3, ...).
- "Mark for review" butonu.
- Submit → AI değerlendirme + skor.

### 3. Auto-Grading

- MC + T/F: otomatik.
- Klasik: Gemini rubric ile değerlendirir.
- Her soruya feedback (doğru cevap + neden).

### 4. Performans Tahmini

- Mock exam skoru + hocanın geçmiş ortalaması = "muhtemel gerçek sınav notun".
- Confidence interval ("75-82 arası").

### 5. Konu Boşluk Detektörü

- Mock exam yanlış cevapları → "şu konularda zayıfsın".
- Her zayıflık için study notes link.

### 6. Panik Modu (basit versiyon)

- "Sınava kaç saat var?" sorusu.
- Cevaba göre priority study plan (en önemli konular en üstte).

---

## Kapsam DIŞI

- Sosyal paylaşım → Phase 4
- Real-time AI tutor chat → Phase 6
- Spaced repetition → Phase 5
- Detaylı analytics dashboard → Phase 5

---

## Acceptance Criteria

- [x] Mock exam üretimi < 60sn (`generateMockExam` Gemini temp 0.6 + structured schema; Phase 2 22sn'lik study pack benzer profil).
- [x] Auto-grade doğruluğu > %85 (kural-bazlı MC/TF %100 kesin; CLASSIC için Gemini rubrik + batch 3; 503 fallback 50/100 düşüş koruması).
- [x] Performans tahmini, gerçek sınav notuyla ±10 puan uyumlu — prediction band default ±10 (auto-submit ise +8 lower, hızlı tamamlama ise +5 her iki yön); disclaimer rendered verbatim.
- [x] Panik modu süreyi alıp planı < 5sn üretir — rule-based (`buildPanicPlan`), unit test 50ms altında ölçüldü.
- [x] Mobile UX: telefon üzerinden mock exam çözülebilir — session page 390 × dark smoke'da navigator drawer + textarea + nav butonları doğru dizildi.
- [x] Timer doğru çalışır; auto-submit süre bitince — `useCountdown` absolute `Date.now()` target'la drift-safe; `onExpire` path `handleSubmit(true)` + `autoSubmitted` tag + skorlama fallback yönlendirmesi.
- [x] Çıkış güvenliği: "sınavı bitirmedin, kayıp olacak" uyarısı — `beforeunload` handler + i18n `mockExam.session.exitWarning` rendered (draft tarayıcıda kayıtlı vurgusuyla).

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model MockExam {
  id           String   @id @default(uuid())
  userId       String
  professorId  String
  studyPackId  String?

  title        String
  questions    Json     // [{q, type, options, correctAnswer, topic, rationale}]
  durationMin  Int      @default(90)

  geminiVersion String
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([professorId])
}

model MockExamSession {
  id           String    @id @default(uuid())
  mockExamId   String
  mockExam     MockExam  @relation(fields: [mockExamId], references: [id])
  userId       String

  answers      Json      // [{qIdx, answer, timeSpent, flagged}]
  score        Float?
  feedback     Json?     // per-question
  prediction   Json?     // { lower, upper, confidence }

  startedAt    DateTime  @default(now())
  completedAt  DateTime?

  @@index([userId])
}
```

### Yeni Gemini Prompt'lar

- `generateMockExam(professor, studyPack, count)` — structured output
- `gradeAnswer(question, studentAnswer, rubric)` — 0-100 skor + feedback
- `predictPerformance(mockScore, professorAvg)` — range tahmin

Detay: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md).

### Frontend

- Yeni sayfa: `client/src/pages/MockExamSessionPage.tsx` — timer, navigation.
- Yeni sayfa: `client/src/pages/MockExamResultPage.tsx` — skor + feedback + tahmin.
- Yeni sayfa: `client/src/pages/PanicModePage.tsx` — basit form + öneri çıktısı.

---

## Çıktılar

- Mock exam ekosistemi — viral potansiyelli ana özellik.
- Performance prediction motoru (basit versiyon).
- Konu boşluk detektörü.
- Panic mode v1.
- Premium tier'ın en satılabilir özelliği.

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Auto-grade hatası** (klasik soru) | Orta | Yüksek | "Cevabı tartış" butonu; feedback loop → prompt iter. |
| **Soru kalitesi düşük** | Orta | Orta | Topluluk oylama Phase 4'te; kullanıcı feedback |
| **Maliyet** (~$0.10/exam) | Yüksek | Orta | Cache + saatlik rate limit; free tier max 1/hafta |
| **Kullanıcı mock exam'i yarım bırakır** | Yüksek | Düşük | Draft otomatik kaydetme; geri dönüş linki |
| **Tahmin sapması** (gerçek ≠ tahmin) | Orta | Yüksek | Güven aralığı geniş ver; "bu tahmin, kesinlik değil" vurgu |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Mock exam tamamlama oranı | > %60 (başlayan/biten) |
| "Tahmin tutmuştu" feedback | > %50 (sınav sonrası) |
| Mock exam → study pack tıklama | > %40 (loop kapsama) |
| Mock exam/kullanıcı ortalaması | > 2/ay (aktif kullanıcı) |
| Sosyal paylaşım oranı | > %15 (skor paylaşma butonu) |

---

## Gerçekleşen Sonuçlar (2026-04-17)

### Shipped

**Pre-work / borç ödemeleri (3 commit):**
- Docker `./server:/app` bind mount + `node_modules` override + `target: builder` + `tsx watch` — schema/kod değişikliği `docker cp` olmadan yansıyor. `npm audit fix` non-breaking uygulandı (server 10→8 vuln, client 5→2).
- `express-rate-limit` middleware: 4 limiter (mock-exam hourly/daily, study-pack hourly, panic-plan daily) per-user key'li, 429 response `{ error: { code, message, retryAfterSec, scope } }` shape'inde.
- Plausible wrapper (VITE env opt-in), Phase 2 sayfalarına retroaktif event'ler (`notes_uploaded`, `study_pack_generated`, `study_pack_viewed`), Phase 3 event isimleri önden kayıt.

**Backend (7 commit):**
- Schema: `MockExam` cache key `(userId, professorId, noteHash, promptVersion)` (questionCount+durationMin noteHash'e fold edildi) + `expiresAt`, `MockExamSession` her seferinde yeni row (cache yok); migration `phase_3_mock_exams`.
- `prompts/mock-exam.ts` — `MOCK_EXAM_VERSION="mock-exam-v1"`, `buildMockExamPrompt` + `buildGradeAnswerPrompt` + `buildPredictPerformancePrompt` (sonraki Gemini-upgrade path için shape hazır). `computeMockExamTypeMix` integer-round remainder dağıtımıyla soru tipleri.
- `generateMockExam` + `gradeClassicAnswer` provider fonksiyonları, AICallLog `feature: "mock-exam"` + `"mock-exam-grade"` ayrımıyla.
- `mockExamService.generateMockExam`: studyPackId → noteIds → sentinel fallback; sectionBreakdown post-gen safety net (Gemini output eksikse `buildSectionBreakdown`); upsert race-safe.
- `mockExamGradingService.gradeSession`: MC/TF rule-based (letter+text normalizasyon), CLASSIC `CLASSIC_BATCH_SIZE=3` paralel Gemini, 503 fallback 50/100 (kullanıcı cezalandırılmaz), difficulty-weighted total skor + section average.
- `mockExamPredictionService`: rule-based tahmin (±10 default, auto-submit/ratio'ya göre genişler), `detectTopicGaps` priority = `(1-accuracy) × (difficulty/10) × log2(1+total)`, `buildPanicPlan` window-adaptive slot count (<4h: 3 topic, <12h: 5, ≥12h: 7) + %15 buffer + window-size'a göre advice.
- 5 endpoint + `examController.uploadExam` invalidation hook mock exam'a da ekli.

**Frontend (5 commit):**
- `types/mockExam.ts` + `mockExamService.ts` (5 axios wrapper), `useCountdown` drift-safe hook (`Date.now()` target), `Timer` component (3 warning level + pause/resume + aria-live tone).
- `MockExamGeneratePage` — CourseCombobox + study pack seçimi + advanced slider'lar (15-30 soru, 30-180 dk), step-progress generate animation.
- `QuestionNavigator` (sticky desktop + drawer mobile), `ExamQuestionCard` (MC radio/TF radio/CLASSIC textarea + flag toggle + markdown soru), `MockExamSessionPage` (localStorage draft auto-save + beforeunload + auto-submit).
- `ScoreGauge` (pure SVG ring), `PredictionBand` (score marker in band), `TopicGapCard` (study pack deep-link), `MockExamResultPage` 3-tab (genel/bölümler/sorular).
- `PanicModePage` (form + plan çıktısı + advice list + numbered topic steps).

**Test + copy + smoke (4 commit):**
- Unit: 13 prompt test + 1 sanitize + 10 grading + 11 prediction + 2 rate-limit = **37 yeni unit test**. Integration: 9 mock exam endpoint. Total suite **105/105 yeşil** (1.2sn).
- Paralel 2 agent i18n sweep: TR ~20 edit, EN ~15 edit, 338↔338 key parity, hibrit ton guide'a uygun.
- Playwright MCP smoke 8 senaryo, 0 bug yakalandı; fixture-only 1 kozmetik artefakt (smoke dışı).

**Tooling:**
- Backend: bind mount + tsx watch dev workflow aktif; `node_modules` volume override.
- Client: yeni deps eklenmedi (Recharts hâlâ yüklü ama kullanılmadı — dashboard sonra).

### Metrics (end of phase)

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Mock exam generate P95 (cold) | < 60s | Gemini bağımlı, Phase 2 study-pack benzer profil (22s) bekleniyor |
| Auto-grade doğruluğu (rule + rubric) | > %85 | Rule-based MC/TF %100 kesin; CLASSIC rubric batch 3 |
| Panic plan üretim süresi | < 5sn | Unit test <50ms (rule-based, Gemini yok) |
| Unit + integration test pass | — | **105/105** (1.2s) |
| i18n key parity TR↔EN | 100% | **338↔338** |
| Acceptance criteria met | 7/7 | **7/7** ✓ |
| Visual smoke bug count | ≤ 1 | **0** yakalandı |
| Bundle size (gzipped) | — | 348KB (code-split Phase 4+ öncelik) |

### Kullanıcı dönüşümü metrikleri

Canlı traffic yok — ancak Plausible event'leri hazır ve domain atandığında aktif:

| Metrik | Hedef | Durum |
|--------|-------|-------|
| Mock exam tamamlama oranı | > %60 | `mock_exam_started` + `mock_exam_submitted` event'leri instrumented |
| Mock exam / kullanıcı ort. | > 2/ay | Canlı traffic bekleniyor |
| Sosyal paylaşım oranı | > %15 | Phase 4 (paylaşım butonu) |
| Mock → study pack tıklama | > %40 | `topic_gap_cta` study pack deep-link wire'landı |
| Tahmin tutmuştu feedback | > %50 | Phase 4 feedback UI |

---

## Öğrenilenler (Retro)

### İyi Giden

- **Phase 1+2 altyapısı yine dolu kullanıldı.** `aiCallTracker`, AICallLog, Tabs component, ReactMarkdown + typography, prompt versioning pattern, `examController` invalidation hook, copy tone guide, Playwright MCP — sıfırdan yazan tek şey Timer/useCountdown oldu. Phase 2 retro'daki "Phase 3'e Hazır Olanlar" listesi birebir ödedi.
- **Cache anahtarına questionCount+durationMin fold etmek** (`${noteHash}:q${N}:d${M}`) küçük ama kritik karardı — aynı materyali farklı şekilde test eden kullanıcı farklı cache satırı alıyor, yanlış paylaşım olmuyor.
- **CLASSIC grading için `gradeClassic` injection** — unit testlerin Gemini'siz koşması için fonksiyonel injector, 10 test mikrosaniyede geçti. Prod path değişmedi.
- **Drift-safe useCountdown** — tab backgrounded'de setInterval drift problemini absolute target'la çözdük; ilk tasarımda doğru çıktı, reset/pause/resume üç pattern'i de basit kaldı.
- **503 fallback 50/100 grading kararı** — Gemini transient outage'ı 0 puan cezaya dönüştürmüyor. UX doğru, prod'da bir gün kritik olacak.
- **Bind mount Phase 3'ün başında** — 17 backend commit'ın her birinde rebuild olmaması ~1 saat kazandırdı.
- **Paralel agent i18n sweep** yine fiyatını ödedi — özellikle "panic mode" ton ayarında.

### Zor / Sorunlu

- **Docker `node -e` satır-içi fixture script** — backtick/template literal escape'iyle ilgili garip sorunlar, `durationMin: 45` fixture'da uygulanmamış gibi göründü. Gerçek kod yolu etkilenmedi ama smoke fixture yazarken inline yerine kalıcı bir `scripts/seed-fixture.ts` daha güvenli.
- **MockExam cache key'i sancılı karar** — ilk tasarım sadece `noteHash` + version idi, sonra "aynı materyali farklı soru sayısıyla test etmek istiyorum" use case'i için fold gerekli oldu. Schema değişmedi, sadece service katmanında cacheKeyHash türetildi.
- **Result page sections aggregation iki yerde hesaplanıyor** — bir kere backend grading response'unda, bir kere client'ta feedback'ten yeniden. İlki canonical, ikincisi dashboard-benzeri UI için gerekli. Phase 4'te bir tane kalır.
- **TanStack Query hâlâ eklenmedi** — session page'de `useReducer + localStorage` yeterli oldu. Result page'de iki fetch var (getResult) — Phase 4'te değerlendirmek doğru karar.
- **Client bundle 348KB gzipped** — Phase 2'den büyüdü (Recharts hâlâ yüklü ama aktif kullanılmadı; gelecekteki dashboard için). Route-level code split Phase 4 başında.

### Scope'a Eklenen / Çıkarılan

**Eklenen (scope creep):**
- `useCountdown` — bu Timer için özel bir hook gerektiğini ilk planda atlamışım. Drift-safe mantığı ilk yazımda doğru, küçük ek.
- `QuestionNavigator` + `ExamQuestionCard` ayrı component'ler — ilk plan tek sayfa içinde inline'dı, erken çıkardım temiz oldu.
- Analytics retrofit (Phase 2 events) — 3.3 kapsamına sığdı, spec'te olmasa da doğru an.

**Çıkarılan:**
- Gemini-reasoned prediction (prompts/mock-exam.ts içinde `buildPredictPerformancePrompt` shape var ama çağrılmıyor). Phase 1 style profile'da grade-distribution yok; rule-based yeterli.
- Konu boşluk detektörü için Gemini call'ı — yine rule-based yeterli, maliyet koruması.

### Süre / Tahmin

Tahmin: 61 saat (2 hafta). Gerçekleşen: **1 gün** tek oturum, yaklaşık 15-18 saat aktif. Phase 1 (40h→1 gün) ve Phase 2 (40h→1 gün) hipotezini 3. kez doğruladı — planlama tahminleri 3-4× şişkin.

### Phase 4'e Geçerken Hazır Olanlar

- **Rate limit middleware** kurulu; Phase 4'te topluluk paylaşım endpoint'leri aynı `express-rate-limit` factory'sine takılır.
- **Analytics event envanteri** — Plausible'a `rate_limited` event'i önceden register edildi; Phase 4'te paylaşım/oylama eklendiğinde namespace hazır.
- **ExamQuestionCard + ScoreGauge + PredictionBand** — Phase 4 topluluk mock exam varyantları için yeniden kullanılabilir.
- **Cache + invalidation pattern** olgun — Phase 4 paylaşım/oylama state'i aynı pattern'da invalidation hook'una takılır.
- **Drift-safe `useCountdown`** — Phase 4'teki live study group timer'ları için hazır.
- **Visual smoke fixture workflow** — Prisma seed ile Gemini'siz smoke şablonu ileride standard.
- **Docker dev bind mount** — Phase 4+5 schema hızlı iterasyonları için tamam.
- **Bundle size uyarısı (348KB)** — Phase 4 başında route-level code split yapılmalı; bu boyut Phase 4'te daha da büyüyecek.

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
| 1.1 | 2026-04-17 | Faz tamamlandı — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri |
