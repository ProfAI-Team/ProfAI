# Mevcut Mimari (Phase 0)

**Statü:** Production'da, çalışıyor.
**Son güncelleme:** 2026-04-16

---

## Yüksek Seviye Diyagram

```
┌─────────────────────────────────────────────┐
│              React + Vite SPA               │
│   Tailwind · Framer Motion · Recharts       │
│   react-i18next (TR + EN)                   │
│   ThemeContext (light + dark)               │
└──────────────────┬──────────────────────────┘
                   │ REST (axios) + JWT Bearer
┌──────────────────▼──────────────────────────┐
│         Express + TypeScript Server         │
│  ┌──────────┬──────────┬──────────────┐     │
│  │   Auth   │ Upload   │  Analysis    │     │
│  │ (JWT)    │ (Multer) │  (Gemini)    │     │
│  └──────────┴──────────┴──────────────┘     │
│  routes → controllers → services → prisma   │
└──────────────────┬──────────────────────────┘
                   │ Prisma Client
┌──────────────────▼──────────────────────────┐
│              PostgreSQL 15                  │
│  User · Professor · Course · Exam           │
│  ExamAnalysis · ProfessorRating             │
└─────────────────────────────────────────────┘

External:
- Gemini 2.5 Flash Lite (AI analysis)
- Local filesystem (uploads/, gitignored)
```

---

## Stack Detayı

### Frontend (`client/`)

| Alan | Teknoloji | Versiyon (yaklaşık) |
|------|-----------|---------------------|
| Framework | React | 18.x |
| Bundler | Vite | 5.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS (CSS variables) | 3.x |
| Animation | Framer Motion | 11.x |
| Charts | Recharts | 2.x |
| i18n | react-i18next + i18next-browser-languagedetector | — |
| HTTP | Axios | 1.x |
| Router | React Router | 6.x |
| Avatars | @boringavatars/react | — |

Detay: [`../../client/CLAUDE.md`](../../client/CLAUDE.md).

### Backend (`server/`)

| Alan | Teknoloji |
|------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript |
| ORM | Prisma |
| Auth | `jsonwebtoken`, `bcrypt` |
| Upload | Multer |
| PDF | `pdf-parse` |
| AI | `@google/generative-ai` (Gemini 2.5 Flash Lite) |

Detay: [`../../server/CLAUDE.md`](../../server/CLAUDE.md).

### Veritabanı

PostgreSQL 15 (Docker).

Mevcut modeller:

- `User` — auth + profil (university, department)
- `Professor` — hoca (name, department, university)
- `Course` — ders (code, name, professor bağı)
- `Exam` — sınav (examType, year, semester, fileUrl, uploadedBy)
- `ExamAnalysis` — AI analizi (questionTypes, topicDistribution, difficulty, summary)
- `ProfessorRating` — puanlama (difficulty, fairness, comment)

Ham schema: `server/prisma/schema.prisma`.
Evrim planı: [`data-model-evolution.md`](./data-model-evolution.md).

### Ops

| Alan | Teknoloji |
|------|-----------|
| Container | Docker Compose (db, server, client) |
| CI | GitHub Actions |
| Env | `.env` (root, Gemini key), `server/.env` (DB, JWT) |
| Port | Frontend `:3001`, Backend `:5000`, DB `:5432` |

---

## Endpoint Envanteri

### Auth
- `POST /api/auth/register` — register (email, password, name, university, department)
- `POST /api/auth/login` — login → JWT

### Professors
- `GET /api/professors` — list + filter (`search`, `university`, `city`, `department`, `sort`, `page`, `limit`)
- `GET /api/professors/:id` — detail
- `GET /api/professors/filters` — faceted counts + cities
- `GET /api/professors/discovery?university=X` — topRated + byUserUni
- `GET /api/professors/:id/analysis` — legacy aggregate exam analysis (kept for backward compat)
- `GET /api/professors/:id/style-profile` — **Phase 1** cached style profile (Gemini summary + aggregated metrics). Returns `{ status: "ready" | "insufficient_data", professor, profile? }`.

### Courses
- `GET /api/courses` — filter (`search`, `university`, `professorId`)
- `GET /api/courses/:id` — detail

### Exams
- `POST /api/exams/upload` — multi-file upload → paralel Gemini analizi (protected)
- `GET /api/exams/mine` — kullanıcının yüklediği sınavlar (protected)
- `GET /api/exams/:id/analysis` — analiz detayı

### Ratings
- `POST /api/ratings` — create rating (protected)
- `GET /api/professors/:id/ratings` — list ratings

---

## Pagination Konvansiyonu

```
GET /api/professors?page=1&limit=20
→ { data: [...], pagination: { page, limit, total } }
```

Default `limit=20`, max `limit=200`.

---

## AI Pipeline (Mevcut)

```
Upload PDF → Multer → pdf-parse → extractedText
                                        │
                                        ▼
                              analysisService.analyzeExam
                                        │
                                        ▼
                              geminiProvider (Gemini 2.5 Flash Lite)
                                        │
                                        ▼
                              structured JSON response
                                        │
                                        ▼
                              save as ExamAnalysis
```

Detay: [`ai-pipeline.md`](./ai-pipeline.md).

---

## Bilinen Teknik Borç

- **Tek `PrismaClient` instance** var ama singleton pattern tam değil (hot-reload'da yeniden kurulabilir).
- **Error response shape** tutarsız — bazı endpoint `{ error: "..." }`, bazı `{ message: "..." }`. Konsolide et.
- **Input validation** — Zod yok, elde string check. Phase 1'de Zod ekle.
- **Logger yok** — `console.log`. Phase 1+'da `pino` değerlendir.
- **Rate limit yok** — Phase 4'te `express-rate-limit`.
- **Admin endpoint yok** — moderasyon için Phase 4'te.
- **CORS** dev'de açık, production için sıkılaştır.
- **JWT refresh token yok** — session Phase 5+'da.

---

## Hedef Mimari (Phase 5+)

Detay: [`target-stack.md`](./target-stack.md).

---

## İlgili

- Frontend rehberi: [`../../client/CLAUDE.md`](../../client/CLAUDE.md)
- Backend rehberi: [`../../server/CLAUDE.md`](../../server/CLAUDE.md)
- Hedef mimari: [`target-stack.md`](./target-stack.md)
- AI pipeline: [`ai-pipeline.md`](./ai-pipeline.md)
- Performans hedefleri: [`performance-targets.md`](./performance-targets.md)
- Data model evrimi: [`data-model-evolution.md`](./data-model-evolution.md)
