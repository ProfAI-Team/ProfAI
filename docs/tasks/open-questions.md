# Açık Sorular

Karar bekleyen konular. **Yaşayan doküman** — karar verildiğinde "✅ Kapatıldı" olarak işaretle, ilgili doküman güncellemesini ekle.

---

## Ürün Kararları

### Q1. AI çıktı tarzı — samimi mi, akademik mi?

- **Durum:** Açık.
- **Seçenekler:**
  - A) Samimi ("Peri hoca scrum rolleri sorar, yakala!")
  - B) Akademik ("Profesör Güneş scrum framework sorularını %40 oranında soruyor.")
  - C) Hibrit (varsayılan akademik, kullanıcı toggle ile samimi)
- **Eğilim:** C — karma, default akademik.
- **Karar zamanı:** Phase 1 prompt iteration sırasında.

### Q2. Free tier sınırı

- **Durum:** Açık.
- **Seçenekler:**
  - A) Cömert: 10 hoca analizi/ay + 3 study pack/ay — yüksek edinim, düşük dönüşüm.
  - B) Orta: 3 hoca/ay + 1 study pack/ay — dengeli.
  - C) Sıkı: 1 hoca/ay, study pack premium only — yüksek dönüşüm, düşük edinim.
- **Eğilim:** B.
- **Karar zamanı:** Phase 3 (premium launch öncesi).

### Q3. Hoca opt-out senaryosu

- **Durum:** Açık.
- **Soru:** Hoca kendi adını ProfAI'dan silmek isterse ne yaparız?
- **Seçenekler:**
  - A) Tam sil (sınav analiz de kaldır).
  - B) Anonim "Hoca A — Computer Engineering" göster, sınav analiz kalsın.
  - C) Hibrit — hoca karar versin.
- **Eğilim:** C.
- **Karar zamanı:** Phase 1 sonu (KVKK review ile).

### Q4. Sınav cevap key paylaşımı

- **Durum:** Açık.
- **Soru:** Mock exam cevap key'i public mi, premium mu?
- **Seçenekler:**
  - A) Premium only (etik olarak daha güvenli).
  - B) Free ama watermark ("ProfAI — Sadece çalışma için").
  - C) Hibrit — yeni sınav free, 1 yıldan eskisi public.
- **Eğilim:** A.
- **Karar zamanı:** Phase 3.

### Q5. Mobile-first vs desktop-first

- **Durum:** Açık.
- **Veri:** Hedef öğrenci kitlesi %60 mobil, %40 desktop (tahmini).
- **Eğilim:** Mobile-first (Phase 0'da desktop ağırlık eksikti, Phase 6'da düzeltilecek).
- **Karar zamanı:** Phase 6 (React Native kararı ile).

### Q6. Tagline seçimi

- **Durum:** Açık.
- **Adaylar:**
  - "Profesörünü tanı, sınava hazır gel."
  - "Hocan nasıl soruyor? Bil, hazırlan, başar."
  - "Akademik co-pilot'un — sınava 4 yıl boyunca yanında."
- **Eğilim:** 1. seçenek (kısa, net).
- **Karar zamanı:** Phase 1 demo öncesi.

---

## Teknik Kararlar

### ✅ T1. Cache strategy — Redis seçildi (2026-04-19, Phase 7 task 7.1)

- **Karar:** B — Redis-backed `server/src/lib/cache.ts` helper, in-memory Map fallback test + dev ortamları için.
- **Gerekçe:** Phase 5 BullMQ'nun getirdiği Redis singleton zaten çalışıyordu; cache için ikinci bir runtime dependency eklemek yerine aynı instance'tan (farklı bağlantı, `maxRetriesPerRequest` default) yararlandık. Phase 7 tutor matching + marketplace search hot path'leri multi-instance'ta tutarsız olmasın diye Redis şart. Prisma-backed cache'ler (AcademicDNA, ProfessorStyleProfile, CourseAdvisor) zaten multi-instance safe — oldukları yerde kaldılar.
- **Etki:** `server/src/lib/cache.ts` (`cacheGet` / `cacheSet` / `cacheDel` / `cacheInvalidate` + `__resetCacheForTests`); `REDIS_URL` yoksa veya `RUN_INLINE_QUEUE=1` test modunda in-memory Map; key prefix `profai:cache:`; pattern invalidation SCAN stream ile; Redis hatası → implicit miss (fetcher çalışır); 6 unit test yeşil.

### ✅ T2. File storage — Cloudflare R2 seçildi (2026-04-19, Phase 7 task 7.2)

