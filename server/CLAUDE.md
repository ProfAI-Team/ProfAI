# ProfAI — Backend Rehberi

Bu dosya `server/` altında çalışırken yüklenir. Genel proje bağlamı için: [`../CLAUDE.md`](../CLAUDE.md).

**Scratchpad (her session başı oku, her session sonu güncelle):**
- [`./SCRATCHPAD.md`](./SCRATCHPAD.md) — backend-özel çalışma defteri
- [`../SCRATCHPAD.md`](../SCRATCHPAD.md) — kök / cross-cutting
- [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md) — frontend tarafında neler olduğunu bilmek için

---

## Stack

- **Express 4** + **TypeScript**
- **Prisma ORM** → PostgreSQL 15
- **JWT** (`jsonwebtoken`) + **bcrypt** → auth
- **Multer** → file upload (PDF/DOCX/TXT)
- **`@google/generative-ai`** → Gemini 2.5 Flash Lite
- **`pdf-parse`** → PDF text extraction
- **`zod`** → input validation (eklenmeli — şu an elde validation)

---

## Klasör Organizasyonu

```
server/src/
├── index.ts                   ← app entry: middleware, routes, listen
├── routes/                    ← Express router tanımları (thin)
│   └── {auth,professor,course,exam,rating}Routes.ts
├── controllers/               ← HTTP katmanı: req parse, res format, error handling
│   └── {auth,professor,course,exam,rating}Controller.ts
├── services/                  ← iş mantığı, DB access, dış servis çağrıları
│   ├── analysisService.ts     ← PDF → Gemini → ExamAnalysis
│   └── llm/
│       └── geminiProvider.ts  ← Gemini client soyutlaması
├── middleware/
│   ├── authMiddleware.ts      ← JWT verify → req.user
│   └── uploadMiddleware.ts    ← Multer config (PDF/DOCX/TXT, 10MB cap)
├── lib/                       ← prisma client, helpers
│   └── prisma.ts              ← single PrismaClient instance
├── data/
│   └── turkish-universities.ts← seed kaynak verisi
└── types/                     ← shared TS types
```

**Kat kural:** `route → controller → service → prisma`. Controller DB'ye direkt dokunmaz; service aracılığıyla yapar.

---

## Prisma Workflow

```bash
cd server

# Schema değişikliği sonrası migration üret
npx prisma migrate dev --name add_style_profile

# Client regenerate (çoğu zaman migrate dev yapar)
npx prisma generate

# DB'yi tamamen sıfırla + seed
npm run seed

# Studio (DB browser)
npx prisma studio   # :5555
```

- **Migration:** Her schema değişikliği bir named migration. Üretim veritabanına her zaman `migrate deploy`.
- **Seed:** `prisma/seed.ts` — 200 üni + 4500 hoca + gerçek Aydın Yazılım Geliştirme override'ı. Seed **idempotent değil** — çalıştırınca sıfırdan kurar.
- **Her yeni model için:** `Professor` örüntüsünü izle — `id: String @id @default(uuid())`, `createdAt`, `updatedAt`.

Detay: [`../docs/architecture/data-model-evolution.md`](../docs/architecture/data-model-evolution.md).

---

## Gemini Integration

```ts
// src/services/llm/geminiProvider.ts — merkezi entry
import { getGeminiModel } from './llm/geminiProvider'
const model = getGeminiModel()   // GEMINI_MODEL env ile seçilir
```

- **Model:** `gemini-2.5-flash-lite` (stabil; `gemini-2.5-flash` 503 verebiliyor).
- **API key:** Root `.env` (`GEMINI_API_KEY`) → dotenv root'tan okur.
- **Structured output:** `responseMimeType: "application/json"` + `responseSchema` kullan. Detay: [`../docs/architecture/ai-pipeline.md`](../docs/architecture/ai-pipeline.md).
- **Her yeni AI endpoint için:** input validation → cache check → Gemini call → response parse → log. Retry/fallback Phase 1+ ile ekleniyor.
- **Cost hedefi:** ortalama $0.05/analiz. Her call loglanır (faz 1+ `AICallLog` tablosu).

---

## API Konvansiyonları

- **Prefix:** Tüm endpoint `/api/...`.
- **Auth:** Corumalı endpoint'lerde `authMiddleware` → `req.user = { userId, email }`.
- **Response shape:** Success `{ data: ... }`, error `{ error: { code, message } }`. (Tutarlılaştırılmalı — şu an karışık.)
- **Pagination:** `?page=1&limit=20`, max `limit=200`. Response `{ data, pagination: { page, limit, total } }`.
- **Search:** `?q=term` — name + dept + university'de arar (case-insensitive).
- **Filter:** `?city=Istanbul&university=...&sort=rating_desc`.
- **Error codes (öneri):** `VALIDATION_FAILED`, `UNAUTHORIZED`, `NOT_FOUND`, `AI_UNAVAILABLE`, `RATE_LIMITED`, `INTERNAL`.

Detaylı endpoint listesi: [`../docs/architecture/current-stack.md`](../docs/architecture/current-stack.md).

---

## Auth Modeli

- **Registration:** email + password (bcrypt 10 round).
- **Login:** JWT access token, 7 gün TTL. Refresh token henüz yok (Phase 5+).
- **Email doğrulama:** henüz yok — Phase 4'e kadar plain email kullan.
- **Role:** Tek rol (`STUDENT`). Phase 7'de `HOCA`, `UNIVERSITY_ADMIN`, `TUTOR` ekleniyor.
- **JWT secret:** `server/.env` → `JWT_SECRET`. Rotate stratejisi henüz yok.

---

## Env Değişkenleri

**Root `.env`** (gitignored):
```
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

**`server/.env`** (gitignored):
```
DATABASE_URL=postgresql://profai:profai123@localhost:5432/profai
JWT_SECRET=<random 32+ char>
NODE_ENV=development
PORT=5000
```

`server/.env.example` güncel tutulur.

---

## Dev Komutları

```bash
cd server
npm install
npm run dev           # ts-node-dev, hot reload
npm run build         # tsc → dist/
npm start             # node dist/index.js
npm run seed          # reset + seed DB
```

Docker ile: `docker compose up -d server db`.

---

## Konvansiyonlar

- **Dosya isimlendirme:** `camelCase.ts`. Class ismi `PascalCase`, fonksiyon `camelCase`.
- **Async:** `async/await`, `.then` zinciri kullanma.
- **Error handling:** Controller'da `try/catch`; global error middleware'e `next(err)` ile düş. Exception'ı yut (silent fail) ETME.
- **Log:** `console.log` şimdilik; Phase 1+'da `pino` değerlendirilecek.
- **Güvenlik:**
  - Kullanıcı inputu **asla** ham olarak SQL/log'a gitmez.
  - Path traversal: Multer `destination` sabit, `filename` UUID.
  - JWT secret'ı loglamayın.
  - Gemini prompt'ına kullanıcı input'unu direkt gömmeyin; template değişkenle gömün.

---

## Önemli Linkler

- Genel proje rehberi: [`../CLAUDE.md`](../CLAUDE.md)
- Frontend tarafı: [`../client/CLAUDE.md`](../client/CLAUDE.md)
- AI pipeline detayı: [`../docs/architecture/ai-pipeline.md`](../docs/architecture/ai-pipeline.md)
- Data model evrimi: [`../docs/architecture/data-model-evolution.md`](../docs/architecture/data-model-evolution.md)
- Hedef mimari: [`../docs/architecture/target-stack.md`](../docs/architecture/target-stack.md)
- Aktif faz (Phase 1 backend): [`../docs/roadmap/phase-1-style-profile.md`](../docs/roadmap/phase-1-style-profile.md)
- Risk matrisi: [`../docs/operations/risks.md`](../docs/operations/risks.md)

---

## Yapma!

- DB'ye raw SQL gömme — Prisma kullan (gereken yerde `$queryRaw` parametre binding ile).
- Gemini'ye 30dk+ sürecek synchronous call — upload queue'ya at (Phase 4+).
- Controller'da iş mantığı — service'e taşı.
- Secret'ı log'a yazdırma.
- Seed'i production'da çalıştırma — yalnızca dev/CI.
