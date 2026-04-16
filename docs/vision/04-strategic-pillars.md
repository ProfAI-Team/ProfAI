# 04 — Stratejik Sütunlar

Ürün **5 sütun** üzerine kurulu. Her sütun bağımsız değer üretir, birlikte exponential etki yaratır.

---

## Sütun 1 — İçgörü Katmanı (*"Bu hoca nasıl?"*)

Hocanın geçmiş sınavlarından çıkarılan stil profili.

**Özellikler:**
- Aggregate soru tipi dağılımı (% MC, % klasik, % T/F)
- Top konular (kümülatif)
- Zorluk profili
- **Hoca evrim grafiği:** yıllar içindeki değişim
- **Sezon analizi:** "2024 baharında AI soruları arttı"
- **Trick patterns:** "Bonus sorular hep son haftadan", "Vize teori / finalde uygulama"

**Status:** Backend kısmen hazır (Phase 0). UI Phase 1'de tamamlanacak.
**Referans:** [`../roadmap/phase-1-style-profile.md`](../roadmap/phase-1-style-profile.md)

---

## Sütun 2 — Yardım Katmanı (*"Bana yardım et"*)

Öğrenciye somut, eyleme geçirilebilir içerik üretir.

**Özellikler:**
- **Personalized study notes** — öğrenci konu materyali yükler → hoca stilinde özet
- **AI Mock Exam** — gerçek sınav atmosferi, otomatik puanlama, performans raporu
- **AI Tutor Chat** — "Bu konuyu hocanın anlatış tarzında anlat"
- **Multimodal upload** — el yazısı not / ses kaydı / slayt → analiz

**Status:** Phase 2'de başlar, Phase 6'da tamamlanır.
**Referans:** [`../roadmap/phase-2-study-packs.md`](../roadmap/phase-2-study-packs.md), [`../roadmap/phase-3-mock-exams.md`](../roadmap/phase-3-mock-exams.md)

---

## Sütun 3 — Topluluk Katmanı (*"Yalnız değilsin"*)

Veri network etkisi yaratır, defansibility sağlar.

**Özellikler:**
- **Sınav Borsası** — yüklemeye kredi, premium unlock
- **Sınav Sonrası Otopsi** — "Bu sınavda neler çıktı?" birleştirilmiş rapor
- **Topluluk-onaylı pratik soru havuzu** — 👍/👎 oylama
- **AI-mediated study groups** — aynı sınava girenler eşleştir
- **"Bu hocadan A alanların stratejisi"** — başarı pattern'i

**Status:** Phase 4.
**Referans:** [`../roadmap/phase-4-community.md`](../roadmap/phase-4-community.md)

---

## Sütun 4 — Kişisel Katman (*"Akademik DNA'n"*)

4 yıllık journey'i takip eden persistent memory.

**Özellikler:**
- **Persistent memory** — geçen sömestr neyi öğrendin, neyi sevmedin
- **Learning style discovery** — quiz performansından çıkar
- **Confidence map** — her konu için "hazırım" skoru
- **GPA simülatörü** — "Bu sınavdan 65 alırsam genel notum?"
- **Course advisor** — yeni dönem ders seçerken "DNA uyumu"

**Status:** Phase 5.
**Referans:** [`../roadmap/phase-5-academic-dna.md`](../roadmap/phase-5-academic-dna.md)

---

## Sütun 5 — Tahmin Katmanı (*"Geleceği gör"*)

ML/AI tahmin yetenekleri — wow faktör.

**Özellikler:**
- **"Sınava 5 saat kaldı" panik modu** — priority study plan
- **Sınav kağıdı tahmini** — "%80 olasılıkla bu sorular"
- **Konu boşluk detektörü** — notlardaki eksikleri hoca history'siyle flag'le
- **Bireysel performans tahmini** — "muhtemel sınav notun: 75-82"
- **Kariyer pathway** — akademik DNA + sektör ihtiyaçları = rol uyum skoru

**Status:** Phase 3 + Phase 5 üzerine kurulur.
**Referans:** [`../roadmap/phase-3-mock-exams.md`](../roadmap/phase-3-mock-exams.md), [`../roadmap/phase-5-academic-dna.md`](../roadmap/phase-5-academic-dna.md)

---

## Sütunlar Arası Bağımlılık

```
Sütun 1 (İçgörü) ───┐
                    ├──> Sütun 2 (Yardım) ──┐
Sütun 3 (Topluluk)──┘                       ├──> Sütun 5 (Tahmin)
                                            │
                    Sütun 4 (DNA) ──────────┘
```

- Sütun 1 olmadan Sütun 2 generic kalır (hocasız yardım = ChatGPT).
- Sütun 3 olmadan Sütun 4 yavaş büyür (tek kullanıcı verisi).
- Sütun 5, Sütunlar 1+3+4'ün kesişimi.

---

## İlgili

- Yol haritası: [`../roadmap/README.md`](../roadmap/README.md)
- Killer UX momentleri: [`../killer-moments.md`](../killer-moments.md)
- Moat / rakip: [`05-moat-competition.md`](./05-moat-competition.md)