- **Karar:** B — Cloudflare R2 (S3-compatible, egress free). Local provider (`server/uploads`) development + küçük tek-node deploy için varsayılan fallback olarak kalıyor.
- **Gerekçe:** B2B ölçekte OCR görsel + lecture audio + marketplace dosyaları tek VM diskini şişiriyor; multi-replica rollout'ta evicted pod dosyayı kaybediyor. R2 egress-free + S3 API → AWS SDK direk kullanılabiliyor, CDN için opsiyonel public base URL. AWS S3'ü seçmemek için gerekçe: egress maliyeti aylık tahmini 50-100 TL fazla (marketplace notes download volume kestirilemez; R2 güvenli).
- **Etki:** `server/src/lib/storage.ts` (`StorageProvider` interface + local + r2 provider, lazy AWS SDK import); `getStorage()` singleton + `__resetStorageForTests`; public API `put` / `publicUrl` / `delete` / `listOlderThan`; R2 env'leri `server/.env.example`'da documented (`R2_BUCKET` switch'i); signed URL TTL 3600s default + `R2_PUBLIC_BASE_URL` varsa CDN URL'i. Mevcut OCR/voice/lecture controller'ları bu faz için lokal davranışla devam eder; yeni Phase 7 marketplace upload'ları doğrudan `storage.put()` pattern'ı. 5 unit test yeşil.

### ✅ T3. Background jobs — BullMQ seçildi (2026-04-17, Phase 5 task 5.5)

- **Karar:** BullMQ + Redis.
- **Gerekçe:** Phase 5 spaced repetition scheduler günlük tetiklenmeli + multi-instance'ta duplicate job koruması şart. node-cron multi-worker'da aynı cron'u iki kez çalıştırırdı. BullMQ repeat + Redis lock bu sorunu temiz çözüyor. Ayrıca mevcut `studyGroupService.closeStaleGroups` hiç tetiklenmiyordu — BullMQ wiring onu da canlandırdı.
- **Etki:** `docker-compose.yml`'a `redis:7-alpine` servisi + healthcheck; `server/src/lib/queue.ts` abstraction (prod BullMQ / test `RUN_INLINE_QUEUE=1` inline handler); `server/src/jobs/runner.ts` worker registration; `REDIS_URL` + `RUN_JOBS` env flag'ları; ilk BullMQ job `studyGroupMaintenance` (cron `0 2 * * *`). Test suite inline mode'da Redis'siz çalışıyor.

### ✅ T4. AI provider stratejisi — Gemini primary + Claude fallback (2026-04-19, Phase 6 task 6.3)

- **Karar:** B — Gemini 2.5 Flash Lite primary, Claude 4.7 Opus text fallback.
- **Gerekçe:** Phase 6 voice tutor + lecture transcribe Gemini Live'a bağımlı, geo-restriction riski spec'te yüksek. `withFallback` wrapper her AI call'a tek satırda fallback hook'u veriyor; Claude provider lazy (`@anthropic-ai/sdk` dynamic import, `CLAUDE_API_KEY` set değilse hiç yüklenmez). OpenAI Realtime slot'u voice tutor için ayrıldı (6.11).
- **Etki:** `server/src/services/llm/providerRegistry.ts` (withFallback + isProviderRetryable + getConfiguredProviders); `server/src/services/llm/claudeProvider.ts` (lazy SDK, generateText + generateStructured); `AICallLog.provider` kolonu zaten vardı, `fallbackUsed` flag 6.8 migration'ında eklenecek. İlk migrated call: `generateStyleSummary` (professorStyleService.ts). Diğer Gemini call'ları faz boyunca aynı pattern'le genişleyecek.

### T5. Mobile — React Native / Flutter / Native

- **Durum:** Açık.
- **Seçenekler:**
  - A) PWA only (kod paylaşım %100).
  - B) React Native (web kod %60 paylaşım).
  - C) Flutter (%0 paylaşım, iyi UX).
  - D) Native (iOS + Android ayrı).
- **Eğilim:** A → Phase 5; B → Phase 6.
- **Karar zamanı:** Phase 5 sonu.

### T6. Structured output — Gemini schema vs Zod parse

- **Durum:** Açık.
- **Seçenekler:**
  - A) `responseSchema` with Gemini native.
  - B) Zod post-parse.
  - C) Her ikisi (defensive).
- **Eğilim:** C.
- **Karar zamanı:** Phase 1.

---

## İş Modeli Kararları

### İ1. İlk hedef üniversite

- **Durum:** Açık.
- **Seçenekler:**
  - A) İstanbul Aydın (mevcut user base, gerçek veri hazır).
  - B) Boğaziçi (prestij, marketing avantajı).
  - C) Hacettepe / ODTÜ (kalıcı brand).
- **Eğilim:** A → 0-100 kullanıcı; sonra B veya C.
- **Karar zamanı:** Phase 4.

### İ2. Premium fiyat — ₺49 doğru mu?

- **Durum:** Açık.
- **A/B test planı:** ₺29 vs ₺49 vs ₺79.
- **Eğilim:** ₺49.
- **Karar zamanı:** Phase 3 (premium launch).

### İ3. Yatırım stratejisi — Bootstrap vs Seed funding

- **Durum:** Açık.
- **Seçenekler:**
  - A) Bootstrap (mevcut kaynaklarla, Phase 4'e kadar).
  - B) Pre-seed (500K TL, Phase 3'te).
  - C) Seed (5M TL, Phase 4+).
- **Eğilim:** A → B → (belki C).
- **Karar zamanı:** Phase 3 sonu.

### İ4. Co-founder / ekip

- **Durum:** Açık.
- **Soru:** Kim katılacak? Hangi rollerle?
- **Eğilim:** 1 dev (backend ağırlık) + 1 growth/marketing.
- **Karar zamanı:** Phase 3 — kritik hiring.

### İ5. Yıllık abonelik indirimi

- **Durum:** Açık.
- **Seçenekler:**
  - A) %15 indirim (₺499/yıl).
  - B) %25 indirim (₺439/yıl).
  - C) Sezonluk (sınav dönemi ₺199/3 ay).
- **Eğilim:** C (öğrenci davranışına uygun).
- **Karar zamanı:** Phase 3.

---

## Hukuki Kararlar

### H1. KVKK aydınlatma metni

- **Durum:** Açık — acil!
- **Eylem:** Avukatla çalış (Phase 1 öncesi öncelik).
- **Karar zamanı:** Phase 1'den önce.

### H2. Üniversite ortaklık modeli

- **Durum:** Açık.
- **Seçenekler:**
  - A) Revenue share (%30 → üni).
  - B) Lisans ücreti (₺100K/yıl).
  - C) Free (karşılığında brand association + data).
- **Eğilim:** C başlangıçta, sonra B.
- **Karar zamanı:** Phase 7.

### H3. Hoca onay süreci

- **Durum:** Açık.
- **Seçenekler:**
  - A) Email + LinkedIn yeterli.
  - B) + ID kartı fotoğrafı.
  - C) + üniversite HR onay.
- **Eğilim:** A başlangıçta, sorun çıkarsa B.
- **Karar zamanı:** Phase 7.

---

## Kararlar Nasıl Verilir

1. **Ben (Erdem) sorumluyum** — her karar bir aksiyon.
2. Karar verildiğinde:
   - Bu dosyada "✅ Kapatıldı (YYYY-MM-DD)" olarak işaretle.
   - Karar gerekçesini 1-2 cümleyle yaz.
   - Etkilenen dokümanları güncelle.
3. Yeni soru çıkarsa → uygun kategoriye ekle.

---

## Kapatılmış Kararlar (örnek format)

### ✅ C1. Gemini model seçimi (2026-04-10)

- **Karar:** `gemini-2.5-flash-lite` kullan (not `gemini-2.5-flash`).
- **Gerekçe:** Flash 503 error veriyordu production testlerde; flash-lite stabil + %40 ucuz.
- **Etki:** `server/.env`, `GEMINI_MODEL` env var, `current-stack.md`.

### ✅ D1. Breaking npm upgrade kalanları (Phase 6 task 6.1 ile tamamen kapatıldı, 2026-04-19)

- **Uygulanan (Phase 4):** bcrypt 5→6 — hash API aynı, Node 20 LTS minimum karşılanıyor; 86 backend testi yeşil.
- **Uygulanan (Phase 5, task 5.1):** vite 5→8 + `@vitejs/plugin-react` 4→6 — client `npm run build` + dev server (`vite v8.0.8 ready in 114ms`) smoke geçti. Bonus: initial chunk 546KB/177KB → 124KB/40KB gzipped (v8'in geliştirilmiş tree-shaking'i).
- **Uygulanan (Phase 6, task 6.1):** **vitest 2→4** tamamlandı. Config değişiklikleri:
  - `maxWorkers` top-level key'e geçildi (vitest 4'te `poolOptions.forks.maxForks` yerine); `VITEST_POOL_ID` 1..maxWorkers clamp'i bu yolla garanti.
  - Default `pool: "forks"` + per-worker `test_worker_<poolId>` Postgres schema isolation opt-in'den default'a flip; `VITEST_WORKER_COUNT` override hâlâ mümkün.
  - `textExtract.test.ts` `vi.hoisted` + class-based mock pattern'ına çevrildi (vitest 4 `vi.fn` constructor semantics sıkılaştırması).
- **Doğrulama:** 229/230 green (1 intentional skip — Phase 5'ten kalan cache-hit, 6.6'da açılacak), 4 worker parallel, duration ~13s (baseline ile tutarlı + paralel headroom).
- **Bonus:** suite ~300 test'e çıkınca 4-worker paralel = ~4x speedup hazır.

---

## İlgili

- Risk matrisi: [`../operations/risks.md`](../operations/risks.md)
- KPI: [`../operations/kpis.md`](../operations/kpis.md)
- Business model: [`../vision/06-business-model.md`](../vision/06-business-model.md)
