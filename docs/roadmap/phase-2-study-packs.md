# Phase 2 — Kişiselleştirilmiş Çalışma Materyalleri 📚

**Süre:** 2 hafta
**Statü:** Planlı (Phase 1 bitiminde başlar)
**Hedef:** **Asıl ürün vizyonunu** hayata geçir — hoca stili + öğrenci notu = kişiselleştirilmiş içerik.

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

- [ ] Öğrenci 1 PDF (ders notu) yükleyip, hoca seçince 30 saniye içinde study pack alabilir.
- [ ] Study pack en az 3 konu özeti + 5 pratik soru içerir.
- [ ] Pratik soru tipi dağılımı hocanın gerçek dağılımına ±%10 uyumlu.
- [ ] Türkçe çıktı dil bilgisi olarak temiz.
- [ ] Cache: aynı not + aynı hoca → tekrar üretmez (24h TTL).
- [ ] Input kalite kontrolü: notlar < 500 kelime → uyarı ver.
- [ ] Disclaimer: "AI üretimi — doğrulayın" banner.

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

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
