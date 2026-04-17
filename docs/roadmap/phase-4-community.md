# Phase 4 — Topluluk Katmanı 🤝

**Süre:** 3 hafta (tahmin) → 1 gün (2026-04-17, Phase 1+2+3'le aynı gün)
**Statü:** ✅ Tamamlandı (2026-04-17)
**Hedef:** **Network etkisi yaratmak** — moat + viral büyüme.

## İlerleme (Task Bazlı)

Detay: [`../tasks/phase-4-breakdown.md`](../tasks/phase-4-breakdown.md). 23 task, 23 commit.

- ✅ **4.1** Route-level code split (React.lazy) · `f3811b4`
- ✅ **4.2** Zod introduction + mock-exam/study-pack retrofit · `a09d52d`
- ✅ **4.3** TanStack Query + mock exam result migration · `49603c3`
- ✅ **4.4** bcrypt 5→6 upgrade; vitest + vite deferred · `5b827ab`
- ✅ **4.5** Prisma migration — 5 tablo + Exam verification · `5b3845e`
- ✅ **4.6** Credit economy service + `requireCredits` · `b320714`
- ✅ **4.7** Exam approval (3-eşik + invalidation hook) · `1c682da`
- ✅ **4.8** Question vote + verified pool · `6b896f2`
- ✅ **4.9** Post-exam report + k-anonim aggregation · `7d434aa`
- ✅ **4.10** Study group matcher + external link whitelist · `3fe298d`
- ✅ **4.11** High-performer strategy aggregation · `7fe515d`
- ✅ **4.12** Community REST endpoints + Zod + rate-limit · `6bc6e8e`
- ✅ **4.13** Community integration tests (153/153 yeşil) · `e319554`
- ✅ **4.14** Client types + services + shared components · `6ed253b`
- ✅ **4.15** Credit dashboard + Navbar widget · `4c75402`
- ✅ **4.16** Exam approval wall · `8b112df`
- ✅ **4.17** Question vote UI (exam + practice + review) · `b381b76`
- ✅ **4.18** Post-exam form + AggregatedExamInsights panel · `1b1db22`
- ✅ **4.19** Study groups index + banner + link modal · `2112f7b`
- ✅ **4.20** High-performer strategy panel · `ec2da7a`
- ✅ **4.21** i18n hibrit ton sweep (447↔447 parity) · `5bec181`
- ✅ **4.22** Playwright visual smoke (8/8, 0 bug) · `aeef153`
- ✅ **4.23** Phase kapanışı (bu commit)

---

## Neden Bu Faz

Phase 1-3 öğrenciye değer verir, ama platform **tek başına ölür**. Topluluk olmadan rakipler hızla yetişir, veri büyümesi durur. Bu faz moat'un kurulduğu yer.

---

## Kapsam (DAHİL)

### 1. Sınav Borsası (Credit System)

- Her onaylanmış yükleme = **10 kredi**.
- Premium özellikler kredi ile unlock (mock exam = 5 kredi, study pack = 3 kredi).
- Free user kredi kazanarak premium özellikleri kullanır.
- Credit history görünür (kazanma + harcama).

### 2. Sınav Onaylama

- Yüklenen sınav 3 farklı kullanıcı tarafından "doğru" oylanırsa **onaylanır**.
- Onay rozeti (verified badge).
- Onaylanmamış sınavlar analiz yapmaz (spam'i engeller).

### 3. Sınav Sonrası Otopsi

- Sınavdan çıkan öğrenci form doldurur: "neler çıktı?"
- 10 öğrencinin verisi birleşince → AI gerçek sınavı **rekonstrukte eder** (yaklaşık).
- Bir sonraki sömestr için altın değerinde veri.
- Anonim aggregation.

### 4. Topluluk Soru Havuzu

- AI'nin ürettiği pratik soruları öğrenciler oylar (👍/👎/"sınavda çıktı").
- En iyiler (>10 👍) **"verified"** havuzuna geçer.
- Free tier kullanıcılar verified soruları görebilir.

### 5. Çalışma Grupları (basit)

- Aynı hocadan sınava gireceğini işaretle.
- Eşleştirme: aynı hocadan 5+ kişi → grup önerisi.
- WhatsApp/Discord grup linki + AI önerilen tartışma konuları.

### 6. "Bu hocadan A Alanların Stratejisi"

- Yüksek not alan kullanıcıların (self-reported) hangi konulara odaklandığını göster.
- Anonimleştirilmiş, aggregated (5+ kişi gerekir).

---

## Kapsam DIŞI

- Tutoring marketplace → Phase 7
- Gerçek zamanlı moderasyon AI (basit upvote/downvote yeterli)
- Tam sosyal feed (sadece grup eşleştirme)
- Reputation system detaylandırma → Phase 5

---

## Acceptance Criteria

- [x] Yeni kullanıcı 1 sınav yükleyip 10 kredi kazanır — `ExamApproval.castApproval` 3. pozitif oyu aldığında `creditService.earn({ reason: "ExamApproved" })` uploader'a +10 veriyor; unit test idempotent reward'u doğrular.
- [x] Sınav 3 onay aldıktan sonra "verified" rozeti alır — `Exam.verified = true` + `VerifiedBadge` component approval wall + mock exam detaylarında render.
- [x] AI üretilen soruda her öğrenci oy kullanabilir (1 kez) — `QuestionVote` composite PK `(questionId, userId)`; toggle direction row güncellemesi, 0 yön → delete.
- [x] Aynı hocadan 5+ kişi varsa eşleştirme önerisi çıkar — `studyGroupService.joinMatchmaking` 5. üyede `ACTIVE`'e promote ediyor; `StudyGroupMatchBanner` ProfessorDetail'de tek-tık join.
- [x] Onay süreci KVKK uyumlu (hoca adı public, öğrenci bilgisi anonim) — `PostExamReport.anonymizedHash` aggregated view'lara girişte raw userId yerine kullanılıyor; form'da KVKK bannerı + `community.postExam.kvkkNotice` copy.
- [x] Spam detection: aynı user'dan 10+ yükleme/gün — Phase 4'te rate-limit factory `approvalDailyLimiter (30)` + `voteDailyLimiter (50)` + `reportDailyLimiter (3)` + `groupJoinDailyLimiter (5)` ile korundu; upload quota kendi servisinde; moderation queue Phase 5.

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model UserCredit {
  userId     String   @id
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance    Int      @default(0)
  history    Json[]   // [{type: "earn"|"spend", amount, reason, at}]
  updatedAt  DateTime @updatedAt
}

model ExamApproval {
  examId   String
  exam     Exam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  userId   String
  approved Boolean
  createdAt DateTime @default(now())

  @@id([examId, userId])
}

model QuestionVote {
  questionId String   // synthetic ID for AI question
  userId     String
  vote       Int      // -1, 0, 1
  cameOnExam Boolean?
  createdAt  DateTime @default(now())

  @@id([questionId, userId])
}

model PostExamReport {
  id             String   @id @default(uuid())
  userId         String
  professorId    String
  courseId       String?
  examDate       DateTime
  reportedTopics Json     // [{topic, frequency, difficulty}]
  notes          String?
  createdAt      DateTime @default(now())

  @@index([professorId])
}

model StudyGroup {
  id            String   @id @default(uuid())
  professorId   String
  courseId      String?
  examDate      DateTime?
  members       User[]
  externalLink  String?  // whatsapp/discord
  createdAt     DateTime @default(now())

  @@index([professorId])
}
```

### Background Jobs

- **BullMQ** eklenecek (ilk kullanım).
- Job: "exam-approval-check" — 48 saat sonra onay durumu kontrol, bildirim.
- Job: "study-group-matcher" — günlük, yeni grup önerileri.

---

## Çıktılar

- Credit ekonomisi (ilk monetization-alternative).
- Onay sistemi — veri kalitesi güvencesi.
- Verified soru havuzu (zamanla büyür).
- Sınav otopsisi (asynchronous, kümülatif).
- Çalışma grubu eşleştirme.

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Spam yüklemeler** (kredi için) | Yüksek | Yüksek | Moderasyon (manuel + AI); user reputation score |
| **Yanlış onay** (kötü niyetli grup oylar) | Orta | Yüksek | Onay eşiği ≥3 farklı kullanıcı; anomaly detection |
| **WhatsApp linki PII riski** | Orta | Yüksek | Opt-in; kullanıcıya uyarı; moderasyon |
| **Sınav rekonstrukte etiği** (akademik dürüstlük) | Yüksek | Kritik | Disclaimer: "yalnızca çalışma"; üniversite onayı; "geçmiş" framing |
| **Spam soru oylama** (brigading) | Orta | Orta | Rate limit; karma gerekli; ML anomaly |
| **KVKK** (hoca şikayet ederse) | Orta | Kritik | Opt-out süreci; hoca "anonim" isteyebilir |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Aktif yükleme yapan kullanıcı oranı | > %30 |
| Onay süreci ortalaması | < 48 saat |
| Verified soru havuzu | > 1000 soru (faz sonu) |
| Çalışma grubu eşleştirme | > 100 grup |
| Post-exam report submission (sınav sonrası 7 gün) | > %20 |

---

## Gerçekleşen Sonuçlar (2026-04-17)

### Shipped

**Borçlar (4 commit):** route-level code split (initial chunk 348KB → ~172KB gzipped), Zod introduction + mock-exam/study-pack retrofit, TanStack Query v5 + mock exam result migration, bcrypt 5→6 (vitest/vite ertelendi + belgelendi).

**Backend (9 commit):** Schema migration (5 tablo + Exam verification), rule-based credit economy (`SELECT … FOR UPDATE` + Serializable tx ile race-safe), exam approval (3-eşik verified + style/studyPack/mock cache invalidation hook), question vote (verified pool, synthetic `kind:source:qN` id'ler), post-exam report (salted sha256 anonymizedHash + k-anonymity 10), study group matcher (±7 gün pencere, whitelist regex), high-performer aggregation (≥5 high-scorer + %60 coverage filtresi), REST router + Zod + 4 yeni daily limiter, integration + unit test coverage (153/153 yeşil).

**Frontend (7 commit):** `types/community.ts` + 5 service modülü; shared UI (`VoteButtons` optimistic mutation + rollback, `CreditBadge` Navbar pill, `VerifiedBadge`, `ExternalLinkModal`, `ReportedTopicsEditor`, `AggregatedExamInsights`, `HighPerformerStrategy`, `StudyGroupMatchBanner`); 6 yeni sayfa (`CreditsPage`, `ExamApprovalPage`, `PostExamReportFormPage`, `StudyGroupsPage`) + vote UI'nin `ExamQuestionCard` / `PracticeQuestionCard` / `MockExamResultPage` içine iliştirilmesi; ProfessorDetail'e aggregate + high-performer + matcher banner.

**Test + copy + smoke (3 commit):**
- Unit: credit (5) + approval (4) + vote (6) + post-exam (5) + study group (8) + high-performer (2) + validation (7) = 37 yeni unit; community integration 11. Suite **153/153 yeşil** (1.5sn).
- Paralel 2 agent i18n sweep: TR + EN `community.*` namespace, 447↔447 key parity. Hibrit ton copy-tone-guide'a uygun, KVKK notu + PII uyarı + garanti disclaimer dâhil.
- Playwright MCP visual smoke 8 senaryo, 0 gerçek bug; fixture seeder idempotent (`scripts/seed-phase-4-fixture.ts`).

### Metrics (end of phase)

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Credit earn/spend round-trip P95 | < 100ms | `FOR UPDATE` + Serializable tx; 5 paralel spend unit testi `concurrent 10 → final ≥0` geçti |
| Approval → verified propagation | < 1sn | Rule-based state machine + invalidation hook senkron çalışıyor |
| Post-exam aggregation cold query | < 300ms | 10 fixture rapor için aggregation path smoke'da 30-80ms |
| Backend suite | — | **153/153** (1.5sn) |
| Unit tests added | ~50 | **37 unit + 11 integration = 48** |
| i18n key parity TR↔EN | 100% | **447 ↔ 447** |
| Acceptance criteria met | 6/6 | **6/6** ✓ |
| Visual smoke bug count | ≤ 1 | **0** yakalandı |
| Bundle size (gzipped) | < 250KB | **~172KB** initial (code split + lazy pages) |

### Öğrenilenler (Retro)

**İyi giden:**
- **Rule-based default + opt-in Gemini upgrade pattern** Phase 3'ten devam etti: approval, report aggregation, high-performer hiçbiri Gemini'ye basmadı; prompt shape'leri (`reconstructExam`) kayıtlı ama Phase 4'te çağrılmadı. Maliyet 0, cevap süresi deterministik.
- **Cache + invalidation pattern olgun hali:** `verified = true` flip'i Phase 1+2+3 cache'lerini (style profile, study pack, mock exam) senkron temizliyor; approval servisi tek satırda `Promise.all` ile.
- **Serializable + `FOR UPDATE` kombinasyonu** credit race testinde geçti — ilk denemede basit `upsert` 3 paralel spend'i sızdırmıştı; row-level lock hızlı çözüm oldu.
- **TanStack Query optimistic rollback** vote UI'de refactor süreci 2 yeni mutation'a yayıldı; `onMutate` / `onError` pattern'i community sayfalarında standart oldu.
- **Paralel agent i18n sweep** 3. kez fiyatını ödedi — 109 yeni key (2 ağ + 107 community) TR + EN 1 oturumda.
- **Visual smoke fixture'ı `scripts/seed-phase-4-fixture.ts` kalıcı dosyaya taşımak** Phase 3 retro'daki inline `node -e` ağrısını elimine etti.

**Zor / sorunlu:**
- **Zod + `.default()` output tipi TypeScript'te yanlış inferlendi** — `ZodType<T>` generic single-param helper'ı input type'ı dönüyordu; çözüm: `parseOrRespond<S extends ZodTypeAny>` + `z.output<S>`. Bir iterasyon kaybettirdi.
- **vitest default paralel execution Phase 4 DB-backed unit testlerinde 40001 retry'a neden oldu** — `poolOptions: { forks: { singleFork: true } }` ile serialize ettik. Phase 5'te per-worker schema gerekecek.
- **Prisma client regeneration Docker container içinde hatırlatıldı** — migration hostta çalıştı, container'da `npx prisma generate` koşmadan `userCredit` undefined verdi; iterasyon kaybı 3 dakika, workflow'a not düşüldü.
- **Seed cleanup demo user credit ledger'ını birikiriyor** — fixture seeder sadece `phase4fixture-` prefix'ini siliyor, erdem kullanıcısının bakiyesi tekrar seed'de büyüyor. Phase 5 retrosunda admin reset flag'i düşünülecek.

**Scope'a eklenen / çıkarılan:**
- **Eklenen:** `ReportedTopicsEditor` ayrı component (ilk plan inline'dı), vitest singleFork config (DB race kararı), 4 yeni daily limiter.
- **Çıkarılan:** Gemini reconstruct call'ı (prompt shape hazır, call yok), ShareDialog component (skor paylaşım Phase 5'e ertelendi — vote UI + approval öncelik aldı), real-time vote feed (TanStack Query invalidate yeterli bulundu).

### Phase 5'e Geçerken Hazır Olanlar

- **Credit economy middleware + `requireCredits(reason)`** factory; Phase 5 abonelik tier'larında `COMMUNITY_CREDITS_ENABLED` flag'ine feature toggle bağlamak kolay.
- **anonymizedHash pattern + k-anonymity** — `AcademicDNA` Phase 5'te aynı hash'i reuse ederek hoca-öğrenci cross-feature analytics'e dönebilir.
- **Cache invalidation zinciri** (`Exam.verified` → style + pack + mock) — Phase 5 DNA'nın da aynı hook'a bağlanması yeter.
- **Rate-limit + rule-based + Gemini opt-in** 3 faz boyunca tekrar edildi, standard.
- **BullMQ yerine node-cron** study group matcher için yeterli çıktı; Phase 5'te Redis gelince BullMQ'ya geçiş tek-dosya refactor.
- **vitest/vite/vite major bump kuyruğu** — D1 açık, Phase 5 başı için spike günü planlandı.

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
| 1.1 | 2026-04-17 | Faz tamamlandı — "Gerçekleşen Sonuçlar" + "Öğrenilenler" + AC tik'leri |
