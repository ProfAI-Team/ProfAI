# ProfAI — Claude Çalışma Rehberi (Kök)

Bu dosya her session'da otomatik yüklenir. Kısa tutulmuştur — detay için [`docs/`](./docs/) altındaki dokümanları oku.

---

## Proje Özeti

**ProfAI**, Türk üniversite öğrencileri için AI destekli akademik co-pilot platformudur. Hocanın geçmiş sınav stilini analiz eder, öğrencinin konu materyalini hoca stiline göre özelleştirir, mock sınav üretir, topluluk verisiyle ölçeklenir.

- **Tek cümle vizyon:** *"Üniversitedeki 4 yılın boyunca seninle olan, hocalarını ve seni tanıyan kişisel akademik AI partneri."*
- **Mevcut durum:** Phase 0 (MVP) production'da. **Sıradaki: Phase 1 — Hoca-Merkezli Stil Profili.**
- **Ders bağlamı:** İstanbul Aydın Üniversitesi, UYG338 — Software Project Management (Dr. Öğr. Üyesi Peri Güneş).
- **Sahip:** Erdem Acar (`erdemacar1@stu.aydin.edu.tr`).

Detay: [`docs/vision/00-executive-summary.md`](./docs/vision/00-executive-summary.md), [`docs/roadmap/README.md`](./docs/roadmap/README.md).

---

## Monorepo Yapısı

```
ProfAI/
├── CLAUDE.md                  ← buradasın
├── SCRATCHPAD.md              ← kök scratchpad (cross-cutting, session hafızası)
├── client/                    ← React + Vite SPA        → client/CLAUDE.md + client/SCRATCHPAD.md
├── server/                    ← Express + TS + Prisma   → server/CLAUDE.md + server/SCRATCHPAD.md
├── docs/                      ← Tüm planlama dokümanları → docs/README.md
├── docker-compose.yml
├── .env                       ← gitignored, root-level Gemini key
└── README.md                  ← public README (kullanıcıya yönelik)
```

- Frontend konvansiyonları: [`client/CLAUDE.md`](./client/CLAUDE.md)
- Backend konvansiyonları: [`server/CLAUDE.md`](./server/CLAUDE.md)
- Doküman indeksi: [`docs/README.md`](./docs/README.md)
- **Scratchpad sistemi (3 dosya)** — her session başı oku, her session sonu güncelle:
  - [`SCRATCHPAD.md`](./SCRATCHPAD.md) — kök, cross-cutting
  - [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md) — frontend
  - [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md) — backend

---

## Stack Özeti

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite, Tailwind (CSS variables), Framer Motion, Recharts, react-i18next |
| Backend | Express, TypeScript, Prisma, JWT, Multer |
| Veritabanı | PostgreSQL 15 |
| AI | Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite`) via `@google/generative-ai` |
| Ops | Docker Compose, GitHub Actions |

Detay mimari: [`docs/architecture/current-stack.md`](./docs/architecture/current-stack.md).

---

## Genel Konvansiyonlar

- **Dil:** Dosya/değişken/yorum **İngilizce**; kullanıcıya görünen metin **Türkçe** (i18n key'leri İngilizce).
- **Commit:** İngilizce, imperative ("Add style profile endpoint"). `main` branch üzerinde ilerle; özellik dalı PR ile.
- **Commit trailer — ASLA Claude etiketi:** `Co-Authored-By: Claude`, `Generated with Claude Code`, `🤖` emoji veya benzeri hiçbir AI attribution **yazılmaz**. Commit + PR body tamamen insan üslubunda.
- **Push yetkisi:** Normal `git push origin <branch>` için onay beklemeden push'la. `--force`, dal silme, veya `main` dışı farklı bir dala push ayrıca onay gerektirir.
- **Formatlama:** Prettier default; Tailwind class sırasını normalize et.
- **Secrets:** Asla commit etme. Root `.env` (Gemini) + `server/.env` (DB, JWT) — ikisi de gitignored.
- **Dosya isimlendirme:** Yeni plan dokümanları `kebab-case.md`. Eski `ProfAI_*.md` dosyaları `docs/_archive/` altında.
- **İletişim:** Türkçe. Yaklaşım: plan + onay (auto mode değil), kısa ve sonuç odaklı.

---

## Geliştirme Komutları

```bash
# Tüm stack ayağa kalksın
docker compose up -d

