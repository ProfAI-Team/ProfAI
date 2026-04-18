# Phase 7 — Task Breakdown

**Faz:** [B2B + Marketplace](../roadmap/phase-7-b2b-marketplace.md)
**Toplam tahmini süre:** 4 hafta (planlama) · Phase 1-6 ritmiyle muhtemelen 2 tam oturum (~18-24 saat)
**Hedef commit sayısı:** 30-34 küçük, bağımsız commit

---

## Öncelik Sırası (Sprint Order)

Phase 3+4+5+6 retro düzeni korundu: **borçlar önce** (9), backend core ortada (7), backend infra + endpoint + test (3), frontend (7), polish (5), close (1).

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 7.1 | Cache strategy karar + Redis singleton'a migrate (T1 kapanışı) — BullMQ Redis instance'ını cache layer'a extend et | 3 saat | — | ✅ Tamam | `c33b1d1` |
| 7.2 | File storage R2 migration (T2 kapanışı) — `@aws-sdk/client-s3` + R2 credential'ları + signed URL helper + local `/uploads` → R2 migration script + BullMQ GC job | 5 saat | 7.1 | ✅ Tamam | `2c33e85` |
| 7.3 | pgvector extension + MockExam similarity refactor — 6.13 raw ILIKE path'ini embed + cosine distance'a çevir; tutor matching için de embedding kolonu | 4 saat | — | ✅ Tamam | `848dc77` |
| 7.4 | Hesap silme endpoint `/api/users/me/data` + cascade coverage testi (KVKK follow-up) — voice/ocr/lecture/push + yeni Phase 7 tabloları | 2 saat | — | ⬜ | — |
| 7.5 | `MockExamSessionPage` TanStack Query migration (Phase 3 borç) — localStorage + useState → optimistic mutation + server state | 3 saat | — | ✅ Tamam | `71ca01b` |
| 7.6 | Playwright smoke light-mode toggle helper — `document.documentElement.classList` yerine tema butonuna click + helper util | 1 saat | — | ✅ Tamam | `7ba1fc1` |
| 7.7 | `VoteButtons` 47KB react-markdown shrink — remark-gfm lazy import + code block render opsiyonel; mock exam explain popover'ı küçült | 2 saat | — | ✅ Tamam | `a0f7fb5` |
| 7.8 | Multi-provider registry genişletme — `reconstructExamSummary` + DNA + course advisor call site'larını `withFallback` wrapper'ına geçir (T4 kapanış genişleme) | 3 saat | — | ✅ Tamam | `e445103` |
| 7.9 | VAPID key production runbook + env docs — `scripts/generate-vapid.ts` + `server/.env.example` + `docs/operations/runbooks/push-vapid.md` | 1 saat | — | ✅ Tamam | `31f977e` |
| 7.10 | Prisma schema — `Tutor` + `TutoringSession` + `MarketplaceItem` + `Payment` + `UniversityAccount` + `UserRole` enum + `User.role` + `User.universityAccountId` + migration | 4 saat | 7.3 | ✅ Tamam | `c0c853a` |
| 7.11 | RBAC middleware — `requireRole(["HOCA", "TUTOR", "UNIVERSITY_ADMIN", "SUPER_ADMIN"])` + hierarchy + authentikator'a role yüklemesi | 2 saat | 7.10 | ✅ Tamam | `9581201` |
| 7.12 | Premium + feature flag registry extend — `TUTOR_MATCHING` / `MARKETPLACE_PRO` / `UNIVERSITY_ADMIN` / `HOCA_PORTAL` flag'leri + iyzico sandbox kill switch | 1 saat | 7.10 | ✅ Tamam | `4e519fc` |
| 7.13 | Payment gateway servisi — iyzico primary + Stripe fallback abstraction + webhook handler + retry queue + 3DS flow + e-Fatura stub | 6 saat | 7.10, 7.12 | ✅ Tamam | `45565ef` |
| 7.14 | Tutor servisi — profile CRUD + availability slot + matching engine (DNA compatibility + subject/level filter + rating) + booking lifecycle | 5 saat | 7.3, 7.10, 7.12 | ✅ Tamam | `409f303` |
| 7.15 | Marketplace servisi — MarketplaceItem CRUD + moderation approval queue + commission calc (notes %30 / tutoring %15) + pgvector arama | 4 saat | 7.3, 7.10, 7.12 | ✅ Tamam | `8e59301` |
| 7.16 | B2B institutional servisi — hoca portal (verified badge + anonim student feedback + "en çok zorlanan 3 konu" k≥5) + üniversite admin (aggregate insights + seat mgmt + subscription tier) | 5 saat | 7.10, 7.12 | ✅ Tamam | `44a01b2` |
| 7.17 | REST endpoints — tutor + marketplace + payment + university + hoca (25+ route) + Zod + RBAC + 5 yeni limiter | 5 saat | 7.13–7.16 | ⬜ | — |
| 7.18 | BullMQ workers — payment webhook retry + marketplace indexing (embed refresh) + hoca verification queue + storage GC (7.2 için) | 3 saat | 7.2, 7.13, 7.15 | ⬜ | — |
| 7.19 | Backend tests — RBAC matrix + tutor matching + payment webhook + marketplace commission + university k-anonymity + fallback chain (80+ unit, 15+ integration) | 5 saat | 7.17 | ⬜ | — |
| 7.20 | Client types + 5 services + shared components (`TutorCard`, `PriceTag`, `RatingStars`, `CompatibilityScore`, `PaymentBadge`, `ApprovalBanner`, `SeatCounter`, `RoleGuard`) | 4 saat | 7.17 | ⬜ | — |
| 7.21 | Tutor marketplace `/tutors` + `/tutors/:id` — grid + filter + pagination + detay + booking CTA + compatibility badge | 5 saat | 7.20 | ⬜ | — |
| 7.22 | Tutoring session flow `/tutoring/sessions/:id` — session page + in-app mesajlaşma placeholder + Google Meet link wire + rating form | 4 saat | 7.20 | ⬜ | — |
| 7.23 | Notes marketplace `/marketplace` + `/marketplace/:id` — grid + filter + detay + "satın al" + signed download (7.2) | 4 saat | 7.20 | ⬜ | — |
| 7.24 | Hoca portal `/hoca/dashboard` + `/hoca/profile` + `/hoca/feedback` — verified badge + student performance + profil edit + anonim feedback liste | 4 saat | 7.20 | ⬜ | — |
| 7.25 | Üniversite admin `/admin/university` — dashboard + seats + subscription tier + SSO stub (SAML metadata upload placeholder) + aggregate insights grafiği | 4 saat | 7.20 | ⬜ | — |
| 7.26 | Payment checkout `/checkout` — iyzico 3DS iframe + success/fail callback route + e-Fatura indir placeholder + Stripe fallback shim | 4 saat | 7.20, 7.13 | ⬜ | — |
| 7.27 | Navbar + Dashboard + role-aware navigation — HOCA/UNIVERSITY_ADMIN/TUTOR/STUDENT rollerine göre menu; B2B entry points | 2 saat | 7.21–7.26 | ⬜ | — |
| 7.28 | i18n TR + EN copy sweep — `tutoring.*` / `marketplace.*` / `payment.*` / `university.*` / `hoca.*` / `roles.*` namespace | 3 saat | 7.21–7.27 | ⬜ | — |
| 7.29 | KVKK v2 + `/privacy` update — B2B veri akışı (üniversite × öğrenci) + account deletion full wire + avukat review tur 2 placeholder | 2 saat | 7.4, 7.16 | ⬜ | — |
| 7.30 | Account deletion UI — settings tab + confirm dialog (çifte onay, parola re-entry) + cascade toast | 2 saat | 7.4 | ⬜ | — |
| 7.31 | Playwright MCP visual smoke + `scripts/seed-phase-7-fixture.ts` — tutor/marketplace/payment/hoca/university senaryoları; light mode toggle click (7.6) kullan | 3 saat | 7.28 | ⬜ | — |
| 7.32 | Phase 7 kapanışı — phase-7 retro + roadmap README + scratchpad archive + open-questions (T1/T2/İ1/H2/H3 kapanışları) | 1 saat | Hepsi | ⬜ | — |

**Toplam:** ~105 saat tahmin · Hedef: 2 tam oturum içinde kapanış (Phase 6 ritmi korunursa). **İlerleme:** 0/32.

> Task sayısı 32'ye ulaştı (Phase 6: 27). Borç listesi bir fazla (T1 cache + T2 storage + pgvector + hesap silme + MockExam TanStack + light-mode toggle + VoteButtons shrink + multi-provider genişleme + VAPID runbook = 9), 4 ürün pillar'ı (hoca portal + üni admin + tutoring + notes) ayrı sayfa setleri olarak ayrıldığı için frontend 7'ye ulaştı, payment checkout ayrı bir yük. Multi-tenancy + RBAC Phase 7'ye özel yeni infra.

---

## Phase 6 Retro'sundan Scope'a Dahil Edilen Borçlar

| Borç | Task | Neden şimdi |
|------|------|-------------|
| T1 cache strategy (in-process vs Redis) | **7.1** | Phase 6 BullMQ için Redis singleton var; cache için aynı instance kullanılabilir. Phase 7 tutor arama + marketplace listing + university aggregate insights yüksek read-volume; in-process LRU multi-instance'ta tutarsız kalır. Karar: **B (Redis)** — commit 7.1'de uygulanır. |
| T2 file storage (local fs → R2/S3) | **7.2** | Phase 6 sonunda OCR görsel + lecture audio + exam PDF hep `/uploads` içinde kalıcı; B2B ölçekte disk şişer. Marketplace dosya satışı da R2 signed URL gerektiriyor. Karar: **B (Cloudflare R2)** — egress free, S3 API-compatible. Phase 7'nin en kritik infra borcu. |
| pgvector spike + migration | **7.3** | 6.13 multimodal search raw SQL + pg_trgm + JSONB ILIKE ile kazanmış, escape'li ama ideal değil. Tutor matching (7.14) de embedding benzerliği gerektirecek — pgvector bir kere kurulsun, iki müşterisi aynı anda faydalansın. |
| Hesap silme endpoint + UI | **7.4 + 7.30** | KVKK taslakta referans var ama endpoint yok. Avukat review tur 2 (H1) öncesi şart. Phase 6 voice/ocr/lecture + Phase 7 yeni tabloların cascade coverage'ı aynı testte. |
| MockExamSessionPage TanStack Query migration | **7.5** | Phase 3'ten beri localStorage + useState; Phase 7 tutoring session UI aynı state pattern'i kullanacak — önce mock exam page'ini migrate edip örnek pattern oluştur, sonra 7.22 aynı reçeteyi kopyalasın. |
| Light mode Playwright smoke toggle | **7.6** | Phase 6'da `document.documentElement.classList.remove('dark')` evaluate yetersizdi (ThemeContext re-render gerektiriyor). Phase 7 smoke 7+ sayfa screenshot'ı çekecek — helper util olarak tema butonuna click sınanmalı, fixture seeder'a eklenmeli. |
| VoteButtons 47KB react-markdown şişkinliği | **7.7** | Phase 4'ten beri açık. Phase 7 tutoring review render eder (student → tutor feedback), marketplace item description da render edilecek — aynı markdown parser iki yerde daha kullanılırsa bundle 150KB+ büyür; şimdi lazy import + code block render opsiyonel yapılırsa Phase 7 yeni component'leri temiz girer. |
| Multi-provider registry genişletme (T4 genişleme) | **7.8** | Phase 6 sadece `generateStyleSummary` migrate edildi; Phase 5.14'te aktifleşen `reconstructExamSummary` ve DNA/course-advisor call'ları hâlâ Gemini-only. Phase 7 tutor matching ve marketplace özetleme de withFallback'e gelecek — önce legacy'yi bir elden geçir, sonra yeni feature'lar tek pattern'le ship olsun. |
| VAPID key production runbook | **7.9** | Phase 6 sonu VAPID env yok → PushPermissionCard "not-configured" state. Phase 7 ship öncesi prod VAPID pair üretilmeli, rotation stratejisi yazılmalı. 1 saatlik iş ama bir daha unutmayalım. |

---

## Detaylı Task'lar

### 7.1 — Cache Strategy + Redis Singleton (T1 Kapanışı)

