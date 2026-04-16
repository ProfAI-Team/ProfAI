# Phase 3 — Mock Exam ve Tahminler 🎮

**Süre:** 2 hafta
**Statü:** Planlı (Phase 2 bitiminde başlar)
**Hedef:** **Killer demo özelliği** — viral potansiyel + yüksek engagement.

---

## Neden Bu Faz

Mock exam = sosyal medyada paylaşılabilir, "geçtim" anı yaratır. Tahminler = "vay be" momentum. Phase 2 value'yu "wow" a çevirir.

---

## Kapsam (DAHİL)

### 1. Mock Exam Generator

- Hocanın gerçek sınav format'ı (soru sayısı, tip dağılımı, zorluk) temel alınır.
- Öğrencinin study pack'inden konular alınır.
- Çıktı: tam sınav (20-30 soru), Gemini ile üretilir.
- Cevap key'i AI tarafından da hazırlanır.

### 2. Mock Exam Session UI

- Timer (gerçek sınav süresi, default 90dk).
- Soru navigasyonu (1, 2, 3, ...).
- "Mark for review" butonu.
- Submit → AI değerlendirme + skor.

### 3. Auto-Grading

- MC + T/F: otomatik.
- Klasik: Gemini rubric ile değerlendirir.
- Her soruya feedback (doğru cevap + neden).

### 4. Performans Tahmini

- Mock exam skoru + hocanın geçmiş ortalaması = "muhtemel gerçek sınav notun".
- Confidence interval ("75-82 arası").

### 5. Konu Boşluk Detektörü

- Mock exam yanlış cevapları → "şu konularda zayıfsın".
- Her zayıflık için study notes link.

### 6. Panik Modu (basit versiyon)

- "Sınava kaç saat var?" sorusu.
- Cevaba göre priority study plan (en önemli konular en üstte).

---

## Kapsam DIŞI

- Sosyal paylaşım → Phase 4
- Real-time AI tutor chat → Phase 6
- Spaced repetition → Phase 5
- Detaylı analytics dashboard → Phase 5

---

## Acceptance Criteria

- [ ] Mock exam üretimi < 60sn.
- [ ] Auto-grade doğruluğu > %85 (manuel kontrol sample).
- [ ] Performans tahmini, gerçek sınav notuyla ±10 puan uyumlu (kullanıcı bildirimiyle).
- [ ] Panik modu süreyi alıp planı 5sn'de üretir.
- [ ] Mobile UX: telefon üzerinden mock exam çözülebilir.
- [ ] Timer doğru çalışır; auto-submit süre bitince.
- [ ] Çıkış güvenliği: "sınavı bitirmedin, kayıp olacak" uyarısı.

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model MockExam {
  id           String   @id @default(uuid())
  userId       String
  professorId  String
  studyPackId  String?

  title        String
  questions    Json     // [{q, type, options, correctAnswer, topic, rationale}]
  durationMin  Int      @default(90)

  geminiVersion String
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([professorId])
}

model MockExamSession {
  id           String    @id @default(uuid())
  mockExamId   String
  mockExam     MockExam  @relation(fields: [mockExamId], references: [id])
  userId       String

  answers      Json      // [{qIdx, answer, timeSpent, flagged}]
  score        Float?
  feedback     Json?     // per-question
  prediction   Json?     // { lower, upper, confidence }

  startedAt    DateTime  @default(now())
  completedAt  DateTime?

  @@index([userId])
}
```

### Yeni Gemini Prompt'lar

- `generateMockExam(professor, studyPack, count)` — structured output
- `gradeAnswer(question, studentAnswer, rubric)` — 0-100 skor + feedback
- `predictPerformance(mockScore, professorAvg)` — range tahmin

Detay: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md).

### Frontend

- Yeni sayfa: `client/src/pages/MockExamSessionPage.tsx` — timer, navigation.
- Yeni sayfa: `client/src/pages/MockExamResultPage.tsx` — skor + feedback + tahmin.
- Yeni sayfa: `client/src/pages/PanicModePage.tsx` — basit form + öneri çıktısı.

---

## Çıktılar

- Mock exam ekosistemi — viral potansiyelli ana özellik.
- Performance prediction motoru (basit versiyon).
- Konu boşluk detektörü.
- Panic mode v1.
- Premium tier'ın en satılabilir özelliği.

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Auto-grade hatası** (klasik soru) | Orta | Yüksek | "Cevabı tartış" butonu; feedback loop → prompt iter. |
| **Soru kalitesi düşük** | Orta | Orta | Topluluk oylama Phase 4'te; kullanıcı feedback |
| **Maliyet** (~$0.10/exam) | Yüksek | Orta | Cache + saatlik rate limit; free tier max 1/hafta |
| **Kullanıcı mock exam'i yarım bırakır** | Yüksek | Düşük | Draft otomatik kaydetme; geri dönüş linki |
| **Tahmin sapması** (gerçek ≠ tahmin) | Orta | Yüksek | Güven aralığı geniş ver; "bu tahmin, kesinlik değil" vurgu |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Mock exam tamamlama oranı | > %60 (başlayan/biten) |
| "Tahmin tutmuştu" feedback | > %50 (sınav sonrası) |
| Mock exam → study pack tıklama | > %40 (loop kapsama) |
| Mock exam/kullanıcı ortalaması | > 2/ay (aktif kullanıcı) |
| Sosyal paylaşım oranı | > %15 (skor paylaşma butonu) |

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
