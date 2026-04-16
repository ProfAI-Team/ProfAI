# Risk Matrisi

Risk skalası: **Olasılık** (Düşük/Orta/Yüksek) × **Etki** (Düşük/Orta/Yüksek/Kritik).

---

## 1. Hukuki / Gizlilik Riskleri

| Risk | Olasılık | Etki | Faz | Mitigasyon |
|------|----------|------|-----|------------|
| **KVKK ihlali** (gerçek hoca isim + öğrenci puanı) | Yüksek | Kritik | Phase 0+ | Hocaların onayı + moderasyon + KVKK aydınlatma metni + DPO |
| **Telif hakkı** (öğrenci yayıncı notu yükler) | Orta | Yüksek | Phase 2 | "Sadece kişisel kullanım" disclaimer + DMCA takedown |
| **Akademik dürüstlük itirazı** (üniversite) | Orta | Yüksek | Phase 4 | "Geçmiş sınavlar = yalnızca çalışma"; üniversite partnership |
| **Sınav rekonstrukte etiği** | Düşük | Kritik | Phase 4 | "Tahminler" framing; onaylı geçmiş sınavlar; 3-kişi onay |
| **Hoca adı opt-out** | Orta | Orta | Phase 1+ | Public opt-out formu; anonim "Hoca A" gösterimi |
| **KVKK export/delete hakkı** eksik | Yüksek | Yüksek | Phase 5 | Self-serve export + delete API; 30 gün tam silme |
| **B2B data leak** (üni aggregate'lerin bireyselleşmesi) | Orta | Kritik | Phase 7 | k-anonymity ≥5; legal review; audit log |

---

## 2. Teknik Riskler

| Risk | Olasılık | Etki | Faz | Mitigasyon |
|------|----------|------|-----|------------|
| **Gemini API kesintisi** | Orta | Yüksek | Phase 0+ | Multi-provider fallback (Claude) — Phase 4 |
| **AI hallucination** (uydurma bilgi) | Yüksek | Orta-Yüksek | Phase 1+ | Prompt engineering, feedback loop, "AI üretimi" badge |
| **Cost explosion** (Gemini fatura) | Yüksek | Yüksek | Phase 2+ | Aggressive caching, tier limits, alert threshold |
| **Performance degradation** (10K+ kullanıcı) | Orta | Orta | Phase 4+ | Redis cache, read replicas, CDN |
| **Database cascade delete bug** | Düşük | Kritik | Her faz | Schema review; integration test; backup stratejisi |
| **Secret leak** (GEMINI_API_KEY commit'lenir) | Düşük | Kritik | Her faz | `.gitignore` + pre-commit hook + GitGuardian scan |
| **Migration conflict** (prod'da) | Orta | Yüksek | Her faz | Staging environment + `migrate deploy` only |
| **File storage disk full** | Yüksek | Yüksek | Phase 3 | S3/R2 geçişi Phase 4; monitoring |
| **Gemini Live latency** (voice tutor) | Yüksek | Yüksek | Phase 6 | Graceful degradation; fallback to text |
| **OCR hatası** (el yazısı) | Yüksek | Orta | Phase 6 | Manuel düzelt editor; confidence score göster |

---

## 3. Ürün Riskleri

| Risk | Olasılık | Etki | Faz | Mitigasyon |
|------|----------|------|-----|------------|
| **Düşük topluluk katılımı** | Yüksek | Yüksek | Phase 4 | Gamification, kredi sistemi, manuel onboarding ilk 1K |
| **AI çıktı kalitesi yetersiz** | Orta | Yüksek | Phase 1+ | A/B test, kullanıcı oylama, prompt iteration |
| **Mobile UX yokluğu** | Yüksek | Orta | Phase 0-5 | PWA Phase 3'te; React Native Phase 6 |
| **Kullanıcı mock exam yarım bırakır** | Yüksek | Düşük | Phase 3 | Draft autosave; geri dönüş email reminder |
| **Premium feature gating öğrenciyi iter** | Orta | Yüksek | Phase 4 | Free tier cömert; "ilk deneyim" premium unlock |
| **Spam yüklemeler** (kredi farm) | Yüksek | Yüksek | Phase 4 | Moderasyon; user reputation; rate limit |
| **Yanlış onay** (brigading) | Orta | Yüksek | Phase 4 | Onay eşiği ≥3; anomaly detection |

---

## 4. İş Modeli Riskleri

| Risk | Olasılık | Etki | Faz | Mitigasyon |
|------|----------|------|-----|------------|
| **Premium dönüşüm düşük** (<%5) | Orta | Yüksek | Phase 3+ | Killer premium features (mock exam, voice); A/B fiyat |
| **Üniversiteler engelleyebilir** | Düşük | Yüksek | Phase 4+ | University partnership program; pilot anlaşmalar |
| **ChatGPT free tier yeterince iyi olur** | Yüksek | Orta | Süreklİ | Yerel context + Türkçe + hoca-özel vurgu |
| **Bir Türk startup hızla kopyalar** | Orta | Orta | Phase 4+ | Moat (veri + topluluk + partnership); hız |
| **B2B satış döngüsü uzun** (6-12 ay) | Yüksek | Orta | Phase 7 | Pilot program; 30 gün free trial |
| **Ödeme dolandırıcılığı** (marketplace) | Orta | Yüksek | Phase 7 | 3D Secure; iyzico fraud; refund policy |
| **Regulator AI içerik sınırlar** | Düşük | Yüksek | Süreklİ | KVKK uyumlu yapı; human-in-the-loop opt-in |

---

## 5. Operasyonel Riskler

| Risk | Olasılık | Etki | Faz | Mitigasyon |
|------|----------|------|-----|------------|
| **Solo founder burnout** | Yüksek | Kritik | Süreklİ | Co-founder araması; haftalık mola; scope disiplini |
| **Anahtar kullanıcı terk** (ilk 100) | Orta | Yüksek | Phase 1-4 | Haftalık interview; hızlı feedback döngüsü |
| **Maliyet modeli yanlış hesaplanmış** | Orta | Kritik | Phase 3-4 | Her ay detaylı cost review; modeli revize |
| **Üniversite partnership çökmesi** | Düşük | Yüksek | Phase 7 | Birden fazla üni paralel ilişki; exclusivity yok |
| **Kritik bir hata (data loss)** | Düşük | Kritik | Her faz | Günlük backup; restore drill ayda bir |

---

## En Kritik 5 Risk (Top Priority)

1. **KVKK ihlali** → Phase 1'e geçmeden hukuki review + aydınlatma metni şart.
2. **Cost explosion** → Phase 1'den itibaren `AICallLog` + alert threshold.
3. **AI hallucination** → Her faz prompt iteration + feedback loop.
4. **Düşük topluluk katılımı** → Phase 4 öncesi 1K kullanıcı elle kuratör.
5. **Solo founder burnout** → Scope disiplini + co-founder search.

---

## Yeni Risk Eklerken

- Tabloda uygun kategoriye yaz.
- Olasılık / etki / faz / mitigasyon kolonlarını doldur.
- Eğer "Top 5"e girecek kadar kritikse yukarı çıkar.
- [`kpis.md`](./kpis.md) ile senkron kontrol (risk bir KPI'ı etkiliyorsa bağlı).

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | İlk yayın — 7 faz için konsolide |
