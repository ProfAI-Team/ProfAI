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

- [ ] Üniversite resmî email doğrulama çalışır.
- [ ] Tutor onboarding < 10dk.
- [ ] Marketplace ödeme entegre (iyzico veya Paddle).
- [ ] B2B user onboarding "self-serve" (hoca kayıt sonrası demo verilmeden erişir).
- [ ] Anonim aggregation KVKK uyumlu (min 5 kişi grup).
- [ ] Tutor-student messaging moderation altyapısı var.

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

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
