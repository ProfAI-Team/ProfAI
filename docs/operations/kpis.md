# KPI ve Başarı Metrikleri

---

## North Star Metric

> **"Sınavdan önce ProfAI'ı kullanmış öğrenci sayısı / hafta"**

Bu metrik:
- Kullanıcının core value'ya ulaştığını gösterir (aha moment).
- Topluluk büyümesini ölçer.
- Viral büyüme sinyalidir.

**Ölçüm:** `weekly_active_users WHERE has_analysis_viewed_OR_study_pack_generated`.

---

## Faz Bazlı Hedefler

| Faz | Toplam Kullanıcı | Haftalık Aktif | Premium | NPS |
|-----|------------------|----------------|---------|-----|
| 1 | 500 | 100 | 0 | 30 |
| 2 | 2K | 400 | 10 | 40 |
| 3 | 5K | 1K | 50 | 50 |
| 4 | 15K | 3K | 200 | 55 |
| 5 | 30K | 6K | 600 | 60 |
| 6 | 50K | 10K | 1.5K | 65 |
| 7 | 100K | 20K | 5K | 70 |

---

## Conversion Funnel Hedefleri

| Aşama | Hedef Conversion |
|-------|------------------|
| Ziyaretçi → Kayıt | %15 |
| Kayıt → İlk yükleme | %50 |
| İlk yükleme → 7 gün retention | %60 |
| 7d retention → 30d retention | %50 |
| Aktif → Premium | %8 |
| Premium → 6 ay churn | < %30 |

---

## Kalite Metrikleri

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| AI çıktı "faydalı" oranı | > %75 | `AIFeedback` thumbs up/down aggregation |
| Mock exam tahmin doğruluğu (±10 puan) | > %70 | Post-exam "gerçek not" self-report |
| Page load (P95) | < 500ms | Frontend Web Vitals / Plausible |
| Crash rate | < %0.1 | Sentry |
| Uptime | %99.0+ | UptimeRobot |

---

## Faz Bazlı Anahtar Başarı Kriterleri

### Phase 1 — Stil Profili

- Hoca sayfası bounce rate < %30
- Avg time on page > 60sn
- "Hocanın Tarzı" özeti okuma oranı > %80
- Style profile endpoint P95 (cache hit) < 500ms

### Phase 2 — Study Pack

- Study pack üretim > 100/hafta
- "Faydalı buldum" > %70
- Tekrar üretim oranı < %20 (cache başarısı)
- Session'da study pack açan > %40

### Phase 3 — Mock Exam

- Tamamlama oranı > %60
- "Tahmin tutmuştu" > %50
- Mock exam → study pack click-through > %40
- Mock exam/kullanıcı > 2/ay

### Phase 4 — Topluluk

- Aktif yükleyen kullanıcı > %30
- Onay süreci ortalama < 48 saat
- Verified soru havuzu > 1000
- Çalışma grubu > 100

### Phase 5 — DNA

- DNA oluşturmuş kullanıcı > %50
- 30 günlük retention > %40
- Spaced repetition bildirim CTR > %20
- Course advisor kullanım (dönem başı) > %25

### Phase 6 — Voice

- Premium dönüşüm %2 → %8
- Sesli tutor kullanım > 10dk/oturum
- OCR başarı > %85 user feedback
- Premium Plus 3 ay retention > %60

### Phase 7 — B2B

- Doğrulanmış hoca > 100
- Üniversite müşterisi > 10
- Marketplace GMV > ₺100K/ay
- B2B MRR > ₺500K

---

## Ölçüm Altyapısı

| Metrik Türü | Tool | Phase |
|-------------|------|-------|
| Product analytics | Plausible (self-hosted) | Phase 2 |
| Error tracking | Sentry | Phase 1 |
| AI cost | `AICallLog` + admin dashboard | Phase 1 |
| Uptime | UptimeRobot / Better Uptime | Phase 2 |
| User feedback | `AIFeedback` (in-app) | Phase 1 |
| NPS | In-app survey (monthly) | Phase 3 |
| Funnel analytics | Plausible goals | Phase 2 |
| Cohort retention | SQL query + dashboard | Phase 4 |

---

## Dashboard (Admin)

`/admin/metrics` sayfası (Phase 3'te ekle):

- Günlük/haftalık/aylık aktif kullanıcı
- Funnel breakdown
- AI cost breakdown (feature bazlı)
- Top errors (Sentry linki)
- Pending approvals (moderasyon queue)

---

## Alert Threshold'ları

| Metrik | Threshold | Aksiyon |
|--------|-----------|---------|
| Daily AI cost | > $50 | Slack alert |
| Daily AI cost | > $200 | Slack alert + email + auto-disable low-priority features |
| Error rate (5xx) | > %1 (15dk) | Slack alert |
| P95 latency | > 5s (15dk) | Slack alert |
| Uptime | < %99 (24h) | Email + investigate |
| New user registrations | 0 (12h) | Check auth service |

---

## Review Ritmi

- **Haftalık:** Founder kendi dashboard review → open questions'a insight ekle.
- **Aylık:** KPI postmortem — hedefe neden ulaşmadık / ulaştık? Sonraki faza hangi düzeltme?
- **Her faz sonu:** Başarı kriterleri gözden geçir → sonraki faz planı revize.

---

## İlgili

- Risk matrisi: [`risks.md`](./risks.md)
- Test stratejisi: [`testing-strategy.md`](./testing-strategy.md)
- Demo planı: [`demo-plan.md`](./demo-plan.md)
- Faz haritası: [`../roadmap/README.md`](../roadmap/README.md)
