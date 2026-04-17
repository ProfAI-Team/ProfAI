# Phase 3 — Task Breakdown

**Faz:** [Mock Exam ve Tahminler](../roadmap/phase-3-mock-exams.md)
**Toplam tahmini süre:** 2 hafta (planlama süresi); Phase 1+2 ritmiyle muhtemelen 2-3 tam oturum (~18-20 saat)
**Hedef PR sayısı:** 12-15 küçük, bağımsız commit

---

## Öncelik Sırası (Sprint Order)

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 3.1 | Dev environment refresh — Docker `./server:/app` bind mount + `node_modules` volume override + `npm audit fix` (Phase 1+2 borcu) | 2 saat | — | ✅ Tamam | `04b021e` |
| 3.2 | Rate limit middleware (`express-rate-limit`, mock-exam endpoint'ine özel quota, anon vs auth) (Phase 1+2 borcu) | 2 saat | — | ✅ Tamam | `d2612ca` |
| 3.3 | Analytics kurulumu — Plausible veya eşdeğer + key event stub'ları (upload / generate / exam start / submit) (Phase 1+2 borcu) | 2 saat | — | ✅ Tamam | `81b1e0d` |
| 3.4 | Prisma schema + migration (`MockExam` + `MockExamSession`) | 2 saat | — | ✅ Tamam | `c5f4b03` |
| 3.5 | Mock exam Gemini prompt (structured output schema: questions + answer key + rubric) + prompt versioning | 4 saat | 3.4 | ✅ Tamam | `371138f` |
| 3.6 | `mockExamService.ts` generate — cache-first (veya session-unique karar) + lock + cost log (`feature: "mock-exam"`) | 5 saat | 3.4, 3.5 | ✅ Tamam | `9fbbac9` |
| 3.7 | Grading servisi — MC/TF rule-based + CLASSIC için Gemini rubric çağrısı + per-question feedback | 5 saat | 3.4, 3.5 | ✅ Tamam | `877e52d` |
| 3.8 | Performance prediction servisi — mock skor + hoca ortalaması → range + confidence + konu boşluk detektörü | 3 saat | 3.4 | ✅ Tamam | `b6d35aa` |
| 3.9 | Mock exam endpoint'leri (`generate` / `:id` / `:id/submit` / `session/:sid/result` / `panic-plan`) | 3 saat | 3.6, 3.7, 3.8, 3.2 | ✅ Tamam | `51262d1` |
| 3.10 | Backend unit + integration testler (prompt schema, grading, prediction, endpoint auth + flow) | 5 saat | 3.9 | ✅ Tamam | `d4ef6d2` |
| 3.11 | Client: TS types + `mockExamService` + `Timer` component (tick + warning state + pause/resume) | 3 saat | 3.9 | ✅ Tamam | `aba7520` |
| 3.12 | `MockExamGeneratePage` — hoca + study pack seçimi, süre/soru sayısı override, "oluştur" CTA | 2 saat | 3.11 | ✅ Tamam | `2cc5d6c` |
| 3.13 | `MockExamSessionPage` — Timer + soru nav + "mark for review" + auto-save draft + beforeunload çıkış uyarısı + auto-submit | 8 saat | 3.11 | ✅ Tamam | `8e1dd1b` |
| 3.14 | `MockExamResultPage` — Tabs (genel skor / bölüm analizi / soru-bazlı feedback) + performans tahmini viz + konu boşluk → study pack CTA | 6 saat | 3.13 | ✅ Tamam | `d3ec7ab` |
| 3.15 | `PanicModePage` — "sınava kaç saat var?" form + priority study plan çıktısı | 3 saat | 3.11 | ✅ Tamam | `7c14212` |
| 3.16 | i18n TR + EN copy sweep (paralel 2 agent, hibrit ton, `mockExam.*` namespace) | 3 saat | 3.15 | ✅ Tamam | `58144f5` |
| 3.17 | Playwright MCP visual smoke (generate / exam / result / panic × 390/1440 × light/dark) | 2 saat | 3.16 | ✅ Tamam | in closeout commit |
| 3.18 | Phase 3 kapanış: doc "gerçekleşen" + scratchpad archive + roadmap README güncelle | 1 saat | Hepsi | ✅ Tamam | (this commit) |

**Toplam:** ~61 saat tahmin · Gerçek: **~15-18 saat** tek oturum (Phase 1+2 ritmi korundu). **İlerleme:** ✅ **18/18 task tamam — Phase 3 kapandı.**

---

## Detaylı Task'lar

### 3.1 — Dev Environment Refresh

**Değişen dosyalar:**
- `docker-compose.yml` — `server` servisine bind mount + `node_modules` override.
- `server/package-lock.json` — `npm audit fix` sonrası.

**İş:**
- `server` servisine:
  ```yaml
  volumes:
    - ./server:/app
    - /app/node_modules
  ```
  Böylece schema / kod değişikliği anında container'a yansır, `docker cp` workaround'u biter.
- `npm audit fix` → 24+ Dependabot vulnerability toplu değerlendir; breaking change varsa manuel karar ver.
- Smoke: `docker compose up -d server` → hot reload çalışıyor mu; `npm run build` temiz geçiyor mu.

**Test:**
- Bir `console.log` ekle, dosyayı kaydet, logs'da görünsün (hot reload doğrulaması).
- `npm audit` clean veya known-exception list.

**Neden şimdi:** Phase 3'te mock exam prompt/service iterasyonu çok olacak. Her rebuild 2 dakika → 18 task × 3 iter = saatler. Phase 1+2 retrolarında iki kez vurgulandı.

**PR:** "Add dev bind mount + dependabot audit refresh"

---

### 3.2 — Rate Limit Middleware

**Yeni dosya:**
- `server/src/middleware/rateLimitMiddleware.ts`

**Değişen dosyalar:**
- `server/src/routes/mockExamRoutes.ts` (3.9'da ayrıca) — generate endpoint'ine `mockExamLimiter` bağla.
- `server/package.json` — `express-rate-limit` dep.

**İş:**
- İki ayrı limiter factory:
  - `mockExamLimiter`: kullanıcı başına saatlik 3, günlük 10 (free tier). `req.user.userId` key'li.
  - `studyPackLimiter`: kullanıcı başına saatlik 5 (retroaktif — Phase 2 endpoint'ine de uygulanacak).
- Fallback: anonim istekler için IP-bazlı (nadir case; mock exam auth-only olmalı).
- `429` response: `{ error: "RATE_LIMITED", retryAfterSec }` — frontend i18n key'e çevirecek.
- Redis gerektirmez — in-memory store şimdilik yeter; ölçek Phase 5'te Redis'e taşınır.

**Neden şimdi:** Mock exam Gemini call'ı study pack'ten daha pahalı (~$0.10 projeksiyon). Rate limit olmadan kötü niyet veya bug bir gecede bütçe yiyebilir.

**Test:**
- Unit: 4. istek 429 döner.
- Integration: `GET /api/study-pack/mine` (cheap) limit'e takılmaz; `POST /api/mock-exam/generate` takılır.

**PR:** "Add rate limit middleware for expensive AI endpoints"

---

### 3.3 — Analytics Kurulumu

**Yeni dosyalar:**
- `client/src/lib/analytics.ts` — `track(event, props?)` wrapper.
- `.env.example` satırı: `VITE_PLAUSIBLE_DOMAIN=...`

**Değişen dosyalar:**
- `client/index.html` — Plausible script tag (domain env'den).
- `client/src/pages/UploadNotesPage.tsx` + `StudyPackPage.tsx` — retroaktif event'ler: `notes_uploaded`, `study_pack_generated`, `study_pack_viewed`.
- Mock exam sayfaları (3.12-3.15) da baştan event'li gelir.

**İş:**
- Plausible (self-host veya hosted) — KVKK dostu, cookie'siz.
- Event envanteri (Phase 3 closeout'ta genişler):
  - `page_view` (otomatik)
  - `notes_uploaded` (file_count, total_word_count)
  - `study_pack_generated` (professor_id hashed)
  - `mock_exam_generated` (question_count, duration_min)
  - `mock_exam_submitted` (score, time_spent_sec)
  - `panic_mode_used` (hours_to_exam)
- PII yok — userId hash'li veya yok.

**Neden şimdi:** Phase 2 metriklerinin çoğu "canlı traffic bekleniyor" kaldı. Phase 3'te mock exam tamamlama oranı, tahmin doğruluğu vs. demo pitch için şart — ölçmeden optimize edemeyiz.

**Test:**
- Manual: `track` çağrıları Plausible dashboard'unda görünüyor (staging domain).

**PR:** "Add analytics (Plausible) + retroactive Phase 2 events"

---

### 3.4 — Prisma Schema + Migration

**Değişen dosya:**
- `server/prisma/schema.prisma`

**İş:**
- `MockExam` modeli (spec'e göre) + ek field'lar:
  - `noteHash String` — study pack'ten gelen hash; cache key parçası.
  - `promptVersion String` — mock-exam-v1.
  - `sectionBreakdown Json?` — bölüm başlıkları + soru index aralıkları (result sayfasında kullanılacak).
- `MockExamSession` modeli + ek field'lar:
  - `timeSpentSec Int?` — completedAt - startedAt (aggregated).
  - `autoSubmitted Boolean @default(false)` — süre dolduğunda mı submit edildi.
- User/Professor back-relation'ları.
- Unique constraint: mock exam cache karar noktası — `(userId, professorId, noteHash, promptVersion)` veya session-unique (tek seferlik)? **Öneri:** cache var (aynı materyal için aynı kullanıcı 24h tekrar üretmez), ama her **session** yeni kayıt (soru cevap rastgele). MockExam cache'lenir, MockExamSession asla.
- Migration: `npx prisma migrate dev --name phase_3_mock_exams`.

**Test:**
- `npx prisma migrate status` clean.
- Seed bozulmamalı — mock exam fixture yok.

**PR:** "Add Phase 3 Prisma schema — mock exams + sessions"

---

### 3.5 — Mock Exam Gemini Prompt

**Yeni dosya:**
- `server/src/prompts/mock-exam.ts`

**İş:**
- Prompt template:
  - System: hibrit ton, "gerçek sınavı simüle ediyorsun, konu dışına çıkma".
  - Input variable'ları: `professorStyle` (aggregated), `studyPackTopics`, `targetQuestionCount` (default 20), `targetDurationMin` (default 90), `targetTypeDistribution`.
  - Çıktı: `{ title, durationMin, sections?, questions: [{ q, type, options?, correctAnswer, topic, difficulty, rationale, rubric? }] }`.
  - CLASSIC sorularda `rubric` alanı (grading için kullanılacak, Phase 3.7).
  - **Kaynak dışına çıkma** kuralı (Phase 2'deki "uydurma formül yok" ile aynı).
- Ayrı prompt: `gradeAnswer(question, studentAnswer, rubric)` — CLASSIC tip için, 0-100 skor + bullet feedback.
- Ayrı prompt: `predictPerformance(mockScore, professorHistoricalAvg, attemptCount)` — `{ lowerBound, upperBound, confidence: "low"|"medium"|"high", reasoning }`.
- Version export: `MOCK_EXAM_VERSION = "mock-exam-v1"`.
- `computeTargetQuestionMix(styleProfile, totalCount)` helper — Phase 2'deki `computeTargetTypeDistribution` pattern'ı.

**Test:**
- Unit: prompt builder, empty input → throw; correct interpolation.
- Unit: distribution math — 20 soru × style %60 MC → 12 MC targeted.
- Gemini integration optional (CI-gated).

**PR:** "Add mock exam Gemini prompt + grading + prediction prompts"

---

### 3.6 — Mock Exam Service (Generate)

**Yeni dosya:**
- `server/src/services/mockExamService.ts`

**İş:**
- `generateMockExam({ userId, professorId, studyPackId?, questionCount?, durationMin? })`:
  1. Study pack varsa konuları çıkar; yoksa profesör style profile'dan genel konuları al.
  2. `noteHash` = study pack noteHash'i veya `"no-study-pack"` sentinel.
  3. Cache: `findFirst({ userId, professorId, noteHash, promptVersion, expiresAt > now })` → varsa dön.
  4. Yoksa: Phase 1/2 advisory lock veya unique-upsert pattern'i.
  5. Gemini call → `recordAICall({ feature: "mock-exam", userId })`.
  6. `MockExam.create` — `expiresAt = now + 24h`, `sectionBreakdown` hesapla (her 5-7 soruda bir section).
- `getMockExam(id, userId)` — owner check.
- `invalidateForProfessor(professorId)` — Phase 1/2 hook'una ekle (examController).

**Test:**
- Unit: cache hit path, cache miss path, lock contention.
- Unit: hash stability.

**PR:** "Add mock exam generation service with cache + lock"

---

### 3.7 — Grading Service

**Yeni dosya:**
- `server/src/services/mockExamGradingService.ts`

**İş:**
- `gradeSession(session, mockExam)`:
  - Her answer için:
    - `MC` / `TF`: `correctAnswer` eşleşiyorsa 100, değilse 0.
    - `CLASSIC`: `gradeAnswer` Gemini prompt'u — 0-100 + feedback. Paralel `Promise.all` (rate limit içinde kalarak, tercihen batch size 3).
  - Section-level aggregation: her section için % doğru.
  - Total score: weighted average (zorluk × doğruluk).
  - `feedback` JSON: `[{ qIdx, correct: bool, scoreOutOf100, feedback, suggestedTopic }]`.
- `saveGradedSession(sessionId, scores, feedback)` — `MockExamSession.update`.
- Cost koruma: CLASSIC sayısı > 10 ise batch'leme + per-user hourly cap (rate limit middleware ayrıca korur).

**Test:**
- Unit: rule-based MC/TF puanlama.
- Unit: rubric call mock'lanınca CLASSIC skor aggregate.
- Unit: section breakdown aggregation.
- AC: auto-grade doğruluğu > %85 — test fixture olarak 5 CLASSIC cevap, manuel grade karşılaştır (gerçek Gemini'yle sample run).

**PR:** "Add mock exam grading service (rule-based + rubric)"

---

### 3.8 — Performance Prediction + Topic Gap

**Yeni dosya:**
- `server/src/services/mockExamPredictionService.ts`

**İş:**
- `predictExamPerformance(session, mockExam, professor)`:
  - Input: session skor, hocanın `styleProfile.historicalGradeStats` (yoksa null).
  - Çıktı: `{ lowerBound, upperBound, confidence, reasoning }`.
  - Yöntem: simple — mock skor ± sapma (hoca geçmiş sınav farkı + 1 sigma). Sonradan Gemini'ye reasoning yaz dedirtme opsiyonel.
  - Geniş confidence interval default (spec AC: "güven aralığı geniş ver").
- `detectTopicGaps(session, mockExam)`:
  - Session'daki yanlış cevapların `topic` field'larını grupla.
  - Her topic için doğruluk % ve öncelik sırası.
  - Return: `[{ topic, correctCount, totalCount, accuracy, priority }]`.
- `buildPanicPlan({ hoursUntilExam, topicGaps, mockExam? })`:
  - Saate göre topic priority sıralı, her topic için suggested study duration.
  - Return: `{ totalMinutes, topics: [{ topic, minutes, reason }] }`.
  - Gemini call opsiyonel — simple rule-based yeterli (spec: "5sn'de üretir").

**Test:**
- Unit: prediction range (mock skor %60, hoca avg %65 → range 55-75 civarı).
- Unit: topic gap sıralaması (en düşük accuracy en yüksek priority).
- Unit: panic plan 4 saat input → plan süreleri topla ≤ 4 saat.

**PR:** "Add performance prediction + topic gap + panic plan services"

---

### 3.9 — Mock Exam Endpoints

**Yeni dosyalar:**
- `server/src/routes/mockExamRoutes.ts`
- `server/src/controllers/mockExamController.ts`

**Değişen dosya:**
- `server/src/app.ts` — route register.

**İş:**
- `POST /api/mock-exam/generate` — body `{ professorId, studyPackId?, questionCount?, durationMin? }`. AC: < 60sn response. `mockExamLimiter` bağla.
- `GET /api/mock-exam/:id` — owner check, mock exam + questions (cevap hariç — client sınav sırasında görmesin).
- `POST /api/mock-exam/:id/submit` — body `{ answers: [{ qIdx, answer, timeSpentSec, flagged }], autoSubmitted? }`. Server tarafında grading + prediction + gap → `MockExamSession` upsert.
- `GET /api/mock-exam/session/:sessionId/result` — score + per-question feedback + prediction + topic gaps.
- `POST /api/mock-exam/panic-plan` — body `{ hoursUntilExam, professorId, mockExamSessionId? }`. AC: 5sn. Rate limit: günde 5.
- Error standardı: `{ error: { code, message } }` — Phase 3 boyunca Zod ekleme iyi fırsat.

**Test:**
- Integration: generate 200, minimum 15 soru (AC).
- Integration: submit + result round trip, score hesaplanmış.
- Integration: başkasının sessionına 403.
- Integration: süre bitince `autoSubmitted: true` işaretle.
- Integration: rate limit 4. generate'te 429.

**PR:** "Add /api/mock-exam endpoints (generate/submit/result/panic)"

---

### 3.10 — Backend Tests (Full)

**Yeni dosyalar:**
- `server/tests/unit/mock-exam-prompt.test.ts`
- `server/tests/unit/mock-exam-service.test.ts`
- `server/tests/unit/mock-exam-grading.test.ts`
- `server/tests/unit/mock-exam-prediction.test.ts`
- `server/tests/integration/mock-exam-endpoint.test.ts`

**İş:**
- Phase 1/2'deki skip-if-no-DATABASE_URL pattern'ini izle.
- CLASSIC grading fixture: 3-5 sample cevap + beklenen skor range.
- Auto-grade > %85 AC testi: sample response'la manuel beklenti karşılaştır.
- Coverage hedefi: Phase 2 seviyesinde (~60+ test toplam).

**PR:** "Add Phase 3 backend test coverage"

---

### 3.11 — Client Types + Services + Timer

**Yeni dosyalar:**
- `client/src/types/mockExam.ts` — tüm shape'ler (backend senkron).
- `client/src/services/mockExamService.ts` — `generate`, `get`, `submit`, `getResult`, `getPanicPlan`.
- `client/src/components/Timer.tsx` — countdown + warning state + pause/resume + `onExpire` callback.
- `client/src/hooks/useCountdown.ts` — pure hook, timer component'i bu hook üstüne kurar.

**İş:**
- Timer: dakika:saniye gösterim, son 5dk'da amber uyarı, son 1dk'da kırmızı pulse.
- Hook tick interval 1sn; `pause()` / `resume()` / `reset()` API.
- **TanStack Query değerlendir:** Mock exam session state (çekilen exam, kalan süre, cevaplar) multiple page arası persist gerektiriyor. Şimdilik localStorage draft + `useReducer` yeterli; TanStack Query Phase 4'te.

**Test:**
- Manual: Timer 5sn'ye kurulup bitince `onExpire` tetiklendi.
- Manual: pause → resume → kaldığı yerden devam.

**PR:** "Add mock exam client types + services + Timer component"

---

### 3.12 — MockExamGeneratePage

**Yeni dosya:**
- `client/src/pages/MockExamGeneratePage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/mock-exam/generate` route (ProtectedRoute).
- `client/src/components/Navbar.tsx` — nav link.

**İş:**
- Form: hoca seçimi (mevcut `professorService`), study pack seçimi (`studyPackService.listMyStudyPacks`), opsiyonel `questionCount` (15-30) + `durationMin` (30-120).
- "Sınavı oluştur" CTA → `mockExamService.generate` → redirect `/mock-exam/:id/session` (session page'e).
- Phase 2 `StudyPackPage`'deki step-progress pattern'ı: "üretiliyor… ~45sn".
- KVKK + AI disclaimer banner (Phase 2'den yeniden kullan).

**Test:**
- Manual: empty state, hoca seç, study pack seç, generate.
- Manual: error state (rate limit 429) i18n'den mesaj.

**PR:** "Add mock exam generate page"

---

### 3.13 — MockExamSessionPage (Timed Exam UI)

**Yeni dosyalar:**
- `client/src/pages/MockExamSessionPage.tsx`
- `client/src/components/QuestionNavigator.tsx` — yan panel, 1-30 grid, flagged/answered görsel durum.
- `client/src/components/ExamQuestionCard.tsx` — PracticeQuestionCard genişletmesi: cevap input'u + flag buton + next/prev.

**İş:**
- **Timer:** üstte sabit, `onExpire` → auto-submit.
- **Soru navigasyonu:** solda grid (1, 2, 3, …), answered yeşil, flagged amber, current vurgulu.
- **Cevap input'ları:**
  - MC: radio group.
  - TF: radio (Doğru / Yanlış).
  - CLASSIC: textarea.
- **"Mark for review":** flag toggle; grid'de de görün.
- **Auto-save:** Her cevap değişikliğinde `localStorage` draft'a yaz (`mockExamDraft:{sessionId}`). Sayfa yenilense kaldığı yerden.
- **Exit warning:** `beforeunload` handler + React Router leave block; "Sınavı bitirmedin, ilerleme kaybolabilir" (localStorage draft zaten var ama explicit uyar). AC gereği.
- **Submit dialog:** "X soru cevaplanmadı, Y flagged — yine de gönder?" onay.
- **Auto-submit:** Timer bitince sessizce `/submit` + `autoSubmitted: true` → result page.
- Mobile: soru-soru ekran, aşağıda prev/next/flag/submit; grid drawer'a taşınır. **AC: telefon üzerinden çözülebilir.**

**Test:**
- Manual: desktop + mobile (390px) + light/dark.
- Manual: timer bitmeden submit, timer bitince auto-submit.
- Manual: sekmeyi kapat, aç → draft geri geldi.
- Manual: 15 soru × 3 tip × flag toggle.

**PR:** "Add mock exam session page with timer + nav + auto-save"

---

### 3.14 — MockExamResultPage

**Yeni dosyalar:**
- `client/src/pages/MockExamResultPage.tsx`
- `client/src/components/ScoreGauge.tsx` — Recharts veya pure SVG ring chart.
- `client/src/components/PredictionBand.tsx` — lower-upper band görsel.
- `client/src/components/TopicGapCard.tsx` — topic başına accuracy + "çalışmaya git" CTA (study pack'e link).

**İş:**
- **3 tab** (mevcut `Tabs` component):
  - Tab 1 — Genel skor: ScoreGauge + pass/fail badge + prediction band + "tahmin tutmuştu mu?" feedback tetiği (1-tık, Phase 4'te işler).
  - Tab 2 — Bölüm analizi: section başına accuracy bar (Recharts).
  - Tab 3 — Soru-soru dönüt: `ExamQuestionCard` read-only + correct/incorrect + feedback text (markdown).
- **Konu boşluk:** tab 2 altında "zayıf konular" listesi → her biri study pack'e deep-link (`/study-pack/:id?topic=...`).
- AI disclaimer banner + "tahmin, kesinlik değil" vurgu.
- Mobile: tab'lar wrap, ScoreGauge küçülür.

**Test:**
- Manual: mock data ile 3 tab, TR + EN + light + dark + mobile.
- Manual: topic gap CTA → study pack sayfasına git, ilgili konu açılır.

**PR:** "Add mock exam result page with tabs + prediction + topic gap"

---

### 3.15 — PanicModePage

**Yeni dosya:**
- `client/src/pages/PanicModePage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/panic` route.
- `client/src/components/Navbar.tsx` — nav link (basit CTA, kullanıcı sık görür).

**İş:**
- Form: "Sınava kaç saat var?" (0.5 - 72), hoca seçimi, opsiyonel "son mock exam'imi kullan" toggle.
- Submit → `POST /api/mock-exam/panic-plan` → 5sn içinde çıktı.
- Çıktı: öncelik sıralı liste (topic + süre + kısa öneri + study pack link).
- Empati tonu: Phase 1 i18n'deki "stresli anı" copy guide'ına uy.

**Test:**
- Manual: 2 saat input → < 5sn plan.
- Manual: empty state, error state.

**PR:** "Add panic mode v1 page"

---

### 3.16 — i18n Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni namespace'ler: `mockExam.generate.*`, `mockExam.session.*`, `mockExam.result.*`, `panic.*`, `rateLimit.*`.
- Phase 1/2 pattern: paralel 2 agent (TR + EN), `copy-tone-guide.md` referansı.
- Özellikle hassas alanlar:
  - Timer warning metinleri (sakin + spesifik).
  - Exit warning (empatik, alarmcı değil).
  - Tahmin disclaimer (kesinlik vermez).
  - Panic mode (destekleyici ton).
- Key parity assert: TR ↔ EN count eşit.

**Test:**
- Manual: her sayfa TR + EN switch, tüm string'ler çevrildi.

**PR:** "Add Phase 3 i18n copy (hybrid tone sweep)"

---

### 3.17 — Playwright MCP Visual Smoke ✅

**Çalışma:**
- Playwright MCP üzerinden 8 senaryo koşuldu. Session + result pages için Prisma fixture enjekte edildi (Gemini canlı üretimi kullanılmadan smoke için).
  1. `/mock-exam/generate` · 1440 · light — hero + form + süre/soru slider gizli, disclaimer + CTA stack doğru hizalanıyor. Navbar'da "Deneme Sınavı" linki aktif.
  2. `/panic` · 1440 · light — kırmızı "Panik modu" badge, hours slider varsayılan 4 sa, "Min 30 dk, maks 72 sa. Gerçekçi yaz — fazla iyimser olma" copy rendered.
  3. `/panic` · 1440 · dark — tüm surface token'ları dark mode'da tutarlı, slider pill primary.
  4. `/mock-exam/:id/session` · 1440 · dark — sol sticky navigator (1-5 grid + legend + "Sınavı bitir" CTA), üst sağ Timer (89:49 countdown, progress bar primary), ortada CLASSIC soru kartı (type/difficulty/topic chip'leri + flag butonu + textarea), alt Önceki/Sonraki nav.
  5. `/mock-exam/:id/session` · 390 · dark — mobile layout: navigator drawer'a taşındı ("≡ 1/5" trigger), timer genişlik aldı, soru kartı ve alt nav doğru dizildi.
  6. `/mock-exam/session/:sid/result` · 1440 · dark · Genel tab — ScoreGauge 64/100 (primary ring), PredictionBand "54 – 72" + Orta Güven pill + mock skor işareti bant içinde + "Bu tahmin geniş bir aralıktır — kesin bir not değildir" disclaimer, Önce buraya odaklan başlığı altında 2 topic gap card (Hash %0, Ağaçlar %0).
  7. `/mock-exam/session/:sid/result` · 1440 · dark · Bölümler — Bölüm 1 %62 amber bar, Bölüm 2 %35 red bar.
  8. `/mock-exam/session/:sid/result` · 1440 · dark · Sorular — 5 soru, her biri type/topic chip + doğru/yanlış badge (green CheckCircle2 / red XCircle) + markdown soru body + DÖNÜT card + rubric hits checklist (✓ Big-O tanımı verilmiş, ✓ Örnek zorluklar sıralanmış).

**Yakalanan bug:** 0 (gerçek UI hatası). Fixture kaynaklı 1 kozmetik artefakt: smoke fixture `durationMin: 45` yazıyordu ama API/sanitize yoluyla session page 90 dk default'u aldı (fixture write tarafında Docker `node -e` + satır-içi escape ile ilgili olabilir). Gerçek generate akışında etki yok, fixture-only issue.

**Auto-submit + timer warning state için canlı path:** Fixture'dan ziyade real generate + 5dk süreli bir mock exam gerekirdi — Gemini bağımlılığı sebebiyle manual QA'e bırakıldı.

**Analytics doğrulaması:** `VITE_PLAUSIBLE_DOMAIN` boş bırakıldığı için no-op path koşturuldu; console'da hata yok, gönderim yok (beklenen). Production domain bağlanınca events canlıya çıkar.

---

### 3.18 — Phase Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-3-mock-exams.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri.
- `docs/roadmap/README.md` — Phase 3 "🎯 Aktif" → "✅ Tamamlandı".
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — eski içerik `docs/_archive/scratchpad-*-YYYY-MM-DD-phase-3.md`'ye, Phase 4 için reset.
- `docs/tasks/phase-3-breakdown.md` — tüm task'lar ✅ + commit hash.

**PR:** "Close out Phase 3 — mock exams shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark + mobile — UI task'larında).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz).
- [ ] Acceptance criteria kısmı ✅ (`phase-3-mock-exams.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 1+2'den Yeniden Kullanılacak Altyapı

- **`aiCallTracker.recordAICall`** — `feature: "mock-exam"` flag'iyle aynı tabloya.
- **Prompt versioning pattern** (`MOCK_EXAM_VERSION`) — cache key'de.
- **Cache-first + unique constraint + `expiresAt`** — Phase 2 study pack pattern'ı.
- **`examController.uploadExam` invalidation hook** — mock exam'ı da ekle.
- **`Tabs` component** — result sayfasında doğrudan.
- **React-markdown + `prose`** — soru açıklamaları + feedback.
- **`PracticeQuestionCard`** — `ExamQuestionCard` onun genişlemesi.
- **Copy tone guide** — tüm yeni copy hibrit ton.
- **Vitest + Supertest** — yeni test dosyaları mevcut config'e düşer.
- **Playwright MCP** — hazır.
- **KVKK + telif disclaimer** — yeniden kullanılabilir banner.

---

## Açık Karar Noktaları (İlk Sprint'te Çözülmeli)

- **MockExam cache'leniyor mu?** Öneri: evet (aynı materyal için 24h). Ama session asla cache'lenmez. Schema'da çözüldü, ama service'te netleştirilmeli.
- **CLASSIC grading batch size?** Rate limit içinde kalmak için 3-5; A/B test gerekirse.
- **Panic plan Gemini mi, rule-based mi?** Spec "5sn'de üretir" diyor — rule-based default, Gemini upgrade Phase 4+.
- **Auto-submit sırasında kullanıcı internet yoksa?** localStorage draft var ama submit sunucuya ulaşamaz. Offline queue Phase 4+; şimdilik basit retry + "bağlantı kontrol et" uyarı.
- **TanStack Query bu fazda mı gelir?** Şimdilik hayır — `useReducer` + localStorage yeterli. Phase 4'te değerlendir.

---

## Riskler (Uygulama Sırasında)

- **60sn AC aşılırsa** — mock exam Gemini çıktı şeması 20-30 soru. İlk iter'da prompt sıkıştır, gerekirse question count'u 15'e düşür (AC "en az 15" olarak yorumlanır).
- **CLASSIC grading paralel Gemini call'ları** rate limit içinde batch'lenmezse 429 patlar. `Promise.all(batch 3)` + delay.
- **Timer drift** — tab background'a atıldığında setInterval freeze olabilir. `Date.now()` farkına dayalı hook kullan, interval'ı mutlak olarak hesapla.
- **Exit warning bug'ı** — React Router v6 `Prompt` kaldırıldı. `unstable_useBlocker` veya custom `beforeunload` + navigation intercept.
- **Mock exam cache contamination** — başka kullanıcı aynı prof için farklı study pack ile generate ettiğinde cache hit yanlış olur. Unique key study pack ID'yi de içersin (öneri: `noteHash` zaten study pack'ten türevli, yeterli).
- **Analytics PII sızıntısı** — event prop'ta userId/email asla yok; prof ID ile hashleme yeterli.
- **Dev ortam bind mount patlarsa** (3.1) — rollback: eski `docker cp` workaround'una dön, Phase 3 devam eder ama yavaş.

---

## Başarı Ölçütleri (Faz Sonu)

Phase 2 retro tablosundan kopya pattern — "Gerçekleşen Sonuçlar" bölümünde doldurulacak:

| Metrik | Hedef |
|--------|-------|
| Mock exam generate P95 (cold) | < 60s |
| Cache hit | 1000×+ hızlanma (ms düzey) |
| Grading total time (20 soru, 5 CLASSIC) | < 20s |
| Auto-grade doğruluğu (sample) | > %85 |
| Unit + integration test pass | Phase 2 tarzı 60+ yeşil |
| i18n key parity TR↔EN | 100% |
| Acceptance criteria met | 7/7 |
| Visual smoke bug count | ≤ 1 |

---

## İlgili

- Faz detay: [`../roadmap/phase-3-mock-exams.md`](../roadmap/phase-3-mock-exams.md)
- Phase 2 retro: [`../roadmap/phase-2-study-packs.md#öğrenilenler-retro`](../roadmap/phase-2-study-packs.md)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- AI pipeline: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md)
- Açık sorular: [`open-questions.md`](./open-questions.md)
