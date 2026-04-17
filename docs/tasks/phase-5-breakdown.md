# Phase 5 — Task Breakdown

**Faz:** [Akademik DNA + Persistent Memory](../roadmap/phase-5-academic-dna.md)
**Toplam tahmini süre:** 2 hafta (planlama süresi); Phase 1-4 ritmiyle muhtemelen 2-3 tam oturum (~14-18 saat)
**Hedef PR sayısı:** 22-26 küçük, bağımsız commit

---

## Öncelik Sırası (Sprint Order)

Phase 4 retro düzeni korundu: **borçlar önce** (6), backend ortada (9), frontend sonra (6), polish son (3).

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 5.1 | vitest 2→4 + vite 5→8 spike — vite 8 uygulandı (bundle 177→40KB gzipped), vitest 4 Phase 6'ya ertelendi (6 test kırıldı) | 3 saat | — | ✅ Tamam | `ad66c29` |
| 5.2 | Per-worker test DB schema izolasyonu — `test_worker_${poolId}` pattern, opt-in via `VITEST_WORKER_COUNT` env; 3 integration test self-fixture'a çevrildi | 3 saat | 5.1 | ✅ Tamam | `c15d7e5` |
| 5.3 | Global error response middleware — `AppError` + handler + Zod normalize; Phase 0/1 controller migration Phase 6'ya ertelendi (50+ call) | 2 saat | — | ✅ Tamam | `45d8346` |
| 5.4 | Recharts dynamic import — `StyleHero` + `EvolutionChart` + `AnalysisCard` lazy; ProfessorDetailPage 114KB → 6.5KB gzipped (Recharts 97KB ayrı chunk) | 2 saat | — | ✅ Tamam | `1230f82` |
| 5.5 | BullMQ + Redis infrastructure — docker compose redis servisi + queue abstraction + studyGroupMaintenance job + inline queue test mode; T3 kapatıldı | 4 saat | — | ✅ Tamam | `b0977f9` |
| 5.6 | Demo user credit reset utility — `scripts/reset-demo-user.ts` + `npm run reset:demo`, idempotent, live DB'de doğrulandı | 1 saat | — | ✅ Tamam | `d657ea3` |
| 5.7 | Prisma schema + migration — 4 DNA tablosu + `User.subscriptionTier`, migrate dev uygulandı, test suite 163/164 | 3 saat | — | ✅ Tamam | `7fa91e6` |
| 5.8 | DNA aggregation servisi — `recomputeDNA` + `getDNA` (cache-first 6h TTL) + `invalidateDNA`; Exam.verified hook uploader + approvers DNA'larını mark stale | 4 saat | 5.7 | ✅ Tamam | `d5c51e1` |
| 5.9 | Learning style inference — `inferStyle` (pure) + `inferLearningStyle` (DB) + `updateLearningStyleFromInference`; reading/kinesthetic/mixed/null, min 20 soru + 15pp dominance gap | 3 saat | 5.7, 5.8 | ✅ Tamam | `04bee87` |
| 5.10 | Confidence scoring — `computeConfidence` (pure, 70/20/10 correctRate/streak/recency weights) + `recomputeConfidence` + `getWeakestTopics`; mock exam submit hook | 3 saat | 5.7, 5.8 | ✅ Tamam | `3fc5200` |
| 5.11 | Grade + GPA service — 3 üni preset (Aydın/Boğaziçi/ODTÜ), `calculateGPA` + `simulateGPA` + `whatIfTargetGPA` (binary search) | 3 saat | 5.7 | ✅ Tamam | `e5193bc` |
| 5.12 | Course advisor — `scoreCompatibility` (style 30 + difficulty 20 + topic 50 weights) + `getCompatibility` insufficient branches | 3 saat | 5.7, 5.8 | ✅ Tamam | `45038db` |
| 5.13 | Spaced repetition — simplified SM-2 (tier'lı intervals), `scheduleReview` / `completeReview` / `countDueByUser`, BullMQ daily scheduler + `User.reviewFrequency` | 4 saat | 5.5, 5.7 | ✅ Tamam | `75a111f` |
| 5.14 | Premium tier gating — `requirePremium` middleware (402/403/401 matrix) + feature flag registry + `reconstructExamSummary` Gemini activation with fallback | 3 saat | 5.7 | ✅ Tamam | `5f97d51` |
| 5.15 | DNA endpoint'leri — 14 route (`/dna` + `/confidence` + `/grades` + `/course-advisor` + `/exam-reconstruct` + `/spaced-repetition` + `/users/me/review-frequency`) + Zod + premium gate + 3 yeni limiter | 4 saat | 5.8–5.14 | ✅ Tamam | `5dc5a1f` |
| 5.16 | Backend tests — 76 yeni test (DNA + learning style + confidence + grade/GPA + advisor + SM-2 + premium + error middleware + queue + endpoint integration). Toplam 229/230 yeşil | 4 saat | 5.15 | ✅ Tamam | `aec376f` |
| 5.17 | Client types + 5 services + shared components (`DNARadar` lazy, `ConfidenceHeatmap`, `GpaCalculator`, `ReviewCard`, `InsufficientDataBanner`, `PremiumLockCard`) | 4 saat | 5.15 | ✅ Tamam | `b9a36ad` |
| 5.18 | DNA profile sayfası `/me/profile` — radar + strengths/weaknesses + learning style override + KVKK notice + insufficient banner | 4 saat | 5.17 | ✅ Tamam | `413ae5d` |
| 5.19 | Confidence heatmap sayfası `/me/confidence` + Dashboard `WeakTopicsWidget` | 3 saat | 5.17 | ✅ Tamam | `ea81a1a` |
| 5.20 | Grade tracker + GPA simulator sayfası `/me/grades` — tabs (list/simulator) + add/delete + GPA header + üni formül picker | 4 saat | 5.17 | ✅ Tamam | `d9d67d2` |
| 5.21 | Course advisor sayfası `/me/course-advisor` — professor search + compatibility card + PremiumLockCard 402 handler + insufficient branches | 3 saat | 5.17 | ✅ Tamam | `f1640f5` |
| 5.22 | Spaced repetition UI `/me/reviews` — 3 tab (today + 30-day calendar + settings) + optimistic complete mutation; Navbar'da DNA/Grades/Reviews linkleri | 4 saat | 5.17 | ✅ Tamam | `cfb9a14` |
| 5.23 | i18n TR + EN copy sweep (paralel 2 agent, hibrit ton, `dna.*` / `confidence.*` / `grades.*` / `courseAdvisor.*` / `spacedRepetition.*` / `premium.*` namespace'leri) | 3 saat | 5.18–5.22 | ⏳ Bekliyor | — |
| 5.24 | Playwright MCP visual smoke (DNA / confidence / grades / course-advisor / reviews × 390/1440 × light/dark) + Phase 5 fixture seeder | 2 saat | 5.23 | ⏳ Bekliyor | — |
| 5.25 | Phase 5 kapanış: doc "gerçekleşen" + scratchpad archive + roadmap README güncelle + data-model-evolution ekle | 1 saat | Hepsi | ⏳ Bekliyor | — |

**Toplam:** ~74 saat tahmin · Hedef gerçek: Phase 4 ritmi (~10-14 saat tek oturum). **İlerleme:** ⏳ **22/25 — tüm frontend sayfalar hazır. Polish (i18n + smoke + kapanış) kaldı.**

> Task numaralama 25'e ulaştı (Phase 4: 23); borç sayısı bir fazla (BullMQ + Redis'i ayrı koyduk) + premium tier ayrı task.

---

## Phase 4 Retro'sundan Scope'a Dahil Edilen Borçlar

| Borç | Task | Neden şimdi |
|------|------|-------------|
| vitest 2→4 + vite 5→8 spike (D1 açık) | **5.1** | Auth + test + build etkiler; Phase 5'te 50+ yeni test eklenecek, eski runner kalırsa config dağılır. Güvenli bump'ları uygula, riskliyi ertele + belgele. |
| Per-worker test DB schema izolasyonu | **5.2** | Phase 4'te `singleFork: true` serialize etti (1.5sn 153 test için OK). Phase 5 ~200+ test'e çıkacak, paralelleştirme şart; `test_worker_${processId}` schema migration pattern. |
| BullMQ + Redis kararı (T3 açık) | **5.5** | Spaced repetition scheduler günlük job gerektirecek; node-cron multi-instance'ta duplicate job sorunu. Phase 4'teki study-group matcher'ı da BullMQ'ya taşı. |
| Recharts dynamic import | **5.4** | ProfessorDetail chart'ları + Phase 5 DNA/confidence dashboard Recharts ağır. Şimdi dynamic import pattern'ını kur, yoksa initial chunk Phase 4 sonu ~172KB'den yine kaçar. |
| Error format normalization | **5.3** | Phase 0/1 endpoint'leri `{ error: "..." }` string; Phase 2/3/4 endpoint'leri `{ error: { code, message } }`. Global middleware'la normalize et (client-side error handling tutarlı olsun). |
| Demo user credit reset | **5.6** | Phase 4 fixture seeder `phase4fixture-*` temizliyor ama `erdem@` kullanıcısının ledger'ı birikiyor. Basit `scripts/reset-demo-user.ts` + admin docs notu. |

---

## Detaylı Task'lar

### 5.1 — vitest 2→4 + vite 5→8 Spike

**Değişen dosyalar:**
- `client/package.json` / `client/package-lock.json` — vite 5→8, vitest 2→4.
- `server/package.json` / `server/package-lock.json` — vitest 2→4.
- `client/vite.config.ts` + `server/vitest.config.ts` — config API breaking değişiklikleri.

**İş:**
- Spike branch'te dene: `npm install` → `npm run build` → `npm test` her iki tarafta.
- **Vite 5→8:** React plugin + dev server HMR kırılma riski. Plugin'in latest'i çıkarsa uygula; çıkmazsa Phase 6'ya ertele.
- **Vitest 2→4:** v3→v4 `test.pool` + `coverage.provider` API değişti. Config update + test run smoke.
- Güvenli olanları main'e al (muhtemelen vitest); riskli olanı `open-questions.md`'de D1'in altına ikinci erteleme kaydı olarak ekle.

**Test:**
- `npm run build` warning yok.
- `npm test` — tüm Phase 0-4 suite yeşil (server 153, client lint).

**PR:** "Apply vitest 2→4; defer vite 5→8 with rationale"

---

### 5.2 — Per-Worker Test DB Schema Izolasyonu

**Değişen dosyalar:**
- `server/vitest.config.ts` — `poolOptions.forks.singleFork` kaldır.
- `server/tests/helpers/testDb.ts` (yeni) — her worker için unique schema (`test_worker_${process.pid}`), setup/teardown migration.
- `server/tests/unit/*.test.ts` — `beforeAll` içinde `setupWorkerSchema()` çağrısı.

**İş:**
- Vitest worker başına `DATABASE_URL` suffix'ine `?schema=test_worker_${id}` ekle.
- `npx prisma migrate deploy` her worker'da tek sefer (`globalSetup` hook).
- `afterAll` teardown — schema drop (CI temizliği).
- Hedef: 200+ test paralel çalışsın, toplam süre 1.5sn'den 1sn altına insin (worker başına bölündüğü için).

**Test:**
- `npm test -- --reporter=verbose` — 153+ test yeşil, worker sayısı ≥2.
- 40001 retry / deadlock olmamalı.

**PR:** "Add per-worker test DB schema isolation"

---

### 5.3 — Global Error Response Normalization

**Yeni dosya:**
- `server/src/middleware/errorMiddleware.ts` — global error handler.

**Değişen dosyalar:**
- `server/src/controllers/authController.ts` + `server/src/controllers/professorController.ts` + Phase 0/1 controller'ları — `{ error: "..." }` string response'ları `next(new AppError(code, message, statusCode))`a çevir.
- `server/src/index.ts` — en sona `app.use(errorMiddleware)` register.

**İş:**
- `AppError` class: `{ code: string, message: string, status: number, issues?: unknown }`.
- Middleware: `AppError` ise `{ error: { code, message, issues? } }`; Zod error → `VALIDATION_FAILED`; bilinmeyen → `INTERNAL`.
- Phase 4'teki shape zaten uyumlu — sadece Phase 0/1 endpoint'leri geri kalıyor.

**Test:**
- Integration: login invalid → `{ error: { code: "UNAUTHORIZED", message: "..." } }`.
- Regression: Phase 4 `VALIDATION_FAILED` + `RATE_LIMITED` shape aynı.

**PR:** "Normalize error response shape (global middleware)"

---

### 5.4 — Recharts Dynamic Import

**Değişen dosyalar:**
- `client/src/pages/ProfessorDetailPage.tsx` — `EvolutionChart` import `React.lazy`a çevrilir; tab-bazlı Suspense.
- `client/src/components/charts/LazyRadar.tsx` (yeni) — Phase 5 DNA radar wrapper.
- `client/src/components/charts/LazyHeatmap.tsx` (yeni) — Phase 5 confidence heatmap wrapper (Recharts custom cell).

**İş:**
- Recharts bundle ~80KB gzipped — lazy import sonrası initial chunk'tan çıkar.
- Her chart component'i kendi file'ında, `Suspense` fallback minimal skeleton.
- ProfessorDetail tab'ına tıklanana kadar yüklenmesin (intersection observer gerekirse 5.18'de).

**Test:**
- `npm run build` sonrası `dist/assets/Recharts-*.js` ayrı chunk.
- Manuel: ilk sayfa yüklemesinde Recharts bundle network'te yok; tab'a tıklayınca geliyor.
- Bundle hedef: initial < 180KB gzipped (Phase 4 sonu 172KB koruma).

**PR:** "Lazy-load Recharts across dashboards"

---

### 5.5 — BullMQ + Redis Infrastructure

**Yeni dosyalar:**
- `server/src/lib/queue.ts` — BullMQ wrapper, connection singleton.
- `server/src/jobs/runner.ts` — worker registration.
- `docker-compose.yml` patch — `redis:7-alpine` servis + healthcheck.

**Değişen dosyalar:**
- `server/package.json` — `bullmq` dep.
- `server/src/jobs/studyGroupMatcher.ts` (Phase 4) — node-cron'dan BullMQ scheduled job'a migrate (Phase 4'ten tek satır refactor vaadi).
- `server/.env.example` — `REDIS_URL`.

**İş:**
- Queue abstraction: `enqueue(queueName, payload, opts)` + `registerWorker(queueName, handler)`. Multi-instance safe (BullMQ job key + lock).
- Dev default: `REDIS_URL=redis://redis:6379` (docker compose).
- Test env: mock queue (synchronous inline handler + memory transport) — queue testlerde gerçek Redis gerektirmesin.
- T3 kararını `open-questions.md`'de "✅ Kapatıldı (2026-04-17)" olarak işaretle.

**Test:**
- Integration: study-group matcher job BullMQ'dan tetikleniyor, duplicate job yok.
- Unit: mock queue test helper.

**PR:** "Introduce BullMQ + Redis; migrate study-group matcher job"

---

### 5.6 — Demo User Credit Reset Utility

**Yeni dosya:**
- `server/scripts/reset-demo-user.ts` — `UserCredit.balance = 0 + history = []`; `ExamApproval` / `QuestionVote` / `PostExamReport` / `StudyGroup` membership'lar demo user için temizlenir.

**İş:**
- Idempotent. `npm run reset:demo` script.
- `scripts/seed-phase-4-fixture.ts` içine hook olarak çağır (fixture seed öncesi demo user'ı temiz tut).
- `CLAUDE.md`'ye dev notu ("fixture seed öncesi `npm run reset:demo` önerilir").

**Test:**
- Manuel: 3 kez çalıştır → bakiye 0, history boş kalır.

**PR:** "Add demo user credit reset script"

---

### 5.7 — Prisma Schema + Migration

**Değişen dosya:**
- `server/prisma/schema.prisma`

**İş:**
- Spec'teki 4 modeli ekle + ek field'lar:
  - **`AcademicDNA`** — spec shape + `version Int @default(1)` (DNA algoritma versiyonu, Phase 6+ refresh için) + `lastComputedAt DateTime`. `strengths` / `weaknesses` JSON array `[{ topic, score, confidence, sampleSize }]`.
  - **`ConfidenceScore`** — spec shape + `lastQuestionCount Int @default(0)` (hangi N soruya dayanarak hesaplandı) + `source String` (`"mock_exam"|"practice"|"self_report"`). Composite PK `(userId, topic)`.
  - **`GradeRecord`** — spec shape + `letterGrade String?` (AA/BA/CB vb.) + `university String?` (formül seçimi için).
  - **`SpacedRepetition`** — spec shape + `correctStreak Int @default(0)` (SM-2 consecutive correct) + `lapseCount Int @default(0)` + `questionText String?` (snapshot — soruyu silinse bile hatırla).
- `User` modeline:
  - `subscriptionTier String @default("free")` — `"free" | "premium"` (5.14 premium gate için).
  - Back-relations: `academicDNA`, `confidenceScores[]`, `gradeRecords[]`, `spacedRepetitions[]`.
- Migration: `npx prisma migrate dev --name phase_5_dna`.

**Cache-key fold tekrarı (Phase 1-4 öğrenilen):**
- `AcademicDNA.lastComputedAt` → cache TTL key (6 saat). Aggregation query bu timestamp'i çek; taze ise skip.

**Test:**
- `npx prisma migrate status` clean.
- Seed bozulmamalı — DNA fixture yok (user-generated, seed sonrası fixture seeder üretir).

**PR:** "Add Phase 5 Prisma schema — DNA layer (4 tables)"

---

### 5.8 — DNA Aggregation Servisi

**Yeni dosya:**
- `server/src/services/dnaService.ts`

**İş:**
- `recomputeDNA(userId)`:
  - Input: `MockExamAttempt` + `QuestionVote` + `PostExamReport` + `StudentNote` topic tag'leri (Phase 2) + `GradeRecord` (5.11'den).
  - Output: `{ learningStyle, strengths, weaknesses, correctRate, preferredDifficulty, totalQuestionsAnswered }`.
  - **Insufficient data branching:** `totalQuestionsAnswered < 20` → `learningStyle = null`, `strengths/weaknesses = []`, UI'da "DNA oluşuyor" banner tetiklenir.
  - Upsert `AcademicDNA` + `lastComputedAt = now`.
- `getDNA(userId)` — cache-first (`lastComputedAt < 6h` ise recompute'suz dön).
- **Invalidation hook (Phase 4'ten devam):** `Exam.verified = true` olduğunda `recomputeDNA` tetiklenecek kullanıcıları bul (approvers + uploader) — `examApprovalService` hook'una ekle.
- **Rule-based default + opt-in Gemini upgrade (Phase 3 pattern):** Base rule-based. `subscriptionTier === "premium"` ise opsiyonel Gemini "DNA narrative" call (prompt shape hazırla, Phase 6'ya bırak).
- **anonymizedHash reuse (Phase 4):** Cross-user DNA analytics'e girerse aynı salt + sha256.

**Test:**
- Unit: 19 soru → `learningStyle = null`.
- Unit: 20+ soru, 80% visual doğru → `learningStyle = "visual"`.
- Unit: invalidation hook — verified flip → DNA recompute tetiklenir.
- Unit: cache hit — 6h içinde 2. çağrı DB hit etmez.

**Neden önce:** 5.9, 5.10, 5.12 DNA'yı input olarak kullanır.

**PR:** "Add DNA aggregation service + Exam.verified invalidation hook"

---

### 5.9 — Learning Style Inference Servisi

**Yeni dosya:**
- `server/src/services/learningStyleService.ts`

**İş:**
- Input: `MockExamAttempt.questionResponses` — her soru için `{ correct, topicTags, questionType }`.
- Topic tag taxonomy: `visual` (chart/diagram soruları), `reading` (uzun metin), `kinesthetic` (problem çözme), `auditory` (Phase 6 voice tutor sonrası).
- Algoritma:
  - Her `questionType` için correct rate hesapla.
  - En yüksek rate %15+ önde ise bu style. Yoksa `mixed` veya `null` (20 soru altı).
- Bu bilgi 5.8'de `AcademicDNA.learningStyle` alanına yazılır.
- **Kullanıcı override:** `User.learningStyleOverride String?` — (5.7 migration'a ek alan eklenmezse 5.14 endpoint'inde user-provided override).

**Test:**
- Unit: 20 soru, 18'i chart (visual) doğru → `visual`.
- Unit: 20 soru, her tip 50/50 → `mixed`.
- Unit: 19 soru → `null` (insufficient).
- Unit: override set edildiyse inferred değeri ezer.

**PR:** "Add learning style inference"

---

### 5.10 — Confidence Scoring Servisi

**Yeni dosya:**
- `server/src/services/confidenceService.ts`

**İş:**
- `recomputeConfidence(userId, topic)`:
  - Input: topic'teki son N (default 10) soru response'u.
  - Score = `correctRate * 70 + streak * 20 + recencyDecay * 10` — basit ağırlıklı.
  - Upsert `ConfidenceScore`.
- `getConfidenceMap(userId)` — tüm topic'ler, sorted by score asc (en zayıf önde).
- `getWeakestTopics(userId, n = 3)` — "Bu hafta çalışman gereken 3 konu" widget için.
- **Hook:** Mock exam submit sonrası (Phase 3 `mockExamService.submit`) → her topic için `recomputeConfidence` enqueue (BullMQ).

**Test:**
- Unit: 10 soru, 5 doğru → score ~50.
- Unit: streak 5 consecutive correct → score boost.
- Unit: mock exam submit hook confidence update tetikler.

**PR:** "Add confidence scoring + weak topic selector"

---

### 5.11 — Grade Record + GPA Calculator Servisi

**Yeni dosyalar:**
- `server/src/services/gradeService.ts`
- `server/src/config/gpaFormulas.ts` — 3+ üni preset (Aydın 4.0, Boğaziçi 4.0, ODTÜ 4.0 — letter grade mapping farklı).

**İş:**
- `addGrade({ userId, courseId?, courseName, grade, credit, semester, letterGrade?, university? })`:
  - Upsert unique `(userId, courseId ?? courseName, semester)`.
- `calculateGPA(userId, { semester?, university? })` — formül preset'ten letter grade → numeric point, weighted average (credit * point / total credit).
- `simulateGPA(userId, { courseName, hypotheticalGrade, credit })` — "X alırsam GPA kaç olur" hesabı.
- `whatIfTargetGPA(userId, targetGPA, remainingCourses)` — "Hedef için bu dersten en az kaç?" solve.

**Test:**
- Unit: 3 ders (AA, BA, CB) × 3 credit Aydın formülünde 3.42 döner (kendi hesap).
- Unit: simulator — mevcut 3.0 GPA, 3-credit dersten AA alırsa 3.15.
- Unit: 3 farklı üni formülü aynı 3 dersten farklı GPA döner.

**PR:** "Add grade record + GPA calculator (3 university formulas)"

---

### 5.12 — Course Advisor Servisi

**Yeni dosya:**
- `server/src/services/courseAdvisorService.ts`

**İş:**
- `getCompatibilityScore({ userId, professorId, courseId })`:
  - Insufficient check: `AcademicDNA` yoksa veya `totalQuestionsAnswered < 40` (≥1 dönem veri) → `{ status: "insufficient" }`.
  - Hoca style profile (Phase 1) çek → `questionTypes` + `difficulty` + `topicFocus`.
  - DNA çek → `learningStyle` + `strengths` + `preferredDifficulty`.
  - Cross-fit rule:
    - Style match: +30 puan (visual ↔ chart heavy).
    - Difficulty match: +20 puan.
    - Topic strength overlap: `overlap * 50` puan.
  - Output: `{ score: 0-100, reasons: [...], warnings: [...] }`.
- **Rule-based only** — Gemini call yok Phase 5'te (deterministic karar).
- **Gating:** `requirePremium` middleware (5.14) → free kullanıcıda sayfa "Premium" CTA'ya yönlendirir.

**Test:**
- Unit: DNA yok → insufficient.
- Unit: visual learner + chart-heavy hoca → skor > 70.
- Unit: kinesthetic learner + theory-only hoca → skor < 50, warnings'de "öğrenme stilin ders tipiyle uyumsuz".

**PR:** "Add course advisor compatibility scoring"

---

### 5.13 — Spaced Repetition Servisi + SM-2 + Scheduler

**Yeni dosyalar:**
- `server/src/services/spacedRepetitionService.ts`
- `server/src/jobs/spacedRepetitionScheduler.ts` — BullMQ daily job.

**İş:**
- **SM-2 (basitleştirilmiş):**
  - `easiness` başlangıç 2.5, min 1.3.
  - Correct response: `interval = interval * easiness`, `easiness += 0.1`.
  - Wrong response: `interval = 1`, `easiness -= 0.2`, `lapseCount++`.
  - Next interval ceil'lenir (1, 3, 7, 14, 30, 90 gün tiers).
- `scheduleReview(userId, questionId, questionText, result)` — mock exam submit sonrası otomatik (yanlış cevaplanan + düşük confidence).
- `getDueReviews(userId, { limit, until? })` — `nextReview <= until`.
- `completeReview(userId, questionId, correct)` — SM-2 update.
- **BullMQ scheduler:** `spaced-repetition-daily` — her gün 09:00 UTC, bugünkü due review'ları olan kullanıcıları bul + notification queue (email/in-app, Phase 6 push). Multi-instance safe (BullMQ lock).
- **Akıllı timing:** Sabah 9 - akşam 9 arası (kullanıcı timezone `User.timezone` field'ı Phase 6'da ekle, şimdilik Europe/Istanbul varsayılan).
- **Kullanıcı frekans ayarı:** `User.reviewFrequency` enum `"daily"|"weekly"|"off"` (Phase 5 riskler: bildirim yorgunluğu).

**Test:**
- Unit: SM-2 1. doğru → interval 1 → 3. Yanlış → interval 1.
- Unit: getDueReviews — 3 review bugüne due, 1 tomorrow → 3 döner.
- Unit: scheduler idempotent — 2 kez çalıştığında duplicate notification yok.

**PR:** "Add spaced repetition (SM-2) + BullMQ daily scheduler"

---

### 5.14 — Premium Tier Gating + reconstructExam Activation

**Yeni dosyalar:**
- `server/src/middleware/premiumMiddleware.ts` — `requirePremium` factory; `user.subscriptionTier !== "premium"` → 402 `{ error: { code: "PREMIUM_REQUIRED", message: "..." } }`.
- `server/src/config/premiumFeatures.ts` — flag registry (`COURSE_ADVISOR`, `EXAM_RECONSTRUCT`, `DNA_NARRATIVE_GEMINI`).

**Değişen dosyalar:**
- `server/src/services/postExamReportService.ts` — Phase 4'teki `reconstructExam` Gemini call skeleton'ını aktifleştir; `requirePremium` gated endpoint'ten çağrılır.
- `server/src/services/dnaService.ts` — opsiyonel "DNA narrative" Gemini prompt (prompt shape hazırla, call premium only).

**İş:**
- Middleware factory: `requirePremium(featureFlag)` — flag disabled ise 403 `FEATURE_DISABLED` (admin kill switch için).
- `reconstructExam` Gemini call: 10+ post-exam report aggregated olduğunda, premium user opt-in ile tetiklenir. `AICallLog.feature = "post-exam-reconstruct"`. Rate-limit: user başına 5/gün.
- Subscription toggle'ı admin üzerinden set (Phase 5 scope dışı admin panel — manuel DB update yeterli, demo için `subscriptionTier = "premium"` erdem user'da).

**Test:**
- Unit: free user course advisor → 402 PREMIUM_REQUIRED.
- Unit: premium user + feature flag off → 403 FEATURE_DISABLED.
- Unit: reconstructExam Gemini call `AICallLog`'a yazar.

**PR:** "Add premium tier gating + activate reconstructExam Gemini call"

---

### 5.15 — DNA REST Endpoint'leri

**Yeni dosyalar:**
- `server/src/routes/dnaRoutes.ts` — tüm DNA + confidence + grades + advisor + spaced rep endpoint'leri tek router.
- `server/src/controllers/dnaController.ts`
- `server/src/controllers/confidenceController.ts`
- `server/src/controllers/gradeController.ts`
- `server/src/controllers/courseAdvisorController.ts`
- `server/src/controllers/spacedRepetitionController.ts`
- `server/src/schemas/dna.ts` — Zod şemaları.

**Değişen dosyalar:**
- `server/src/index.ts` — router register.
- `server/src/middleware/rateLimitMiddleware.ts` — yeni limiter'lar: `dnaRecomputeLimiter` (10/gün), `gradeWriteLimiter` (30/gün), `advisorLimiter` (20/gün).

**Endpoint listesi:**
- `GET /api/dna/me` — `AcademicDNA` (insufficient → `{ status: "insufficient", count }`).
- `POST /api/dna/me/recompute` — manuel recompute (rate-limited).
- `PATCH /api/dna/me/learning-style` — kullanıcı override.
- `GET /api/confidence/me` — tüm topic heatmap.
- `GET /api/confidence/me/weakest?n=3` — widget.
- `POST /api/grades` — add/update grade.
- `GET /api/grades/me?semester` — liste.
- `DELETE /api/grades/:id` — soft delete.
- `GET /api/grades/me/gpa?university&semester` — calculated.
- `POST /api/grades/me/simulate` — what-if.
- `GET /api/course-advisor/:professorId/:courseId?` — compatibility (premium).
- `GET /api/spaced-repetition/me/due?until` — queue.
- `POST /api/spaced-repetition/me/:questionId/complete` — `{ correct: boolean }`.
- `PATCH /api/users/me/review-frequency` — ayar.
- Error shape: `{ error: { code, message } }` (5.3 middleware).

**Test:**
- Integration: her endpoint 200 + auth + Zod 400 + rate-limit 429.
- Integration: premium gate → free user 402.

**PR:** "Add Phase 5 DNA endpoints"

---

### 5.16 — Backend Tests (Full)

**Yeni dosyalar:**
- `server/tests/unit/dna-service.test.ts`
- `server/tests/unit/learning-style-service.test.ts`
- `server/tests/unit/confidence-service.test.ts`
- `server/tests/unit/grade-service.test.ts`
- `server/tests/unit/course-advisor-service.test.ts`
- `server/tests/unit/spaced-repetition-service.test.ts`
- `server/tests/unit/premium-middleware.test.ts`
- `server/tests/integration/dna-endpoints.test.ts`

**İş:**
- Phase 1-4'teki skip-if-no-DATABASE_URL pattern'i.
- Insufficient data fixture'ları (< 20 soru / < 5 grade vb.).
- SM-2 algoritma property-based test (fast-check ekleme opsiyonel — interval monotonik artar).
- Invalidation hook regression testi (Phase 4 + 5 cache chain).
- Premium gate matrix: `{free, premium} × {feature on, off}` = 4 senaryo.
- Coverage hedefi: Phase 4 seviyesi ~50+ yeni test; toplam suite ~205 yeşil.

**PR:** "Add Phase 5 backend test coverage"

---

### 5.17 — Client Types + Services + Shared Chart Components

**Yeni dosyalar:**
- `client/src/types/dna.ts` — `AcademicDNA`, `ConfidenceScore`, `GradeRecord`, `SpacedRepetitionItem`, `CompatibilityScore` shape'leri.
- `client/src/services/dnaService.ts`
- `client/src/services/confidenceService.ts`
- `client/src/services/gradeService.ts`
- `client/src/services/courseAdvisorService.ts`
- `client/src/services/spacedRepetitionService.ts`
- `client/src/components/charts/DNARadar.tsx` — lazy Recharts RadarChart wrapper (5.4 pattern).
- `client/src/components/charts/ConfidenceHeatmap.tsx` — lazy Recharts ScatterChart custom cell.
- `client/src/components/GpaCalculator.tsx` — simulator input.
- `client/src/components/ReviewCard.tsx` — spaced repetition review card (question + answer reveal + correct/wrong).
- `client/src/components/InsufficientDataBanner.tsx` — "DNA oluşuyor" empty state (param: `{ count, minRequired }`).
- `client/src/components/PremiumLockCard.tsx` — course advisor paywall empty state.

**İş:**
- TanStack Query hook'ları: `useDNA()`, `useConfidence()`, `useGrades()`, `useCompatibility(professorId, courseId)`, `useDueReviews()`.
- Optimistic mutation: `useCompleteReview` — SM-2 interval hesap client-side preview + rollback on error (Phase 4 vote pattern).
- `InsufficientDataBanner` rengi ton "encouraging" (hibrit guide).
- `PremiumLockCard` CTA "Premium'a Geç" → `/upgrade` (Phase 5 scope dışı ama placeholder).

**Test:**
- Manual: radar + heatmap chart lazy yüklenir (network tab'da ayrı chunk).
- Manual: review card correct/wrong tıklama → UI hemen güncellenir.

**PR:** "Add DNA client types + services + shared components"

---

### 5.18 — DNA Profile Sayfası

**Yeni dosya:**
- `client/src/pages/DNAProfilePage.tsx` — `/me/profile`.

**Değişen dosyalar:**
- `client/src/App.tsx` — `/me/profile` lazy route.
- `client/src/components/Navbar.tsx` — kullanıcı menüsü altında "Akademik DNA" link.

**İş:**
- 3 section:
  1. Radar chart (`DNARadar`) — topic strengths score 0-100.
  2. Strengths / weaknesses list (top 3 + bottom 3).
  3. Learning style card — detected style + "override" button.
- `<InsufficientDataBanner>` render edilir eğer `totalQuestionsAnswered < 20` (copy: "DNA henüz oluşuyor. {X}/20 soru çözüldü.").
- KVKK banner: "Bu veri sadece sana görünür. [Export et] [Sil] [Ayarlar]" — delete confirm modal.
- Mobile: section'lar stacked, radar chart responsive width.

**PR:** "Add DNA profile page (/me/profile)"

---

### 5.19 — Confidence Heatmap + Dashboard Widget

**Yeni dosyalar:**
- `client/src/pages/ConfidencePage.tsx` — `/me/confidence`.
- `client/src/components/WeakTopicsWidget.tsx` — Dashboard'a eklenir.

**Değişen dosyalar:**
- `client/src/pages/DashboardPage.tsx` — üst section'a `<WeakTopicsWidget />`.
- `client/src/App.tsx` — `/me/confidence` route.

**İş:**
- Heatmap: topic × difficulty grid; renk score'a göre (yeşil > 70, sarı 40-70, kırmızı < 40).
- Tıklanabilir cell → o topic'e ait son 10 soru listesi açılır (drawer).
- Widget: "Bu hafta çalışman gereken 3 konu" — `/api/confidence/me/weakest?n=3` → kart liste, her kart CTA "Çalış" → study pack generate (Phase 2).
- Empty state: "Henüz yeterli veri yok; mock exam çöz" CTA.

**PR:** "Add confidence heatmap + dashboard weak topics widget"

---

### 5.20 — Grade Tracker + GPA Simulator

**Yeni dosyalar:**
- `client/src/pages/GradesPage.tsx` — `/me/grades`.

**Değişen dosyalar:**
- `client/src/App.tsx` — `/me/grades` route.
- `client/src/components/Navbar.tsx` — "Notlarım" link.

**İş:**
- 2 tab (`Tabs` component Phase 2'den):
  - **Notlarım**: dönem bazlı grup; her satır ders + credit + letter grade + numeric + edit/delete CTA. Header'da toplam GPA + üni formül picker (Aydın/Boğaziçi/ODTÜ).
  - **Simülatör**: "Bu sınavdan X alırsam?" form + target GPA solver. Recharts LineChart ile GPA projection (lazy).
- Ekle modal: course name + credit + grade + letterGrade (otomatik formülden) + semester picker.
- Empty state: "Notlarını ekle, dönem ortalamanı gör" CTA.

**PR:** "Add grade tracker + GPA simulator (/me/grades)"

---

### 5.21 — Course Advisor Sayfası

**Yeni dosya:**
- `client/src/pages/CourseAdvisorPage.tsx` — `/me/course-advisor`.

**Değişen dosya:**
- `client/src/App.tsx` — `/me/course-advisor` route.

**İş:**
- Form: hoca ara (existing autocomplete Phase 0'dan) + ders adı input.
- `useCompatibility(professorId, courseId?)` → `{ score, reasons, warnings }`.
- Score ring (0-100), 3 kısa reason bullet, varsa warnings sarı rozet.
- **Premium gate:** `subscriptionTier === "free"` ise sayfa direkt `<PremiumLockCard>` render. Free user landing: "Bu özellik premium. Örnek ekran görüntüsü + 'Premium'a Geç'."
- Insufficient (< 1 dönem DNA): "En az 1 dönem mock exam çöz" CTA.

**PR:** "Add course advisor page (premium)"

---

### 5.22 — Spaced Repetition UI

**Yeni dosyalar:**
- `client/src/pages/ReviewsPage.tsx` — `/me/reviews`.
- `client/src/components/ReviewCalendar.tsx` — aylık grid view, due count overlay.

**Değişen dosya:**
- `client/src/App.tsx` — `/me/reviews` route.
- `client/src/components/Navbar.tsx` — "Tekrar" link + due badge (bugün sayısı).

**İş:**
- 2 tab:
  - **Bugün ({count})**: due review kartları; `<ReviewCard>` her soruda cevap reveal + correct/wrong CTA; optimistic update.
  - **Takvim**: aylık grid, her günde due count rozeti. Geçmiş günler koyu, gelecek açık.
- Settings drawer: `reviewFrequency` toggle (`daily`/`weekly`/`off`) + "Bildirim saati" placeholder (Phase 6).
- Empty state: "Bugün tekrar yok. Mock exam çöz, yanlış yaptığın sorular hatırlatma kuyruğuna eklenir."

**PR:** "Add spaced repetition UI (/me/reviews)"

---

### 5.23 — i18n Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni namespace'ler: `dna.*`, `confidence.*`, `grades.*`, `courseAdvisor.*`, `spacedRepetition.*`, `premium.*`.
- Phase 1-4 pattern: paralel 2 agent (TR + EN), `copy-tone-guide.md` referans.
- Özellikle hassas alanlar:
  - "DNA oluşuyor" banner — motivasyonel, basınç vermeden.
  - Learning style override — "Bu tahmin, değiştirebilirsin" empatik.
  - GPA simülatör negatif senaryo — yapıcı ("düşme" yerine "hedefine ulaşmak için şu ortalamayı koruman gerek").
  - Premium lock CTA — çekici ama mecbur hissettirmeden.
  - Spaced repetition bildirim sıklık — kullanıcı kontrolü vurgusu (bildirim yorgunluğu riski).
  - Course advisor disclaimer — "garanti değil, trend" (Phase 4 high-performer pattern).
  - KVKK (DNA silme + export) — net + empatik.
- Key parity assert: TR ↔ EN count eşit (Phase 4: 447↔447, Phase 5 hedef ~530).

**Test:**
- Manual: her yeni sayfa TR + EN switch, tüm string çevrilmiş.

**PR:** "Add Phase 5 i18n copy (hybrid tone sweep)"

---

### 5.24 — Playwright MCP Visual Smoke

**Senaryolar (Phase 4 pattern — fixture + live hybrid):**
- `/me/profile` · 1440 · light & dark — radar + strengths + insufficient banner.
- `/me/confidence` · 1440 · light & dark — heatmap render + cell click drawer.
- Dashboard · 1440 · light — WeakTopicsWidget + diğer Phase 0-4 widget'ları.
- `/me/grades` · 1440 · light — notlarım dolu state + simülatör tab.
- `/me/course-advisor` · 1440 · light — free user premium lock; premium user skor render.
- `/me/reviews` · 1440 · light & dark — bugün tab + calendar tab.
- 390 mobile: heatmap responsive + review card stacked.
- Navbar due badge görünsün.

**Fixture workflow (Phase 4 öğrenileni):** `scripts/seed-phase-5-fixture.ts` (20+ mock exam attempt, 15 confidence score, 10 grade record, 5 due review, 1 premium user).

**Yakalanan bug kaydı:** count + kategori (Phase 4 tablosu pattern'i).

**PR:** "Add Phase 5 Playwright visual smoke + fixture seeder"

---

### 5.25 — Phase Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-5-academic-dna.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri.
- `docs/roadmap/README.md` — Phase 5 "🎯 Aktif" → "✅ Tamamlandı".
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — eski içerik `docs/_archive/scratchpad-*-YYYY-MM-DD-phase-5.md`'ye, Phase 6 için reset.
- `docs/tasks/phase-5-breakdown.md` — tüm task'lar ✅ + commit hash.
- `docs/architecture/data-model-evolution.md` — 4 yeni tablo + `subscriptionTier` ekle.
- `docs/tasks/open-questions.md` — D1 (vitest/vite), T3 (BullMQ), T4 (multi-provider) kapanış işaretleri.

**PR:** "Close out Phase 5 — DNA + persistent memory shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark + mobile — UI task'larında).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz).
- [ ] Acceptance criteria kısmı ✅ (`phase-5-academic-dna.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 4'ten Yeniden Kullanılacak Altyapı

- **`anonymizedHash` pattern** — DNA cross-feature analytics'te aynı salted sha256.
- **Cache invalidation zinciri** (`Exam.verified = true`) — Phase 5 DNA recompute hook'u aynı zincire eklenecek (5.8).
- **Serializable tx + `FOR UPDATE`** — grade record concurrent edit (opsiyonel, tek user bile race riski düşük).
- **TanStack Query optimistic mutation + rollback** — review card + grade add aynı pattern.
- **Rule-based default + opt-in Gemini upgrade** — 4. faz boyunca standardı doğruladı; Phase 5'te DNA narrative + course advisor rule-based, `reconstructExam` Gemini premium only (5.14).
- **`requireCredits` factory** — Phase 5 grade import gibi ücretli endpoint'ler için hazır; Phase 5'te yeni spending yok ama iskelet kullanılabilir.
- **Rate-limit factory** (per-user key) — 5.15'teki 3 yeni limiter aynı factory.
- **Zod + `parseOrRespond<S>`** — Phase 5 endpoint'leri baştan Zod.
- **`Tabs` component** — grades + reviews sayfalarında.
- **`VerifiedBadge`** — Phase 5'te doğrudan gerekmez ama high-performer + aggregated panel hâlâ aktif.
- **`ReportedTopicsEditor` dynamic list** — grade record list editor + review queue list'ine adapte.
- **`ExternalLinkModal`** — Phase 5 scope dışı (study group Phase 4'tü).
- **Copy tone guide** — hibrit ton devam.
- **Vitest + Supertest** — 5.2 per-worker schema'dan sonra hala bu config.
- **Playwright MCP + fixture seeder template** — `scripts/seed-phase-4-fixture.ts` pattern'ı kopyala.
- **KVKK disclaimer banner** — DNA export/delete ekranlarında tekrar.
- **BullMQ (5.5 sonrası)** — spaced repetition daily scheduler doğrudan kullanır.
- **`AICallLog.feature` flag** — Phase 5'te `"post-exam-reconstruct"` + `"dna-narrative"` yeni feature adları.

---

## Açık Karar Noktaları (İlk Sprint'te Çözülmeli)

- **DNA recompute frekansı — 6 saat cache TTL mi, event-driven mi?** Öneri: ikisi birden — cache 6h + invalidation hook event-driven (verified flip + mock exam submit). Konservatif tarafta.
- **Learning style taxonomy kesin mi?** Spec 4 kategori (visual/reading/kinesthetic/auditory). Öneri: auditory'i Phase 6'ya bırak (voice tutor yok); Phase 5'te 3 kategori + `null` + `mixed`.
- **GPA formülü kaç üni?** Aydın kesin (demo), Boğaziçi + ODTÜ spec'te. Öneri: 3 preset + "custom formula" field (Phase 6'da admin panel).
- **Course advisor premium mi free mi?** Spec net değil. Öneri: premium only (viral potential vs monetization — Phase 5 stickiness için premium paywall ilk kullanım yeri).
- **Spaced repetition bildirim kanalı — email mi in-app mi push mı?** Phase 6'da push planı var. Öneri: Phase 5'te in-app banner + email opsiyonel (user setting), push Phase 6.
- **SM-2 veya daha basit (1-3-7-21 günlük sabit interval)?** Spec "SM-2 basitleştirilmiş". Öneri: 5.13'te SM-2 interval ceiling'li (1, 3, 7, 14, 30, 90 tier) — saf SM-2 sürekli interval çok dağınık.
- **DNA öğeleri kaç N-back?** `questionResponses` history sonsuz büyür. Öneri: son 200 soru rolling window.
- **Premium subscription toggle admin UI mi env mi?** Phase 5 scope dışı. Öneri: manuel DB update yeterli (demo için erdem user `subscriptionTier = "premium"`).
- **vitest 2→4 upgrade'i fazda mı?** Risk düşükse evet; v4 config break çıkarsa 5.1'de erteleme (Phase 6).
- **Multi-provider AI (T4 açık)?** Phase 5 scope dışı; reconstructExam tek provider (Gemini). T4 kararını Phase 6'ya bırak.

---

## Riskler (Uygulama Sırasında)

- **DNA yanlış çıkarım** — ilk 20-40 soruda learning style kararsız olabilir. Mitigasyon: insufficient banner + kullanıcı override + `version` field ile Phase 6'da refresh.
- **Spaced repetition bildirim yorgunluğu** — günlük spam kullanıcıyı uzaklaştırır. Mitigasyon: user frequency ayarı (`daily`/`weekly`/`off`) + akıllı timing (9-21 saat) + "bugün yok" empty state keyifli.
- **GPA formül tutarsızlığı** — 3 üni formülü farklı kaynaklardan (resmi katalog). Mitigasyon: her preset için reference link yorumda; kullanıcı "custom" gelecekte override.
- **Course advisor compatibility uydurulmuş görünebilir** — rule-based score açıklanamazsa "büyü" hissedilir. Mitigasyon: `reasons[]` 3 bullet + `warnings[]` açıkça yazılır.
- **DNA privacy sızıntısı** — aggregation'da raw userId ifşası. Mitigasyon: `anonymizedHash` pattern + k-anonymity 5+ kişi + sadece self'e görünür (`/api/dna/me`, başka user'ın DNA'sı yok).
- **BullMQ + Redis production down** — Redis düşerse spaced repetition sessizce sekme. Mitigasyon: health check endpoint + in-app banner "Bildirimler geçici durdu".
- **Prisma migration rollback zor** — 4 yeni tablo + `subscriptionTier` kolonu. Mitigasyon: migration ayrı commit + seed smoke + `migrate reset` test.
- **Premium middleware kötü yerleşirse** — free user'a 402 fırlatırken 500 olur. Mitigasyon: 5.16'da 4 senaryo matrix testi.
- **SM-2 interval hatası** — `correctStreak` reset koşulu yanlışsa review queue sonsuza gider. Mitigasyon: property-based test (interval monotonik).
- **Bundle size Phase 5 sonu büyür** — 5 yeni sayfa + 2 Recharts chart. Mitigasyon: 5.4 lazy import + route-level code split (Phase 4'ten devam).
- **Test DB schema isolation (5.2) bug'ı** — worker schema drop yarım kalırsa CI kirli bırakır. Mitigasyon: `globalTeardown` + schema prefix `test_worker_*`'ları bulk drop.
- **Error middleware (5.3) regresyonu** — shape değişir ama Phase 2/3/4 client'ı eski string kontrol ederse UI bozulur. Mitigasyon: backwards-compat yok (internal app) ama client error handler'ları tek noktada kontrol et (`api.ts` interceptor).
- **reconstructExam Gemini hallucination** — post-exam aggregate üzerinden sahte sınav üretirse etik sorun. Mitigasyon: output disclaimer "yalnızca çalışma", premium only, rate-limit 5/gün.

---

## Başarı Ölçütleri (Faz Sonu)

Phase 4 retro tablosundan kopya pattern:

| Metrik | Hedef |
|--------|-------|
| DNA recompute P95 | < 300ms |
| Confidence map cold query | < 200ms |
| GPA calculator P95 | < 50ms (tamamen in-memory) |
| Course advisor cold query | < 400ms |
| Spaced repetition daily job | < 30sn (100 user, 500 due review) |
| Backend suite | ~205 yeşil (153 + ~50 yeni) |
| Unit tests added | ~50 |
| i18n key parity TR↔EN | 100% (~530 ↔ 530) |
| Acceptance criteria met | 6/6 |
| Visual smoke bug count | ≤ 1 |
| Bundle size (gzipped) | < 200KB initial (lazy Recharts + route split) |

---

## İlgili

- Faz detay: [`../roadmap/phase-5-academic-dna.md`](../roadmap/phase-5-academic-dna.md)
- Phase 4 retro: [`../roadmap/phase-4-community.md#öğrenilenler-retro`](../roadmap/phase-4-community.md)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- AI pipeline: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md)
- Data model evrimi: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md)
- Açık sorular: [`open-questions.md`](./open-questions.md) (D1, T3, T4 Phase 5'te kapanış adayı)
