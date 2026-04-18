# Phase 6 — Task Breakdown

**Faz:** [Multimodal + Live AI Tutor](../roadmap/phase-6-multimodal.md)
**Toplam tahmini süre:** 3 hafta (planlama) · Phase 1-5 ritmiyle muhtemelen 1-2 tam oturum (~16-22 saat)
**Hedef commit sayısı:** 25-28 küçük, bağımsız commit

---

## Öncelik Sırası (Sprint Order)

Phase 3+4+5 retro düzeni korundu: **borçlar önce** (8), backend core ortada (6), backend infra + endpoint + test (3), frontend (7), polish (3), close (1).

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 6.1 | vitest 2→4 upgrade + per-worker schema default flip (D1 kapanışı) | 4 saat | — | ✅ Tamam | `b96522a` |
| 6.2 | Phase 0/1 error shape migration — 6 controller + client `api.ts` interceptor (50+ call) | 4 saat | 5.3 infra | ✅ Tamam | `1985d30` |
| 6.3 | Multi-provider AI abstraction (T4 kapanışı) — Gemini primary + Claude fallback interface | 3 saat | — | ✅ Tamam | `bc24edf` |
| 6.4 | pino structured logging — console.log/warn → pino + request_id + AI call log | 3 saat | — | ✅ Tamam | `57a8ee3` |
| 6.5 | Prisma JSON field Zod parse helpers — 3 `as unknown as X` cast'i temizle | 2 saat | — | ✅ Tamam | `e5e0dcf` |
| 6.6 | Style-profile cache-hit integration test — cache warmup hook + 5.16 skip'i aç | 2 saat | 6.1 | ✅ Tamam | `a4975cd` |
| 6.7 | Docker rebuild workflow standardize — `.dockerignore` + `scripts/rebuild-volumes.sh` | 1 saat | — | ✅ Tamam | `d3770a1` |
| 6.8 | Prisma schema — `VoiceSession` + `OCRResult` + `PushDevice` + `VoiceUsage` tabloları + migration | 3 saat | — | ✅ Tamam | `ab1b8d0` |
| 6.9 | Premium feature flag registry extend — `VOICE_TUTOR` / `OCR_PRO` / `LECTURE_TRANSCRIBE` / `MULTIMODAL_SEARCH` | 1 saat | 6.8 | ⬜ | — |
| 6.10 | OCR servisi — Gemini multimodal + Vision fallback + LaTeX formül çıkarımı + rate limit | 5 saat | 6.3, 6.8, 6.9 | ⬜ | — |
| 6.11 | Voice session servisi — Gemini Live API provider + transcript aggregation + usage cap (30dk/gün) | 6 saat | 6.3, 6.8, 6.9 | ⬜ | — |
| 6.12 | Lecture audio analiz — BullMQ queue + Gemini multimodal audio + 60dk < 5dk target | 5 saat | 6.3, 6.8, 6.9 | ⬜ | — |
| 6.13 | Multimodal similarity search — image embedding + nearest question lookup | 4 saat | 6.3, 6.8, 6.9 | ⬜ | — |
| 6.14 | Push notification altyapısı — FCM web push + `PushDevice` registration + spaced rep delivery | 4 saat | 6.8 | ⬜ | — |
| 6.15 | REST endpoints — voice/ocr/lecture/multimodal/push (14+ route) + Zod + premium gate + 4 yeni limiter | 4 saat | 6.10–6.14 | ⬜ | — |
| 6.16 | Backend tests — voice + OCR + lecture + multimodal + push + provider fallback (70+ unit, 10+ integration) | 5 saat | 6.15 | ⬜ | — |
| 6.17 | Client types + 5 services + shared components (`VoiceRecorder` + `AudioStreamer` + `TranscriptView` + `CameraCapture` + `LatexRenderer` + `PushPermissionCard`) | 5 saat | 6.15 | ⬜ | — |
| 6.18 | Voice tutor sayfası `/tutor` — WebRTC/WebSocket state machine + mic + waveform + canlı transcript + interruption | 6 saat | 6.17 | ⬜ | — |
| 6.19 | OCR upload sayfası `/me/ocr` — camera capture + file picker + LaTeX preview + "notlarıma ekle" + study pack input | 4 saat | 6.17 | ⬜ | — |
| 6.20 | Lecture audio sayfası `/me/lectures` — upload + progress + transcript view + key topic list | 4 saat | 6.17 | ⬜ | — |
| 6.21 | Multimodal search sayfası `/search/multimodal` — formül fotoğrafla benzer soru bul | 3 saat | 6.17 | ⬜ | — |
| 6.22 | Navbar + Dashboard entegrasyonu — voice quick action + OCR notlar linki + lectures + multimodal | 2 saat | 6.18–6.21 | ⬜ | — |
| 6.23 | Push notification registration UI — settings drawer + browser prompt + test gönderim | 2 saat | 6.14, 6.17 | ⬜ | — |
| 6.24 | i18n TR + EN copy sweep — `voice.*` / `ocr.*` / `lectures.*` / `multimodal.*` / `pushNotifications.*` / `privacy.*` | 3 saat | 6.18–6.23 | ⬜ | — |
| 6.25 | KVKK aydınlatma metni güncellemesi (H1) — voice transcript + OCR PII kapsamı; avukat review placeholder | 2 saat | 6.11, 6.10 | ⬜ | — |
| 6.26 | Playwright MCP visual smoke + `scripts/seed-phase-6-fixture.ts` (+ reset-demo hook) | 3 saat | 6.24 | ⬜ | — |
| 6.27 | Phase 6 kapanışı — phase-6-multimodal.md retro + roadmap README + scratchpad archive + open-questions | 1 saat | Hepsi | ⬜ | — |

**Toplam:** ~90 saat tahmin · Phase 1-5 ritmiyle 1-2 tam oturum beklenir.

> Task sayısı 27'ye ulaştı (Phase 5: 25). Borç listesi bir fazla (multi-provider + pino + Docker + JSON typing ayrı), frontend'de 4 farklı yeni sayfa (voice + OCR + lectures + multimodal) + push settings UI ayrıldığı için.

---

## Phase 5 Retro'sundan Scope'a Dahil Edilen Borçlar

| Borç | Task | Neden şimdi |
|------|------|-------------|
| vitest 2→4 upgrade (D1 kısmen açık) | **6.1** | Phase 5 sonunda 229/230 test yeşil, 1 skip + 6 kırık test refactor'u erteliydi. Phase 6 ~300 test'e çıkacak — singleFork default kalırsa CI süresi iki katına gider. `vi.mock` factory semantics + per-worker schema flip birlikte temiz. |
| Phase 0/1 error shape migration | **6.2** | 5.3'te middleware kuruldu, 50+ `res.json({ error: "..." })` call'ı hâlâ auth/professor/course/note/rating/exam controller'ında. Phase 6 endpoint'leri baştan doğru shape'le geliyor; geri kalan legacy'nin bir elden temizlenmesi client `api.ts` interceptor'ını tek branch'e indiriyor. |
| Multi-provider AI (T4 açık) | **6.3** | Phase 6 voice tutor + lecture transcribe Gemini Live'a doğrudan bağımlı. Geo-restriction riski spec'te yüksek (Gemini Live erişimi). Claude + OpenAI Realtime fallback abstraction'u voice'tan önce kurulmalı, sonrasında provider swap config değişikliği olsun. |
| pino structured logging | **6.4** | Voice session başına 5-10 log satırı + OCR request per-image + push delivery attempt gibi gürültülü feature'lar Phase 6'da açılıyor. `console.log`/`console.warn` dağınık kalırsa debug cehennemi; şimdi request_id propagation ile taze başla. |
| Prisma JSON field Zod parse (teknik borç) | **6.5** | DNA `strengths`, confidence `source`, course advisor `warnings` için 3 `as unknown as X` cast var. Phase 6 VoiceSession.topics + OCRResult.latexFormulas Json field'ları aynı tuzaktan geçecek; Zod helper'ı bir kere kurulsun. |
| Style-profile cache-hit integration test | **6.6** | 5.2'de per-worker schema isolation altında skip edilmişti (fallback Gemini call 8sn → cache ready değil). vitest 4'e geçince (6.1) cache warmup hook'uyla geri açılır. |
| Docker rebuild workflow standardize | **6.7** | 5.24'te BullMQ + ioredis için volume sil + recreate gerekti. `.dockerignore` yok, rebuild script yok. Phase 6 FCM admin SDK + (muhtemelen) MediaPipe gibi yeni native bindings ekleyecek — aynı tuzağı tekrar yaşamayalım. |
| Demo user credit reset fixture hook | **6.26 içinde** | 5.6'da script var, Phase 5 fixture seeder henüz hook olarak çağırmıyordu. Phase 6 fixture'ı (`seed-phase-6-fixture.ts`) yazılırken reset-demo-user öncelikle çağrılsın (idempotent). |
| H1 KVKK aydınlatma metni | **6.25** | Avukat review şart. Voice transcript (tam konuşma kaydı) + OCR (el yazısı notlar / dersleri içeren görseller) kişisel veri yüzeyini ciddi büyütüyor. Phase 6 sonu ship öncesi metin hazır olmalı. |

---

## Detaylı Task'lar

### 6.1 — vitest 2→4 + Per-Worker Schema Default Flip

**Değişen dosyalar:**
- `server/package.json` + `client/package.json` — vitest 2→4 (+ `@vitest/coverage-v8` bump).
- `server/vitest.config.ts` — `poolOptions.forks.singleFork: false` (default); `globalSetup` per-worker schema path doğrulama.
- `server/tests/unit/textExtract.test.ts` — `vi.mock` factory `vi.hoisted` ile sarmalla (pdf-parse constructor).
- `server/tests/helpers/testDb.ts` — 5.2'de opt-in kurulan `test_worker_${poolId}` pattern'ı default'a çevir.
- 5 DB-backed unit test — `VITEST_WORKER_COUNT=4` zaten çalışır hale getiren skip/guard'ları temizle.

**İş:**
- `npm install vitest@^4 @vitest/coverage-v8@^4` her iki pakette.
- `vi.hoisted` gerekirse mock factory wrap (D1 kırık listesinden 6 test tek tek smoke).
- Per-worker schema `globalSetup` + `globalTeardown` drop (CI kirlenme engelle).
- Suite hedef: 229+6 test yeşil, `singleFork: false` toplam süre ölçüm.
- D1 kapanış: `docs/tasks/open-questions.md` → "✅ Kapatıldı (2026-04-XX)" + etki.

**Test:**
- `npm test` — server 235+ yeşil, worker ≥ 2, 40001 retry yok.
- Client smoke aynı.

**Commit:** "Upgrade vitest 2→4; flip per-worker test DB isolation to default"

---

### 6.2 — Phase 0/1 Error Shape Migration + Client Interceptor

**Değişen dosyalar:**
- `server/src/controllers/authController.ts` — login/register/me response 6 call.
- `server/src/controllers/professorController.ts` — list/detail/create 8+ call.
- `server/src/controllers/courseController.ts`, `noteController.ts`, `ratingController.ts`, `examController.ts` — geriye kalan 35+ call.
- `server/src/middleware/errorMiddleware.ts` — unknown error fallback'i sıkılaştır (stack leak engelle).
- `client/src/services/api.ts` — axios interceptor: yanlızca yeni shape'i handle et (eski string branch'i sil); `AxiosError<{error: {code, message}}>` default typing.

**İş:**
- Her `res.status(4xx).json({ error: "..." })` → `throw new AppError(code, message, status)` → `next(err)` (route handler async wrapper).
- Uygun error code'lar: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_FAILED`, `FORBIDDEN`, `RATE_LIMITED`, `INTERNAL` (AppError factory helper'ları 5.3'te hazır).
- Client interceptor: `error.response?.data?.error?.code` → i18n key mapping; fallback "UNKNOWN".

**Test:**
- Integration: her controller'da 1 negative path test (401/404/422); shape `{ error: { code, message } }`.
- Smoke: login invalid → TR UI'da "Geçersiz e-posta veya parola" (i18n key'i).

**Commit:** "Migrate Phase 0/1 controllers to AppError; tighten client error interceptor"

---

### 6.3 — Multi-Provider AI Abstraction (T4 Kapanışı)

**Yeni dosyalar:**
- `server/src/services/llm/providerRegistry.ts` — provider interface (`generateText`, `generateStructured`, `generateMultimodal`, `liveSession`).
- `server/src/services/llm/claudeProvider.ts` — Claude 3.7 Sonnet veya Opus 4.7 text + multimodal.
- `server/src/services/llm/openaiRealtimeProvider.ts` — sadece voice fallback skeleton (Phase 6'da aktif değilse placeholder + flag).

**Değişen dosyalar:**
- `server/src/services/llm/geminiProvider.ts` — registry'ye uy; `getClient` public kalsın (5.14'te expose edildi).
- `server/src/services/analysisService.ts` + `postExamReportService.ts` + `dnaService.ts` — her `getGeminiModel()` → `registry.primary()` + `registry.fallback()` chain (retry on 503).
- `server/src/config/env.ts` (yoksa `server/.env.example`) — `CLAUDE_API_KEY` + `OPENAI_API_KEY` + `AI_PROVIDER_PRIMARY=gemini` + `AI_PROVIDER_FALLBACK=claude`.

