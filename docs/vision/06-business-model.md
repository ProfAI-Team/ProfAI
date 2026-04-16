# 06 — İş Modeli

---

## Freemium Yapı (B2C)

| Tier | Fiyat | Sınırlamalar | Hedef Kullanıcı |
|------|-------|--------------|-----------------|
| **Ücretsiz** | ₺0 | 3 hoca analizi/ay, 5 pratik soru, basic study notes | Tüm öğrenciler (giriş kapısı) |
| **Premium** | ₺49/ay | Sınırsız analiz, mock exam, AI tutor chat, panic mode, predictions | Aktif sınav hazırlayan öğrenci |
| **Plus** | ₺99/ay | + Real-time voice tutor, priority Gemini, 1-on-1 study coach | Final / mezuniyet dönemi |
| **Üniversite Bursu** | Ücretsiz | Premium tüm özellikler | İhtiyaç sahibi öğrenciler (sponsorlu) |

Detaylı feature gating kararı Phase 3 başında netleşir.

---

## B2B Modeli (Phase 7+)

| Müşteri | Ürün | Fiyat |
|---------|------|-------|
| **Üniversite Eğitim Direktörlüğü** | Aggregate öğrenci başarı analizi, ders/hoca heatmap | ₺50K-200K/yıl |
| **Hoca (bireysel)** | Kendi öğrencilerinin performans dashboard'u | ₺149/ay |
| **Özel ders kurumu** | Hoca data + öğrenci eşleştirme | Komisyon (%15) |

---

## Marketplace Modeli (Phase 7)

- **Tutoring marketplace:** Öğrenci ↔ tutor eşleştirme. %15 komisyon.
- **Premium konu anlatımı satışı:** Mezunlar kendi notlarını satabilir. ProfAI %30 komisyon.

Detay: [`../roadmap/phase-7-b2b-marketplace.md`](../roadmap/phase-7-b2b-marketplace.md).

---

## Conversion Funnel Hedefleri

```
Ziyaretçi (10K/ay) → Kayıt (15%) → 1.500 öğrenci
Kayıt → Aktif (60%) → 900 aktif öğrenci
Aktif → Premium dönüşümü (%8) → 72 ödeme = ₺3.500/ay (yıl 1)

Yıl 2 hedef: 100K aktif, %8 premium = 8K ödeme = ₺400K/ay = ₺4.8M/yıl
```

---

## Birim Ekonomi (Tahmini)

| Metrik | Değer |
|--------|-------|
| ARPU (free dahil) | ₺6 |
| ARPU (premium) | ₺49 |
| Gemini maliyeti / premium kullanıcı | ~₺3/ay (avg) |
| Server + DB maliyeti | ~₺1/ay |
| **Net margin (premium)** | **~%80** |
| CAC (organik + viral hedef) | ₺15 |
| Ortalama premium ömrü | 6 ay → LTV ₺294 |
| **LTV / CAC** | **~20x** (sağlıklı) |

---

## Gelir Stratejisi Zamanlama

| Dönem | Ana Gelir | Destek |
|-------|-----------|--------|
| Phase 0-3 (0-3 ay) | Yok — büyüme odaklı | — |
| Phase 4-5 (4-6 ay) | Premium ₺49 | Üni sponsorluk pilotu |
| Phase 6 (7-8 ay) | Premium + Plus | İlk B2B pilot |
| Phase 7+ (9 ay+) | Premium + B2B + Marketplace | — |

---

## Fiyatlandırma Kararları Açık

- **₺49 premium doğru mu?** Öğrenci alım gücü test edilmeli. A/B: ₺29, ₺49, ₺79.
- **Kredi sistemi premium'un yerine mi, yanında mı?** Phase 4'te karar.
- **Yıllık abonelik indirim oranı?** Kritik retention sinyali.

Detay: [`../tasks/open-questions.md`](../tasks/open-questions.md).

---

## İlgili

- Moat: [`05-moat-competition.md`](./05-moat-competition.md)
- KPI hedefleri: [`../operations/kpis.md`](../operations/kpis.md)
- Phase 7 B2B detay: [`../roadmap/phase-7-b2b-marketplace.md`](../roadmap/phase-7-b2b-marketplace.md)
