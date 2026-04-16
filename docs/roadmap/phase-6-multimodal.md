# Phase 6 — Multimodal ve Live AI Tutor 🎙️

**Süre:** 3 hafta
**Statü:** Planlı
**Hedef:** Premium WOW factor — ücretli tier'ın asıl differentiator'ı.

---

## Neden Bu Faz

Phase 1-5 değer üretir, ama "ses ile hoca tarzında anlat" diyemiyorsan Premium Plus satamazsın. Viral video moment'ı da burada çıkar ("ProfAI benimle konuştu").

---

## Kapsam (DAHİL)

### 1. Sesli AI Tutor (Gemini Live API)

- Real-time voice conversation.
- "Bu konuyu anlat" → ses ile cevap.
- Türkçe akıcı diksiyon.
- Konuşma sırasında konu kartı görsel olarak güncellenir.
- Interruption handling (öğrenci keser, devam eder).

### 2. El Yazısı Not OCR

- Defter sayfası fotoğrafla → metin çıkar.
- Math formüllerini LaTeX'e dönüştür (MathPix alternatifi).
- Otomatik dijital nota dönüş.
- Phase 2'deki study pack'e input olur.

### 3. Ders Kaydı Analiz

- Audio upload (45 dk-90 dk).
- Transcript + key topics + "hocanın bu sınavda çıkar dedi" cümleleri.
- Slayt OCR ile kombinasyon.

### 4. Multimodal Search

- "Şu denkleme benzer soru var mı?" — formül fotoğrafla → benzer soru bul.
- Image embedding tabanlı similarity.

---

## Kapsam DIŞI

- Video analizi (çok pahalı)
- Real-time translation (TR ↔ EN)
- Mobile native (PWA kullanılabilir)

---

## Acceptance Criteria

- [ ] Sesli tutor 5sn içinde cevap vermeye başlar.
- [ ] OCR > %90 doğruluk (basit notlar).
- [ ] Ders kaydı transcripti < 5dk işlenir (60dk audio için).
- [ ] Math formül LaTeX çıktısı %80 basit formüller için doğru.
- [ ] Sesli tutor interruption sonrası kaldığı yerden devam.
- [ ] Premium Plus user only (feature gating).

---

## Teknik Değişiklikler

### Prisma Schema

```prisma
model VoiceSession {
  id           String   @id @default(uuid())
  userId       String
  professorId  String?
  durationSec  Int
  transcript   String   @db.Text
  topics       Json     // [{topic, timestamp}]
  createdAt    DateTime @default(now())

  @@index([userId])
}

model OCRResult {
  id           String   @id @default(uuid())
  userId       String
  fileUrl      String
  extractedText String  @db.Text
  latexFormulas Json    // [{latex, confidence}]
  createdAt    DateTime @default(now())

  @@index([userId])
}
```

### Yeni Integrations

- **Gemini Live API** (WebRTC tabanlı) — yeni provider abstraction.
- **WebRTC** client-side + ses streaming.
- **Google Vision API** veya Tesseract + Gemini multimodal → OCR.
- **Gemini multimodal audio** → transcript.

### AI Service Soyutlaması

`aiService.voiceTutor(audio, context)` yeni metod.

Detay: [`../architecture/ai-pipeline.md`](../architecture/ai-pipeline.md).

### Frontend

- Yeni sayfa: `/tutor` — ses UI, waveform, transcript canlı görüntüleme.
- Yeni komponent: `VoiceRecorder.tsx` + `AudioStreamer.tsx`.
- WebRTC state machine (connecting → streaming → error → ended).

---

## Çıktılar

- Premium tier'ın **asıl satış noktası.**
- Yüksek engagement (sesli interaksiyon viral).
- OCR altyapısı — iPhone'la not fotoğrafı = anında dijital.
- Ders kaydı özetleme — B2B için cazip (Phase 7).

---

## Riskler

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| **Ses kalitesi** (ortam gürültülü) | Yüksek | Orta | Fallback to text; noise suppression |
| **Maliyet** (Live API pahalı) | Yüksek | Yüksek | Premium Plus only; kullanım cap (30dk/gün) |
| **Latency** (real-time network duyarlı) | Yüksek | Yüksek | Graceful degradation; "bağlantı zayıf" uyarısı |
| **OCR math formülleri** | Yüksek | Orta | Fallback: "manuel düzelt" editor |
| **Gemini Live erişim** (geo-restriction) | Düşük | Yüksek | Claude alternatif; OpenAI Realtime fallback |

---

## Başarı Metriği

| Metrik | Hedef |
|--------|-------|
| Premium dönüşüm oranı | %2 → %8 (Phase 6 etkisi) |
| Sesli tutor kullanım | > 10dk/oturum |
| OCR başarı oranı | > %85 user feedback |
| Ders kaydı upload sayısı | > 500/hafta |
| Premium Plus retention 3 ay | > %60 |

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın |
