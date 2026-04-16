# Phase 5 — Akademik DNA ve Persistent Memory 🧬

**Süre:** 2 hafta
**Statü:** Planlı
**Hedef:** **Stickiness** — 4 yıllık veri = yüksek switch cost.

---

## Neden Bu Faz

Topluluk büyüdükçe, öğrenci **bireysel deneyimini kaybetmemeli**. Persistent memory = retention. Phase 4 sosyal, Phase 5 kişisel — ikisi dengede kalır.

---

## Kapsam (DAHİL)

### 1. Akademik DNA Profili

- Sayfa: `/me/profile`
- Tracked:
  - Çözülen pratik soru sayısı
  - Doğru / yanlış oranı
  - En güçlü / zayıf konular
  - Sevilen ders türleri
- Görsel: skill graph (radar chart), strengths/weaknesses list.

### 2. Learning Style Discovery

- Quiz performansından çıkar:
  - **Visual** (chart soruları başarılı)
  - **Reading** (uzun metin başarılı)
  - **Kinesthetic** (problem çözme başarılı)
  - **Auditory** (Phase 6 voice tutor sonrası)
- Bu bilgi → study pack format'ını ayarlar (default'tan farklı).

### 3. Confidence Map

- Her ders/konu için "hazırım?" skoru (0-100).
- Quiz cevaplarından otomatik güncellenir.
- Görsel: heatmap (yeşil = hazır, kırmızı = riskli).
- Dashboard'da "bu hafta çalışman gereken 3 konu" önerisi.

### 4. GPA Simülatörü

- Mevcut notlar girilir.
- "Bu sınavdan X alırsam genel notum?" hesaplar.
- Hedef GPA için "bu sınavda en az X almalısın" calc.
- Üniversite bazlı GPA formülü (opsiyonel ayar).

### 5. Course Advisor

- Yeni sömestr ders seçimi öncesi.
- Adı yazılan dersi tara: hocanın stili + senin DNA = uyum skoru.
- "Bu ders senin için %85 uygun" + gerekçe.

### 6. Spaced Repetition

- Mock exam'lerden zayıf konular → 3-7-21 gün sonra hatırlatma.
- Algoritma: SM-2 (basitleştirilmiş).
- "Bu konuyu 5 gün önce yanlış cevapladın, hadi tekrar dene" bildirimi.

---

## Kapsam DIŞI

- Detaylı ML model eğitimi (basit istatistik yeterli)
- Mobile push notification (Phase 6)
- Integration with university LMS (Phase 7)

---

## Acceptance Criteria

- [ ] Kullanıcı her giriş yaptığında DNA güncellenir.
- [ ] Confidence map mock exam sonrası otomatik güncellenir.
- [ ] GPA simulator doğru hesaplar (en az 3 üniversite formülüyle test).
- [ ] Spaced repetition bildirim doğru tarihte gelir.
- [ ] Learning style minimum 20 soru sonrası güvenle belirlenir (< 20 → "henüz belirsiz").
- [ ] Course advisor minimum 1 dönem DNA verisi ile çalışır.

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model AcademicDNA {
  userId                 String   @id
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  learningStyle          String?  // "visual" | "reading" | "kinesthetic" | "auditory"
  strengths              Json     // [{topic, score}]
  weaknesses             Json
  totalQuestionsAnswered Int      @default(0)
  correctRate            Float?
  preferredDifficulty    String?  // "easy" | "medium" | "hard"

  updatedAt              DateTime @updatedAt
}

model ConfidenceScore {
  userId    String
  topic     String
  score     Float    // 0-100
  updatedAt DateTime @updatedAt

  @@id([userId, topic])
  @@index([userId])
}

model GradeRecord {
  id         String   @id @default(uuid())
  userId     String
  courseId   String?
  courseName String   // free-text if no course id
  grade      Float    // 0-100 or 0-4 depending on system
  credit     Int
  semester   String   // e.g. "2026-Spring"
  createdAt  DateTime @default(now())

  @@index([userId])
}

model SpacedRepetition {
  id         String   @id @default(uuid())
  userId     String
  questionId String
  nextReview DateTime
  interval   Int      // days
  easiness   Float    // SM-2 parameter
  lastReviewed DateTime?

  @@index([userId, nextReview])
}
```

### Background Jobs (BullMQ)

- `dna-recompute` — günlük, aggregation
- `spaced-repetition-scheduler` — her saat, yaklaşan review'lar için bildirim queue

### Yeni Servis

`server/src/services/dnaService.ts` — aggregation + updates + learning style inference.

### Frontend

- Yeni sayfa: `/me/profile` (DNA)
- Yeni sayfa: `/me/grades` (GPA simulator)
- Yeni sayfa: `/me/confidence` (heatmap)
- Dashboard widget: "Bu hafta çalışman gereken konular"

---

## Çıktılar

- Kullanıcının **akademik kimliği** — ürünün kalıcılık arjumanı.
- Spaced repetition motoru.
- GPA simülatörü.
- Course advisor (viral potansiyel — "bu dersi seç/seçme").
- Personalized learning paths hazırlığı.

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **DNA yanılması** (yeni kullanıcıda yetersiz veri) | Yüksek | Düşük | "DNA henüz oluşuyor" banner; min 20 soru şartı |
| **Bildirim yorgunluğu** (spaced rep spam) | Orta | Orta | User frekans ayarı; akıllı timing (sabah 9-akşam 9) |
| **GPA formülü** farklı üniversitelerde | Yüksek | Düşük | Opsiyonel ayar + yaygın formüller preset |
| **Learning style yanlış belirleme** | Orta | Orta | "Bu tahmin" olarak sun, kullanıcı override edebilir |
| **Privacy** (DNA hassas veri) | Orta | Yüksek | Sadece kullanıcıya görünür; export + delete hakkı |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| DNA oluşturmuş kullanıcı oranı | > %50 |
| 30 günlük retention | > %40 |
| Spaced repetition bildirim CTR | > %20 |
| Course advisor kullanım (dönem başı) | > %25 aktif kullanıcı |
| GPA simulator kullanım (sınav dönemi) | > %35 |

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
