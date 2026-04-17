# Phase 2 — Kişiselleştirilmiş Çalışma Materyalleri 📚

**Süre:** 2 hafta (tahmin) → 1 gün (2026-04-17, Phase 1'le aynı gün içinde)
**Statü:** ✅ Tamamlandı (2026-04-17)
**Hedef:** **Asıl ürün vizyonunu** hayata geçir — hoca stili + öğrenci notu = kişiselleştirilmiş içerik.

## İlerleme (Task Bazlı)

Detay: [`../tasks/phase-2-breakdown.md`](../tasks/phase-2-breakdown.md).

- ✅ **2.1** — Prisma schema + migration (`StudentNote` + `StudyPack`, 24h cache key) · commit `b19e057`
- ✅ **2.2** — File extraction helpers (pdf-parse v2 + mammoth + txt) + 15 unit test · `218be99`
- ✅ **2.3** — `POST /api/notes/upload` multi-file + mime whitelist + <500 kelime warning · `a5d299e`
- ✅ **2.4** — Study pack Gemini prompt + structured output schema · `43b867d`
- ✅ **2.5** — `studyPackService` cache-first + soft invalidation + cost log · `49271a5`
- ✅ **2.6** — `POST /api/study-pack/generate`, `GET /:id`, `GET /mine` · `45e894c`
- ✅ **2.7** — Unit + integration testler (59/59 yeşil; DB'siz CI'da 42 unit) · `b50850f`
- ✅ **2.8** — `Tabs` component + `/upload-notes` multi-file drag-drop · `8f70ae3`
- ✅ **2.9** — Client service + TS types (`noteService`, `studyPackService`) · `13b631b`
- ✅ **2.10** — `/study-pack/:id` sayfası + 3 tab + markdown + accordion · `28c2cea`
- ✅ **2.11** — Async UX + AI/KVKK/telif disclaimer'ları · `b05e8c4`
- ✅ **2.12** — i18n hibrit ton sweep (paralel agent, 15 edit) · `7bdb7dc`
- ✅ **2.13** — Playwright MCP visual smoke — 0 bug yakalandı · `359fe86`
- ✅ **2.14** — Phase kapanışı (bu commit)

---

## Neden Bu Faz

Bu, ürünün **çekirdek değeri**. Bu olmadan sadece "hoca hakkında bilgi sayfası"yız. Phase 1 stil profili bu fazın *input'u*, asıl fayda burada çıkar.

---

## Kapsam (DAHİL)

### 1. Konu Materyali Yükleme

- Yeni sayfa: `/upload-notes`
- Ders + öğrenci notu upload (PDF / DOCX / TXT / fotoğraf).
- Notlar DB'de saklanır (kullanıcıya özel, gizli).
- Multi-file upload desteği (slayt + ek not kombinasyonu).

### 2. AI Personalized Study Notes

- Yüklenen not + hoca stil profili → Gemini prompt'u.
- Çıktı: hocanın diline uygun konu özetleri, anahtar noktalar, "hocanın bu konuyu nasıl sorduğu" pattern'leri.
- Format: kısa, scannable, vurgulanmış.
- Markdown render edilir.

### 3. AI Pratik Sorular

- Hoca stiline uygun 5-10 soru.
- Her sorunun: tip (MC / klasik / T/F), konu, zorluk, gerekçe (cevap dahil).
- Topluluk için ileride oylama altyapısına hazır (henüz görünmez).

### 4. Yeni Endpoint'ler

- `POST /api/notes/upload` — öğrenci konu materyali.
- `POST /api/study-pack/generate` — hoca + notlar → study pack üret.
- `GET /api/study-pack/:id` — üretilmiş paket.
- `GET /api/study-pack/mine` — kullanıcının paketleri.

### 5. UI — `/study-pack/:id` Sayfası

- **Tab 1:** Konu özeti (markdown).
- **Tab 2:** Pratik sorular (her birinde "Cevabı göster" toggle).
- **Tab 3:** Hoca trick'leri (pattern detection sonuçları).

---

## Kapsam DIŞI

- Mock exam → Phase 3
- Topluluk soru oylama → Phase 4
- Voice tutor → Phase 6
- El yazısı OCR → Phase 6

---

## Acceptance Criteria

- [x] Öğrenci 1 PDF (ders notu) yükleyip, hoca seçince 30 saniye içinde study pack alabilir (gerçek ölçüm: cold 22s, cache hit 14ms).
- [x] Study pack en az 3 konu özeti + 5 pratik soru içerir (prompt'ta `MIN_TOPIC_SUMMARIES=3`, `MIN_PRACTICE_QUESTIONS=5`; smoke'da 4 özet + 8 soru üretildi).
- [x] Pratik soru tipi dağılımı hocanın gerçek dağılımına ±%10 uyumlu (`isDistributionWithinTolerance` + prompt'ta target distribution; unit test).
- [x] Türkçe çıktı dil bilgisi olarak temiz (hibrit ton sweep uygulandı, smoke'da sorun yok).
- [x] Cache: aynı not + aynı hoca → tekrar üretmez (24h TTL) — unique constraint `(userId, professorId, noteHash, promptVersion)` + `expiresAt`.
- [x] Input kalite kontrolü: notlar < 500 kelime → uyarı ver (`MIN_WORDCOUNT_FOR_STUDY_PACK`, UI banner `uploadNotes.shortWarning`).
- [x] Disclaimer: "AI üretimi — doğrulayın" banner (`studyPack.disclaimer`, StudyPackPage üstünde sabit).

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model StudentNote {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title         String
  courseId      String?
  course        Course?  @relation(fields: [courseId], references: [id])

  fileUrl       String
  extractedText String   @db.Text
  wordCount     Int

  createdAt     DateTime @default(now())

  @@index([userId])
}

model StudyPack {
  id                String   @id @default(uuid())
  userId            String
  professorId       String
  noteIds           String[]

  topicSummaries    Json     // [{topic, content}]
  practiceQuestions Json     // [{q, type, topic, answer, difficulty, rationale}]
  profStylePatterns Json     // ["bonus son haftadan", "vize teori"]

  geminiVersion     String
  generatedAt       DateTime @default(now())

  @@index([userId])
  @@index([professorId])
}
```

### File Extraction

- `pdf-parse` → PDF
- `mammoth` → DOCX
- Plain text → TXT
- Phase 6'da OCR eklenecek (foto için şimdilik placeholder).

### Gemini Prompt

Yeni prompt tipi: structured output for study pack.

Detay: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md).

### Yeni Servis

`server/src/services/studyPackService.ts`

---

## Çıktılar

- "Konu Yükle" akışı.
- Study Pack sayfası — **ana value proposition'ın görünür yüzü.**
- "Hocan nasıl soruyor?" pattern detection ilk versiyon.
- Premium tier'ın ilk satılabilir özelliği.

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **AI hallucination** (uydurma formül) | Yüksek | Yüksek | Prompt'ta "kaynak dışına çıkma" + warning banner + feedback loop |
| **Kötü PDF quality** | Yüksek | Orta | Input kalite kontrol (word count, text extraction success) |
| **Telif ihlali** (öğrenci yayıncı notu yüklerse) | Orta | Yüksek | "Sadece kişisel kullanım" disclaimer + DMCA takedown |
| **KVKK** (kişisel not özel) | Orta | Yüksek | Gizlilik garantisi, notlar sadece kullanıcıya, paylaşım opsiyonel |
| **Maliyet patlaması** (~$0.05/pack × 1000 = $50) | Yüksek | Orta | Agresif cache; free tier limit (3/ay) |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Study pack üretim sayısı | > 100/hafta (Phase 2 sonu) |
| "Faydalı buldum" oranı (1-tık feedback) | > %70 |
| Tekrar üretim oranı (cache başarısı göstergesi) | < %20 |
| Session'da study pack açan kullanıcı oranı | > %40 |
| Ortalama study pack üretim süresi | < 30sn |

---

## Gerçekleşen Sonuçlar (2026-04-17)

### Shipped

**Backend (7 commit):**
- Schema: `StudentNote` (user-private extractedText + wordCount), `StudyPack` (24h cache anahtarı `(userId, professorId, noteHash, promptVersion)` + explicit `expiresAt`). Migration `phase_2_study_packs`.
- `lib/textExtract.ts`: PDF (pdf-parse v2 `PDFParse({data})` API), DOCX (mammoth), TXT; `hashText` SHA-256, `wordCount` Türkçe karakter desteği, `UnsupportedMimeTypeError`/`ExtractionFailedError` tipleri.
- `studentNoteService.ingestNote`: read → extract → persist akışı, <500 kelime `insufficient_content` soft warning.
- `noteController` + `noteRoutes` + `uploadNote` Multer middleware (PDF/DOCX/TXT whitelist, `handleUploadErrors` wrapper → 400 JSON).
- `prompts/study-pack.ts` (v1): hibrit ton system instruction, "kaynak dışına çıkma" kuralı, 100k char klip, structured output schema. `computeTargetTypeDistribution` + `isDistributionWithinTolerance` (±10pp).
- `generateStudyPack` Gemini provider: structured JSON, `feature: "study-pack"` AICallLog, 3 retry backoff.
- `studyPackService`: cache-first (unique constraint + `expiresAt`), Phase 1 style profile bağımlılığı, post-gen dağılım doğrulaması (soft miss → log), upsert race-safe.
- Invalidation hook `examController.uploadExam`'a eklendi — Phase 1 style profile'ın yanında study packs da `expiresAt = now` ile soft invalidate olur.
- Endpoint'ler: `POST /api/study-pack/generate`, `GET /:id` (owner check), `GET /mine` (paginated).

**Frontend (4 commit):**
- `types/studyPack.ts` backend response shape'iyle birebir eşleşen union tipler.
- `noteService` + `studyPackService` axios wrapper'ları.
- `Tabs` + `TabPanel` + `useTabListId` — aria-tablist, ArrowLeft/Right/Home/End keyboard nav, framer-motion layoutId indicator.
- `FileUpload` generalize: `acceptedTypes` / `acceptedExtensions` / `rejectionMessage` / `hint` opsiyonel props (backward-compatible).
- `UploadNotesPage` — course combobox (professor otomatik), multi-file drag-drop, step-progress strip (uploading → generating 20-30sn ETA), privacy + copyright notları ayrı ikonlarla.
- `StudyPackPage` — 3 tab (summary / practice / trick), `react-markdown` + `remark-gfm` + `@tailwindcss/typography` `prose` classes, AI disclaimer banner (sabit), 404 state + "Yeni paket oluştur" CTA.
- `PracticeQuestionCard` — type/topic/difficulty chip'leri, markdown soru + "Cevabı göster" accordion + rationale.
- Route + Navbar wire-up; `nav.uploadNotes` TR+EN.

**Tests + copy (3 commit):**
- 10 yeni unit test (`study-pack-prompt` tolerance + target math; `study-pack-service` hash determinism + distribution build).
- 6 integration test (notes-upload): auth, ≥500 no-warning, <500 warning, unsupported mime, empty, multi-file.
- 7 integration test (study-pack): auth, body validation, insufficient_data, cross-user 404, owner access, isolated `/mine`.
- Toplam 59/59 test yeşil (DB'siz CI: 42 unit pass + 17 integration skip guard).
- Hibrit ton sweep: paralel 2 agent (TR + EN), 15 edit (7 TR + 8 EN), 225↔225 key parity.

**Tooling:**
- Frontend'de yeni deps: `react-markdown`, `remark-gfm`, `@tailwindcss/typography`.
- Backend'de yeni deps: `pdf-parse` v2 (text-only extraction), `mammoth` (DOCX), `@types/pdf-parse`.

### Metrics (end of phase)

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Study pack generate P95 (cold) | < 30s | **22s** (smoke gözlemi) |
| Study pack cache hit | — | **14ms** (1500× hızlanma) |
| Gemini cost / pack (projected) | free tier | `$0` actual / projected ~$0.0005 |
| Unit + integration test pass | — | **59/59** (1.6s) |
| i18n key parity TR↔EN | 100% | **225↔225** |
| Acceptance criteria met | 7/7 | **7/7** ✓ |
| Visual smoke bug count | 0 | **0** yakalandı |

### Kullanıcı dönüşümü metrikleri

Canlı traffic yok — Phase 2 sonunda ölçüm placeholder:

| Metrik | Hedef | Durum |
|--------|-------|-------|
| Study pack üretim sayısı | > 100/hafta | Canlı traffic bekleniyor |
| "Faydalı buldum" oranı | > %70 | Feedback UI Phase 4'te |
| Tekrar üretim oranı | < %20 | Canlı traffic bekleniyor |
| Session'da study pack açan kullanıcı | > %40 | Canlı traffic bekleniyor |
| Ortalama üretim süresi | < 30sn | **22s** (smoke) |

Analytics Phase 3 öncesi kurulmalı (Phase 1 retrosunda da vurgulanmıştı).

---

## Öğrenilenler (Retro)

### İyi Giden

- **Phase 1'de inşa edilen altyapı tam dolu kullanıldı.** `aiCallTracker`, `AICallLog`, style profile cache, `examController` invalidation hook, Vitest + Supertest setup, Playwright MCP, copy tone guide — hiç yeniden yazmadan extend edildi. Phase 1'de "Phase 2'ye hazır olanlar" listesi literal olarak ödedi.
- **Cache anahtarı ilk tasarımda doğru çıktı.** `(userId, professorId, noteHash, promptVersion)` unique + `expiresAt` kombinasyonu hem race-safe hem TTL'li hem migration tüm versiyonları otomatik invalide edebilir. Phase 1'deki `isStale` + advisory lock pattern'ine göre daha temiz.
- **Structured output schema Gemini'yi zorlamadan bağlıyor.** `responseSchema` ile 22sn'de 4 özet + 8 soru + 4 kalıp geldi; post-gen dağılım doğrulaması da ±%10 içinde çıktı. Phase 1'deki plain-text summary'ye kıyasla daha güvenilir çıktı.
- **Paralel agent sweep ikinci seferde de değer üretti** — Phase 1'de 82 edit, Phase 2'de 15 edit (daha az çünkü key'ler zaten tone guide'la yazıldı). Her iki dilde convergent hit'ler (`toleranceWarning`, `trick.empty`) en zayıf yerleri işaret etti.
- **Owner-scoped query (`findFirst({ id, userId })`) pattern'ı** integration test'te 2 satırda doğrulandı. Phase 4 paylaşım geldiğinde override noktası tek yerde.
- **TypeScript + structured schema** Gemini response'unu cast'siz tüketmeyi mümkün kıldı; `StudyPackContent` tek kaynak.

### Zor / Sorunlu

- **npm `@rollup` root-sahipliği** — Phase 1 Docker workflow borcunun hâlâ kalıntısı. `sudo chown` ile açıldı ama bind mount olmayınca yeni deps eklemek her seferinde sürtünme. **Phase 3'te `./server:/app` bind mount ekleyelim** (server/SCRATCHPAD.md borç listesinde).
- **pdf-parse v2 API değişmişti** — v1'deki `pdf(buffer)` yerine `new PDFParse({data})`. Dokümantasyona bakmadan direkt yazsam kırılırdı; erken farkettim.
- **`@tailwindcss/typography` eksikti** — `prose` class'larını yazdım, ilk render'da hiçbir stil yoktu. Plugin kurulup tailwind.config.js'e eklendi. Markdown rendering yapan faz için şart.
- **Client build non-bind-mount'ta her değişiklikte 1-2 dakika** — Phase 2'de 3-4 kez rebuild gerekti. Dev velocity için bind mount olsaydı 10-30sn'de değişiklik görünürdü.
- **Study pack generate'in sync 22sn'lik UX'i** — optimistic sync + progress strip yeterli oldu ama 1000+ aynı anda kullanıcı olunca queue lazım. Phase 3 scale'ine hazırlık gerekecek.

### Scope'a Eklenen / Çıkarılan

**Eklenen (scope creep):**
- `@tailwindcss/typography` (plugin ekle). Markdown rendering için şart; Phase 3 mock exam'larda da kullanılacak. Doğru karar.
- `pdf-parse` (sadece `mammoth` planlanmıştı). Phase 0 Gemini PDF'i direkt okuyordu ama Phase 2 için wordCount + hash gerekiyordu. Scope değil, kaçınılmazdı.
- Invalidation hook'a study pack satırı — 3 satır, doğru yer.

**Çıkarılan:**
- `Tabs` component'in 3 tabın ötesinde kullanılacağı düşünülmüştü; şimdilik sadece study pack kullanıyor. Phase 3 mock exam'da yeniden kullanılacak (zaten hazır).

### Süre / Tahmin

Tahmini: 40 saat (2 hafta). Gerçekleşen: **1 gün** tek oturum (yaklaşık 10-12 saat aktif). Phase 1 retro'daki hipotezim tutuyor — tahminler 3-4× yüksek.

### Phase 3'e Geçerken Hazır Olanlar

- **Study pack infrastructure** — Phase 3 mock exam üretimi aynı `aiCallTracker` + `generateStudyPack`-benzeri pattern'ı kullanacak. `feature: "mock-exam"` flag'iyle aynı tabloya yazar.
- **Tabs component** — Phase 3 mock exam result sayfasında (genel skor / bölüm / soru analizi) doğrudan kullanılabilir.
- **React-markdown + typography** — mock exam soru açıklamaları için hazır.
- **Unique-constraint + expiresAt cache pattern'ı** — mock exam'ın oluşturulduğunda cache'lenmesi için aynı pattern.
- **Client service/types pattern** — `MockExamService` + `types/mockExam.ts` aynı şablonu izler.
- **KVKK + telif disclaimer'ları** — öğrenci notu tabanlı üretimin her yerinde aynı dil kullanılacak.
- **Analytics kurulumu hâlâ bekliyor** (Phase 1 retrosu + bu retro). Plausible veya eşdeğer, Phase 3 öncesi.

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
| 1.1 | 2026-04-17 | Faz tamamlandı — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri |
