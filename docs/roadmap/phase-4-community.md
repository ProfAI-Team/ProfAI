# Phase 4 — Topluluk Katmanı 🤝

**Süre:** 3 hafta
**Statü:** Planlı
**Hedef:** **Network etkisi yaratmak** — moat + viral büyüme.

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

- [ ] Yeni kullanıcı 1 sınav yükleyip 10 kredi kazanır.
- [ ] Sınav 3 onay aldıktan sonra "verified" rozeti alır.
- [ ] AI üretilen soruda her öğrenci oy kullanabilir (1 kez).
- [ ] Aynı hocadan 5+ kişi varsa eşleştirme önerisi çıkar.
- [ ] Onay süreci KVKK uyumlu (hoca adı public, öğrenci bilgisi anonim).
- [ ] Spam detection: aynı user'dan 10+ yükleme/gün → manuel review queue.

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

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
