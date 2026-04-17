# Phase 4 — Task Breakdown

**Faz:** [Topluluk Katmanı](../roadmap/phase-4-community.md)
**Toplam tahmini süre:** 3 hafta (planlama süresi); Phase 1+2+3 ritmiyle muhtemelen 2-3 tam oturum (~18-22 saat)
**Hedef PR sayısı:** 18-22 küçük, bağımsız commit

---

## Öncelik Sırası (Sprint Order)

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 4.1 | Route-level code split — `React.lazy` + `Suspense` `pages/**.tsx` (Phase 2+3 borcu, 348KB gzip) | 2 saat | — | ✅ Tamam | `f3811b4` |
| 4.2 | Zod introduction — `lib/validation.ts` + mock-exam/study-pack endpoint'lerine retrofit (Phase 3 borcu) | 3 saat | — | ✅ Tamam | `a09d52d` |
| 4.3 | TanStack Query v5 eklenmesi + `QueryClientProvider` + `mockExamService`'e ilk entegrasyon (Phase 3 borcu) | 3 saat | — | ✅ Tamam | `49603c3` |
| 4.4 | Breaking npm upgrades değerlendirmesi (bcrypt 5→6 ✓; vitest/vite Phase 5'e ertelendi) | 3 saat | — | ✅ Tamam | `5b827ab` |
| 4.5 | Prisma schema + migration — `UserCredit` + `ExamApproval` + `QuestionVote` + `PostExamReport` + `StudyGroup` (5 tablo) | 3 saat | — | ✅ Tamam | `5b3845e` |
| 4.6 | Credit economy servisi — `earn` / `spend` / `history`, balance middleware, config tablosu | 4 saat | 4.5 | ✅ Tamam | `b320714` |
| 4.7 | Exam approval servisi — `vote` / 3-eşik / verified badge propagation + `Exam.verified` flag | 4 saat | 4.5, 4.6 | ✅ Tamam | `1c682da` |
| 4.8 | Question vote servisi — up/down/cameOnExam, `verified` havuz derivation, anti-brigade rate-limit | 3 saat | 4.5, 4.6 | ✅ Tamam | `6b896f2` |
| 4.9 | Post-exam report servisi — submit + anonimleştirme + 10+ user aggregation + Gemini opsiyonel reconstruct | 4 saat | 4.5 | ✅ Tamam | `7d434aa` |
| 4.10 | Study group matcher servisi — professor+examDate eşleştirme, günlük job, external link submission | 3 saat | 4.5 | ⏳ | — |
| 4.11 | "A alanların stratejisi" aggregation — self-reported grade + topic focus (≥5 kişi anonim) | 3 saat | 4.5 | ⏳ | — |
| 4.12 | Topluluk endpoint'leri — `/api/credits/*` / `/api/exams/:id/approve` / `/api/questions/:id/vote` / `/api/post-exam-reports` / `/api/study-groups` (Zod + rate-limit + credit middleware) | 4 saat | 4.6–4.11 | ⏳ | — |
| 4.13 | Backend unit + integration testler (credit state machine, 3-eşik verified, cameOnExam precedence, rate-limit brigade, aggregation k-anonymity) | 5 saat | 4.12 | ⏳ | — |
| 4.14 | Client types + services + shared components (`VoteButtons`, `CreditBadge`, `VerifiedBadge`, `ShareDialog`) | 4 saat | 4.12 | ⏳ | — |
| 4.15 | Credit dashboard sayfası + Navbar balance widget + kazanç/harcama history tab | 3 saat | 4.14 | ⏳ | — |
| 4.16 | Exam approval wall — upload queue, approve/reject CTA, verified filter switch | 4 saat | 4.14 | ⏳ | — |
| 4.17 | Question vote UI — `ExamQuestionCard` + study-pack practice soruları içine entegrasyon + "sınavda çıktı" rozeti | 3 saat | 4.14 | ⏳ | — |
| 4.18 | Post-exam report form + `/post-exam-reports/new` + hoca detay sayfasında aggregated view | 4 saat | 4.14 | ⏳ | — |
| 4.19 | Study group index + hoca detayında "5+ kişi bekliyor" banner + external link input modal | 4 saat | 4.14 | ⏳ | — |
| 4.20 | "A alanların stratejisi" paneli — `ProfessorDetailPage` yeni section (aggregated, k-anonim) | 2 saat | 4.14 | ⏳ | — |
| 4.21 | i18n TR + EN copy sweep (paralel 2 agent, hibrit ton, `community.*` / `credit.*` / `approval.*` / `vote.*` / `postExam.*` / `studyGroup.*` namespace'leri) | 3 saat | 4.15–4.20 | ⏳ | — |
| 4.22 | Playwright MCP visual smoke (credit / approval / vote / report form / study group × 390/1440 × light/dark) | 2 saat | 4.21 | ⏳ | — |
| 4.23 | Phase 4 kapanış: doc "gerçekleşen" + scratchpad archive + roadmap README güncelle | 1 saat | Hepsi | ⏳ | — |

**Toplam:** ~70 saat tahmin · Phase 1+2+3 ritmi korunursa **~18-22 saat** tek/iki oturum. Phase 4 hedefi: 23 task, 18-22 commit.

---

## Detaylı Task'lar

### 4.1 — Route-level Code Split

**Değişen dosyalar:**
- `client/src/App.tsx` — her `pages/*` import `React.lazy(() => import('./pages/...'))`a çevrilir.
- `client/src/components/RouteSuspense.tsx` (yeni) — ortak `Suspense` + skeleton fallback.

**İş:**
- Tüm `pages/**.tsx` (Home, ProfessorList, ProfessorDetail, Login, Register, UploadNotes, StudyPack, MockExamGenerate, MockExamSession, MockExamResult, PanicMode, Dashboard) lazy import'a çevir.
- `Suspense` fallback: minimal skeleton (Navbar hâlâ görünür, content area shimmer).
- Phase 3 bundle 348KB gzipped → hedef < 200KB initial chunk; yeni Phase 4 sayfaları (credit, approval wall, post-exam form, study group, vb.) zaten lazy başlar.
- Vite build rapor et: `dist/assets/*.js` boyutları not düş.

**Test:**
- Manual: her route'a tıkla → network tab'da ilgili chunk lazy yüklendiğini gör.
- `npm run build` warning yok; her chunk < 500KB.

**Neden şimdi:** Phase 4 ≥ 6 yeni sayfa ekleyecek. Code split önce gelirse yeni sayfalar lazy import ile baştan doğar.

**PR:** "Add route-level code splitting (React.lazy)"

---

### 4.2 — Zod Introduction

**Yeni dosyalar:**
- `server/src/lib/validation.ts` — ortak Zod helper (`parseBody`, `parseQuery`, `parseParams`); hata durumunda `{ error: { code: "VALIDATION_FAILED", message, issues } }` shape.
- `server/src/schemas/` klasörü — per-endpoint Zod şemaları (`mock-exam.ts`, `study-pack.ts`, şimdilik).

**Değişen dosyalar:**
- `server/src/controllers/mockExamController.ts` — elle yazılmış guard'ları Zod parse ile değiştir.
- `server/src/controllers/studyPackController.ts` — aynı.
- `server/package.json` — `zod` dep.

**İş:**
- Önce mock-exam + study-pack endpoint'lerini Zod'a geçir (regression base).
- Sonra Phase 4 endpoint'leri (4.12) baştan Zod ile gelir.
- Error shape Phase 3'tekiyle uyumlu (`{ error: { code, message } }`). `issues` alanı dev-only (prod: `NODE_ENV === 'production'` iken çıkarılır).

**Test:**
- Integration: invalid body → 400 + `VALIDATION_FAILED`.
- Regression: mevcut integration testler yeşil kalmalı (shape değişmedi).

**Neden şimdi:** Phase 4 endpoint'lerinin input şeması karmaşık (post-exam report çok alanlı, vote cameOnExam nullable). Elle guard yazma sürdürülemez.

**PR:** "Add zod validation + retrofit mock-exam/study-pack"

---

### 4.3 — TanStack Query Introduction

**Yeni dosyalar:**
- `client/src/lib/queryClient.ts` — `QueryClient` config (staleTime 30sn, retry 1).
- `client/src/hooks/useMockExam.ts` — ilk query hook (`useMockExam(id)`, `useSubmitMockExam`).

**Değişen dosyalar:**
- `client/src/main.tsx` — `QueryClientProvider` wrap.
- `client/src/pages/MockExamSessionPage.tsx` — `useEffect + useState` → `useQuery` refactor (regression base).
- `client/src/pages/MockExamResultPage.tsx` — aynı.
- `client/package.json` — `@tanstack/react-query` dep.

**İş:**
- Base client kurulum, devtools dev-only.
- Phase 4 paylaşım feed'i + oylama mutation'ları (4.14+) `useMutation` + `queryClient.invalidateQueries` pattern'ından faydalanacak.
- İlk iterasyon sadece mock exam flow'u refactor — regression testi olarak işe yarar.
- localStorage draft (session page) dokunulmaz; TanStack Query sadece network state.

**Test:**
- Manual: mock exam generate → session → result flow aynı çalışıyor.
- React DevTools + TanStack devtools: query cache'lerinde `mockExam:${id}` key görünür.

**Neden şimdi:** Phase 4 paylaşım feed + vote mutation optimistic update ister; `useEffect` + elle invalidation sürdürülemez.

**PR:** "Add TanStack Query + migrate mock exam flow"

---

### 4.4 — Breaking npm Upgrades Değerlendirmesi

**Değerlendirme (her biri ayrı commit adayı; riskli olan ertelenir):**

- **bcrypt 5→6:** Node 18 drop, Node 20+ gerekli. Node 20 LTS zaten minimum; major bump'ın davranış değişikliği yok (hash uyumlu). Öneri: **uygula**.
- **vitest 2→4:** v3 ve v4 arası config değişikliği (`coverage.provider`, `test.pool`). 105 mevcut test kırılabilir. Öneri: ayrı spike branch, geçerse uygula; geçmezse Phase 5'e ertele + borç olarak logla.
- **vite 5→8:** Plugin ekosistemi kırılması en yüksek risk (React plugin, dev-server HMR). Öneri: Phase 4 scope'u **dışında** tut — Phase 5 başına kadar erteleme kararı (not al).

**Değişen dosyalar (uygulanırsa):**
- `server/package.json` / `server/package-lock.json` — bcrypt 6.
- `client/package.json` / `server/package.json` — vitest (iki tarafta da).
- (vite ertelenirse) `client/package.json` — değişmez.

**İş:**
- Her upgrade için ayrı commit. Smoke: `npm run build` + tüm testler (server + client).
- Ertelenen upgrade'leri `docs/tasks/open-questions.md`'e borç olarak ekle.

**Test:**
- Tüm Phase 1+2+3 testleri yeşil.
- Manuel login flow smoke (bcrypt).
- Unit test runner yeni binary ile çalışıyor (vitest).

**PR:** "Apply safe major bumps (bcrypt 6); defer vitest/vite with rationale"

---

### 4.5 — Prisma Schema + Migration

**Değişen dosya:**
- `server/prisma/schema.prisma`

**İş:**
- Spec'teki 5 modeli ekle + ek field'lar:
  - **`UserCredit`** — spec shape + `updatedAt` (spec'te var); `history` JSON array: `[{ type, amount, reason, refId?, at }]`. `refId`: approval/spend source traceability.
  - **`ExamApproval`** — spec shape + `reason String?` (downvote için opsiyonel short note). Composite PK `(examId, userId)`.
  - **`QuestionVote`** — spec shape + ek: `vote` yerine `direction Int (-1|1)` + `cameOnExam Boolean?` ayrı. `questionId` synthetic (`${sourceTable}:${sourceId}:${questionIdx}` format — study pack practice + mock exam ayrı namespace).
  - **`PostExamReport`** — spec shape + `anonymizedHash String` (aggregation için deterministik user→hash mapping, raw userId aggregated view'a sızmaz). Unique `(userId, professorId, examDate)` (aynı sınav için tek report).
  - **`StudyGroup`** — spec shape + `status enum ("suggested"|"active"|"closed")`. Members: implicit many-to-many (Prisma: `members User[] @relation("StudyGroupMembers")`).
- `Exam` modeline `verified Boolean @default(false)` + `verifiedAt DateTime?` ekle (approval threshold tetikler).
- `User` modeline `UserCredit` + `members: StudyGroup[]` back-relations.
- Migration: `npx prisma migrate dev --name phase_4_community`.

**Cache-key fold tekrarı (Phase 3 öğrenilen):**
- `PostExamReport.examDate` için `YYYY-MM` precision tutmak aggregation clustering'i kolaylaştırır; ama storage'da full date kalsın, aggregation query truncate etsin.

**Test:**
- `npx prisma migrate status` clean.
- Seed bozulmamalı — community fixture yok (user-generated).

**PR:** "Add Phase 4 Prisma schema — community layer (5 tables)"

---

### 4.6 — Credit Economy Servisi

**Yeni dosya:**
- `server/src/services/creditService.ts`
- `server/src/config/creditRules.ts` — earn/spend sabitleri tek yerde (Q4'e future config migration için).

**İş:**
- `earn(userId, amount, reason, refId?)` — `UserCredit` upsert, balance += amount, history append.
- `spend(userId, amount, reason, refId?)` — balance < amount ise `INSUFFICIENT_CREDIT` throw; yeterli ise balance -= amount, history append. **Transaction içinde** — race yok.
- `getBalance(userId)` — `{ balance, updatedAt }`.
- `getHistory(userId, { limit, offset })` — paged, newest first.
- **Rule-based defaults (Phase 3 pattern):** earn 10 on approved upload, spend 5 on mock exam, spend 3 on study pack. Sabit `creditRules.ts`'te, env override yok (şimdilik).
- **Middleware factory:** `requireCredits(amount)` — Phase 2/3 endpoint'lerine (mock exam generate, study pack generate) opt-in olarak takılır; "Phase 4 için" feature flag ile kapatılabilir (`COMMUNITY_CREDITS_ENABLED=false`).

**Test:**
- Unit: earn → balance artar, history append.
- Unit: spend yeterli değilse throw.
- Unit: paralel 5 spend call → final balance deterministic (transaction lock doğrular).
- Unit: middleware integration — balance 0 iken mock exam generate 402 döner.

**Neden önce:** Approval (4.7), vote (4.8), group (4.10) servisleri `creditService`'in downstream'i (earn call'ları).

**PR:** "Add credit economy service + middleware"

---

### 4.7 — Exam Approval Servisi

**Yeni dosya:**
- `server/src/services/examApprovalService.ts`

**İş:**
- `castApproval(examId, userId, approved, reason?)`:
  - `ExamApproval` upsert (composite PK enforce).
  - Kendi yüklediği sınava oy veremez (`ownerId` check → `FORBIDDEN`).
  - 3 pozitif oy eşiğine ulaştıysa `Exam.verified = true, verifiedAt = now`; upload'cıya `creditService.earn(10, "exam_approved", examId)`. Eşik bir kere tetiklenir — `verified` zaten true ise earn yok.
  - 3 negatif oy: `Exam.verified` kalır false; spam flag (`Exam.flagged = true` opsiyonel — Phase 5 moderation queue için saklanır).
- `listPending(userId, { limit, offset })` — kullanıcının oy vermediği + verified olmayan + kendisine ait olmayan sınavlar.
- `invalidateStyleProfile(professorId)` — verified true olunca Phase 1 style profile cache invalidate (Phase 3 pattern).

**503 fallback koruması (Phase 3 pattern):** approval path Gemini-free, ama future enhancement (spam-detection Gemini call) için `gradeClassic`-style injection noktası bırak — opt-in, default rule-based.

**Test:**
- Unit: 2 approve → verified false; 3. approve → verified true, earn tetiklendi.
- Unit: sahibi oy veremez.
- Unit: aynı user tekrar oy verirse update (toggle), earn tekrarlanmaz.
- Integration: invalidation hook style profile cache'i siliyor.

**PR:** "Add exam approval workflow (3-approval threshold)"

---

### 4.8 — Question Vote Servisi

**Yeni dosya:**
- `server/src/services/questionVoteService.ts`

**İş:**
- `voteQuestion(questionId, userId, direction, cameOnExam?)` — `QuestionVote` upsert.
- `getVerifiedPool({ professorId?, topic?, limit })` — toplam `direction` sum > 10 olan soruları döner; cache 5dk in-memory LRU.
- `markCameOnExam(questionId, userId, bool)` — idempotent toggle (aynı user toggle'ı zaten upsert ile hallediyor).
- Anti-brigade: kullanıcı başına günlük 50 oy kapağı (rate-limit middleware factory).
- **Synthetic questionId namespace:**
  - `studyPack:${packId}:q${idx}` — study pack practice soruları.
  - `mockExam:${examId}:q${idx}` — mock exam soruları.
- Migration kolaylığı: sonraki fazda verified question'lar ayrı tabloya promote edilebilir (şimdilik derivation view yeterli).

**Test:**
- Unit: upvote + downvote karışık → direction sum doğru.
- Unit: 10 upvote sonrası getVerifiedPool'da görün.
- Unit: cameOnExam separately tracked; direction ile orthogonal.
- Integration: rate-limit 51. istekte 429.

**PR:** "Add question vote service + verified pool derivation"

---

### 4.9 — Post-Exam Report Servisi

**Yeni dosya:**
- `server/src/services/postExamReportService.ts`

**İş:**
- `submitReport({ userId, professorId, courseId?, examDate, reportedTopics, notes? })`:
  - Zod validate (topic: `{ topic: string, frequency: "bir kez"|"birkaç"|"çok", difficulty: 1-5 }`).
  - Upsert `(userId, professorId, examDate)` unique → aynı sınav için tek report.
  - `anonymizedHash = sha256(userId + examDate + process.env.POST_EXAM_SALT)` — aggregation'da raw userId yok.
  - `creditService.earn(5, "post_exam_report", reportId)` — katkı teşviki.
- `getAggregatedReport(professorId, { examDate? | windowMonths = 6 })`:
  - Rapor sayısı < 10 → `{ status: "insufficient", count }` döner (k-anonymity).
  - ≥10 ise topic frequency aggregate (mode per topic) + difficulty median + notes concatenation (isteğe bağlı Gemini summary — 4.9.b opt-in).
- **Opt-in Gemini upgrade (Phase 3 pattern):** `reconstructExam(aggregated)` — rule-based default, kullanıcı premium/admin ise Gemini ile serbest metin reconstruction. Phase 4'te sadece rule-based; prompt shape hazırla (Phase 5 için).

**Test:**
- Unit: 9 report → insufficient.
- Unit: 10 report → aggregated çıkar; topic frequency dominant mode seçili.
- Unit: aynı user aynı sınav için ikinci submit → ilkini günceller (duplicate earn yok).
- Unit: notes null-safe.

**PR:** "Add post-exam report + k-anonymized aggregation"

---

### 4.10 — Study Group Matcher Servisi

**Yeni dosya:**
- `server/src/services/studyGroupService.ts`
- `server/src/jobs/studyGroupMatcher.ts` — günlük node-cron (T3 kararı Phase 4+ BullMQ; şimdilik `node-cron` yeter, spec "basit").

**İş:**
- `joinMatchmaking({ userId, professorId, courseId?, examDate? })` — aynı (professorId, courseId, examDate ±7 gün) eşleşmelerini sorgular, 5+ kişi varsa otomatik `StudyGroup` upsert + user member olarak ekle.
- `submitExternalLink(groupId, userId, url)`:
  - Kullanıcı grupta üye olmalı.
  - URL whitelist: `https://chat.whatsapp.com/...` veya `https://discord.gg/...` — regex validate.
  - Moderation log'a düş (Phase 5 moderation queue için).
- `listForUser(userId)` — üye olduğu gruplar.
- `listSuggestionsForProfessor(professorId, userId)` — aynı hocadan ama henüz üye olmadığı gruplar.
- **Günlük job:** `studyGroupMatcher` — her gece 02:00 UTC çalışır, orphan matchmaker entry'lerini groupe döker + eski (examDate > 30 gün geçmiş) grupları `status: "closed"` yapar.

**Test:**
- Unit: 4 kişi joinMatchmaking → hiç grup yok. 5. kişi → grup oluştu.
- Unit: URL whitelist — `https://random.com/x` → 400.
- Unit: closed group'a join edemez.

**PR:** "Add study group matcher + external link submission"

---

### 4.11 — "A Alanların Stratejisi" Aggregation

**Yeni dosya:**
- `server/src/services/highPerformerInsightService.ts`

**İş:**
- Input veri kaynağı: `PostExamReport.notes` + `StudentNote` topic tag'leri + (Phase 5'te `GradeRecord` self-reported — şimdilik `PostExamReport` ek alanı). **Geçici plan:** `PostExamReport`'e `selfReportedGrade Int? (0-100)` + `selfReportedLetterGrade String?` ekle (4.5 migration zaten açık; ek kolon kolay).
- `getHighPerformerStrategy(professorId)`:
  - Rapor sayısı filtered (`grade >= 85`) < 5 → `{ status: "insufficient" }`.
  - ≥5 → topic focus aggregation: hangi topic'ler yüksek not alanların %70+'ınca "çok sık" işaretlenmiş. k-anonymity korundu (5+ kişi, hash'li).
- Rule-based — Gemini call yok. Phase 5'te `academicDNA` ile birleşecek.

**Test:**
- Unit: 4 high-performer → insufficient.
- Unit: 5 high-performer, 4'ü "scrum rolleri" işaretlemiş → "scrum rolleri" top strategy.
- Unit: anonymizedHash aggregation output'ta raw userId yok.

**PR:** "Add high-performer strategy aggregation"

---

### 4.12 — Topluluk Endpoint'leri

**Yeni dosyalar:**
- `server/src/routes/communityRoutes.ts` — tüm community endpoint'ler tek router.
- `server/src/controllers/creditController.ts`
- `server/src/controllers/examApprovalController.ts`
- `server/src/controllers/questionVoteController.ts`
- `server/src/controllers/postExamReportController.ts`
- `server/src/controllers/studyGroupController.ts`
- `server/src/schemas/community.ts` — Zod şemaları (4.2 pattern).

**Değişen dosya:**
- `server/src/index.ts` — router register.
- `server/src/middleware/rateLimitMiddleware.ts` — yeni limiter'lar: `voteLimiter` (50/gün), `reportLimiter` (3/gün), `groupJoinLimiter` (5/gün).

**Endpoint listesi:**
- `GET /api/credits/balance` — `{ balance, updatedAt }`.
- `GET /api/credits/history?limit&offset` — paged.
- `POST /api/exams/:id/approve` — `{ approved: boolean, reason?: string }` (Zod) → approval + verified tetikleme.
- `GET /api/exams/pending-approval?limit&offset` — kullanıcının oy vermediği sınavlar.
- `POST /api/questions/:id/vote` — `{ direction: -1|1, cameOnExam?: boolean }`.
- `GET /api/questions/verified?professorId&topic&limit` — verified pool.
- `POST /api/post-exam-reports` — body Zod.
- `GET /api/post-exam-reports/professor/:id?windowMonths` — aggregated; insufficient ise 200 + `{ status: "insufficient" }`.
- `POST /api/study-groups/matchmake` — `{ professorId, courseId?, examDate? }`.
- `POST /api/study-groups/:id/link` — `{ url }`.
- `GET /api/study-groups/mine` — kullanıcının grupları.
- `GET /api/professors/:id/high-performer-strategy` — aggregation (k-anonim).
- Error shape: `{ error: { code, message } }` standart.

**Test:**
- Integration: her endpoint 200 + auth + Zod 400 + rate-limit 429 senaryoları.
- Integration: credit middleware — balance 0 iken mock exam generate 402.

**PR:** "Add Phase 4 community endpoints (credits/approval/vote/report/group)"

---

### 4.13 — Backend Tests (Full)

**Yeni dosyalar:**
- `server/tests/unit/credit-service.test.ts`
- `server/tests/unit/exam-approval-service.test.ts`
- `server/tests/unit/question-vote-service.test.ts`
- `server/tests/unit/post-exam-report-service.test.ts`
- `server/tests/unit/study-group-service.test.ts`
- `server/tests/unit/high-performer-insight.test.ts`
- `server/tests/integration/community-endpoints.test.ts`

**İş:**
- Phase 1/2/3'teki skip-if-no-DATABASE_URL pattern'i.
- K-anonymity fixture'ları: 4 user (insufficient) + 10 user (aggregated) senaryoları.
- Credit state machine: earn → spend → insufficient → refill.
- Anti-brigade rate-limit smoke (50 hızlı istek).
- Coverage hedefi: Phase 3 seviyesi (~50+ yeni test; toplam suite ~155 yeşil).

**PR:** "Add Phase 4 backend test coverage"

---

### 4.14 — Client Types + Services + Shared Components

**Yeni dosyalar:**
- `client/src/types/community.ts` — tüm shape'ler (backend senkron).
- `client/src/services/creditService.ts`
- `client/src/services/examApprovalService.ts`
- `client/src/services/questionVoteService.ts`
- `client/src/services/postExamReportService.ts`
- `client/src/services/studyGroupService.ts`
- `client/src/components/VoteButtons.tsx` — 👍/👎 + cameOnExam rozeti, optimistic update.
- `client/src/components/CreditBadge.tsx` — balance pill (Navbar'da).
- `client/src/components/VerifiedBadge.tsx` — "Doğrulanmış sınav" badge (approval sonrası).
- `client/src/components/ShareDialog.tsx` — Phase 4 paylaşım dialog (native `navigator.share` + copy link fallback).

**İş:**
- `VoteButtons` TanStack Query (4.3) `useMutation` + optimistic `setQueryData`. Rollback on error.
- `CreditBadge` `useQuery(['credits','balance'])` — stale 30sn.
- `ShareDialog`'da PII uyarı copy (whatsapp link submission'ı bu dialog'dan değil, study group page'den; burada skor paylaşım için).

**Test:**
- Manual: `VoteButtons` tıkla → UI hemen güncellenir; network 500'de rollback.
- Manual: Navbar CreditBadge her sayfa değişiminde güncel.

**PR:** "Add community client types + services + shared UI"

---

### 4.15 — Credit Dashboard + Navbar Widget

**Yeni dosyalar:**
- `client/src/pages/CreditsPage.tsx`

**Değişen dosya:**
- `client/src/components/Navbar.tsx` — `CreditBadge` + tıklanınca `/credits`.

**İş:**
- 2 tab (`Tabs` component — Phase 2'den): "Bakiye" + "Geçmiş".
- Bakiye tab: büyük balance number + rozet grid ("Yükle bir sınav", "Soru oyla", "Rapor yaz" → kazanç bilgisi).
- Geçmiş tab: paged list, her satır `{ type, amount, reason, at }` + icon.
- Empty state: "Henüz kredi kazanmadın, ilk sınav yüklemen +10 kredi getirecek".

**PR:** "Add credit dashboard + Navbar balance"

---

### 4.16 — Exam Approval Wall

**Yeni dosyalar:**
- `client/src/pages/ExamApprovalPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/approve-exams` route.
- `client/src/components/Navbar.tsx` — nav link ("Sınav Onayla") + badge (bekleyen sayı).

**İş:**
- Pending queue: `GET /api/exams/pending-approval` infinite scroll (TanStack Query `useInfiniteQuery`).
- Her kart: hoca adı, sınav başlığı, extracted preview (ilk 300 char), upload tarihi, "Doğru" / "Yanlış" CTA + opsiyonel reason textarea.
- Oyladıktan sonra kart listeden kaybolur (optimistic).
- Verified badge: `VerifiedBadge` component. Onayladığın sınav verified olursa notification toast "+10 kredi" yok (upload'cıya gider, oylayan kazanmaz — spec).
- Mobile: kartlar stacked, CTA'lar full-width.

**PR:** "Add exam approval wall page"

---

### 4.17 — Question Vote UI

**Değişen dosyalar:**
- `client/src/components/ExamQuestionCard.tsx` — `VoteButtons` footer'a ekle.
- `client/src/pages/StudyPackPage.tsx` — practice soru accordion'ına `VoteButtons`.
- `client/src/pages/MockExamResultPage.tsx` — soru-soru tab'ındaki her karta (review mode) `VoteButtons`.
- `client/src/types/mockExam.ts` — `questionId` synthetic format consumer side.

**İş:**
- Synthetic questionId backend'den gelir (4.8). Client sadece render eder.
- `cameOnExam` rozeti ayrı toggle: "Bu soru sınavda çıktı" checkbox; açılınca `VoteButtons`'un yanında altın rozet.
- Rate-limit 429 → i18n toast "Bugünlük oy hakkın doldu".
- Optimistic update (4.3 TanStack Query pattern).

**PR:** "Add question vote UI (exam cards + study pack + mock exam result)"

---

### 4.18 — Post-Exam Report Form + Aggregated View

**Yeni dosyalar:**
- `client/src/pages/PostExamReportFormPage.tsx` — `/post-exam-reports/new`.
- `client/src/components/ReportedTopicsEditor.tsx` — dynamic list (topic + frequency dropdown + difficulty slider).
- `client/src/components/AggregatedExamInsights.tsx` — hoca detay sayfasında görünecek aggregated panel.

**Değişen dosya:**
- `client/src/pages/ProfessorDetailPage.tsx` — "Son Sınav Raporları" section + `AggregatedExamInsights` render.
- `client/src/components/Navbar.tsx` — "Sınav Raporu Yaz" nav link (sık ihtiyaç beklenmiyor; belki dashboard CTA yeterli).

**İş:**
- Form: hoca + course + sınav tarihi (datepicker) + ReportedTopicsEditor + notes textarea + self-reported grade (opsiyonel, 4.11 input'u).
- Submit → toast "+5 kredi" + redirect hoca detay.
- Aggregated panel: `insufficient` ise "Henüz 10 rapor yok ({count}/10)"; yeter ise top 5 topic frequency + median difficulty.
- KVKK disclaimer: "Raporun anonim olarak havuza katılacak" — form başında banner.

**PR:** "Add post-exam report form + aggregated insights"

---

### 4.19 — Study Group Index + Matcher Banner

**Yeni dosyalar:**
- `client/src/pages/StudyGroupsPage.tsx` — `/study-groups`.
- `client/src/components/StudyGroupMatchBanner.tsx` — hoca detay sayfasında görünen "5+ kişi bekliyor" banner.
- `client/src/components/ExternalLinkModal.tsx` — whatsapp/discord URL submission.

**Değişen dosya:**
- `client/src/pages/ProfessorDetailPage.tsx` — matcher banner render.
- `client/src/App.tsx` — `/study-groups` route.

**İş:**
- Index page: "Benim gruplarım" + "Önerilen gruplar" iki section.
- Her grup kart: hoca + ders + examDate + member count + external link (varsa) + "Katıl" / "Linki ekle" CTA.
- Matcher banner: 5+ kişi biriktiğinde hoca detayında çıkar; tıklayınca `joinMatchmaking` → auto-add.
- External link modal: PII uyarısı + URL whitelist (backend validate).
- Empty state: "Hiç grup yok; hoca detayında 'bu sınava giriyorum' işaretle".

**PR:** "Add study groups index + matcher banner"

---

### 4.20 — "A Alanların Stratejisi" Panel

**Yeni dosya:**
- `client/src/components/HighPerformerStrategy.tsx`

**Değişen dosya:**
- `client/src/pages/ProfessorDetailPage.tsx` — panel render.

**İş:**
- `GET /api/professors/:id/high-performer-strategy` → insufficient ise "5+ A öğrenci verisi gerekli ({count}/5)"; yeter ise top 3 topic focus liste + hibrit ton açıklama.
- Disclaimer: "Bu veri anonim, 5+ kişiden toplandı. Garanti değil, yalnızca trend."
- Mobile: collapse/expand accordion.

**PR:** "Add high-performer strategy panel"

---

### 4.21 — i18n Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni namespace'ler: `community.*`, `credit.*`, `approval.*`, `vote.*`, `postExam.*`, `studyGroup.*`, `highPerformer.*`.
- Phase 1-3 pattern: paralel 2 agent (TR + EN), `copy-tone-guide.md` referans.
- Özellikle hassas alanlar:
  - Credit kazanç/harcama — motivasyonel, "gamification'a yaklaşma" dengesi (öğrencinin suçluluk hissetmemesi).
  - Approval reason reddi — yapıcı ("yanlış sınav" yerine "bu dosya hoca adıyla uyuşmuyor gibi görünüyor").
  - Post-exam report KVKK uyarısı — net + empatik.
  - Study group external link PII uyarısı — mesafeli, korkutmadan.
  - High-performer strategy disclaimer — garanti vermez.
- Key parity assert: TR ↔ EN count eşit (Phase 3'te 338↔338 oldu, Phase 4 ~400 hedef).

**Test:**
- Manual: her yeni sayfa TR + EN switch, tüm string çevrilmiş.

**PR:** "Add Phase 4 i18n copy (hybrid tone sweep)"

---

### 4.22 — Playwright MCP Visual Smoke

**Senaryolar (Phase 3 pattern — fixture + live hybrid):**
- `/credits` · 1440 · light & dark — balance pill, history tab, empty state.
- `/approve-exams` · 1440 · light & dark — queue 3 kart, VoteButtons, Verified badge.
- `/approve-exams` · 390 · dark — mobile stacked.
- `/post-exam-reports/new` · 1440 · light — form dolu state, ReportedTopicsEditor 3 satır.
- `/study-groups` · 1440 · light & dark — mine + suggested sections, external link modal açık.
- `ProfessorDetailPage` · 1440 · light — AggregatedExamInsights + HighPerformerStrategy + MatchBanner üçü aynı sayfada.
- `StudyPackPage` + `MockExamResultPage` — VoteButtons integration doğru render.
- Navbar CreditBadge her senaryoda görünsün.

**Fixture workflow (Phase 3 öğrenileni):** Inline `node -e` kaçın, `scripts/seed-phase-4-fixture.ts` yaz (10 approval, 10 vote, 10 post-exam report, 5 study group üye).

**Yakalanan bug kaydı:** count + kategori (Phase 3'teki gibi tabloya yaz).

**PR:** "Add Phase 4 Playwright visual smoke + fixture seeder"

---

### 4.23 — Phase Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-4-community.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri.
- `docs/roadmap/README.md` — Phase 4 "🎯 Sıradaki" → "✅ Tamamlandı".
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — eski içerik `docs/_archive/scratchpad-*-YYYY-MM-DD-phase-4.md`'ye, Phase 5 için reset.
- `docs/tasks/phase-4-breakdown.md` — tüm task'lar ✅ + commit hash.
- `docs/architecture/data-model-evolution.md` — 5 yeni tablo ekle.

**PR:** "Close out Phase 4 — community layer shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark + mobile — UI task'larında).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz).
- [ ] Acceptance criteria kısmı ✅ (`phase-4-community.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 3'ten Yeniden Kullanılacak Altyapı

- **`aiCallTracker.recordAICall`** — Phase 4'te varsa `feature: "post-exam-reconstruct"` flag'iyle aynı tabloya.
- **Prompt versioning pattern** — `POST_EXAM_RECONSTRUCT_VERSION` (opsiyonel; faz sonunda gerek görülmezse eklenmez).
- **Cache-first + unique constraint + `expiresAt`** — `PostExamReport` aggregated view 1h cache.
- **Invalidation hook** — Phase 1+2+3 cache'leri (style profile, study pack, mock exam) `Exam.verified = true` olunca invalidate (4.7).
- **Rate limit factory** — Phase 3'teki `express-rate-limit` wrapper; yeni limiter'lar aynı `per-user key` pattern'ıyla.
- **`Tabs` component** — Credit + Study Groups sayfalarında.
- **React-markdown + `prose`** — post-exam report notes render.
- **`ExamQuestionCard`** — `VoteButtons` footer eklemek için yeniden kullanım.
- **`Tabs` + `ScoreGauge` + `PredictionBand`** — Phase 5 dashboard için de kalıyor.
- **Copy tone guide** — hibrit ton devam.
- **Vitest + Supertest** — yeni test dosyaları mevcut config'e düşer.
- **Playwright MCP** — hazır.
- **KVKK + telif disclaimer banner** — post-exam report form'da tekrar.
- **Rule-based defaults + opt-in Gemini upgrade pattern (Phase 3 öğrenileni)** — approval/aggregation/high-performer hepsi rule-based default; Gemini'siz faz sonu.
- **503 fallback pattern** — Gemini call'ları yoksa bile aggregate path'lerin fallback response'u hazır.

---

## Açık Karar Noktaları (İlk Sprint'te Çözülmeli)

- **Credit earn/spend sabitleri config mi, env mi?** Öneri: `creditRules.ts` const; env override yok (Phase 5 admin panel'de config UI).
- **ExamApproval downvote eşiği?** Spec sadece 3 approve diyor. Öneri: 3 downvote → `flagged = true`, silmiyor (moderation queue Phase 5).
- **Question verified threshold gerçekten 10 mu?** Spec "10 👍". Öneri: `direction sum > 10` (10 upvote, 0 downvote = 10; 15 upvote, 5 downvote = 10). A/B test Phase 5.
- **Post-exam report k-anonymity eşiği 10 mu?** Spec "10 öğrenci". KVKK açısından 5+ kişi yeterli olabilir. Öneri: 10'da kal (spec + güvenlik); Phase 5'te 5'e düşür.
- **Study group matcher job: node-cron mu BullMQ mi?** Spec BullMQ diyor ama Phase 4 scope'u zaten geniş. Öneri: node-cron ile ship, BullMQ Phase 5'te Redis + queue infrastructure ile birlikte (T3 kararı).
- **TanStack Query ne kadar refactor?** Sadece mock exam (4.3) + community yeni hook'lar. Phase 1-2 sayfaları dokunulmaz (regression yok).
- **vitest 2→4 upgrade'i fazda mı?** Risk düşükse evet; config break çıkarsa 4.4'te ertelenir.
- **Yüklenen sınav silme hakkı (upload'cı)?** Spec net değil. Öneri: verified olana kadar silinebilir; verified olduktan sonra sadece moderation silebilir (Phase 5).

---

## Riskler (Uygulama Sırasında)

- **Credit economy balance race** — paralel earn/spend'de transaction atomicity kritik. Prisma `$transaction` her spend'de zorunlu.
- **Approval brigading** — 3 eşik çok düşük; 3 arkadaş koordineli false approve yapabilir. Mitigasyon: aynı IP'den 3 oy veto + `createdAt` cluster detection (Phase 5).
- **Study group external link spam** — whitelist regex sıkı; whatsapp/discord invite dışında hiçbir şey kabul edilmez.
- **Post-exam report PII sızıntısı** — `anonymizedHash` salt production'da rotate edilmemeli (aggregation tutarlılığı bozulur). `POST_EXAM_SALT` env'e pin.
- **TanStack Query cache invalidation bug'ları** — optimistic update rollback yanlış key invalidation yaparsa stale data gösterir. Her mutation için explicit `invalidateQueries` + rollback test.
- **Bundle size Phase 4 sonu büyür** — 4.1 code split + TanStack Query tree-shake + Recharts dynamic import ile başlangıçta savun.
- **K-anonymity çekiş** — 10 rapor/5 high-performer çok uzun sürebilir (ilk kullanıcılar hiç insight göremez). Mitigasyon: "katkı çağrısı" UI ile teşvik; faz sonu empty-state kalabilir (kabul edilebilir).
- **Exam approval cache invalidation bug'ı** — verified true olunca Phase 1 style profile + Phase 2 study pack + Phase 3 mock exam cache'leri invalidate edilmezse stale analiz servis edilir. Hook regression testi şart.
- **BullMQ kararı ertelenirse** node-cron multi-instance'ta duplicate job sorunu çıkarır. Şimdilik tek instance — Phase 5'te Redis geldiğinde BullMQ'ya geç.
- **Breaking npm upgrade regresyonu** — 4.4 spike branch çıkarırsa Phase 4'ün toplam süresini uzatır. Güvenli olanları uygula, gerisini ertele + belgeleş.
- **KVKK (hoca şikayet)** — Phase 4 moat'u bu; ama hoca opt-out süreci Q3 açık (open-questions.md). Paylaşım + aggregation canlıya çıkmadan önce Q3 kapatılmalı.

---

## Başarı Ölçütleri (Faz Sonu)

Phase 3 retro tablosundan kopya pattern — "Gerçekleşen Sonuçlar" bölümünde doldurulacak:

| Metrik | Hedef |
|--------|-------|
| Credit earn/spend round-trip P95 | < 100ms |
| Approval → verified propagation | < 1sn (invalidation dahil) |
| Question vote optimistic roundtrip | < 50ms UI; < 500ms server |
| Post-exam aggregation cold query | < 300ms (10 report) |
| Study group matcher job süresi | < 5sn (100 bekleyen) |
| Unit + integration test pass | Phase 3 tarzı 50+ yeni yeşil (~155 toplam) |
| i18n key parity TR↔EN | 100% |
| Acceptance criteria met | 6/6 |
| Visual smoke bug count | ≤ 1 |
| Bundle size (gzipped) | < 250KB initial (code split sonrası) |

---

## İlgili

- Faz detay: [`../roadmap/phase-4-community.md`](../roadmap/phase-4-community.md)
- Phase 3 retro: [`../roadmap/phase-3-mock-exams.md#öğrenilenler-retro`](../roadmap/phase-3-mock-exams.md)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- AI pipeline: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md)
- Data model evrimi: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md)
- Açık sorular: [`open-questions.md`](./open-questions.md)
