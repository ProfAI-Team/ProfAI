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

### T1. Cache strategy — Redis vs in-process

- **Durum:** Açık.
- **Seçenekler:**
  - A) In-process LRU (tek instance, basit).
  - B) Redis (scalable, multi-instance hazır).
- **Eğilim:** A → Phase 3'e kadar; B Phase 3+.
- **Karar zamanı:** Phase 3 başı.

### T2. File storage — Local vs S3/R2

- **Durum:** Açık.
- **Seçenekler:**
  - A) Local fs (şu anki, basit).
  - B) Cloudflare R2 (ucuz, egress free).
  - C) AWS S3 (standart).
- **Eğilim:** B.
- **Karar zamanı:** Phase 3 sonu / Phase 4 başı.

### T3. Background jobs — BullMQ vs node-cron

- **Durum:** Açık.
- **Seçenekler:**
  - A) node-cron (basit, tek instance).
  - B) BullMQ (Redis, retry, DLQ).
  - C) Cloudflare Cron Triggers (serverless).
- **Eğilim:** B (Phase 4'te Redis zaten gelecek).
- **Karar zamanı:** Phase 4 başı.

### T4. AI provider stratejisi

- **Durum:** Açık.
- **Seçenekler:**
  - A) Sadece Gemini (basit, tek vendor risk).
  - B) Gemini + Claude fallback.
  - C) Multi-provider load balance.
- **Eğilim:** B — Phase 4+.
- **Karar zamanı:** Phase 4.

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

---

## İlgili

- Risk matrisi: [`../operations/risks.md`](../operations/risks.md)
- KPI: [`../operations/kpis.md`](../operations/kpis.md)
- Business model: [`../vision/06-business-model.md`](../vision/06-business-model.md)