**Değişen dosyalar:**
- `server/src/lib/cache.ts` (yeni) — `cacheGet<T>(key, fetcher, ttlSec)` + `cacheInvalidate(key | pattern)` helpers. Redis `GET/SET EX`; prefix `profai:cache:`.
- `server/src/lib/queue.ts` — mevcut Redis connection'ı export et, cache reuse etsin (tek `ioredis` instance).
- `server/src/services/styleProfileService.ts` — in-process Map cache Redis'e geçir (5.16 cache warmup uyumlu).
- `server/src/services/dnaService.ts` — 6h TTL in-process → Redis (Phase 5.8'deki cache).
- `server/src/services/courseAdvisorService.ts` — compatibility cache.
- `server/tests/unit/cache.test.ts` (yeni) — inline mode `REDIS_URL` yoksa Map fallback, integration `RUN_INLINE_QUEUE=1` modunda.
- `docs/tasks/open-questions.md` → **T1 ✅ Kapatıldı (2026-04-XX)** + gerekçe.

**İş:**
- Test ortamı: `REDIS_URL` set değilse in-memory Map fallback (RUN_INLINE_QUEUE=1 ile aynı pattern).
- Cache key schema: `profai:cache:{feature}:{identifier}` — pattern invalidation `SCAN` ile.
- Tests: TTL expiry, invalidation pattern (`profai:cache:dna:*`), fallback behaviour.

**Test:**
- Unit: get miss → fetcher called; get hit → fetcher bypassed; TTL expire → refetched.
- Unit: `cacheInvalidate("profai:cache:dna:*")` aynı prefix'teki 3 key'i siler.
- Integration: style-profile 2. call < 50ms (6.6 assertion).

**Commit:** "Migrate in-process caches to Redis singleton (close T1)"

---

### 7.2 — File Storage R2 Migration (T2 Kapanışı)

**Yeni dosyalar:**
- `server/src/lib/storage.ts` — `StorageProvider` interface + `r2Provider.ts` + `localProvider.ts` fallback.
- `scripts/migrate-uploads-to-r2.ts` — tek-seferlik upload migration + DB `fileUrl` update.
- `server/src/jobs/storageGcWorker.ts` — soft-delete TTL'i geçen dosyaları sil (voice 30 gün KVKK + marketplace draft 90 gün).

**Değişen dosyalar:**
- `server/package.json` — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`.
- `server/src/middleware/uploadMiddleware.ts` — Multer memory storage → R2 upload stream; filename UUID.
- `server/src/services/ocrService.ts` + `voiceTutorService.ts` + `lectureAudioService.ts` — `fileUrl` artık R2 signed URL (TTL 1h per-request refresh).
- `server/src/services/examService.ts` — exam PDF upload path da R2'ye.
- `server/.env.example` — `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.
- `docs/tasks/open-questions.md` → **T2 ✅ Kapatıldı (2026-04-XX)**.

**İş:**
- Dev ortam: `R2_BUCKET` yoksa `localProvider` (mevcut davranış) — docker-compose'da minio container opsiyonel (ileride).
- Migration script: eski `/uploads` dosyalarını walk et, R2'ye yükle, DB'de ilgili `fileUrl` kolonlarını signed URL şablonuyla güncelle. Dry-run flag.
- Signed URL TTL 1h; UI tarafı her request'te fresh URL ister (frontend `fileUrl` property yerine `signedFileUrl` helper).
- Storage GC: KVKK 30 günlük voice TTL otomatik çalışsın (BullMQ `storage-gc` cron `0 3 * * *`).

**Test:**
- Unit: upload stream mock → R2 put + signed URL dön.
- Unit: signed URL expiry → yeni URL üret.
- Integration: migration script smoke (fixture 3 dosya → R2 mock).
- Integration: GC job 30+ gün eski voice session dosyalarını siler.

**Commit:** "Migrate file storage to Cloudflare R2 with signed URLs (close T2)"

---

### 7.3 — pgvector + MockExam Similarity Refactor

**Değişen dosyalar:**
- `server/prisma/schema.prisma` — `MockExam` + `Tutor` modellerine `embedding Unsupported("vector(768)")?` kolonu; pgvector extension migration.
- `server/prisma/migrations/YYYY_phase_7_pgvector.sql` — `CREATE EXTENSION IF NOT EXISTS vector;` + ALTER TABLE + `CREATE INDEX ... USING ivfflat (embedding vector_cosine_ops)`.
- `server/src/services/multimodalSearchService.ts` — 6.13'teki raw ILIKE path'ini embedding + cosine distance `<=>` query'sine çevir.
- `server/src/services/llm/embeddingService.ts` (yeni) — Gemini `text-embedding-004` wrapper + withFallback Claude.
- `server/src/jobs/embeddingBackfillWorker.ts` (yeni) — mevcut MockExam + Tutor rowları için embedding üret, batched.

**İş:**
- pgvector 0.7+ gerekli — `docker-compose.yml`'da `postgres:15` yerine `pgvector/pgvector:pg15` image'ına geç.
- Embedding 768-dim (Gemini) tutarlı; Claude fallback için aynı boyutlu embedding dönüyor mu kontrol — değilse projection matrix ya da Gemini-only lock.
- Raw `$queryRaw` kullan (`<=>` operatorü Prisma'da native değil), Prisma `tag literal` ile safe parameter binding.

**Test:**
- Unit: embedding service Gemini 503 → Claude fallback.
- Integration: MockExam 5 row fixture → query embedding top-3 beklenen sırada (order by distance).
- Integration: backfill worker idempotent.

**Commit:** "Add pgvector extension; refactor multimodal search to embedding cosine similarity"

---

### 7.4 — Hesap Silme Endpoint + Cascade Test

**Yeni dosya:**
- `server/src/controllers/accountController.ts` — `DELETE /api/users/me/data` (parola confirm required).
- `server/tests/integration/account-deletion.test.ts` — tüm cascade edge case.

**Değişen dosyalar:**
- `server/src/routes/userRoutes.ts` — delete endpoint wire.
- `server/src/services/accountService.ts` (yeni) — `purgeUserData(userId)` → transaction: VoiceSession + OCRResult + LectureTranscript + PushDevice + StudentNote + MockExamSession + Payment (soft + anonymize) + Tutor (soft) + MarketplaceItem (anonymize seller) + User.
- `server/src/middleware/passwordConfirm.ts` (yeni) — re-enter password guard.

**İş:**
- Payment rows **silinmez**, `anonymizedUserId` kolonu doldurulur (KVKK defter tutma yükümlülüğü vs silme hakkı çakışması).
- Tutor satır soft-delete; marketplace item soft-delete (satın alanların download hakkı yarım saat window ile düşürülür + refund placeholder).
- Post-delete: JWT token revoke (Phase 5'te yoktu — in-memory blacklist kısa vadeli; Phase 8 refresh token).

**Test:**
- Integration: user oluştur + voice/ocr/marketplace data ekle + delete → tüm ilişkili row'lar silinmiş / anonimleştirilmiş.
- Integration: wrong password → 401.

**Commit:** "Add account deletion endpoint with cascade purge"

---

### 7.5 — MockExamSessionPage TanStack Query Migration

**Değişen dosyalar:**
- `client/src/pages/MockExamSessionPage.tsx` — `useState` + `localStorage` → `useQuery({ queryKey: ["mockExamSession", id] })` + `useMutation` for answer submit + optimistic rollback.
- `client/src/services/mockExamService.ts` — `getSession(id)` + `updateAnswers(id, answers)` + `submitSession(id)` query/mutation helpers.
- `client/src/hooks/useMockExamSession.ts` (yeni) — hook sarmalayıcı.

**İş:**
- LocalStorage'daki "in-progress answers" artık server'a push (her 15sn debounce + blur event). Network offline guard basit toast.
- Rollback: submit mutation fail → eski cevap state'e dön.
- Phase 7'nin 7.22 tutoring session page'i bu hook pattern'ı kopyalayacak.

**Test:**
- Manuel: answer input → ~15sn sonra network call; reload → server state restored.

**Commit:** "Migrate MockExamSessionPage to TanStack Query"

---

### 7.6 — Playwright Smoke Light-Mode Toggle Helper

**Yeni dosya:**
- `scripts/playwright-helpers.ts` — `toggleTheme(page, mode: "light" | "dark")` helper: tema butonunu selector ile bul, click, bekle.

**Değişen dosyalar:**
- Phase 6 smoke script (eğer ayrı bir Playwright runner doc'u varsa) + Phase 7 7.31 template'i helper'ı import eder.

**İş:**
- Helper: `await page.locator('[data-testid="theme-toggle"]').click()` + assert `html.dark` class yok/var.
- Navbar tema butonuna `data-testid="theme-toggle"` ekle (yoksa; mevcut `ThemeToggle` component'ini kontrol et).

**Test:**
- Manuel: helper smoke'ta light → dark → light flip doğrulanır.

**Commit:** "Add Playwright light-mode toggle helper via theme button click"

---

### 7.7 — VoteButtons react-markdown Shrink

**Değişen dosyalar:**
- `client/src/components/MarkdownRenderer.tsx` (yeni) — `React.lazy(() => import("react-markdown"))` + Suspense fallback; `remark-gfm` + `rehype-highlight` opsiyonel flags.
- `client/src/components/VoteButtons.tsx` — açıklama popover'ı `<MarkdownRenderer markdown={...} />`.
- `client/src/components/mockExam/ExplainPopover.tsx` — aynı.

**İş:**
- Mevcut react-markdown + remark-gfm toplam ~47KB gzipped chunk'ta; lazy chunk'a çekince initial bundle ~40KB kalır.
- Rehype-highlight syntax highlighting şu an kullanılmıyor (mock exam cevap açıklaması code block nadir) — opsiyonel flag arkasına, default off.

**Test:**
- Manuel: mock exam explain popover ilk açıldığında network tab'da markdown chunk lazy yüklenir; initial bundle ölçümü.

**Commit:** "Lazy-load react-markdown; shrink initial bundle"

---

### 7.8 — Multi-Provider Registry Genişletme

**Değişen dosyalar:**
- `server/src/services/postExamReportService.ts` — `reconstructExamSummary` Gemini call `withFallback` wrapper'ına.
- `server/src/services/dnaService.ts` — DNA narrative call Gemini-only; withFallback'e geç.
- `server/src/services/courseAdvisorService.ts` — advisor narrative call aynı.
- `server/src/services/analysisService.ts` — exam analysis primary call aynı.
- `server/tests/unit/provider-registry.test.ts` — 4 yeni call site için fallback senaryosu.

**İş:**
- Her call site için `aiFeature` parametresi pino log'a düşer (6.4 ile uyumlu).
- Fallback path test edilir: Gemini 503 → Claude text → `AICallLog.fallbackUsed = true`.

**Test:**
- Unit: 4 call site için primary OK + primary 503 → fallback OK matrisi.
- Integration: smoke DNA narrative Claude fallback'e düşerse UI'da "hazırlandı" state normal görünür.

**Commit:** "Migrate remaining AI call sites to multi-provider withFallback"

---

### 7.9 — VAPID Production Runbook

**Yeni dosyalar:**
- `scripts/generate-vapid.ts` — `web-push generateVAPIDKeys()` + terminal output `.env` format.
- `docs/operations/runbooks/push-vapid.md` — Generate → Deploy → Rotate süreci.

**Değişen dosyalar:**
- `server/.env.example` — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` açıklaması.
- `docs/operations/runbooks/README.md` — index'e ekle (yoksa oluştur).

**İş:**
- Rotation stratejisi: yeni pair üret, 30 gün eski key de fallback olarak tut, 30 gün sonra eski aboneliği drop. Bu doc'ta opsiyonel, Phase 8 formal.
- Runbook'ta Cloudflare Worker / Vercel / Fly.io için secret set örnekleri (kısa).

**Test:**
- Manuel: `npx ts-node scripts/generate-vapid.ts` → pair üretiliyor, `.env` kopyala-yapıştır formatında.

**Commit:** "Add VAPID key generation script + production runbook"

---

### 7.10 — Prisma Schema (Phase 7 Tables + Roles) + Migration

**Değişen dosya:**
- `server/prisma/schema.prisma`

**İş — 5 yeni tablo + 2 enum + User.role + User.universityAccountId:**

```prisma
enum UserRole {
  STUDENT
  HOCA
  TUTOR
  UNIVERSITY_ADMIN
  SUPER_ADMIN
}

model Tutor {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio             String   @db.Text
  hourlyRate      Int      // TL (tam sayı)
  specializations Json     // [{ subject, level, tags[] }]
  availability    Json     // [{ dayOfWeek, startHour, endHour }]
  rating          Float?
  totalSessions   Int      @default(0)
  embedding       Unsupported("vector(768)")?
  verifiedAt      DateTime?
  status          String   @default("pending") // pending | active | suspended
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([rating])
}

model TutoringSession {
  id            String   @id @default(uuid())
  tutorId       String
  tutor         Tutor    @relation(fields: [tutorId], references: [id])
  studentId     String
  student       User     @relation("TutoringAsStudent", fields: [studentId], references: [id])
  scheduledAt   DateTime
  durationMin   Int
  status        String   // scheduled | completed | cancelled | disputed | no_show
  rating        Float?
  feedback      String?
  price         Int      // TL
  meetingUrl    String?
  paymentId     String?  @unique
  createdAt     DateTime @default(now())
  completedAt   DateTime?

  @@index([tutorId, scheduledAt])
  @@index([studentId, scheduledAt])
}

model MarketplaceItem {
  id           String   @id @default(uuid())
  sellerId     String
  seller       User     @relation(fields: [sellerId], references: [id])
  type         String   // notes | study_guide
  title        String
  description  String   @db.Text
  price        Int      // TL
  fileUrl      String   // R2 key (not signed)
  previewText  String?  @db.Text
  tags         Json     // [string]
  rating       Float?
  totalSales   Int      @default(0)
  approved     Boolean  @default(false)
  approvedById String?
  createdAt    DateTime @default(now())

  @@index([approved, type])
  @@index([sellerId])
}

model Payment {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // subscription | marketplace | tutoring
  amount      Int      // kuruş
  currency    String   @default("TRY")
  status      String   // pending | succeeded | failed | refunded | disputed
  provider    String   // iyzico | stripe
  externalId  String?  @unique
  metadata    Json?    // { refId, kind, 3dsStatus }
  createdAt   DateTime @default(now())
  completedAt DateTime?

  @@index([userId, createdAt])
  @@index([status])
}

model UniversityAccount {
  id            String   @id @default(uuid())
  universityId  String   @unique
  university    University @relation(fields: [universityId], references: [id])
  contactEmail  String
  tier          String   // basic | pro | enterprise
  seats         Int
  renewalDate   DateTime
  ssoMetadata   String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

- `User.role UserRole @default(STUDENT)`.
- `User.universityAccountId String?` — B2B öğrenci-üniversite bağı (nullable, soft tenant).
- Back-relations: `User.tutor?`, `User.marketplaceItems[]`, `User.payments[]`, `User.tutoringAsStudent[]`.
- Migration: `npx prisma migrate dev --name phase_7_b2b_marketplace`.

**Test:**
- `npx prisma migrate status` clean, seed çalışıyor.
- Unit: Payment row insert → updatedAt doğru.

**Commit:** "Add Phase 7 Prisma schema — B2B + marketplace + payments + roles"

---

### 7.11 — RBAC Middleware

**Yeni dosya:**
- `server/src/middleware/rbacMiddleware.ts` — `requireRole(["HOCA"])` + `requireRoleOrSelf(role, paramName)` helpers.

**Değişen dosyalar:**
- `server/src/middleware/authMiddleware.ts` — `req.user.role` payload'a eklenir (JWT claims'te de).
- `server/src/services/authService.ts` — login token payload `role` include.
- `server/tests/unit/rbac-middleware.test.ts` (yeni).

**İş:**
- Role hierarchy: `SUPER_ADMIN` her şeyi geçer; `UNIVERSITY_ADMIN` kendi tenant'ı üstünde; `HOCA` + `TUTOR` + `STUDENT` eşit seviye (farklı scope'lar).
- Error: `403 FORBIDDEN_ROLE` + kullanıcıya i18n mesaj ("Bu sayfaya erişim yetkin yok").

**Test:**
- Unit: 5 rol × 5 endpoint matrisi (25 kombinasyon); expected allow/deny.
- Integration: HOCA portal endpoint STUDENT token ile → 403.

**Commit:** "Add RBAC middleware for Phase 7 roles"

---

### 7.12 — Premium + Feature Flag Registry Extend

**Değişen dosya:**
- `server/src/config/premiumFeatures.ts`

**İş:**
- Yeni flag'ler: `TUTOR_MATCHING`, `MARKETPLACE_PRO` (satış kapasitesi; STUDENT default viewer, seller gate premium), `UNIVERSITY_ADMIN` (B2B tenant), `HOCA_PORTAL` (verified hoca), `PAYMENT_SANDBOX` (iyzico sandbox kill switch — prod öncesi güvenli toggle).
- `requirePremium` ile `requireRole` birlikte komp: `requirePremium("TUTOR_MATCHING")` + `requireRole(["STUDENT"])` iki middleware.
- Rate limit quota: tutor search 60/gün, marketplace purchase 10/gün, hoca feedback query 20/gün, university aggregate fetch 100/gün.

**Test:**
- Unit: PAYMENT_SANDBOX off + prod env → iyzico real endpoint; on → mock response.

**Commit:** "Register TUTOR_MATCHING / MARKETPLACE_PRO / UNIVERSITY_ADMIN / HOCA_PORTAL flags"

---

### 7.13 — Payment Gateway Servisi

**Yeni dosyalar:**
- `server/src/services/paymentService.ts`
- `server/src/services/payment/iyzicoProvider.ts` — iyzico SDK wrapper (init, retrieve, refund, 3DS callback).
- `server/src/services/payment/stripeProvider.ts` — fallback (Phase 7 scope'ta tam değil, skeleton — international Phase 8).
- `server/src/services/payment/webhookHandler.ts` — HMAC verify + idempotency key.
- `server/src/jobs/paymentWebhookRetry.ts` — BullMQ worker (maxAttempts 5, exponential).
- `server/src/services/efaturaStub.ts` — e-Fatura placeholder (gerçek entegrasyon Phase 8).

**Değişen dosyalar:**
- `server/package.json` — `iyzipay` (official SDK) + `stripe` (opsiyonel).
- `server/.env.example` — `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL` (sandbox/prod), `STRIPE_SECRET_KEY?`.

**İş:**
- `initPayment({ userId, type, amount, metadata })` → iyzico checkout URL + 3DS required.
- Webhook endpoint `POST /api/payments/webhook/iyzico` — HMAC verify + Payment.update + side-effects (subscription upgrade / marketplace access grant / tutoring booking confirm).
- Idempotency: `externalId` unique; duplicate webhook skip.
- Retry: failed webhook → BullMQ queue `payment-webhook`, backoff 1s/5s/30s/5m/1h.
- Refund: `refundPayment(id, reason)` — iyzico refund API; Payment.status = "refunded".
- 3DS: iframe URL döner, client iframe'le çözer, callback `/checkout/callback` → payment status poll.
- e-Fatura: stub sadece pending state → PDF placeholder URL (Phase 8 gerçek).

**Test:**
- Unit: HMAC mismatched → webhook 401.
- Unit: duplicate externalId → skip (idempotent).
- Unit: iyzico 503 → retry queue'ya enqueue.
- Integration: init + callback + webhook full flow (inline queue mode).
- Integration: refund → subscription downgrade trigger.

**Commit:** "Add payment gateway service (iyzico primary + webhook retry queue)"

---

### 7.14 — Tutor Servisi (Matching Engine)

**Yeni dosyalar:**
- `server/src/services/tutorService.ts`
- `server/src/services/tutorMatchingService.ts` — DNA compatibility + subject filter + rating + hourly rate window.

**İş:**
- `createTutorProfile({ userId, bio, hourlyRate, specializations, availability })` — role STUDENT→TUTOR upgrade (onay sonrası).
- `approveTutor(tutorId, adminId)` — SUPER_ADMIN only; status pending→active + embedding generate.
- `matchTutors({ studentId, subject?, level?, priceMin?, priceMax?, minRating? })`:
  - 1. Subject filter (`Tutor.specializations` JSONB query).
  - 2. Availability filter (student'in zaman aralığıyla kesişim).
  - 3. DNA compatibility score: student DNA'sı × tutor embedding (pgvector cosine + weighted rubric — 50% subject match, 30% rating, 20% DNA similarity).
  - 4. Top-20 dön, 5 dakika cache.
- `bookSession({ tutorId, studentId, scheduledAt, durationMin })` — TutoringSession.create `status=scheduled` + payment init.
- `completeSession({ sessionId, rating, feedback })` — status update + tutor.rating re-aggregate.

**Test:**
- Unit: matching — 5 tutor fixture, student DNA reading-heavy + subject "Math" → expected top 3 order.
- Unit: book + payment fail → TutoringSession rollback (transaction).
- Unit: completion idempotent.

**Commit:** "Add tutor service + matching engine (DNA compatibility + pgvector)"

---

### 7.15 — Marketplace Servisi

**Yeni dosyalar:**
- `server/src/services/marketplaceService.ts`
- `server/src/services/marketplaceModeration.ts` — approval queue.

**İş:**
- `createItem({ sellerId, type, title, description, price, fileUpload })` → R2 upload (7.2) + item.approved=false + admin queue.
- `approveItem(itemId, adminId)` → approved=true + embedding generate.
- `searchItems({ query, type?, priceMin?, priceMax?, sort? })`:
  - Query varsa Gemini embedding + pgvector top-50; else tags/type filter.
  - Pagination page/limit.
- `purchaseItem({ itemId, buyerId })` → Payment init + download grant record (`ItemAccess` ayrı tablo gerek mi? — Phase 7 MVP Payment.metadata.itemId yeterli).
- `calculateCommission(amount, type)` → notes %30, tutoring %15 (spec).

**Test:**
- Unit: commission calc 3 case.
- Unit: approval queue idempotent (aynı item 2 kez approve → no-op).
- Integration: search → approved only + pgvector relevance order.

**Commit:** "Add marketplace service (items + moderation + commission)"

---

### 7.16 — B2B Institutional Servisi (Hoca + Üniversite)

**Yeni dosyalar:**
- `server/src/services/hocaPortalService.ts`
- `server/src/services/universityAdminService.ts`

**İş hoca portal:**
- `getHocaDashboard(hocaUserId)`:
  - Hocanın sahip olduğu Professor row'ları (email domain match + manual link).
  - Her prof için son sömestr mock exam session'larında öğrenci performansı aggregate (k≥5 min).
  - Top-3 struggling topics (Phase 5 confidence score'lardan).
- `getHocaFeedback(hocaUserId)` — anonim student feedback (ProfessorRating + post-exam report excerpt'leri; k≥5).
- `verifyHoca({ userId, universityEmail })` — email domain match + manual review queue (SUPER_ADMIN approve).

**İş üniversite admin:**
- `getUniversityDashboard(tenantId)`:
  - Aktif öğrenci sayısı (ProfAI user × universityAccountId match).
  - Course-level pass rate (MockExamSession performance).
  - Hoca etkinlik skoru.
  - k-anonymity ≥ 5 guard her aggregate'te.
- `manageSeat({ tenantId, userId, action: "add" | "remove" })`.
- `provisionSso({ tenantId, samlMetadata })` — stub, parse + save.

**Test:**
- Unit: k-anonymity violation → "yetersiz veri" branch (n<5).
- Unit: hoca verify wrong email domain → 422.
- Integration: university dashboard aggregate 5 user fixture → top topics döner.

**Commit:** "Add B2B institutional service (hoca portal + university admin)"

---

### 7.17 — REST Endpoints (Phase 7)

**Yeni dosyalar:**
- `server/src/routes/tutorRoutes.ts`
- `server/src/routes/marketplaceRoutes.ts`
- `server/src/routes/paymentRoutes.ts`
- `server/src/routes/universityRoutes.ts`
- `server/src/routes/hocaRoutes.ts`
- `server/src/controllers/tutorController.ts`, `marketplaceController.ts`, `paymentController.ts`, `universityController.ts`, `hocaController.ts`.
- `server/src/schemas/b2b.ts` — Zod şemaları.

**Değişen dosyalar:**
- `server/src/index.ts` — router register.
- `server/src/middleware/rateLimitMiddleware.ts` — `tutorSearchLimiter` (60/gün), `marketplacePurchaseLimiter` (10/gün), `paymentInitLimiter` (20/gün), `universityAdminLimiter` (100/gün), `hocaFeedbackLimiter` (20/gün).

**Endpoint listesi (~25 route):**
- `POST /api/tutors` (self-register TUTOR) + `GET /api/tutors/:id` + `GET /api/tutors/match` (POST with filters) + `PATCH /api/tutors/me`.
- `POST /api/tutoring/sessions` + `GET /api/tutoring/sessions/:id` + `PATCH /api/tutoring/sessions/:id/complete` + `GET /api/tutoring/sessions/me`.
- `POST /api/marketplace/items` (multipart) + `GET /api/marketplace/items` (search) + `GET /api/marketplace/items/:id` + `POST /api/marketplace/items/:id/purchase`.
- `POST /api/payments/init` + `POST /api/payments/webhook/iyzico` (raw body) + `GET /api/payments/me` + `POST /api/payments/:id/refund` (SUPER_ADMIN).
- `GET /api/university/dashboard` + `POST /api/university/seats` + `DELETE /api/university/seats/:userId` + `POST /api/university/sso`.
- `GET /api/hoca/dashboard` + `GET /api/hoca/feedback` + `POST /api/hoca/verify` + `PATCH /api/hoca/profile`.
- Error shape `{ error: { code, message } }` garanti.

**Test:**
- Integration: her endpoint 200 + auth 401 + RBAC 403 + Zod 422 + rate-limit 429.
- Integration: iyzico webhook raw body parse (JSON middleware skip).

**Commit:** "Add Phase 7 B2B + marketplace + payment endpoints"

---

### 7.18 — BullMQ Workers

**Yeni dosyalar:**
- `server/src/jobs/paymentWebhookRetry.ts` (7.13'te başlatıldı, burada complete).
- `server/src/jobs/marketplaceIndexingWorker.ts` — item approve sonrası embedding generate + pgvector insert.
- `server/src/jobs/hocaVerificationWorker.ts` — LinkedIn lookup stub + notification email (şu an console.log, Phase 8 Sendgrid).
- `server/src/jobs/storageGcWorker.ts` (7.2'den devam) — TTL'i aşan dosyalar sil.

**Değişen dosya:**
- `server/src/jobs/runner.ts` — yeni worker'ları register et.

**İş:**
- Tüm worker'lar `registerWorker` + `scheduleRepeating` pattern (5.5).
- `marketplace-index` cron her 10 dk; `hoca-verify` event-driven; `storage-gc` daily 3:00.

**Test:**
- Unit: inline mode her worker idempotent.
- Integration: marketplace-index item approve trigger → embedding doldurulur.

**Commit:** "Add Phase 7 BullMQ workers (payment retry + marketplace indexing + hoca verify + storage GC)"

---

### 7.19 — Backend Tests (Full)

**Yeni dosyalar:**
- `server/tests/unit/tutor-matching.test.ts`
- `server/tests/unit/tutor-service.test.ts`
- `server/tests/unit/marketplace-service.test.ts`
- `server/tests/unit/marketplace-commission.test.ts`
- `server/tests/unit/payment-service.test.ts`
- `server/tests/unit/payment-webhook.test.ts`
- `server/tests/unit/university-admin-service.test.ts`
- `server/tests/unit/hoca-portal-service.test.ts`
- `server/tests/unit/rbac-middleware.test.ts`
- `server/tests/integration/b2b-endpoints.test.ts`
- `server/tests/integration/marketplace-endpoints.test.ts`
- `server/tests/integration/payment-flow.test.ts`
- `server/tests/integration/account-deletion.test.ts`

**İş:**
- DATABASE_URL skip-if-no pattern.
- RBAC matrix: 5 rol × 10 critical endpoint.
- Payment: 3DS success + 3DS fail + webhook retry exhaust + refund.
- Marketplace: commission 3 case + approval queue idempotent + search pgvector order.
- k-anonymity: n=4 → blocked, n=5 → allowed.
- Fallback chain: embedding Gemini 503 → Claude.
- Hedef: ~80 yeni unit + ~15 integration = ~95 yeni test; suite toplamı ~345 yeşil.

**Commit:** "Add Phase 7 backend test coverage"

---

### 7.20 — Client Types + Services + Shared Components

**Yeni dosyalar:**
- `client/src/types/b2b.ts` — `Tutor`, `TutoringSession`, `MarketplaceItem`, `Payment`, `UniversityAccount`, `HocaDashboard`.
- `client/src/services/tutorService.ts`
- `client/src/services/tutoringService.ts`
- `client/src/services/marketplaceService.ts`
- `client/src/services/paymentService.ts`
- `client/src/services/universityService.ts`
- `client/src/services/hocaService.ts`
- `client/src/components/b2b/TutorCard.tsx`
- `client/src/components/b2b/CompatibilityScore.tsx`
- `client/src/components/b2b/PriceTag.tsx`
- `client/src/components/b2b/RatingStars.tsx`
- `client/src/components/b2b/PaymentBadge.tsx`
- `client/src/components/b2b/ApprovalBanner.tsx`
- `client/src/components/b2b/SeatCounter.tsx`
- `client/src/components/b2b/RoleGuard.tsx` — route-level `<RoleGuard roles={["HOCA"]}>` wrapper.

**İş:**
- TanStack Query hooks: `useTutorMatch()`, `useTutorDetail(id)`, `useTutoringSession(id)`, `useMarketplaceItems(filter)`, `usePayment(id)`, `useUniversityDashboard()`, `useHocaDashboard()`.
- Optimistic: marketplace purchase draft + tutor booking reserve (rollback on payment fail).
- `TutorCard` bundle ~3KB gzipped target; avatar reuse.

**Test:**
- Manuel: service smoke (network tab'dan ayrı chunk'lar görünüyor).

**Commit:** "Add Phase 7 client types + services + shared components"

---

### 7.21 — Tutor Marketplace Sayfaları `/tutors` + `/tutors/:id`

**Yeni dosyalar:**
- `client/src/pages/TutorListPage.tsx`
- `client/src/pages/TutorDetailPage.tsx`

**Değişen dosyalar:**
- `client/src/App.tsx` — `/tutors` + `/tutors/:id` lazy route.

**İş:**
- List: filter bar (subject + level + price range + min rating) + `TutorCard` grid + URL state sync (`?subject=&priceMax=&page=`).
- Pagination (ProfessorListPage pattern).
- Detail: profil (bio + specializations + availability calendar + rating histogram) + CompatibilityScore (DNA'dan gelir) + "Ders al" CTA (premium gate STUDENT + TUTOR_MATCHING flag).
- Empty state: "Henüz bu konuda tutor yok; bildirim iste" (Phase 8).

**Test:**
- Manuel: mobile + desktop + light + dark + TR + EN.

**Commit:** "Add tutor marketplace pages (/tutors + /tutors/:id)"

---

### 7.22 — Tutoring Session Flow `/tutoring/sessions/:id`

**Yeni dosya:**
- `client/src/pages/TutoringSessionPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/tutoring/sessions/:id` route.

**İş:**
- State: 7.5'teki TanStack Query pattern'i kopya (scheduled → live → completed → disputed).
- Pre-session: countdown + "Meet linkine git" CTA + "İptal et" (cancellation policy copy).
- Post-session: rating form (1-5 star + feedback textarea) + "Tekrar ders al" CTA.
- In-app mesajlaşma: Phase 7'de placeholder — "Meet chat kullan" + scope dışı pill (Phase 8).

**Test:**
- Manuel: scheduled → completed flow smoke; rating submit optimistic rollback.

**Commit:** "Add tutoring session page (/tutoring/sessions/:id)"

---

### 7.23 — Notes Marketplace `/marketplace` + `/marketplace/:id`

**Yeni dosyalar:**
- `client/src/pages/MarketplaceListPage.tsx`
- `client/src/pages/MarketplaceItemPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/marketplace` + `/marketplace/:id`.

**İş:**
- List: filter (type: notes / study_guide, price, rating, tag), search bar (pgvector-backed), grid.
- Detail: title + açıklama (lazy `<MarkdownRenderer>` 7.7) + preview (ilk 200 karakter) + seller RatingStars + "Satın al" CTA → PaymentCheckout.
- Post-purchase: signed R2 URL ile download.
- Seller dashboard: `/me/marketplace` — kullanıcının satılan + pending item'ları (7.27 Navbar link).

**Test:**
- Manuel: purchase flow (sandbox iyzico) → download button enable.

**Commit:** "Add notes marketplace pages (/marketplace + /marketplace/:id)"

---

### 7.24 — Hoca Portal Sayfaları `/hoca/*`

**Yeni dosyalar:**
- `client/src/pages/hoca/HocaDashboardPage.tsx`
- `client/src/pages/hoca/HocaProfilePage.tsx`
- `client/src/pages/hoca/HocaFeedbackPage.tsx`

**Değişen dosyalar:**
- `client/src/App.tsx` — `<RoleGuard roles={["HOCA"]}>` altında `/hoca/dashboard`, `/hoca/profile`, `/hoca/feedback`.

**İş:**
- Dashboard: verified badge + "Bu sömestr öğrencilerin en çok zorlandığı 3 konu" kartı (k-anonymity pill) + subject-level performance chart (Recharts lazy) + sınıf aggregate difficulty.
- Profile: "hakkımda" textarea + office hours + "publish" toggle.
- Feedback: anonim student feedback listesi (ProfessorRating + post-exam report excerpt'leri); k<5 ise "henüz yeterli veri yok" banner.

**Test:**
- Manuel: STUDENT token `/hoca/dashboard` → 403 redirect + i18n mesaj.

**Commit:** "Add hoca portal pages (/hoca/dashboard + /hoca/profile + /hoca/feedback)"

---

### 7.25 — Üniversite Admin `/admin/university`

**Yeni dosya:**
- `client/src/pages/admin/UniversityAdminPage.tsx`

**Değişen dosyalar:**
- `client/src/App.tsx` — `<RoleGuard roles={["UNIVERSITY_ADMIN", "SUPER_ADMIN"]}>` altında route.

**İş:**
- Tabs: Overview / Seats / Subscription / SSO / Aggregate Insights.
- Overview: aktif öğrenci count + MRR + renewal countdown.
- Seats: user list + add/remove + CSV upload (Phase 8).
- Subscription: tier (basic/pro/enterprise) + upgrade CTA + invoice placeholder.
- SSO: SAML metadata paste box (stub); "Kurumsal email domain doğrula" CTA.
- Insights: course-level pass rate Recharts line + top struggling topics + hoca efektivitesi scatter — her grafik k-anonymity pill.

**Test:**
- Manuel: HOCA token → 403; UNIVERSITY_ADMIN → sayfa render.

**Commit:** "Add university admin dashboard (/admin/university)"

---

### 7.26 — Payment Checkout `/checkout`

**Yeni dosyalar:**
- `client/src/pages/CheckoutPage.tsx`
- `client/src/pages/CheckoutCallbackPage.tsx`
- `client/src/components/payment/IyzicoFrame.tsx` — iyzico 3DS iframe wrapper.

**Değişen dosya:**
- `client/src/App.tsx` — `/checkout` + `/checkout/callback`.

**İş:**
- Query param'la context geçer: `?type=tutoring&sessionId=X` veya `?type=marketplace&itemId=Y` veya `?type=subscription&plan=premium-plus`.
- Mount: `paymentService.init({ type, refId })` → iyzico checkout URL → IyzicoFrame'e gömülür.
- Callback route: `status=success|fail` + `paymentId` → payment status poll (TanStack Query refetch interval 2sn, max 30sn).
- Success: ilgili resource'a redirect (session / item / dashboard).
- Fail: retry CTA + "Farklı kart dene" + ekstra hata kodu i18n mapping.
- e-Fatura placeholder: "Faturan e-posta ile gönderilecek" notice.

**Test:**
- Manuel: sandbox iyzico success + fail path; mobile responsive iframe.

**Commit:** "Add payment checkout + 3DS callback pages"

---

### 7.27 — Navbar + Dashboard + Role-Aware Navigation

**Değişen dosyalar:**
- `client/src/components/Navbar.tsx` — role-based menu:
  - STUDENT: mevcut + "Tutorlar" + "Marketplace" linkleri.
  - HOCA: Hoca Dashboard + Feedback + Profile.
  - UNIVERSITY_ADMIN: University Admin.
  - TUTOR: "Oturumlarım" + "Tutor profili".
  - SUPER_ADMIN: Admin hub (moderation queue + all approvals).
- `client/src/pages/DashboardPage.tsx` — role-aware hero + quick actions row'a "Tutor bul" + "Notlarını sat" + "Marketplace'te keşfet".
- `client/src/components/RoleSwitcher.tsx` (opsiyonel) — SUPER_ADMIN için role impersonation (Phase 8'de formal).

**Test:**
- Manuel: her role farklı menu; mobile drawer consistent.

**Commit:** "Wire Phase 7 role-aware navigation + dashboard entry points"

---

### 7.28 — i18n TR + EN Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni namespace: `tutoring.*`, `marketplace.*`, `payment.*`, `university.*`, `hoca.*`, `roles.*`, `checkout.*`.
- Phase 6 pattern: manuel sweep (paralel agent Phase 5+6'da daha yavaş çıktı — manuel devam).
- `copy-tone-guide.md` referans; B2B sayfalar profesyonel + motivasyonel balans; payment sayfası kısa + net + güven verici ("kartın bilgisi bizde saklanmaz, iyzico güvenli çözüm").
- Hassas alanlar:
  - Payment fail → "Bir şey ters gitti ama paran güvende; tekrar denemeyi istersen aşağıdan."
  - Approval pending (marketplace item) → "Moderasyondayız; genellikle 24 saat içinde sonuç alırsın."
  - Role 403 → "Bu bölüm senin için değil; farklı bir hesapla giriş yapmak gerekebilir."
  - Hoca feedback empty → "Henüz yeterli geri dönüş yok (en az 5 öğrenci gerekli)."
  - Seats full → "Koltuk doldu; admin'e bildirilsin mi?"
- Key parity: Phase 6 sonu 653; hedef ~830-900.

**Test:**
- Manuel: her yeni sayfa TR + EN switch; tüm stringler çevrili.

**Commit:** "Add Phase 7 i18n copy (tutoring + marketplace + payment + university + hoca + roles + checkout)"

---

### 7.29 — KVKK v2 + `/privacy` Update

**Değişen dosyalar:**
- `docs/operations/kvkk-aydinlatma.md` — Phase 7 bölümü ekle:
  - D. Marketplace satın alma geçmişi (Payment kategorisi).
  - E. Tutor booking + session transkripti.
  - F. B2B üniversite × öğrenci tenant ilişkisi (UniversityAccount).
  - G. SSO metadata (SAML) saklama.
- `client/src/pages/PrivacyPage.tsx` (6.25'ten) — yeni bölümleri render + "Verilerimi sil" linki 7.30'a.
- `docs/operations/kvkk-review-log.md` (yeni) — avukat review tur 1 (Phase 6) + tur 2 (Phase 7 ship öncesi) kayıtları.

**İş:**
- Payment kayıtları "silinmez, anonimleştirilir" KVKK defter tutma yükümlülüğü ile uyumlu açıklama.
- B2B senaryo: üniversite admin öğrenci listesini görebilir mi? — hayır, sadece aggregate k≥5.
- Avukat review tur 2 tahmini: 2026-04-28 öncesi (ship blocker).

**Test:**
- Manuel: `/privacy` her bölüm render; TR + EN.

**Commit:** "Update KVKK privacy notice for Phase 7 B2B + marketplace flows"

---

### 7.30 — Account Deletion UI

**Yeni dosya:**
- `client/src/components/settings/DeleteAccountDialog.tsx`

**Değişen dosyalar:**
- `client/src/pages/ReviewsPage.tsx` (settings tab) veya ayrı `/me/settings` (yoksa minimal) — "Tehlikeli bölge" bölümü + "Hesabımı sil" CTA.
- `client/src/i18n/locales/*.json` — `privacy.deleteAccount.*`.

**İş:**
- Dialog: uyarı metni + "Tüm verilerim (voice/ocr/lectures/marketplace/payments...) silinecek" checklist + parola re-entry + 10 saniye delay (yanlış tık koruması).
- Success: logout + landing page + TR/EN "Hesabın silindi; geri gelmek istersen kapı açık" copy.
- Fail: "Parolanı doğru gir" + retry.

**Test:**
- Manuel: delete → tüm data cascaded (7.4 integration test ile paralel).

**Commit:** "Add account deletion UI (settings dialog + cascade confirmation)"

---

### 7.31 — Playwright MCP Visual Smoke + Fixture Seeder

**Yeni dosya:**
- `scripts/seed-phase-7-fixture.ts` — idempotent Phase 7 fixture:
  - Demo user (Phase 6 fixture öncelik çağırır — subscriptionTier=premium) + 2 yeni fixture user: `tutor@profai.local` (role=TUTOR), `hoca@aydin.edu.tr` (role=HOCA), `admin@aydin.edu.tr` (role=UNIVERSITY_ADMIN).
  - 5 Tutor (farklı rating + hourly rate) + availability.
  - 3 TutoringSession (1 scheduled + 1 completed + 1 cancelled).
  - 10 MarketplaceItem (7 approved + 3 pending).
  - 5 Payment (farklı status: succeeded/pending/failed).
  - 1 UniversityAccount (Aydın Üniversitesi, tier=pro, 100 seats).
  - Light mode toggle helper (7.6) her screenshot'ta kullanılacak.

**Senaryolar:**
- `/tutors` · 1440 + 390 · light & dark — filter + grid.
- `/tutors/:id` · 1440 · light — detay + compatibility badge.
- `/tutoring/sessions/:id` · 1440 · light — scheduled + completed states.
- `/marketplace` · 1440 + 390 · light — grid + filter.
- `/marketplace/:id` · 1440 · light — detay + purchase CTA.
- `/checkout` · 1440 · light — iframe mount (iyzico sandbox stub).
- `/hoca/dashboard` · 1440 · light — verified badge + struggling topics.
- `/hoca/feedback` · 1440 · light — anonim feedback + k<5 banner.
- `/admin/university` · 1440 · light — 5 tab all.
- Dashboard · 1440 · light — STUDENT/HOCA/UNIVERSITY_ADMIN role-aware hero (3 screenshot).
- Navbar role switcher.
- `/privacy` · 1440 · light — Phase 7 bölümleri + delete CTA.

**Bug count:** takip tablosu (Phase 4+5+6 pattern).

**Commit:** "Add Phase 7 Playwright visual smoke + fixture seeder"

---

### 7.32 — Phase 7 Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-7-b2b-marketplace.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri + "Phase 8'e Geçerken Hazır Olanlar".
- `docs/roadmap/README.md` — Phase 7 "🎯 Sıradaki" → "✅ Tamamlandı" + Phase 8 spotlight (go-to-market / refresh / ertele kararı burada).
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — `docs/_archive/scratchpad-*-YYYY-MM-DD-phase-7.md`'ye dondur; Phase 8 / go-to-market için reset.
- `docs/tasks/phase-7-breakdown.md` — tüm task ✅ + commit hash.
- `docs/architecture/data-model-evolution.md` — Phase 7 tabloları (Tutor/TutoringSession/MarketplaceItem/Payment/UniversityAccount) + UserRole + pgvector + R2.
- `docs/architecture/ai-pipeline.md` — embeddingService + pgvector similarity + matchingService.
- `docs/architecture/current-stack.md` — iyzico + R2 + pgvector + ioredis-as-cache.
- `docs/tasks/open-questions.md` — T1 (cache Redis), T2 (storage R2), İ1 (ilk hedef Aydın), H2 (üniversite ortaklık modeli), H3 (hoca onay süreci) kapanış işaretleri.
- `docs/operations/kpis.md` — Phase 7 hedefler (100 hoca verified, 10 üniversite, 100K ay GMV, 500 session).
- `docs/operations/risks.md` — Phase 7 payment fraud + marketplace kalite + avukat review gecikmesi riskleri güncelle.

**Commit:** "Close out Phase 7 — B2B + marketplace + payments shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark + mobile — UI task'larında; payment flow'unda iyzico sandbox; RBAC'te her rol için).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz).
- [ ] Acceptance criteria kısmı ✅ (`phase-7-b2b-marketplace.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 6'dan Yeniden Kullanılacak Altyapı

- **Multi-provider AI registry** (6.3) — tutor matching + marketplace search + hoca dashboard narrative tutorlu fallback; 7.8 ile genişleme tamamlanır.
- **BullMQ + Redis** (5.5) — payment webhook retry + marketplace indexing + hoca verification + storage GC doğrudan `registerWorker` + `scheduleRepeating` pattern.
- **pino logger + request_id** (6.4) — `featureLogger.child({ tenant, userId })` B2B multi-tenant log ayrıştırma için hazır.
- **asyncHandler + AppError + errorMiddleware + client api.ts interceptor** (6.2) — Phase 7 endpoint'leri baştan tek shape.
- **Premium flag registry** (5.14 + 6.9) — TUTOR_MATCHING + MARKETPLACE_PRO + UNIVERSITY_ADMIN + HOCA_PORTAL eklemek tek satır (7.12).
- **Rate-limit factory** — 5 yeni limiter aynı factory'den.
- **Zod + `parseOrRespond<S>`** — Phase 7 endpoint'leri baştan Zod.
- **Per-worker test DB isolation** (6.1) — Phase 7 ~95 yeni test, 4 worker paralel <15s hedef.
- **anonymizedHash + k-anonymity** (4.x) — tutor performans metrikleri + marketplace popülarite + hoca feedback + üniversite aggregate hepsi reuse.
- **TanStack Query optimistic rollback** (5.x + 6.x) — payment state + booking + marketplace purchase aynı pattern.
- **InsufficientDataBanner + PremiumLockCard** (5.17) — hoca feedback k<5 + marketplace premium gate + university admin aggregate hepsi reuse.
- **Fixture seeder template** (6.26 `seed-phase-6-fixture.ts`) — 7.31 kopyala-uyarla.
- **Hybrid tone guide** — 6 faz tutarlı; Phase 7 payment copy özellikle güven + netlik.
- **KVKK disclaimer + /privacy route** (6.25) — Phase 7 B2B genişlemesi aynı sayfaya 4 yeni bölüm.
- **`AICallLog.feature`** — Phase 7 yeni feature adları: `"tutor-match"`, `"marketplace-search"`, `"hoca-dashboard-narrative"`, `"embedding-generate"`.
- **`User.subscriptionTier`** — Phase 7 4 yeni flag bu kolona bakıyor.
- **Playwright MCP smoke** (6.26) — 7.31 aynı fixture pattern + light-mode toggle click (7.6 helper).

---

## Açık Karar Noktaları (İlk Sprint'te Çözülmeli)

- **T1 cache karar: Redis** — BullMQ Redis singleton'ını cache olarak extend et; in-process LRU sadece test + dev fallback. Commit 7.1.
- **T2 storage karar: Cloudflare R2** — egress free, S3 API. Minio docker-compose opsiyonel. Commit 7.2.
- **Payment gateway karar: iyzico primary** (TR focus, spec ile uyumlu). Stripe placeholder Phase 8. e-Fatura 7.13 stub, Phase 8 real.
- **Multi-tenancy: soft tenant** — `User.universityAccountId` nullable FK; hard tenant (tamamen ayrı schema) Phase 8+ enterprise için. Commit 7.10.
- **RBAC: 5 rol** (STUDENT + HOCA + TUTOR + UNIVERSITY_ADMIN + SUPER_ADMIN). Role impersonation SUPER_ADMIN için Phase 8.
- **Tutor matching score rubric: 50% subject + 30% rating + 20% DNA embedding** — A/B test Phase 8.
- **Marketplace commission: notes %30 + tutoring %15** (spec).
- **Hoca verify: A (email + LinkedIn, manual review)** — H3 kapanış. Phase 7 manual queue, Phase 8 auto-verify deneme.
- **Üniversite ortaklık modeli: C (free + brand association) ilk 5 pilot** — H2 kapanış. Sonra B (lisans ücreti) Phase 8'de.
- **İlk hedef üniversite: A (İstanbul Aydın)** — İ1 kapanış. Hoca Peri Güneş + UYG338 ders bağlamı zaten var; pilot için net.
- **Payment currency: TRY only** — Phase 7 TR odaklı; USD/EUR Phase 8.
- **Seat management: manuel CSV + tek tek add/remove** — Phase 7 MVP. SCIM / Azure AD sync Phase 8.
- **SSO: SAML metadata paste stub** — Phase 7 placeholder; gerçek SAML parse + SP IdP flow Phase 8.
- **In-app messaging: placeholder** — Phase 7'de "Google Meet chat kullan" + scope dışı pill; Phase 8 gerçek.
- **Refund policy: SUPER_ADMIN only, 7 gün içinde** — Phase 7 basit; self-serve refund Phase 8.
- **Marketplace moderation: SUPER_ADMIN queue** — otomatik moderation (profanity / plagiarism) Phase 8.

---

## Riskler (Uygulama Sırasında)

- **iyzico sandbox erişim** — kayıt + test kart numaraları gerekli. Mitigasyon: 7.13 ilk iş, fallback paddle/stripe interface hazır.
- **pgvector Postgres imaj değişikliği** — mevcut `postgres:15` → `pgvector/pgvector:pg15` docker-compose güncellemesi; data preserve. Mitigasyon: `./scripts/rebuild-volumes.sh --with-db` sonrası seed.
- **R2 credential setup** — Cloudflare account + API token + bucket create. Mitigasyon: 7.2'de local fallback provider korunur; R2 credential yoksa dev çalışır.
- **Payment webhook HMAC** — iyzico signature validation yanlış olursa tüm webhook 401. Mitigasyon: unit test HMAC fixture; sandbox ile integration dry-run.
- **Multi-tenancy N+1 query** — üniversite admin aggregate insights seat başına user query yapabilir. Mitigasyon: batched select + cache (7.1).
- **RBAC bypass** — SUPER_ADMIN yetkilerinin istismarı. Mitigasyon: audit log (AICallLog'a benzer `AdminActionLog` — Phase 8'e kaydırılabilir, Phase 7 MVP'de sadece pino log).
- **Hoca verify dolandırıcılık** — sahte hoca hesabı. Mitigasyon: email domain + manuel review + LinkedIn link check (7.16).
- **Marketplace kopyala-yapıştır içerik** — başka öğrencinin notunu satma. Mitigasyon: moderation queue + rating + DMCA takedown email stub (Phase 8 real).
- **Avukat review tur 2 gecikmesi** — 7.29 ship blocker. Mitigasyon: metin draft Phase 7 orta noktasında hazır; review 2 hafta önce başla.
- **Account deletion race condition** — kullanıcı delete sırasında aynı anda mock exam submit'e başlarsa. Mitigasyon: transaction + `User.status = "purging"` + request reject.
- **Payment idempotency** — webhook + manual retry çakışması. Mitigasyon: `externalId` unique constraint + select-for-update.
- **Embedding cost** — her marketplace item + tutor için embedding Gemini call. Mitigasyon: batched API + 10dk cache + Claude fallback. 100 item + 50 tutor = ~150 embedding × $0.0001 = negligible.
- **Docker memory** — iyzico SDK + R2 SDK + pgvector Postgres + BullMQ workers birlikte container RAM'i aşabilir. Mitigasyon: docker-compose resource limits + healthcheck (6.7 pattern).
- **Role impersonation mistake** — SUPER_ADMIN yanlış role'e geçerse data leak. Mitigasyon: Phase 7 impersonation scope dışı; SUPER_ADMIN kendi rolünde + apprendişi (UI warning banner).
- **3DS browser quirk** — Safari iOS iframe sandbox restrictions. Mitigasyon: `/checkout` sayfası same-origin iframe; fallback new tab redirect.
- **KVKK avukat çekinceleri** — B2B veri akışı "üniversite admin öğrenci listesini görebilir mi?" — net cevap "hayır, k≥5 aggregate only". Mitigasyon: 7.29 metin tur 2 öncesi avukat danışılır.
- **vitest 4 regresyonu** — Phase 7 ~95 yeni test, 4 worker paralel schema isolation bazı concurrent payment testlerinde race condition yaratabilir. Mitigasyon: problematic test'ler `sequential` flag ile ayrıştır (Phase 6'da denenmedi, Phase 7'de ihtiyaç olabilir).
- **Bundle size** — iyzico JS (60KB gzipped) + markdown renderer + charts birlikte initial bundle'ı aşabilir. Mitigasyon: iyzico JS checkout sayfasında lazy (7.26); marketplace detail page markdown lazy (7.7).

---

## Başarı Ölçütleri (Faz Sonu)

| Metrik | Hedef |
|--------|-------|
| RBAC matrix test coverage | 25/25 kombinasyon yeşil |
| Tutor matching latency | < 800ms cold (pgvector + cache hit) |
| Payment webhook retry success | %99+ (5 retry içinde) |
| Marketplace search response | < 500ms (pgvector + Redis cache) |
| University aggregate k-anonymity | 100% (n<5 → blocked) |
| Hoca verify queue processing | < 24h average (manual) |
| Backend suite | ~345 yeşil (249 + ~95 yeni) |
| Unit tests added | ~80 + ~15 integration = ~95 |
| i18n key parity TR↔EN | 100% (~830-900) |
| Acceptance criteria met | 6/6 |
| Visual smoke bug count | ≤ 2 |
| Bundle size (gzipped) | < 130KB initial (iyzico + markdown lazy chunks) |
| AI provider fallback engaged | Test suite'te 8/8 senaryo (matching + embedding + narrative + dashboard) |
| pgvector index query | < 100ms p95 |
| R2 signed URL latency | < 200ms |
| KVKK avukat review tur 2 | Ship öncesi tamam (H1 tur 2 kapanış) |
| T1/T2/İ1/H2/H3 open-questions | Kapanış işareti |

---

## İlgili

- Faz detay: [`../roadmap/phase-7-b2b-marketplace.md`](../roadmap/phase-7-b2b-marketplace.md)
- Phase 6 retro: [`../roadmap/phase-6-multimodal.md#öğrenilenler-retro`](../roadmap/phase-6-multimodal.md)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- AI pipeline: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md)
- Data model evrimi: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md)
- KVKK metin: [`../operations/kvkk-aydinlatma.md`](../operations/kvkk-aydinlatma.md)
- Açık sorular: [`open-questions.md`](./open-questions.md) (T1, T2, İ1, H2, H3 Phase 7'de kapanış adayı; H1 avukat review tur 2)