**İş:**
- Interface ufak tut — `generateStructured<T>(prompt, schema, opts)` + `generateMultimodal(prompt, media, opts)` + `liveSession(opts)` (Gemini Live specific; Claude'da stub).
- Retry policy: primary 503/429/timeout → fallback tek retry.
- `AICallLog.provider` kolonu (string) — migration 6.8'le birlikte.
- T4 kapanış: `open-questions.md` → "✅ Kapatıldı (2026-04-XX)".

**Test:**
- Unit: primary timeout → fallback çağrılır + log'a "fallback: true" düşer.
- Unit: structured parse her iki provider'da aynı shape döner (mock).

**Commit:** "Introduce multi-provider AI registry (Gemini primary + Claude fallback)"

---

### 6.4 — pino Structured Logging

**Yeni dosya:**
- `server/src/lib/logger.ts` — `pino` singleton; dev pretty-print, prod JSON; `httpLogger` pino-http middleware wrapper.

**Değişen dosyalar:**
- `server/package.json` — `pino`, `pino-http`, `pino-pretty` (dev).
- `server/src/index.ts` — `httpLogger` middleware mount; request_id propagation (`x-request-id` header).
- `server/src/services/llm/*.ts` — her AI call: `logger.info({ provider, feature, latency, tokenCount })`.
- `server/src/middleware/errorMiddleware.ts` — `logger.error({ err, requestId })` (stack sadece dev).
- 20+ dosyadaki `console.log`/`console.warn` → `logger.info`/`logger.warn` (controller + service + jobs).

**İş:**
- Log seviyeleri: dev `debug`, prod `info`, test `silent`.
- Request_id: `req.id = randomUUID()`; downstream'e `req.log.child({ requestId })` geçir.
- AI call log: `feature`, `provider`, `model`, `latencyMs`, `inputTokens`, `outputTokens`, `fallback` field'ları minimum.

**Test:**
- Integration: request → log satırında `requestId` aynı.
- Unit: `logger.child({ feature: "voice" })` doğru pipeline'a yazıyor.

**Commit:** "Add pino structured logging; replace console calls across server"

---

### 6.5 — Prisma JSON Field Zod Parse Helpers

**Yeni dosya:**
- `server/src/lib/jsonField.ts` — `parseJsonField<T>(value: Prisma.JsonValue, schema: ZodSchema<T>): T` + `stringifyJsonField` (type-safe).

**Değişen dosyalar:**
- `server/src/services/dnaService.ts` — `strengths` / `weaknesses` cast'leri Zod parse'a çevir (3 yer: getDNA, recomputeDNA, cache fetch).
- `server/src/services/confidenceService.ts` — `source` JSON cast.
- `server/src/services/courseAdvisorService.ts` — `warnings` / `reasons` JSON.
- Yeni: VoiceSession.topics + OCRResult.latexFormulas için `parseJsonField` kullanımı (6.11 + 6.10 doğrudan başından temiz).

**İş:**
- Her JSON field için Zod schema: `z.array(z.object({ topic: z.string(), score: z.number() }))` gibi.
- `as unknown as X` cast'lerini tek tek söküp `parseJsonField(raw, Schema)` ile değiştir.
- Parse hatası → `logger.warn({ userId, field })` + empty array fallback (data corruption tolerance).

**Test:**
- Unit: geçersiz JSON → empty + warn logged.
- Unit: valid JSON → typed result.

**Commit:** "Replace Prisma JsonValue casts with Zod parseJsonField"

---

### 6.6 — Style-Profile Cache-Hit Integration Test

**Değişen dosyalar:**
- `server/src/services/styleProfileService.ts` — `warmupCache(professorId)` export (test + cron kullanabilir).
- `server/tests/integration/style-profile.test.ts` — 5.16'daki `.skip` kaldır, `warmupCache` ile seed + 2. call cache hit doğrula.
- `server/src/jobs/styleProfileWarmup.ts` (yeni, opsiyonel) — BullMQ `style-profile-warmup` günlük job (her hoca için stale cache refresh).

**İş:**
- `warmupCache` synchronous path'i Gemini provider mock ile test'te dönsün (8sn'lik flake yok).
- TODO (Phase 5'te bırakılan) → test file yorumundan sil.

**Test:**
- Integration: warmup → getStyleProfile 2. call latency < 50ms (cache).
- Unit: warmup idempotent (aynı professorId 2 kez → 1 cache write).

**Commit:** "Add style-profile cache warmup hook; unskip cache-hit test"

---

### 6.7 — Docker Rebuild Workflow Standardize

**Yeni dosyalar:**
- `.dockerignore` (root) + `server/.dockerignore` + `client/.dockerignore` — `node_modules`, `dist`, `.env*`, `coverage`, `.turbo`, `*.log`.
- `scripts/rebuild-volumes.sh` — `docker compose down -v && docker compose build --no-cache && docker compose up -d`.

**Değişen dosyalar:**
- `CLAUDE.md` — "Geliştirme Komutları" altına `npm run docker:rebuild` ipucu (root `package.json`'a proxy script eklenebilir).
- `README.md` — troubleshooting: "node_modules drift → rebuild-volumes.sh".

**İş:**
- 5.24'teki BullMQ volume sıkıntısı tekrarına izin verme.
- Script executable (`chmod +x`), shebang `#!/usr/bin/env bash`.

**Test:**
- Manuel: `./scripts/rebuild-volumes.sh` → 3 container sağlıklı.

**Commit:** "Standardize Docker rebuild workflow (.dockerignore + helper script)"

---

### 6.8 — Prisma Schema (Phase 6 Tables) + Migration

**Değişen dosya:**
- `server/prisma/schema.prisma`

**İş — 4 yeni tablo + 1 alter:**

```prisma
model VoiceSession {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  professorId     String?
  professor       Professor? @relation(fields: [professorId], references: [id])
  durationSec     Int
  transcript      String   @db.Text
  topics          Json     // [{ topic, startSec, endSec }]
  provider        String   // "gemini-live" | "claude" | "openai-realtime"
  interruptCount  Int      @default(0)
  fallbackUsed    Boolean  @default(false)
  costUsd         Decimal? @db.Decimal(10, 6)
  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
}

model VoiceUsage {
  userId      String
  date        DateTime @db.Date
  totalSec    Int      @default(0)
  sessionCount Int     @default(0)

  @@id([userId, date])
}

model OCRResult {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileUrl        String
  mimeType       String
  extractedText  String   @db.Text
  latexFormulas  Json     // [{ latex, confidence, bbox? }]
  confidence     Float    // 0-1 overall
  provider       String   // "gemini-multimodal" | "vision-api" | "tesseract"
  processingMs   Int
  createdAt      DateTime @default(now())

  @@index([userId, createdAt])
}

model PushDevice {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint    String   @unique
  p256dhKey   String   @db.Text
  authKey     String   @db.Text
  userAgent   String?
  lastSeenAt  DateTime @default(now())
  createdAt   DateTime @default(now())

  @@index([userId])
}
```

- `User.pushOptIn Boolean @default(false)` — Phase 5 `reviewFrequency`'nin yanına.
- `AICallLog.provider String?` (6.3 ile uyumlu) + `AICallLog.fallbackUsed Boolean @default(false)`.

- Back-relations: `User.voiceSessions[]`, `User.ocrResults[]`, `User.pushDevices[]`.
- Migration: `npx prisma migrate dev --name phase_6_multimodal`.

**Test:**
- `npx prisma migrate status` clean.
- Seed hâlâ çalışıyor (hiç Phase 6 fixture yok yet).

**Commit:** "Add Phase 6 Prisma schema — voice + OCR + push tables"

---

### 6.9 — Premium Feature Flag Registry Extend

**Değişen dosya:**
- `server/src/config/premiumFeatures.ts`

**İş:**
- 5.14'te kurulu registry'ye 4 yeni flag ekle:
  - `VOICE_TUTOR` — voice session başlatma + resume.
  - `OCR_PRO` — Gemini multimodal OCR + LaTeX (tesseract fallback free tier'a verilebilir — kararı 6.10'a bırak).
  - `LECTURE_TRANSCRIBE` — ders kaydı upload + analiz.
  - `MULTIMODAL_SEARCH` — formül fotoğrafla benzer soru arama.
- Her flag için `enabled: boolean` default true (admin kill switch).
- Rate limit quota (env-tunable): voice 30dk/gün, OCR 20 image/gün, lecture 2 upload/gün, multimodal 10 query/gün.
- `requirePremium(flag)` middleware 5.14'ten zaten hazır — ekstra iş yok, flag listeye ekle.

**Test:**
- Unit: `requirePremium("VOICE_TUTOR")` free user → 402.
- Unit: flag `enabled: false` → 403 FEATURE_DISABLED.

**Commit:** "Register VOICE_TUTOR / OCR_PRO / LECTURE_TRANSCRIBE / MULTIMODAL_SEARCH flags"

---

### 6.10 — OCR Servisi (Gemini Multimodal + Vision Fallback)

**Yeni dosyalar:**
- `server/src/services/ocrService.ts`
- `server/src/services/latexExtractor.ts` — regex + Gemini structured output combine.

**İş:**
- `extractFromImage({ userId, fileBuffer, mimeType })`:
  - Primary: Gemini multimodal `generateStructured` — prompt "bu defter fotoğrafındaki metni çıkar; formülleri LaTeX'e çevir; `{text, formulas: [{latex, confidence}]}` döndür".
  - Fallback: Google Vision API (env flag `VISION_API_KEY` varsa) → sadece text; LaTeX kısmı Gemini text → LaTeX parse (ikinci call).
  - Upload: Multer memory storage → `uploads/ocr/{uuid}.{ext}` (local fs Phase 6; T2 kararı S3'e taşınırsa buradan kanca).
  - Persist: `OCRResult.create` → `fileUrl`, `extractedText`, `latexFormulas`, `confidence`, `provider`, `processingMs`.
- Rate limit: `ocrUploadLimiter` 20/gün/user (6.15'te).
- Hedef: acceptance criteria "OCR > %90 doğruluk (basit notlar)" — manuel 10 fixture ile smoke.

**Test:**
- Unit: Gemini mock → parse başarılı (10 formül test fixture'ı).
- Unit: Gemini 503 → Vision fallback → `provider: "vision-api"` + `fallbackUsed: true`.
- Unit: OCR latency < 3000ms (mock ile 50ms — gerçek <3sn hedef canlı).

**Commit:** "Add OCR service (Gemini multimodal + Vision fallback + LaTeX extraction)"

---

### 6.11 — Voice Session Servisi (Gemini Live API)

**Yeni dosyalar:**
- `server/src/services/voiceTutorService.ts`
- `server/src/services/llm/geminiLiveProvider.ts` — WebSocket wrapper (Gemini Live API).

**İş:**
- `startSession({ userId, professorId?, topic? })`:
  - Premium gate + daily cap check (`VoiceUsage.totalSec + estimatedMin > 1800` → 429 `QUOTA_EXCEEDED`).
  - WebSocket connect Gemini Live (Claude fallback henüz live stream destekleyemez — fallback text-only tutor).
  - Server-side persistence: session boyunca transcript accumulate, `interruptCount` track.
- `endSession({ sessionId, finalTranscript, durationSec, interruptCount, fallbackUsed })`:
  - `VoiceSession.create` + `VoiceUsage.upsert` (atomic, Serializable — Phase 4 pattern).
  - `topics` inference: transcript → Gemini summary call (async, post-session) → `[{ topic, startSec, endSec }]`.
- Acceptance criteria:
  - "5sn içinde cevap vermeye başlar" — WebSocket open + first audio byte < 5000ms (metric log'da).
  - "Interruption sonrası kaldığı yerden devam" — client kesince server "resume" event gönderiyor; transcript'te timestamp korunur.
- Cost logging: `AICallLog.feature = "voice-tutor"`, `costUsd` tahmin (dakika başına $).

**Test:**
- Unit: usage cap aşımı → 429.
- Unit: fallback path (Gemini Live 503) → text-only Claude session başlar + `fallbackUsed: true`.
- Unit: endSession idempotent (aynı sessionId 2 kez → 1 VoiceSession row).

**Commit:** "Add voice tutor service (Gemini Live + text-only Claude fallback)"

---

### 6.12 — Lecture Audio Analiz (BullMQ Queue)

**Yeni dosyalar:**
- `server/src/services/lectureAudioService.ts`
- `server/src/jobs/lectureTranscribeWorker.ts` — BullMQ worker (`registerWorker` pattern 5.5).

**İş:**
- `enqueueLectureTranscribe({ userId, audioFileUrl, estimatedMin })`:
  - Gate + daily cap (2 upload/gün).
  - `transcribeQueue.enqueue({ userId, fileUrl })` → worker picks up.
- Worker:
  - Gemini multimodal audio `generateStructured` — prompt "bu ders kaydını transcript'e çevir; `{transcript, keyTopics: [{topic, timestamp, quote?}], examHints: string[]}` döndür".
  - "Hocanın bu sınavda çıkar dedi" regex + Gemini flag combine.
  - Persist: `VoiceSession` table'a yaz mı, yoksa yeni `LectureTranscript` mi? — tekrar kullanım için `VoiceSession` extend etme, ayrı tabloya ihtiyaç yok → `VoiceSession` `sourceType String @default("live")` kolonu ekle (6.8 migration'a eklenir; spec'te yoksa buraya patch).
- Hedef: 60dk audio < 5dk processing (Gemini multimodal audio throughput).
- İdempotency: job key `lecture:{userId}:{fileHash}` — duplicate upload tek kez işlenir.

**Test:**
- Unit: enqueue + inline worker (RUN_INLINE_QUEUE=1) → `VoiceSession.create`.
- Unit: aynı fileHash 2 kez → 1 row.
- Unit: 5dk mock audio → `processingMs < 300000`.

**Commit:** "Add lecture audio transcription service (BullMQ worker)"

---

### 6.13 — Multimodal Similarity Search

**Yeni dosyalar:**
- `server/src/services/multimodalSearchService.ts`
- `server/src/services/imageEmbedding.ts` — Gemini multimodal embedding API (veya CLIP proxy).

**İş:**
- `searchByImage({ userId, imageBuffer })`:
  - Gemini embedding → vector (768-dim veya text-of-math route).
  - PostgreSQL `pg_trgm` ile text-based similarity (basit Phase 6 — gerçek vector search T1 cache kararıyla birlikte Phase 7).
  - Alternatif: Gemini `generateMultimodal` → formülü text'e çevir → `Question.text` ILIKE match.
  - Top-10 en benzer soru döndür: `{ question, similarity, examId, professor }`.
- Rate limit: 10 query/gün/user.

**Test:**
- Unit: imageBuffer → embedding mock → top-10 fixture match.
- Unit: empty result → `{ results: [], message: "..." }`.

**Commit:** "Add multimodal similarity search (formula photo → nearest question)"

---

### 6.14 — Push Notification Altyapısı (FCM Web Push)

**Yeni dosyalar:**
- `server/src/services/pushNotificationService.ts`
- `server/src/services/vapidKeys.ts` — VAPID key pair (env'den veya generate).
- `public/service-worker.js` (client) — push event handler (6.23'te frontend'e girecek ama SW dosyası backend'in serve ettiği static olabilir).

**Değişen dosyalar:**
- `server/package.json` — `web-push` dep.
- `server/src/jobs/spacedRepetitionScheduler.ts` (5.13) — scheduler artık notification kuyruğu yerine gerçek push delivery çağırıyor.
- `server/.env.example` — `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT`.

**İş:**
- `registerDevice({ userId, endpoint, p256dhKey, authKey, userAgent })` → upsert `PushDevice` (endpoint unique).
- `sendPush({ userId, title, body, url })` → tüm device'lara web-push library ile gönder; 410 Gone → device delete.
- Spaced repetition integration: 5.13'teki scheduler `countDueByUser` → `pushOptIn` true olan user'lar için sendPush.
- Delivery log: `logger.info({ userId, endpoint, status })` (6.4 pino ile).
- Retry: 1 kez, exponential backoff.

**Test:**
- Unit: 410 response → device silinir.
- Unit: pushOptIn false → sendPush skip.
- Integration: scheduler tick → inline mock push sender çağrılır.

**Commit:** "Add FCM web push infrastructure; wire spaced repetition delivery"

---

### 6.15 — REST Endpoints (Phase 6)

**Yeni dosyalar:**
- `server/src/routes/multimodalRoutes.ts` (voice + OCR + lecture + multimodal search tek router) — Phase 5 `dnaRoutes.ts` benzeri.
- `server/src/routes/pushRoutes.ts` — ayrı tut (cross-cutting).
- `server/src/controllers/voiceController.ts`, `ocrController.ts`, `lectureController.ts`, `multimodalSearchController.ts`, `pushController.ts`.
- `server/src/schemas/multimodal.ts` — Zod şemaları.

**Değişen dosyalar:**
- `server/src/index.ts` — router register.
- `server/src/middleware/rateLimitMiddleware.ts` — 4 yeni limiter: `voiceSessionLimiter` (30dk/gün equivalent + 20 start/gün), `ocrUploadLimiter` (20/gün), `lectureUploadLimiter` (2/gün), `multimodalSearchLimiter` (10/gün).

**Endpoint listesi:**
- `POST /api/voice/sessions` — start (WebSocket URL döner).
- `POST /api/voice/sessions/:id/end` — finalize transcript + usage write.
- `GET /api/voice/sessions/me` — history (pagination).
- `GET /api/voice/usage/me` — günlük kalan cap.
- `POST /api/ocr/upload` — multipart image → OCRResult.
- `GET /api/ocr/me` — history.
- `DELETE /api/ocr/:id` — silme (KVKK).
- `POST /api/lectures/upload` — multipart audio → queue.
- `GET /api/lectures/:id` — transcript + keyTopics.
- `GET /api/lectures/me` — list.
- `POST /api/multimodal/search` — image → similar questions.
- `POST /api/push/devices` — register (p256dh + auth keys).
- `DELETE /api/push/devices/:id` — unregister.
- `PATCH /api/users/me/push-opt-in` — toggle.
- Error shape: 6.2'den sonra garanti `{ error: { code, message } }`.

**Test:**
- Integration: her endpoint 200 + auth + Zod 400 + premium gate 402 + rate-limit 429.
- Integration: upload endpoints multipart smoke (mock file buffer).

**Commit:** "Add Phase 6 multimodal endpoints (voice + OCR + lectures + multimodal + push)"

---

### 6.16 — Backend Tests (Full)

**Yeni dosyalar:**
- `server/tests/unit/voice-tutor-service.test.ts`
- `server/tests/unit/ocr-service.test.ts`
- `server/tests/unit/lecture-audio-service.test.ts`
- `server/tests/unit/multimodal-search-service.test.ts`
- `server/tests/unit/push-notification-service.test.ts`
- `server/tests/unit/provider-registry.test.ts` (6.3 fallback chain)
- `server/tests/integration/multimodal-endpoints.test.ts`
- `server/tests/integration/push-endpoints.test.ts`

**İş:**
- Phase 1-5 skip-if-no-DATABASE_URL pattern.
- Fallback provider matrix: `{primary OK, primary 503, primary timeout} × {fallback OK, fallback 503}` = 6 senaryo.
- Usage cap fuzz: concurrent endSession'lar (Serializable 40001 retry coverage).
- Push 410 Gone device cleanup regression.
- `AICallLog.provider` / `fallbackUsed` assertion her AI servisinde.
- Hedef: ~70 yeni unit + ~10 integration = ~80 yeni test; suite toplamı ~315 yeşil.

**Commit:** "Add Phase 6 backend test coverage"

---

### 6.17 — Client Types + Services + Shared Components

**Yeni dosyalar:**
- `client/src/types/multimodal.ts` — `VoiceSession`, `OCRResult`, `LectureTranscript`, `PushSubscription`, `MultimodalSearchResult`.
- `client/src/services/voiceService.ts`
- `client/src/services/ocrService.ts`
- `client/src/services/lectureService.ts`
- `client/src/services/multimodalSearchService.ts`
- `client/src/services/pushService.ts`
- `client/src/components/voice/VoiceRecorder.tsx` — `getUserMedia` wrapper + AnalyserNode waveform viz (ayrı chunk).
- `client/src/components/voice/AudioStreamer.tsx` — WebSocket / WebRTC state machine (connecting → streaming → paused → error → ended).
- `client/src/components/voice/TranscriptView.tsx` — canlı append + timestamp chip.
- `client/src/components/ocr/CameraCapture.tsx` — mobile `<input type=file capture="environment">` + desktop file picker.
- `client/src/components/ocr/LatexRenderer.tsx` — KaTeX lazy (paket `katex`, CSS import lazy).
- `client/src/components/push/PushPermissionCard.tsx` — "Bildirimleri aç" CTA + permission state.

**İş:**
- TanStack Query hooks: `useVoiceSession()`, `useVoiceHistory()`, `useOCRUpload()`, `useOCRHistory()`, `useLectureUpload()`, `useLectureTranscript(id)`, `useMultimodalSearch()`, `usePushSubscription()`.
- Optimistic: `useOCRDelete` — Phase 5 review pattern ile birebir.
- `VoiceRecorder` bundle impact → ayrı chunk (Phase 5 Recharts lazy pattern'i).
- `LatexRenderer` KaTeX CSS dynamic import (ilk kullanımda load).
- Mobile Safari quirks: getUserMedia sadece HTTPS + user gesture; graceful fallback (iOS 16 öncesi kamera erişim).

**Test:**
- Manuel: her service method hit; network tab'da ayrı chunk'lar görünüyor.

**Commit:** "Add Phase 6 client types + services + shared components"

---

### 6.18 — Voice Tutor Sayfası `/tutor`

**Yeni dosya:**
- `client/src/pages/VoiceTutorPage.tsx`

**Değişen dosyalar:**
- `client/src/App.tsx` — `/tutor` lazy route.
- `client/src/components/Navbar.tsx` — "Canlı Tutor" link (premium icon badge).

**İş:**
- State machine (xstate opsiyonel; basit useReducer yeterli Phase 6 MVP'de):
  - `idle` → "Başlat" CTA.
  - `requestingPermission` → mic access.
  - `connecting` → WebSocket handshake (5sn timeout → error banner).
  - `streaming` → waveform + canlı transcript append + "Durdur" CTA.
  - `paused` (user interrupt) → "Devam" CTA; transcript frozen; server resume event.
  - `error` → "Bağlantın zayıf, tekrar dene" banner (graceful degradation copy — risk matrisi).
  - `ended` → özet card (durationSec + topics listed + "Konu kartını aç" CTA).
- Usage header: "Bugün 14dk / 30dk kullandı" (her 30sn'de bir `GET /api/voice/usage/me`).
- Premium gate: free user `<PremiumLockCard>` direkt render (5.17 pattern'i reuse).
- Mobile: mic button bottom-center, transcript scroll; landscape desteksiz (uyarı banner).

**Test:**
- Manuel: mic izin → 5sn içinde first transcript token; interrupt → devam; ended → VoiceSession history'de görünüyor.

**Commit:** "Add voice tutor page (/tutor) with WebRTC state machine"

---

### 6.19 — OCR Upload Sayfası `/me/ocr`

**Yeni dosya:**
- `client/src/pages/OCRPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/me/ocr` route.

**İş:**
- 3 section (Phase 5 DNA pattern'i):
  - Upload zone: `<CameraCapture>` + dropzone alternatif. Progress bar (file upload + processing). Multer 10MB cap uyarısı.
  - Latest result: extracted text + LaTeX formulas (`<LatexRenderer>`) + confidence bar + "Bu metni düzelt" inline edit (basit textarea).
  - History list: son 20 OCR, thumbnail + tıkla detaya.
- "Notlarıma ekle" CTA → Phase 2 study notes endpoint'ine push (authlanırsa).
- "Study pack'e input yap" CTA → Phase 2 pack generation endpoint.
- Premium gate: `OCR_PRO` flag off → "basit OCR free" mesajı + Pro CTA (Tesseract fallback kararına bağlı, 6.9'dan gelen).

**Test:**
- Manuel: mobile camera → OCR → LaTeX preview renders; delete → history'den düşer.

**Commit:** "Add OCR upload page (/me/ocr)"

---

### 6.20 — Lecture Audio Sayfası `/me/lectures`

**Yeni dosya:**
- `client/src/pages/LecturesPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/me/lectures` route.

**İş:**
- Upload zone: audio file picker (m4a/mp3/wav, 200MB cap — backend guard'la).
- Processing state: "5-10dk sürebilir; işlem bitince bildirim göndereceğiz" (copy hibrit ton).
- Transcript viewer: timestamped (tıkla ses zamanına git — audio element embed).
- Key topics rail (right side): her topic tıklanırsa transcript scroll.
- "Exam hint" rozetleri: AI'ın "bu sınavda çıkar" dediği quote'ları vurgula.
- "Study pack'e çevir" CTA.

**Test:**
- Manuel: 5dk mock audio upload → processing progress → transcript render.

**Commit:** "Add lecture audio page (/me/lectures)"

---

### 6.21 — Multimodal Search Sayfası `/search/multimodal`

**Yeni dosya:**
- `client/src/pages/MultimodalSearchPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/search/multimodal` route.

**İş:**
- Form: `<CameraCapture>` (6.17) + "Formül ya da soru fotoğrafı çek".
- Results: top-10 similar question cards (question text + professor + exam year + similarity ring).
- Tıklanan kart → ilgili exam detayına yönlendir.
- Empty state: "Benzer soru bulunamadı. Daha net bir fotoğraf dene."

**Test:**
- Manuel: formül fotoğrafı → 10 öneri; tıkla → exam page.

**Commit:** "Add multimodal search page (/search/multimodal)"

---

### 6.22 — Navbar + Dashboard Entegrasyonu

**Değişen dosyalar:**
- `client/src/components/Navbar.tsx` — "Canlı Tutor", "OCR Notlar", "Ders Kayıtları", "Görselle Ara" linkleri user menüsü altına; premium rozet.
- `client/src/pages/DashboardPage.tsx` — "Hızlı Aksiyonlar" row: `<VoiceTutorQuickStart />` + `<OCRQuickUpload />` + son ders kaydı card.

**Test:**
- Manuel: navbar + dashboard her sayfada görünüyor; mobile drawer menüsünde de.

**Commit:** "Wire Phase 6 pages into Navbar + Dashboard quick actions"

---

### 6.23 — Push Notification Registration UI

**Yeni dosya:**
- `client/src/components/push/PushSettingsDrawer.tsx`

**Değişen dosyalar:**
- `client/src/pages/ReviewsPage.tsx` (5.22) — settings tab'ına push toggle + "Bildirim saati" placeholder (Phase 6'da timezone-aware delivery scope dışı).
- `public/service-worker.js` — register + push event handler + click → `/me/reviews`.

**İş:**
- "Bildirimleri aç" CTA → `Notification.requestPermission()` + `navigator.serviceWorker.register(...)` + VAPID public key ile `pushManager.subscribe({applicationServerKey})` → `POST /api/push/devices`.
- Toggle off → `pushOptIn: false` + tüm device'lar delete.
- Test push button (dev only): "Test gönder" → `POST /api/push/test`.

**Test:**
- Manuel: Chrome + Firefox + Safari 17+ push permission → registered → test notif geliyor.

**Commit:** "Add push notification registration UI (settings drawer + service worker)"

---

### 6.24 — i18n TR + EN Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni namespace'ler: `voice.*`, `ocr.*`, `lectures.*`, `multimodal.*`, `pushNotifications.*`, `privacy.*` (KVKK genişlemesi 6.25 için).
- Phase 5 pattern: tek oturum manuel sweep (paralel agent ihtiyaç duyulursa özellikle `voice.*` + `ocr.*` için bölünebilir; Phase 5'te manuel daha hızlı çıktı).
- `copy-tone-guide.md` referans; hibrit ton. Hassas alanlar:
  - Voice tutor error banners — "Bağlantın zayıf. Biraz bekle ve tekrar dene" (yapıcı).
  - OCR confidence düşük — "Bu kısmı kendim düzelteceğim" + "Daha net fotoğraf dene" CTA.
  - Lecture processing — "5-10dk sürebilir, bekleme zorunda değilsin; hazır olunca bildirim göndeririz".
  - Push permission — "Bildirimleri açmak zorunda değilsin. Ne zaman istersen kapatabilirsin."
  - Multimodal search empty — motive edici, "daha net fotoğraf" öneri.
  - KVKK (voice + OCR) — 6.25 ile koordine.
- Key parity assert: TR ↔ EN count eşit (Phase 5 sonu 549, hedef ~670-720).

**Test:**
- Manuel: her yeni sayfa TR + EN switch, tüm string çevrilmiş.

**Commit:** "Add Phase 6 i18n copy (voice + ocr + lectures + multimodal + push + privacy)"

---

### 6.25 — KVKK Aydınlatma Metni Güncellemesi (H1)

**Değişen dosyalar:**
- `docs/operations/privacy-notice.md` (veya var olan KVKK dokümanı — yoksa yeni file; `docs/operations/kvkk-aydinlatma.md`).
- `client/src/pages/PrivacyPage.tsx` (varsa) veya ilk kez UI'da bir PrivacyDrawer / /privacy route.
- `client/src/i18n/locales/*.json` — `privacy.voice.*`, `privacy.ocr.*` (6.24 ile overlap).

**İş:**
- Phase 5'te DNA + grade + confidence için KVKK notice mevcuttu. Phase 6'da:
  - Voice transcript (tam konuşma kaydı — biometrik değer) nasıl saklanıyor, ne kadar, kim erişiyor.
  - OCR görselleri (kişi adı / hoca adı / sınıf numarası içerebilir).
  - Lecture audio (3. şahıs — başka öğrenciler sınıfta konuşuyor olabilir).
  - Multimodal search upload'ları (tek sorgu için, kalıcı depolanmıyor).
- "Verilerimi sil" endpoint genişletilmiş: voice + ocr + lecture cascading delete (onDelete: Cascade migration'da var, UI eksik → `DELETE /api/users/me/data` Phase 7'ye kaydırılabilir ama placeholder).
- **Avukat review placeholder:** `docs/operations/kvkk-aydinlatma.md` başlığı + "⚠️ Avukat review bekliyor (2026-04-XX)" banner. Ship öncesi H1 kapanış şart.

**Test:**
- Manuel: /privacy route render eder; "Verilerimi sil" dialog i18n TR + EN.

**Commit:** "Update KVKK privacy notice for voice/OCR/lecture data"

---

### 6.26 — Playwright MCP Visual Smoke + Fixture Seeder

**Yeni dosya:**
- `scripts/seed-phase-6-fixture.ts` — idempotent Phase 6 fixture:
  - Demo user `subscriptionTier = "premium"` (5.6 reset hook çağrılır önce).
  - 3 `VoiceSession` fake (farklı tarihlerde, topics populate).
  - 5 `OCRResult` (çeşitli confidence + LaTeX).
  - 1 `LectureTranscript` (= VoiceSession sourceType="lecture").
  - 1 `PushDevice` registered.
  - `VoiceUsage` bugün için 14dk (header kaldığını test).

**Senaryolar:**
- `/tutor` · 1440 + 390 · light & dark — idle + streaming mock + ended summary.
- `/me/ocr` · 1440 + 390 · light — upload zone + latest result + LaTeX render + history.
- `/me/lectures` · 1440 · light — transcript viewer + key topics rail.
- `/search/multimodal` · 1440 · light — results grid.
- `/me/reviews` settings tab · 1440 · light — push toggle on + test button.
- Dashboard · 1440 · light — hızlı aksiyonlar row.
- Navbar premium badge + due count.

**Yakalanan bug kaydı:** count + kategori (Phase 4+5 tablosu pattern).

**Commit:** "Add Phase 6 Playwright visual smoke + fixture seeder"

---

### 6.27 — Phase 6 Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-6-multimodal.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri + "Phase 7'ye Geçerken Hazır Olanlar".
- `docs/roadmap/README.md` — Phase 6 "🎯 Aktif" → "✅ Tamamlandı" + sıradaki phase'e spotlight.
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — içerik `docs/_archive/scratchpad-*-YYYY-MM-DD-phase-6.md`'ye, Phase 7 için reset.
- `docs/tasks/phase-6-breakdown.md` — tüm task'lar ✅ + commit hash.
- `docs/architecture/data-model-evolution.md` — 4 yeni tablo (VoiceSession/VoiceUsage/OCRResult/PushDevice).
- `docs/architecture/ai-pipeline.md` — multi-provider registry + Gemini Live + fallback flow.
- `docs/tasks/open-questions.md` — D1 (vitest 4), T4 (multi-provider), H1 (KVKK) kapanış işaretleri; Q5 / T5 mobile kararı (Phase 6 PWA'yı test ettik, React Native Phase 7 veya ertele).

**Commit:** "Close out Phase 6 — multimodal + voice tutor shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark + mobile — UI task'larında; voice tutor'da permission flow dahil).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz).
- [ ] Acceptance criteria kısmı ✅ (`phase-6-multimodal.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 5'ten Yeniden Kullanılacak Altyapı

- **BullMQ + Redis** (5.5) — lecture transcribe queue + push delivery queue doğrudan `registerWorker` + `scheduleRepeating` pattern.
- **Premium tier gating** (5.14) — `requirePremium("VOICE_TUTOR")` + `requirePremium("OCR_PRO")` vb. tek satır wire.
- **Per-worker test DB isolation** (5.2 opt-in → 6.1 default) — vitest 4 flip ile 4x paralel.
- **Error middleware + AppError** (5.3 + 6.2 kapanış) — Phase 6 endpoint'leri baştan doğru shape.
- **Recharts lazy pattern** (5.4) — voice waveform + OCR LaTeX + lecture topic chart aynı template.
- **anonymizedHash + k-anonymity** — voice transcript cross-user analytics (Phase 7 ölçek); multimodal search popülarite ölçümü.
- **Rate-limit factory** — 4 yeni limiter (voice/OCR/lecture/multimodal) aynı factory.
- **Zod + `parseOrRespond<S>`** — Phase 6 endpoint'leri baştan Zod.
- **`Tabs` component** — lectures + reviews Phase 6'da da.
- **TanStack Query optimistic mutation + rollback** — OCR delete + push subscription delete aynı pattern.
- **InsufficientDataBanner + PremiumLockCard** — voice tutor free user lock + OCR history empty + lectures empty hepsi reuse.
- **Fixture seeder template** (`seed-phase-5-fixture.ts`) — Phase 6 kopyala-uyarla.
- **Hybrid tone guide** — 5 faz tutarlı; Phase 6 voice + push permission copy'si özellikle yumuşak kontrol vurgusu.
- **KVKK disclaimer banner** — DNA + grade + confidence'tan sonra voice + OCR + lecture için genişleme (6.25).
- **`AICallLog.feature`** — Phase 6 yeni feature adları: `"voice-tutor"`, `"ocr-multimodal"`, `"lecture-transcribe"`, `"multimodal-search"`.
- **`User.subscriptionTier`** — Phase 6 4 yeni flag bu kolona bakıyor, admin toggle aynı DB update.

---

## Açık Karar Noktaları (İlk Sprint'te Çözülmeli)

- **Gemini Live erişim durumu** — Türkiye'den reach edilebilir mi? Geo-restriction yüksek risk. Öneri: 6.3 multi-provider registry + 6.11 voice service baştan Claude text-only fallback'i bilinçli scope'a al.
- **OCR fallback provider** — Vision API ücretli + API key gerekli, Tesseract offline ama LaTeX zayıf. Öneri: Gemini multimodal primary, Tesseract free tier fallback (basit text only), Vision API Phase 7.
- **Lecture audio storage** — 60dk audio ~50MB. Local fs Phase 6 tamam, Phase 7'de R2'ye. Öneri: 6.12 path'i `uploads/lectures/{uuid}.{ext}` + TODO comment.
- **Voice transcript privacy** — Tam kayıt hassas veri. Kaç gün saklansın? Öneri: 30 gün TTL + user-triggered delete (6.15 endpoint). Avukatla 6.25'te netleştir.
- **Multimodal search vector DB** — pg_trgm yeterli mi, pgvector mı? Öneri: Phase 6 MVP pg_trgm (ya da Gemini text fallback); pgvector Phase 7 T1 cache kararıyla.
- **Push notification platform** — Web push yeterli mi, FCM mobile native de lazım mı? Öneri: Phase 6 web push only (PWA); FCM native T5 mobile kararıyla Phase 7.
- **Voice quota günlük mü aylık mı?** Spec 30dk/gün. Öneri: 30dk/gün tut (hedef $200/user/ay cost cap — aylık rollover yapmak maliyet explosion).
- **LaTeX editor** — OCR output düzeltme client-side yapılırsa ne editör? Öneri: basit textarea + `<LatexRenderer>` preview; MathLive Phase 7.
- **Interruption detection** — Server mı client mı tetikliyor? Gemini Live voice activity detection var. Öneri: server-side VAD + client microphone mute event backup.
- **Push notification copy A/B** — Phase 6 scope dışı (tek copy), Phase 7 A/B.
- **Mobile native (Q5 / T5)** — PWA push Safari 16.4+'da var ama iOS home screen install gerekli. Phase 6 sonu Q5 kararı gelecek — "PWA push + 2026 Q4 React Native" öneri.

---

## Riskler (Uygulama Sırasında)

- **Gemini Live geo-restriction** — Türkiye erişimi yoksa voice tutor core işlemez. Mitigasyon: 6.3 fallback abstraction + 6.11 Claude text-only graceful degradation; error banner "Şu an ses hazır değil, metinle devam edelim".
- **Voice maliyeti** — Gemini Live API dakika başına ~$0.15-0.25 tahmin; 30dk/gün/user → $4.5-7.5/user/ay. Mitigasyon: hard cap 30dk/gün + AICallLog cost tracking + admin dashboard $ alert.
- **OCR hallucination LaTeX'te** — Gemini yanlış formül üretebilir. Mitigasyon: confidence < 0.7 → UI'da "düzelt" prompt + manual edit shortcut.
- **WebRTC / WebSocket browser quirks** — Safari iOS 16 öncesi getUserMedia + push permission zor. Mitigasyon: feature detection + graceful empty state + "Chrome/Firefox önerilir" banner.
- **Push permission rate limiting** — Chrome 3. ret sonrası "engellenmiş" kalır. Mitigasyon: UI'da "şimdi değil" seçeneği + contextual prompt (reviews sayfasında ilk CTA tıkladıktan sonra).
- **Lecture audio upload zaman aşımı** — 60dk audio ~50MB, 30sn upload; request timeout hits. Mitigasyon: chunked upload (Phase 6 MVP 200MB multipart cap, Phase 7 tus.io resumable).
- **Voice transcript DB büyüme** — 1 saat konuşma ~30KB text. 1000 user × haftada 3 session = 90MB/hafta. Mitigasyon: 30 gün TTL + archive to S3 Phase 7.
- **Multimodal search false positives** — pg_trgm benzerlik matematik formülünde zayıf. Mitigasyon: "daha iyi sonuç için pgvector Phase 7'de" dokumentation + kullanıcıya "sonuçlar tahmini" disclaimer.
- **Push notification spam regression** — 5.13 `reviewFrequency` ayarı ihlal edilirse user uzaklaşır. Mitigasyon: sendPush öncesi frequency + quiet hours (21-09) double check.
- **KVKK avukat review gecikmesi** — 6.25 blocker olabilir. Mitigasyon: metin draft Phase 6 ortasında hazır; ship öncesi avukat review 2 hafta önce başlat.
- **Docker memory** — Gemini Live WebSocket + BullMQ workers + pino log stream birlikte container RAM'i aşabilir. Mitigasyon: docker-compose resource limits + healthcheck.
- **Provider fallback chain cascade failure** — primary + fallback ikisi de 503 → user dangling state. Mitigasyon: 2. fallback timeout 3sn sonra kullanıcıya "servis geçici olarak kullanılamıyor" banner.
- **PWA service worker cache drift** — Service worker update strategy yoksa kullanıcı eski client kalır. Mitigasyon: `skipWaiting` + `clients.claim` + version banner Phase 7'de.
- **vitest 4 regresyonu** — 6.1'de kırılan yeni test'ler çıkarsa Phase 6 delayed. Mitigasyon: 6.1 ilk task, en çok 1 gün budget; reversible (paket versiyon pin).
- **Bundle size** — KaTeX + WebRTC polyfill + pino-http client shim Phase 6 sonu 80KB gzipped ekleyebilir. Mitigasyon: 6.17 lazy chunk'lar + KaTeX CSS dynamic import.

---

## Başarı Ölçütleri (Faz Sonu)

Phase 5 retro tablosundan kopya pattern:

| Metrik | Hedef |
|--------|-------|
| Voice tutor first-token latency | < 5000ms (AC) |
| OCR doğruluk oranı (fixture) | > %90 basit notlarda |
| Lecture transcribe (60dk) | < 5dk processing |
| LaTeX doğruluk (basit formül) | > %80 |
| Voice interrupt resume | Transcript timestamp korunuyor |
| Multimodal search response | < 2000ms cold |
| Push delivery rate | > %85 (opted-in devices) |
| Backend suite | ~315 yeşil (229 + ~80 yeni) |
| Unit tests added | ~70 + 10 integration = ~80 |
| i18n key parity TR↔EN | 100% (~670-720) |
| Acceptance criteria met | 6/6 |
| Visual smoke bug count | ≤ 1 |
| Bundle size (gzipped) | < 120KB initial (lazy KaTeX + voice chunks) |
| AI provider fallback engaged | Test suite'te 6/6 senaryo |
| KVKK avukat review | Ship öncesi tamam (H1 kapanış) |

---

## İlgili

- Faz detay: [`../roadmap/phase-6-multimodal.md`](../roadmap/phase-6-multimodal.md)
- Phase 5 retro: [`../roadmap/phase-5-academic-dna.md#öğrenilenler-retro`](../roadmap/phase-5-academic-dna.md)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- AI pipeline: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md)
- Data model evrimi: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md)
- Açık sorular: [`open-questions.md`](./open-questions.md) (D1, T4, H1 Phase 6'da kapanış adayı; Q5/T5 mobile kararı sonrası)