# Servisleri yeniden build et (code değişikliği sonrası)
docker compose build server client && docker compose up -d --force-recreate server client

# DB'yi sıfırla ve seed'i yeniden çalıştır
cd server && npm run seed    # ~30 sn; 200 üni, 4500 hoca, ~17K sınav
```

**Portlar:** Frontend `:3001`, Backend `:5000`, Postgres `:5432`.
**Demo kullanıcı:** `erdemacar1@stu.aydin.edu.tr` / `password123`.

---

## Bağlam Yükleme Stratejisi

Session başında hangi dokümana bakmalı:

| İhtiyaç | Dosya |
|---------|-------|
| Genel vizyon, konumlandırma | [`docs/vision/`](./docs/vision/) |
| Aktif faz detayı (Phase 1) | [`docs/roadmap/phase-1-style-profile.md`](./docs/roadmap/phase-1-style-profile.md) |
| Tüm yol haritası | [`docs/roadmap/README.md`](./docs/roadmap/README.md) |
| Mimari karar (AI, DB, performans) | [`docs/architecture/`](./docs/architecture/) |
| Risk, test, KPI, demo | [`docs/operations/`](./docs/operations/) |
| Sıradaki task'lar | [`docs/tasks/`](./docs/tasks/) |
| Tarihi master kaynak | [`docs/ProfAI_Vision_and_Roadmap.md`](./docs/ProfAI_Vision_and_Roadmap.md) (v1) |

---

## Çalışma İlkeleri

1. **Değişiklik yaparken önce ilgili faz dokümanını oku** — acceptance kriterleri oradaki.
2. **Schema değişikliği bir Prisma migration olarak gelir** — seed ile test et, migration dosyasını commit et.
3. **Her AI çağrısı `aiService` soyutlamasından geçer** (detay: [`docs/architecture/ai-pipeline.md`](./docs/architecture/ai-pipeline.md)).
4. **UI değişiklikleri light + dark + TR + EN'de test edilir** (browser'da aç, i18n switch, theme toggle).
5. **Risk ve KPI senkron:** Yeni özellik eklenirken [`docs/operations/risks.md`](./docs/operations/risks.md) ve [`docs/operations/kpis.md`](./docs/operations/kpis.md) güncellenir.
6. **Plan → onay → yap.** Büyük değişiklikleri önce kısa bir plan olarak sun.

---

## Hızlı Yön

**Her session başı** (sırayla oku):

1. Bu dosya (`CLAUDE.md`) — genel bağlam.
2. [`SCRATCHPAD.md`](./SCRATCHPAD.md) — kaldığımız yer, cross-cutting notlar.
3. Dokunacağın alanın scratchpad'i: [`client/SCRATCHPAD.md`](./client/SCRATCHPAD.md) veya [`server/SCRATCHPAD.md`](./server/SCRATCHPAD.md).
4. Aktif faz: [`docs/roadmap/phase-1-style-profile.md`](./docs/roadmap/phase-1-style-profile.md).

**İlgili ikincil dosyalar:**

- Frontend'e dokunuyorsan: [`client/CLAUDE.md`](./client/CLAUDE.md).
- Backend'e dokunuyorsan: [`server/CLAUDE.md`](./server/CLAUDE.md).
- Karar bekleyen konular: [`docs/tasks/open-questions.md`](./docs/tasks/open-questions.md).

**Her session sonu:** dokunduğun alanın scratchpad'ini güncelle — kaldığın yer, keşifler, blocker, sonraki adım.
