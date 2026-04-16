# Phase 0 — Mevcut Temel ✅

**Süre:** Tamamlandı
**Statü:** Production'da çalışıyor
**Hedef:** MVP — hoca + ders + sınav + AI analizi temelini kur.

---

## Kapsam (DAHİL)

### Backend
- ✅ Auth (register / login / JWT, bcrypt)
- ✅ Profesör, ders, sınav, rating CRUD
- ✅ Exam PDF upload (Multer) + Gemini analizi
- ✅ `ExamAnalysis` (questionTypes, topicDistribution, difficulty, summary)
- ✅ Search — name + dept + university
- ✅ Filters — `GET /api/professors/filters` (counts, cities)
- ✅ Discovery — `GET /api/professors/discovery?university=X`
- ✅ User uploads — `GET /api/exams/mine`
- ✅ Course filter: `search`, `university`, `professorId`
- ✅ Pagination (default 20, max 200)

### Frontend
- ✅ 7 sayfa: Home, ProfessorList, ProfessorDetail, Upload, Dashboard, Login, Register
- ✅ Edu-premium design system (Tailwind + CSS variables)
- ✅ Light + dark theme (`ThemeContext` + localStorage)
- ✅ TR + EN i18n (react-i18next + browser detector)
- ✅ Searchable filters (faceted counts, URL sync, city pills, sort)
- ✅ Multi-file upload + paralel analiz
- ✅ Upload sonrası analiz preview + dashboard
- ✅ AnalysisCard (Recharts pie + bar)
- ✅ BoringAvatars + Framer Motion micro-interactions

### Veritabanı
- ✅ 200 Türk üniversitesi (`server/src/data/turkish-universities.ts`)
- ✅ ~4500 fictional professor (Türkçe isimler + unvanlar)
- ✅ ~11K ders, ~17K sınav, ~27K rating
- ✅ 11 demo kullanıcı
- ✅ **Real overrides**: İstanbul Aydın Yazılım Geliştirme — 6 gerçek hoca + 6 gerçek ders

### Ops
- ✅ Docker Compose (db, server, client)
- ✅ GitHub Actions CI
- ✅ `.env` + `server/.env` + Gemini key management

---

## Kapsam DIŞI

- Hoca stil profili aggregated view (Phase 1)
- Öğrenci not yükleme (Phase 2)
- Mock exam (Phase 3)
- Topluluk / kredi (Phase 4)
- Persistent memory (Phase 5)
- Voice / multimodal (Phase 6)
- B2B (Phase 7)

---

## Çıktılar

- Çalışan MVP — demo yapılabilir hale gelmiş sistem.
- Tüm temel altyapı (DB, API, Frontend, Docker, CI/CD).
- Gerçek seed verisi (200 üni + 4500 hoca).
- Gerçek Gemini entegrasyonu (production API key).
- Premium UI kit (design tokens, i18n, theme, motion).

---

## Öğrenilenler (Retrospektif)

- **Gemini model seçimi:** `gemini-2.5-flash` 503 verebiliyor → `gemini-2.5-flash-lite` stabil. Production'da model env ile yönetiliyor.
- **Seed boyutu:** 4500 hoca + 17K sınav seed'i 30sn sürüyor. Production'da seed çalıştırılmamalı.
- **Real overrides sistemi:** Fictional + real prof karışımı iyi çalışıyor, demo için Aydın Yazılım Geliştirme örneği gerçekçi.
- **i18n sonradan eklemek zor:** Başta dahil edilmeli. Her bir component refactor gerekti.
- **URL state sync:** Liste sayfalarında kritik. Kullanıcı paylaşıyor, geri dönüşte state korunuyor.

---

## Teknik Mimari (Phase 0)

```
┌─────────────────────────────────────────────┐
│              React + Vite SPA               │
│   (Tailwind, Framer Motion, Recharts)       │
└──────────────────┬──────────────────────────┘
                   │ REST + JWT
┌──────────────────▼──────────────────────────┐
│         Express + TypeScript Server         │
│   ┌──────────┬──────────┬──────────────┐    │
│   │   Auth   │ Upload   │  Analysis    │    │
│   │  (JWT)   │ (Multer) │  (Gemini)    │    │
│   └──────────┴──────────┴──────────────┘    │
└──────────────────┬──────────────────────────┘
                   │ Prisma
┌──────────────────▼──────────────────────────┐
│              PostgreSQL 15                  │
│   User, Professor, Course, Exam,            │
│   ExamAnalysis, ProfessorRating             │
└─────────────────────────────────────────────┘
```

Detay: [`../architecture/current-stack.md`](../architecture/current-stack.md).

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklik |
|----------|-------|------------|
| 1.0 | 2026-04-16 | Phase 0 tamamlandı, production'da. |
