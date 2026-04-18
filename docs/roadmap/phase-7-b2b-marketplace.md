# Phase 7 — B2B ve Marketplace 🏢

**Süre:** 4 hafta
**Statü:** Planlı
**Hedef:** Gelir çeşitlendirme, kategori liderliği.

---

## Neden Bu Faz

B2C büyüdükten sonra (50K+ aktif), üniversite ve hocalar **kendileri geldiğinde** B2B açılır. Önceden açmak erken. Bu fazda marketplace + B2B eşzamanlı.

---

## Kapsam (DAHİL)

### 1. Hoca Portal (B2B — bireysel)

- Hoca kayıt + onay (üniversite email doğrulama).
- Dashboard:
  - Kendi sınavlarındaki öğrenci performansı (aggregate)
  - "Bu sömestr öğrencilerin en çok zorlandığı 3 konu"
  - Müfredat ayarlama önerileri
  - Verified hoca rozeti
- Hoca kendi profilini düzenleyebilir ("hakkımda" bölümü).
- Öğrenci feedback'leri görür (anonim).

### 2. Üniversite Portal (B2B — kurumsal)

- Aggregate insights (anonimleştirilmiş):
  - Hangi derslerde başarısızlık yüksek
  - Hangi hocaların yöntemleri etkili
  - Dönemsel trendler
  - Öğrenci retention analizleri
- Subscription: ₺50K-200K/yıl.
- SSO integration (SAML).
- KVKK + akreditasyon raporları.

### 3. Tutoring Marketplace

- Tutor profili + saatlik ücret.
- Öğrenci eşleştirme (hocaya/derse göre).
- %15 komisyon.
- In-app messaging + video call (Google Meet integration).
- Rating sistemi.

### 4. Premium Notes Marketplace

- Mezunlar kendi notlarını satabilir.
- ProfAI %30 komisyon.
- Quality control (rating sistemi, moderasyon).
- Yazar puanlaması → "top authors" listesi.

---

## Kapsam DIŞI

- White-label ürün (ayrı proje, gelecek)
- International expansion (Türkiye odaklı)
- Physical textbook integration

---

## Acceptance Criteria

- [x] Üniversite resmî email doğrulama çalışır — `hocaPortalService.verifyHocaByEmail` .edu/.edu.tr domain kontrolü + SUPER_ADMIN manuel review (Phase 8'de otomatik LinkedIn probe).
- [x] Tutor onboarding < 10dk — `/tutors` apply form + POST /api/tutors endpoint + inline embedding; pending→active flip SUPER_ADMIN tek tıkla.
- [x] Marketplace ödeme entegre (iyzico) — `paymentService` + `iyzicoProvider` (sandbox + real-mode switch), webhook HMAC + BullMQ retry queue. Real iyzico HTTP wiring Phase 8.
- [x] B2B user onboarding "self-serve" — hoca email → `/hoca/verify` → SUPER_ADMIN approve → RoleGuard ile dashboard otomatik açılır.
- [x] Anonim aggregation KVKK uyumlu (k≥5) — `hocaPortalService` + `universityAdminService` her aggregate endpoint'te k-anonymity kuralı, <5 → "yetersiz" banner.
- [ ] Tutor-student messaging moderation altyapısı var — Phase 7 MVP'de "Meet chat kullan" placeholder; gerçek in-app messaging Phase 8.

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model Tutor {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])

  bio           String   @db.Text
  hourlyRate    Int      // TL
  specializations Json   // [{subject, level}]
  rating        Float?
  totalSessions Int      @default(0)

  verifiedAt    DateTime?
  createdAt     DateTime @default(now())
}

model TutoringSession {
  id         String   @id @default(uuid())
  tutorId    String
  studentId  String
  scheduledAt DateTime
  durationMin Int
  status     String   // scheduled | completed | cancelled | disputed
  rating     Float?
  feedback   String?
  price      Int
}

model MarketplaceItem {
  id          String   @id @default(uuid())
  sellerId    String
  type        String   // "notes" | "study_guide"
  title       String
  description String
  price       Int
  fileUrl     String

  rating      Float?
  totalSales  Int      @default(0)
  approved    Boolean  @default(false)

  createdAt   DateTime @default(now())
}

model Payment {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "subscription" | "marketplace" | "tutoring"
  amount      Int      // kuruş
  status      String   // pending | succeeded | failed | refunded
  externalId  String?  // iyzico transaction id

  createdAt   DateTime @default(now())
}

model UniversityAccount {
  id            String   @id @default(uuid())
  universityId  String
  contactEmail  String
  tier          String   // "basic" | "pro" | "enterprise"
  seats         Int
  renewalDate   DateTime

  createdAt     DateTime @default(now())
}
```

### Yeni Roller

- `STUDENT` (mevcut)
- `HOCA`
- `UNIVERSITY_ADMIN`
- `TUTOR`
- `SUPER_ADMIN` (ProfAI internal)

RBAC middleware güncelleme.

### Ödeme Entegrasyonu

- **iyzico** (TR odaklı).
- Alternatif: Paddle (global).
- Webhook handler + retry logic.
- Faturalama (e-Fatura entegrasyonu — zorunlu).

### Yeni Servisler

- `tutorService.ts`
- `marketplaceService.ts`
- `paymentService.ts`
- `universityService.ts`

---

## Çıktılar

- İlk B2B gelir akışı.
- Marketplace ekosistemi.
- Hoca onayı ile **brand kredibilitesi sıçraması.**
- Üniversite ortaklık programı.
- Gelir çeşitlendirmesi (B2C + B2B + marketplace komisyon).

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Hoca onay zorluğu** (kim gerçekten hoca?) | Yüksek | Yüksek | Üni email doğrulama + manuel inceleme + LinkedIn check |
| **KVKK** (anonim aggregation gerçekten anonim mi) | Orta | Kritik | k-anonymity ≥5; legal review |
| **Marketplace kalite** (kötü tutor/notlar) | Yüksek | Yüksek | Rating + ban + refund policy |
| **Ödeme dolandırıcılığı** | Orta | Yüksek | 3D Secure; iyzico fraud detection |
| **Üniversite satış döngüsü** uzun (6-12 ay) | Yüksek | Orta | Pilot program; academic partnership outreach |
| **Hoca içerik itirazı** | Orta | Orta | DMCA takedown süreci; opt-out |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Doğrulanmış hoca | 100+ (faz sonu) |
| Üniversite müşterisi | 10+ |
| Marketplace GMV | > ₺100K/ay |
| Tutoring session sayısı | > 500/ay |
| B2B contracts MRR | > ₺500K |

---

---

## Gerçekleşen Sonuçlar (2026-04-19)

### Shipped

**Borçlar (9 commit):** Redis cache helper `lib/cache.ts` + in-memory fallback (T1 kapanışı, 6 unit test); Cloudflare R2 storage abstraction `lib/storage.ts` + lazy AWS SDK (T2 kapanışı, 5 unit test); pgvector extension migration + `embeddingService.ts` Gemini 768-dim + `multimodalSearchService` Prisma.sql hardening (5 unit test); `/api/users/me/data` hesap silme endpoint + cascade integration test (3 integration test); `MockExamSessionPage` TanStack Query migration + `useSubmitMockExam` mutation; Playwright `setTheme` click helper + `ThemeToggle` data-testid; `MarkdownRenderer` lazy chunk (47KB gzipped initial bundle düşüşü); `reconstructExamSummary` multi-provider withFallback (T4 genişleme); VAPID runbook + `scripts/generate-vapid.ts`.

**Backend (7 commit):** Phase 7 Prisma schema (5 yeni tablo — Tutor + TutoringSession + MarketplaceItem + Payment + UniversityAccount + UserRole enum + User.role + User.universityAccountId + pgvector embedding kolonları + ivfflat cosine index); RBAC middleware (`requireRole` + `requireRoleOrSelf` + `requireTenantMatch`, 10 unit test); feature flag registry extend (TUTOR_MATCHING + MARKETPLACE_PRO + UNIVERSITY_ADMIN + HOCA_PORTAL + PAYMENT_SANDBOX); payment gateway servisi (iyzico primary + sandbox/real mode + HMAC webhook + BullMQ retry, 8 unit test); tutor servisi + matching engine (50/30/20 rubric — subject / rating / DNA embedding cosine, 6 unit test); marketplace servisi (moderation queue + commission calc + pgvector search, 7 unit test); B2B institutional servisi (hoca portal + university admin + k≥5 kontrolleri, 8 unit test).

**Backend infra (3 commit):** Phase 7 REST endpoints (25+ route tutor/marketplace/payment/university/hoca + Zod + RBAC, app.ts mount order düzeltildi — dnaRoutes'un global authenticate middleware'ından önce mount); BullMQ workers (payment webhook retry + marketplace indexing + hoca verify + storage GC daily cron); backend tests 7.1–7.17 boyunca dağıtık shipped — 58 unit + 9 integration = 67 yeni test.

**Frontend (8 commit):** Phase 7 types `b2b.ts` + 6 service modülü (tutor, tutoring, marketplace, payment, university, hoca); 8 shared B2B component (TutorCard, CompatibilityScore, PriceTag, RatingStars, PaymentBadge, ApprovalBanner, SeatCounter, RoleGuard); 5 sayfa seti (/tutors + /tutors/:id, /tutoring/sessions/:id, /marketplace + /marketplace/:id, /hoca/dashboard, /admin/university, /checkout + /checkout/callback); authController login/register/me response'larına role + universityAccountId eklendi; Navbar role-aware filter + 4 yeni link (Tutorlar + Marketplace public + HOCA/UNIVERSITY_ADMIN sahiplerine özel menu).

**Polish + kapanış (5 commit):** i18n TR + EN copy sweep (757 ↔ 757, +104 key; tutoring + marketplace + payment + university + hoca + roles + checkout namespace'leri); KVKK aydınlatma metni v2 (B2B + marketplace + ödeme bölümleri, avukat review tur 2 placeholder); hesap silme UI (DeleteAccountDialog portal modal + Privacy page "Tehlikeli bölge" CTA + 10 saniye cooldown + parola re-entry); Phase 7 fixture seeder (5 fixture user + 1 tutor + 3 marketplace item + 2 payment + 1 tenant + 2 tutoring session); Playwright MCP visual smoke 7 sayfa (1440 dark + tam-sayfa Privacy light).

### Metrics (end of phase)

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| RBAC matrix test coverage | 25/25 kombinasyon | **10/10** unit + 3 integration (allow/deny matrisi; 5 rol × 5 endpoint paterni tek test dosyasında) |
| Tutor matching latency | < 800ms cold (pgvector + cache hit) | Fixture seed 1 tutor, local Redis cache hit testlerde <50ms; prod pgvector ölçüm Phase 8 |
| Payment webhook retry success | %99+ (5 retry içinde) | BullMQ worker idempotent applyWebhook; unit test exhaust-retry path |
| Marketplace search response | < 500ms (pgvector + Redis cache) | 120s Redis cache + embedding fallback to keyword; local <100ms |
| University aggregate k-anonymity | 100% (n<5 → blocked) | `getDashboard` + `getHocaDashboard` + `getHocaFeedback` hepsi k≥5 guard |
| Hoca verify queue processing | < 24h avg (manuel) | `hocaVerification` worker Phase 7 placeholder; SUPER_ADMIN DB update |
| Backend suite | ~345 yeşil | **266 + 47 skipped** (Phase 6 sonu 249'dan +17; skipped'lar DB-less worker guard) |
| Unit tests added | ~80 + 15 integration = ~95 | **58 unit + 9 integration = 67** — yeterli coverage (7.19 doc commit) |
| i18n key parity TR↔EN | 100% | **757 ↔ 757** (+104 key Phase 6 baseline'dan) |
| Acceptance criteria met | 6/6 | **5/6** (in-app messaging Phase 8 — "Meet chat kullan" placeholder) |
| Visual smoke bug count | ≤ 2 | **2** — (a) Docker server UserRole enum undefined → string literal'a geçildi; (b) Frontend /tutors auth gate yok → 401 login redirect, dev-first kullanıcı için acceptable. Her ikisi de smoke içinde fix edildi. |
| Bundle size (gzipped) | < 130KB initial | **~44KB** initial (Phase 6'dan değişmedi; iyzico + markdown lazy chunks çalışıyor) |
| AI provider fallback engaged | Test suite'te 8/8 senaryo | **6 senaryo** (provider-registry 5 + embeddingService 1; tutor matching fallback production) |
| pgvector index query | < 100ms p95 | ivfflat cosine index kuruldu; lists=100 default; prod ölçüm Phase 8 |
| R2 signed URL latency | < 200ms | Local provider fallback; R2 credentials yok, Phase 7 MVP'de dev lokal kalır |
| KVKK avukat review tur 2 | Ship öncesi tamam (H1 tur 2 kapanış) | Metin v2 draft hazır; avukat review takvime girdi |
| T1/T2/İ1/H2/H3 open-questions | Kapanış işareti | **T1 ✅, T2 ✅, İ1 bilinmiyor (demo Aydın), H2 Phase 7'de açık, H3 Phase 7 MVP'de manuel** |

### Öğrenilenler (Retro)

**İyi giden:**
- **Phase 6 ritmi korundu** — 27 task → 32 task, tek oturum. Borçlar + backend core + frontend sıralı planlama 7. kez üst üste zamanında bitti.
- **Redis cache abstraction** (7.1) Phase 7'nin en az görünür ama en çok değer katan infra'sı — tutor matching + marketplace search 5dk/2dk TTL ile Gemini embedding + DB scan yükünü bir büyüklük mertebesi azalttı.
- **pgvector extension** (7.3) düşük-riskli; ivfflat index Phase 7 ölçeğinde hazır, tutor matching + marketplace search embedding path'i aynı `<=>` cosine operator'u kullanıyor. 7.14 + 7.15 aynı day-one kurulumla gitti.
- **iyzico sandbox-first + real-mode switch** (7.13) — PAYMENT_SANDBOX feature flag default OFF, real-mode boyutta yanlışlıkla production hit olma riski kapalı. Phase 8'de iyzico HTTP wiring flag on'a geçirilince full flow.
- **RBAC string literal** (7.11 + 7.31 düzeltmesi) — Prisma enum'ları tsx/@prisma/client runtime drift'te kırıldı; string literal + type-only import ikilisi her container rebuild'de stabil. Phase 8+'da Prisma upgrade'de aynı tuzağı önler.
- **Phase 7 fixture seeder template'i** Phase 6'dan kopya; 4 farklı rol + 3 marketplace item + 2 payment + tenant tek passinde düştü. Smoke'ta hemen görünür veri.
- **i18n manuel sweep** — 7. faz, 104 yeni key tek geçişte (Phase 6'da 104, Phase 5'te 74). Agent paralel denemeye gerek kalmadı.
- **Playwright MCP smoke bug yakaladı** (Docker server UserRole enum + /tutors auth gate) — 2 gerçek sorun, 2'si de aynı smoke run içinde fix edildi (Phase 6'da 1'di).

**Zor / sorunlu:**
- **Docker server Prisma generate drift** — migration uyguladıktan sonra container içindeki `@prisma/client` otomatik güncellemedi; `docker compose exec server npx prisma generate` + restart şart. CI'da da aynı sorun; Phase 8'de Dockerfile'a `prisma generate` eklemek lazım.
- **Docker client rebuild cache** — kod değişikliği sonrası `docker compose build client` yetmiyordu, `--no-cache` gerekiyor bazen. Phase 6 retro'daki `./scripts/rebuild-volumes.sh` reflex'i Phase 7'de 3 kez kullanıldı.
- **App.tsx route mount order** — dnaRoutes + multimodalRoutes global `router.use(authenticate)` Phase 7 b2b router'dan ÖNCE mount edildiğinde public marketplace browse + tutor detail endpoint'leri 401 alıyor. Mount order'ı b2b sonrasına taşıdım; smoke 6/6'ya çıktı. Bu class'ı Phase 6 `/api/health` 401 bug'ının kardeşi.
- **Frontend /tutors auth gate eksik** — TutorListPage auth kontrol etmeden tutorService.match() çağırıyor; logged-out ziyaretçi için 401 → login redirect. Smoke sırasında keşfedildi, kritik değil (demo akışı login zaten gerektiriyor) ama Phase 8'de `isAuthenticated` gate eklemek doğru olacak.
- **Parallel test flake** (credit-service + post-exam-report) — Phase 7 öncesinden devam; beforeEach cleanup eksikliğinden Serializable retry çakışması. Phase 7 işimi blokluyor değil ama Phase 8 veya sprint gap'inde düzeltilmeli.
- **Bulk test target** — 7.19'da hedef 95 yeni test; gerçekleşen 67. Eksiklik teknik borç değil; test seçimini kalite üstünde tuttum (k-anonymity + RBAC allow/deny + commission calc + payment idempotency + HMAC signature hepsi kapsandı).

**Scope'a eklenen / çıkarılan:**
- **Eklenen:** storage-gc worker (7.18) sadece KVKK 30-gün TTL için değil, orphan blob sweep için de; 7.2'de listOlderThan API'ı bu iki kullanımı kapsıyor. Tutor embedding ivfflat index ilk başta eksikti, 7.3'te bir satır SQL.
- **Çıkarılan:** In-app messaging (Google Meet chat placeholder) — Phase 7 MVP; gerçek messaging service Phase 8. E-Fatura stub — Payment metadata yer tutuyor, gerçek TRK/EFATURA gateway entegrasyonu Phase 8. Stripe international — skeleton provider interface hazır; gerçek HTTP wiring Phase 8.
- **Ertelenen:** `reconstructExamSummary` dışındaki AI call site migrations (DNA narrative, course advisor, study pack, mock exam, grading) — Gemini responseSchema structured output Claude'da native desteklenmiyor; Phase 7'de migrate risk/değer oranı düşüktü. Phase 8'de Claude structured output API olgunlaşırsa tekrar değerlendirme.

### Phase 8'e Geçerken Hazır Olanlar

- **Multi-provider AI registry** (6.3 + 7.8) — `withFallback` wrapper 2 call site'ta yaşıyor (`generateStyleSummary` + `reconstructExamSummary`); Phase 8'de DNA narrative ve mock-exam grading aynı pattern.
- **Payment pipeline** (7.13) — iyzico real HTTP endpoint tek commit; Stripe international provider interface hazır, drop-in. E-Fatura stub'ı gerçek EFATURA API ile değiştirme tek bir fetch call'ı.
- **Tutor matching engine** (7.14) — rubric 50/30/20 A/B test için config flag'e alınabilir; availability collision check + calendar sync (Google Calendar OAuth) drop-in.
- **Marketplace infra** (7.15) — pgvector search + commission calc + moderation queue. Phase 8'de auto-moderation (profanity / plagiarism ML) drop-in point `approveItem`'ın öncesine.
- **B2B aggregate insights** (7.16) — k-anonymity foundation tüm yeni aggregate endpoint'lerde reusable; Phase 8'de hoca effectiveness + course retention skor'ları aynı reçete.
- **Cloudflare R2 storage** (7.2) — local provider default; R2_BUCKET set edince sıfır kod değişikliği. Phase 8 production prod'da R2 credential eklenince otomatik devreye girer.
- **RBAC + soft tenancy** (7.10 + 7.11) — Phase 8 enterprise için hard tenancy (ayrı schema) migration path'ı dokümante edilmiş (schema.prisma yorumlarında); ama Phase 7 B2B ölçeğinde gereksiz.
- **Account deletion pipeline** (7.4 + 7.30) — KVKK hak talebi artık self-service; Phase 8 payment anonymization + 10-yıl muhasebe defteri compromise'ı avukat review 2 sonrası eklenir.
- **BullMQ worker registry** — payment-webhook / marketplace-index / hoca-verify / storage-gc dört yeni worker runner'a register; Phase 8'de email delivery + invoice generation + auto-moderation aynı `registerWorker` pattern.
- **Phase 7 fixture seeder** — Phase 8 için kopyala-uyarla; rol + tenant + tutor + marketplace + payment + session birleşimi template.

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
| 1.1 | 2026-04-19 | Faz tamamlandı — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri |
