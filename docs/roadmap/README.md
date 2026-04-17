# Yol Haritası — 7 Fazlı Ürün Evrimi

Her faz **kullanılabilir bir ürün** ekler. Her fazın net giriş kriterleri, çıktıları ve başarı metriği vardır.

---

## Faz Durumu

| Faz | Ad | Süre | Statü | Giriş |
|-----|----|----- |-------|-------|
| 0 | [Mevcut Temel](./phase-0-baseline.md) | — | ✅ Tamamlandı | — |
| 1 | [Hoca-Merkezli Stil Profili](./phase-1-style-profile.md) | 1 hafta (tahmin) · 1 gün (gerçek) | ✅ Tamamlandı 2026-04-17 | Phase 0 |
| 2 | [Kişiselleştirilmiş Çalışma Materyalleri](./phase-2-study-packs.md) | 2 hafta (tahmin) · 1 gün (gerçek) | ✅ Tamamlandı 2026-04-17 | Phase 1 tamam |
| 3 | [Mock Exam ve Tahminler](./phase-3-mock-exams.md) | 2 hafta (tahmin) · 1 gün (gerçek) | ✅ Tamamlandı 2026-04-17 | Phase 2 tamam |
| 4 | [Topluluk Katmanı](./phase-4-community.md) | 3 hafta | 🎯 **Sıradaki** | Phase 3 tamam |
| 5 | [Akademik DNA + Persistent Memory](./phase-5-academic-dna.md) | 2 hafta | Planlı | Phase 4 tamam |
| 6 | [Multimodal + Live AI Tutor](./phase-6-multimodal.md) | 3 hafta | Planlı | Phase 5 tamam |
| 7 | [B2B + Marketplace](./phase-7-b2b-marketplace.md) | 4 hafta | Planlı | Phase 6 tamam |

**Toplam süre:** ~17 hafta (≈4 ay odaklı geliştirme; realistik takvim 9 ay).

---

## Faz Yazım Şablonu

Her faz dokümanı şu başlıkları içerir:

1. **Özet** — süre, hedef, bir cümle değer
2. **Neden Bu Faz** — öncekine bağımlılık, atlayamayız nedeni
3. **Kapsam (DAHİL)** — neler yapılacak
4. **Kapsam DIŞI** — neler bu fazda yok
5. **Acceptance Criteria** — checklist
6. **Teknik Değişiklikler** — yeni tablolar, servisler, endpoint'ler
7. **Çıktılar** — faz sonunda elimizde ne olacak
8. **Riskler** — mitigasyonla birlikte
9. **Başarı Metriği** — ölçülebilir hedef
10. **Versiyon Geçmişi**

---

## Faz Arası Bağımlılıklar

```
Phase 0 (MVP)
   │
   └─> Phase 1 (Stil Profili)
         │
         └─> Phase 2 (Study Packs) ─────┐
                │                       │
                └─> Phase 3 (Mock Exam) │
                      │                 │
                      └─> Phase 4 (Topluluk)
                            │
                            └─> Phase 5 (DNA)
                                  │
                                  └─> Phase 6 (Multimodal)
                                        │
                                        └─> Phase 7 (B2B)
```

**Not:** Phase 3 ve Phase 4 bazı kısımları paralel ilerleyebilir (mock exam + oylama altyapısı). Phase 5 → 6 → 7 katı sıralı.

---

## Veritabanı Evrimi Özeti

| Faz | Eklenen Tablolar |
|-----|------------------|
| Phase 1 | `ProfessorStyleProfile` |
| Phase 2 | `StudentNote`, `StudyPack` |
| Phase 3 | `MockExam`, `MockExamSession` |
| Phase 4 | `UserCredit`, `ExamApproval`, `QuestionVote`, `PostExamReport`, `StudyGroup` |
| Phase 5 | `AcademicDNA`, `ConfidenceScore`, `GradeRecord`, `SpacedRepetition` |
| Phase 6 | `VoiceSession`, `OCRResult` |
| Phase 7 | `Tutor`, `TutoringSession`, `MarketplaceItem`, `Payment`, `UniversityAccount` |

Detay: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md).

---

## KPI Özet (faz bazlı)

| Faz | Toplam Kullanıcı | Haftalık Aktif | Premium | NPS |
|-----|------------------|----------------|---------|-----|
| 1 | 500 | 100 | 0 | 30 |
| 2 | 2K | 400 | 10 | 40 |
| 3 | 5K | 1K | 50 | 50 |
| 4 | 15K | 3K | 200 | 55 |
| 5 | 30K | 6K | 600 | 60 |
| 6 | 50K | 10K | 1.5K | 65 |
| 7 | 100K | 20K | 5K | 70 |

Detay: [`../operations/kpis.md`](../operations/kpis.md).

---

## İlgili

- Task breakdown (Phase 1): [`../tasks/phase-1-breakdown.md`](../tasks/phase-1-breakdown.md)
- Task breakdown (Phase 2): [`../tasks/phase-2-breakdown.md`](../tasks/phase-2-breakdown.md)
- Task breakdown (Phase 3): [`../tasks/phase-3-breakdown.md`](../tasks/phase-3-breakdown.md)
- Mimari evrim: [`../architecture/data-model-evolution.md`](../architecture/data-model-evolution.md)
- Risk matrisi: [`../operations/risks.md`](../operations/risks.md)
