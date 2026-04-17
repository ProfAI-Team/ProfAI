# Phase 2 — Task Breakdown

**Faz:** [Kişiselleştirilmiş Çalışma Materyalleri](../roadmap/phase-2-study-packs.md)
**Toplam tahmini süre:** 2 hafta (planlama süresi); Phase 1 ritmiyle muhtemelen 1.5-2 tam oturum (~15 saat)
**Hedef PR sayısı:** 8-10 ayrı PR (küçük, review'u kolay)

---

## Öncelik Sırası (Sprint Order)

| # | Task | Tahmini | Bağımlılık | Durum | Commit |
|---|------|---------|------------|-------|--------|
| 2.1 | Prisma schema + migration (`StudentNote` + `StudyPack`) | 2 saat | — | ✅ Tamam | `b19e057` |
| 2.2 | File extraction helpers (pdf-parse + `mammoth` + txt) | 3 saat | — | ✅ Tamam | `218be99` |
| 2.3 | `POST /api/notes/upload` endpoint + multi-file servis | 3 saat | 2.1, 2.2 | ✅ Tamam | `a5d299e` |
| 2.4 | Study pack Gemini prompt (structured JSON) + prompt versioning | 3 saat | — | ✅ Tamam | `43b867d` |
| 2.5 | `studyPackService.ts` — cache-first, generate, lock, cost log | 5 saat | 2.1, 2.4 | ✅ Tamam | `49271a5` |
| 2.6 | Study pack endpoint'leri (`generate` / `:id` / `mine`) | 2 saat | 2.5 | ✅ Tamam | `45e894c` |
| 2.7 | Backend unit + integration testler (aggregation + endpoint + dağılım ±%10 doğrulama) | 4 saat | 2.3, 2.6 | ✅ Tamam | `b50850f` |
| 2.8 | Frontend: `Tabs` component + `/upload-notes` sayfası (multi-file, drag-drop) | 4 saat | 2.3 | ✅ Tamam | `8f70ae3` |
| 2.9 | Client service + TS types (`noteService`, `studyPackService`) | 1 saat | 2.6 | ✅ Tamam | `13b631b` |
| 2.10 | `/study-pack/:id` sayfası — 3 tab + markdown render + pratik soru accordion | 5 saat | 2.8, 2.9 | ✅ Tamam | `28c2cea` |
| 2.11 | Async generation UX (polling + progress) + disclaimer banner + <500 kelime soft warning + KVKK notu | 3 saat | 2.10 | ✅ Tamam | `b05e8c4` |
| 2.12 | i18n TR + EN copy (paralel agent sweep, hibrit ton) | 2 saat | 2.11 | ✅ Tamam | `7bdb7dc` |
| 2.13 | Playwright MCP visual smoke (390/1440 × light/dark × upload/generating/ready) | 2 saat | 2.12 | ✅ Tamam | bu commit |
| 2.14 | Phase 2 kapanış: doc "gerçekleşen" + scratchpad archive + roadmap README güncelle | 1 saat | Hepsi | ⏳ | — |

**Toplam:** ~40 saat tahmin çalışma · **İlerleme:** ⏳ 0/14.

---

## Detaylı Task'lar

### 2.1 — Prisma Schema + Migration

**Dosyalar:**
- `server/prisma/schema.prisma`

**İş:**
- `StudentNote` modeli: `id, userId, title, courseId?, fileUrl, extractedText (Text), wordCount, createdAt`, `@@index([userId])`.
- `StudyPack` modeli: `id, userId, professorId, noteIds (String[]), topicSummaries Json, practiceQuestions Json, profStylePatterns Json, geminiVersion, promptVersion, noteHash, generatedAt, expiresAt`. Index: `userId`, `professorId`, unique `(userId, professorId, noteHash, promptVersion)` → 24h TTL cache anahtarı.
- `User` + `Professor` modellerine back-relation ekle.
- Migration: `npx prisma migrate dev --name phase_2_study_packs`.

**Test:**
- `npx prisma migrate status` clean.
- Seed değişmemeli (study pack fixture yok, Phase 2 scratchpad'e göre).

**PR:** "Add Phase 2 Prisma schema — student notes + study packs"

---

### 2.2 — File Extraction Helpers

**Yeni dosya:**
- `server/src/services/extraction/index.ts` veya `server/src/lib/textExtract.ts`

**Değişen dosya:**
- `server/package.json` — `mammoth` dep (yeni).

**İş:**
- `extractText(buffer, mime): Promise<{ text, wordCount }>`
  - `application/pdf` → `pdf-parse` (mevcut `analysisService` pattern'ini izle).
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX) → `mammoth.extractRawText`.
  - `text/plain` → buffer toString.
  - Unsupported mime → throw `EXTRACTION_UNSUPPORTED` (error code).
- `hashText(text): string` — SHA-256, `noteHash` üretimi için.
- `wordCount(text): number` — split + filter non-empty.

**Test:**
- Unit: her üç mime için küçük sample (<1KB) buffer'dan doğru text + count.
- Edge: boş buffer → wordCount=0.
- Edge: unsupported mime → throw.

**PR:** "Add multi-format text extraction helpers (pdf/docx/txt)"

---

### 2.3 — Notes Upload Endpoint

**Yeni dosyalar:**
- `server/src/routes/noteRoutes.ts`
- `server/src/controllers/noteController.ts`
- `server/src/services/studentNoteService.ts`

**Değişen dosya:**
- `server/src/app.ts` — route register.
- `server/src/middleware/uploadMiddleware.ts` — DOCX + TXT mime whitelist ekle (mevcut PDF-only'ydı).

**İş:**
- `POST /api/notes/upload` — `authMiddleware` + Multer `.array("files", 5)`.
- Her file → extract → `StudentNote.create({ userId, title, fileUrl, extractedText, wordCount })`.
- Response: `{ notes: [{ id, title, wordCount, warning? }] }` — `wordCount < 500` → `warning: "insufficient_content"`.
- Multi-file atomicity: tek file parse hatası → diğerleri kurtarılır, response `errors: []` ile döner.

**Test:**
- Integration: PDF upload → 1 note kaydı.
- Integration: 3 file (PDF + DOCX + TXT) → 3 note.
- Integration: unsupported mime → 400 + error code.
- Integration: auth yok → 401.

**PR:** "Add POST /api/notes/upload with multi-format support"

---

### 2.4 — Study Pack Gemini Prompt

**Yeni dosya:**
- `server/src/prompts/study-pack.ts`

**İş:**
- Prompt template:
  - System: "Sen bir ders asistanısın…" — hibrit ton (samimi + akademik + ciddi, `copy-tone-guide.md`'ye göre).
  - Instruction: "Verilen not içeriği + hoca stil profili ışığında yapılandırılmış çalışma paketi üret. **Kaynak dışına çıkma** — uydurma kavram, uydurma formül yok."
  - Structured output schema (`responseSchema`):
    ```ts
    {
      topicSummaries: [{ topic: string, content: string (markdown) }],
      practiceQuestions: [{ question: string, type: "MC"|"CLASSIC"|"TF", topic, difficulty: 1-10, answer, rationale }],
      profStylePatterns: [string]
    }
    ```
- `version: "study-pack-v1"` export — cache key'de kullanılacak.
- Acceptance: **pratik soru tipi dağılımı hocanın `styleProfile.aggregated.questionTypes`'a ±%10 uyumlu** — prompt'ta somut hedef dağılım ver (örn. "MC %60, Klasik %30, T/F %10 olacak şekilde üret").
- Türkçe çıktı; input variable'ları: `noteText`, `aggregatedStyle`, `targetTypeDistribution`.

**Test:**
- Unit (prompt builder): doğru template interpolasyonu, boş input'ta throw.
- Gemini integration optional (CI gated) — real call, schema match assert.

**PR:** "Add study pack Gemini prompt (structured output)"

---

### 2.5 — Study Pack Service

**Yeni dosya:**
- `server/src/services/studyPackService.ts`

**İş:**
- `generateStudyPack({ userId, professorId, noteIds }): Promise<StudyPack>`
  1. Notları DB'den çek, `extractedText` concat + `hashText` → `noteHash`.
  2. Cache look-up: `findFirst({ userId, professorId, noteHash, promptVersion, expiresAt > now })` → varsa dön.
  3. Yoksa: hocanın `styleProfile`'ını çek (yoksa `professorStyleService.getOrBuildStyleProfile`).
  4. Phase 1'deki advisory lock pattern'ini yeniden kullan — aynı (user, prof, hash) üzerinde concurrent request → ikincisi bekler (5 dk lock TTL). Serbest bir `StudyPackLock` tablosu yerine basit yol: `promptVersion` ile unique constraint + upsert-or-skip.
  5. Gemini call → `recordAICall({ feature: "study-pack", userId })`.
  6. Response parse + validate (Zod opsiyonel, en azından manuel shape check).
  7. `StudyPack.create` — `expiresAt = now + 24h`.
- `getStudyPack(id, userId)` — userId eşleşmezse 403.
- `listMyStudyPacks(userId)` — `orderBy generatedAt desc`.
- `invalidateForProfessor(professorId)` — Phase 1 style profile invalidation hook'una paralel: yeni exam analiz edildiğinde hocanın study pack'leri soft invalidate (expiresAt = now). `examController` hook'unu extend et.

**Test:**
- Unit: Cache hit path (mock Prisma).
- Unit: Cache miss → generate path (mock Gemini).
- Unit: Cache key'i doğru üretir (noteHash stable).

**PR:** "Add study pack service with cache + cost logging"

---

### 2.6 — Study Pack Endpoints

**Yeni dosyalar:**
- `server/src/routes/studyPackRoutes.ts`
- `server/src/controllers/studyPackController.ts`

**Değişen dosya:**
- `server/src/app.ts` — route register.

**İş:**
- `POST /api/study-pack/generate` — body `{ professorId, noteIds: string[] }`. Acceptance: 30sn içinde response (Gemini call sync).
- `GET /api/study-pack/:id` — auth + owner check.
- `GET /api/study-pack/mine` — paginated (default 20).
- Error code standardizasyonu: Phase 1 stil profili endpoint'i `{ status, ... }` union pattern'ini takip et.

**Test:**
- Integration: generate → 200 + pack ID + topicSummaries ≥ 3 + practiceQuestions ≥ 5 (AC).
- Integration: aynı notları 2. kez generate → cache hit (generatedAt aynı).
- Integration: başkasının pack'ine GET → 403.
- Integration: auth yok → 401.

**PR:** "Add /api/study-pack endpoints"

---

### 2.7 — Backend Testler (Full)

**Yeni dosyalar:**
- `server/tests/unit/study-pack-service.test.ts`
- `server/tests/unit/extraction.test.ts`
- `server/tests/integration/notes-upload.test.ts`
- `server/tests/integration/study-pack-endpoint.test.ts`

**İş:**
- Unit: 2.2, 2.4, 2.5 için (Gemini mock).
- Integration: 2.3, 2.6 için (supertest + test DB; Phase 1'deki `skip-if-no-DATABASE_URL` pattern'i).
- **Dağılım ±%10 doğrulaması:** Mock Gemini response ile test et — eğer mock response hocanın dağılımına uymuyorsa test fail. (Gerçek Gemini değil, prompt'un iç kontratını doğrula.)
- CI: mevcut `npm test` zaten hepsini koşar.

**PR:** "Add Phase 2 backend test coverage"

---

### 2.8 — Tabs Component + Upload Notes Page

**Yeni dosyalar:**
- `client/src/components/Tabs.tsx` — headless, aria-tabs pattern, skeleton desteği.
- `client/src/pages/UploadNotesPage.tsx`

**Değişen dosya:**
- `client/src/App.tsx` — `/upload-notes` route (ProtectedRoute).
- `client/src/components/Navbar.tsx` — nav link (gerekirse).

**İş:**
- Tabs: accessible keyboard nav (Left/Right), aktif pill, aria-selected; Phase 2 sonrası başka yerlerde de kullanılabilir — pure component.
- UploadNotesPage:
  - Hoca seçimi (dropdown, mevcut `professorService` ile).
  - Course seçimi (opsiyonel).
  - Multi-file drop zone (`UploadPage.tsx` pattern'i + drag).
  - Preview list (filename + size + remove).
  - "Çalışma paketi oluştur" CTA → `POST /api/notes/upload` + redirect.

**Test:**
- Manual: empty state, 1 file, 3 file, oversized file error, wrong mime error.

**PR:** "Add Tabs component + upload-notes page"

---

### 2.9 — Client Service + Types

**Yeni dosyalar:**
- `client/src/services/noteService.ts` — `uploadNotes(files, meta)`.
- `client/src/services/studyPackService.ts` — `generateStudyPack(args)`, `getStudyPack(id)`, `listMyStudyPacks(params)`.
- `client/src/types/studyPack.ts` — tüm shape'ler (backend ile senkron).

**İş:**
- Backend response type'ı ile birebir eşleşen TS interface'ler.
- Axios error → i18n key'e çevirme helper'ı (Phase 1 style profile pattern'ini izle).

**PR:** "Add study pack client services + types"

---

### 2.10 — Study Pack Page

**Yeni dosyalar:**
- `client/src/pages/StudyPackPage.tsx`
- `client/src/components/PracticeQuestionCard.tsx` — soru + "Cevabı göster" accordion.
- `client/src/components/StudyPackTabs.tsx` — Summary / Practice / Trick tabs.

**Değişen dosya:**
- `client/src/App.tsx` — `/study-pack/:id` route.
- `client/package.json` — `react-markdown` + `remark-gfm` dep (scratchpad önerisi).

**İş:**
- Tab 1 — Konu Özeti: her `topicSummary` için accordion + markdown render.
- Tab 2 — Pratik Sorular: her soru için card + type badge + difficulty + "Cevabı göster" toggle.
- Tab 3 — Hoca Trick'leri: `profStylePatterns` bullet list + disclaimer.
- Skeleton: her tab için.
- Empty state: `practiceQuestions.length === 0` → "Henüz soru yok" (AC'ye göre ≥5 olmalı; bu path regression için).

**Test:**
- Manual: mock pack ile tüm tab'lar, markdown formatting, accordion toggle.

**PR:** "Add /study-pack/:id page with 3-tab layout"

---

### 2.11 — Async UX + Disclaimers

**Değişen dosyalar:**
- `client/src/pages/UploadNotesPage.tsx`
- `client/src/pages/StudyPackPage.tsx`
- `client/src/components/Banner.tsx` (yeni veya mevcut genişlet) — AI disclaimer + KVKK bilgi.

**İş:**
- **Async generation UX:** `POST /api/study-pack/generate` 30sn sürer. Seçenekler:
  1. Optimistic sync call + progress animation (loading state, "AI çalışıyor… ~30sn"). **Tercih edilen — basit.**
  2. (Alternatif, Phase 2+) async job + polling.
- **<500 kelime soft warning:** Upload response'unda warning field'ı varsa banner göster, user "yine de oluştur" ile geçebilir.
- **AI disclaimer banner:** StudyPackPage üstünde "AI üretimi — doğrulayın" (sabit, dismiss edilmez).
- **KVKK notu:** UploadNotesPage altında küçük metin: "Notların sadece senin hesabına bağlı, paylaşılmaz." + privacy policy linki (policy sayfası Phase 2 kapsamı dışı — placeholder OK).
- **Telif disclaimer:** UploadNotesPage: "Sadece kişisel kullanımın için yüklediğin notları ekle."

**Test:**
- Manual: upload → generate → loading → study pack render.
- Manual: <500 kelime → warning banner görünür.

**PR:** "Add generation progress UX + AI/KVKK disclaimers"

---

### 2.12 — i18n Copy Sweep

**Değişen dosyalar:**
- `client/src/i18n/locales/tr.json`
- `client/src/i18n/locales/en.json`

**İş:**
- Yeni key namespace'leri: `upload.notes.*`, `studyPack.*` (tabs, practice, trick), `studyPack.generation.*`, `studyPack.disclaimer.*`, `privacy.*`.
- Phase 1 ritmini takip et: paralel 2 agent (TR + EN) — `copy-tone-guide.md` referansı ile hibrit ton; key parity assert (TR ↔ EN key count eşit).
- Gemini study pack prompt'una tone guide'dan 1-2 cümle inject et (samimi + "kaynak dışına çıkma").

**Test:**
- i18n parity check script (Phase 1'de varsa kullan).
- Manual: TR + EN switch, her tab'da metin doğru.

**PR:** "Add Phase 2 i18n copy (hybrid tone sweep)"

---

### 2.13 — Responsive + Theme Visual Smoke ✅

**Çalışma:**
- Playwright MCP matrisi, 6 ana senaryo koşuldu:
  1. `/upload-notes` · 1440 · light — hero + form + disclaimer stack doğru hizalanıyor, CTA disabled görünüm temiz.
  2. `/study-pack/:id` summary · 1440 · light — markdown bold render çalışıyor, tab sayıları 4/8/4, disclaimer banner görünür.
  3. `/study-pack/:id` practice · 1440 · light — 8 soru kartı, type + topic + difficulty chip'leri, "Cevabı göster" toggle.
  4. `/study-pack/:id` summary · 1440 · dark — markdown `dark:prose-invert` ile tam okunaklı, border + surface token'ları doğru.
  5. `/upload-notes` + `/study-pack/:id` · 390 · dark — mobile'da tabs flex-wrap ile 2 satıra dağılıyor, cardlar viewport genişliğine oturuyor.
  6. `/study-pack/{nonexistent}` · 390 — yerel 404 state + "Yeni paket oluştur" CTA, axios 404'ü konsol'da görünüyor ama UI sessiz (beklenen).

**Yakalanan bug:** 0.

**Not:** `fullPage` screenshot + `position: sticky` navbar kombinasyonu Playwright'ta sticky'yi scroll-relative yakalar — gerçek tarayıcıda navbar doğru yerde kalıyor, screenshot artefaktı.

---

### 2.14 — Phase Kapanışı

**Değişen dosyalar:**
- `docs/roadmap/phase-2-study-packs.md` — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri.
- `docs/roadmap/README.md` — Phase 2 durumu "🎯 Aktif" → "✅ Tamamlandı".
- `SCRATCHPAD.md` + `client/SCRATCHPAD.md` + `server/SCRATCHPAD.md` — eski içerik `docs/_archive/scratchpad-*-YYYY-MM-DD.md`'ye donduruldu, Phase 3 için reset.
- `docs/tasks/phase-2-breakdown.md` — tüm task'lar ✅ + commit hash.

**PR:** "Close out Phase 2 — study packs shipped"

---

## Definition of Done

Her task için:

- [ ] Kod yazıldı, ESLint temiz.
- [ ] Test yazıldı, geçiyor.
- [ ] Manuel test edildi (TR + EN + light + dark — UI task'larında).
- [ ] Commit merge edildi (`main` üzerinde ilerliyoruz, feature branch gerekirse PR).
- [ ] Acceptance criteria kısmı ✅ (`phase-2-study-packs.md`).
- [ ] Bu dosyada task ✅ işaretlendi + commit hash yazıldı.

---

## Phase 1'den Yeniden Kullanılacak Altyapı

Scratchpad'lerden tekrar:

- **`aiCallTracker.recordAICall`** — `feature: "study-pack"` flag'iyle aynı tabloya yazacak.
- **Prompt versioning pattern** (`version` field) — cache key'de yeniden kullanılıyor.
- **Cache-first + advisory lock pattern** — `professorStyleService`'teki şablonu takip.
- **Copy tone guide** — UI + Gemini prompt aynı ton.
- **Vitest + Supertest altyapısı** — yeni test dosyaları mevcut config'e düşer.
- **Playwright MCP visual smoke** — `.mcp.json` kurulu, bash/nvm wrapper çalışıyor.
- **`examController.uploadExam` invalidation hook** — study pack invalidasyonuna extend edilecek.

---

## Riskler (Uygulama Sırasında)

- **Gemini structured output 30sn'yi aşabilir** — response schema büyük. Mitigasyon: ilk iterasyonda prompt sıkıştır, gerekirse Phase 3'te async job queue.
- **Cache key edge case**: farklı not sıralaması → farklı hash. `noteIds.sort()` sonra concat.
- **Prompt dağılım ±%10** — Gemini instruction following her zaman mükemmel değil. Test'te ±%15 tolerans düşünülebilir.
- **`mammoth` paket büyüklüğü** (~600KB) — backend-only, frontend bundle etkilemiyor. OK.
- **`react-markdown` paket büyüklüğü** (~40KB gzip) — kabul edilebilir.
- **File upload cap 10MB** — mevcut Multer config; 5 file × 10MB = 50MB toplam request. Yeterli.
- **Hoca stili yoksa** study pack üretimi ne yapsın? → `styleProfile` fallback'i `professorStyleService` zaten halledilmiş; `insufficient_data` ise study pack'te generic prompt + kullanıcıya uyarı.

---

## İlgili

- Faz detay: [`../roadmap/phase-2-study-packs.md`](../roadmap/phase-2-study-packs.md)
- Phase 1 retro (yeniden kullanılabilir altyapı): [`../roadmap/phase-1-style-profile.md#öğrenilenler-retro`](../roadmap/phase-1-style-profile.md#öğrenilenler-retro)
- Copy tone guide: [`../operations/copy-tone-guide.md`](../operations/copy-tone-guide.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
- Açık sorular: [`open-questions.md`](./open-questions.md)
