# Test Stratejisi

Faz faz test kapsamı. Tüm fazlar **manuel smoke test + unit test kritik path** gerektirir; detay faza göre değişir.

---

## Test Piramidi

```
         E2E (az, kritik yol)        ← Playwright (Phase 3+)
        /                      \
       Integration (orta)         ← Supertest (Phase 1+)
      /                            \
     Unit (çok, iş mantığı)          ← Vitest (Phase 1+)
```

**Test oranı hedef:** %70 unit, %20 integration, %10 E2E.

---

## Phase 0 — Mevcut (Manuel + Smoke)

**Durum:** Henüz automated test yok.

**Manuel test checklist:**

- [ ] Register + login akışı (TR + EN, light + dark)
- [ ] Hoca ara, filtre uygula, pagination çalış
- [ ] Hoca detay sayfası analiz göster
- [ ] Exam upload → analiz üretir
- [ ] Dashboard `/api/exams/mine` doğru veriyi döner
- [ ] Logout → token temizlenir

**Commitment:** Her PR öncesi bu liste manuel gözden geçir.

---

## Phase 1 — Unit + Integration

### Unit (Vitest)

**Backend:**

- [ ] `professorStyleService.aggregateFromExams` — çeşitli sınav miksinde doğru aggregation.
- [ ] `professorStyleService.getOrBuildStyleProfile` — cache hit/miss davranışı.
- [ ] Invalidasyon hook — yeni exam → `isStale = true`.
- [ ] Gemini response parse — malformed input tolere eder.

**Frontend:**

- [ ] `StyleHero` komponent render (empty state, with data, with error).
- [ ] i18n TR + EN key'leri eksik değil.

### Integration (Supertest)

- [ ] `GET /api/professors/:id/style-profile` — cache miss → cache hit döngüsü.
- [ ] 401 unauthorized doğru kod.
- [ ] Gemini timeout → 503 döner (dummy Gemini mock).

### Setup

```bash
cd server
npm install --save-dev vitest supertest @types/supertest
cd ../client
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### CI

GitHub Actions: `on: pull_request` → `npm test` her iki klasörde.

---

## Phase 2 — Study Pack Testleri

### Unit

- [ ] `studyPackService.generateStudyPack` — fake Gemini response'ına karşı doğru kayıt.
- [ ] Cache TTL (24h) doğru davranış.
- [ ] Input quality check (< 500 kelime → reject).

### Integration

- [ ] `POST /api/notes/upload` — PDF dosyası, word count doğru.
- [ ] `POST /api/study-pack/generate` — end-to-end (fake Gemini).
- [ ] Gemini rate limit → retry + 503.

### Kalite Testleri (Manuel, Haftalık)

- 10 random study pack review — hoca stiline uygun mu?
- Hata oranı > %30 ise prompt iteration.

---

## Phase 3 — Mock Exam + E2E

### Unit

- [ ] `mockExamService.generateMockExam` — hocanın soru dağılımına ±%10 uyar.
- [ ] `gradeAnswer` — MC/T-F otomatik, klasik Gemini.
- [ ] `predictPerformance` — ±10 puan interval.

### Integration

- [ ] Mock exam flow: generate → session start → answer → submit → grade → predict.
- [ ] Timer sunucu tarafı doğrulama (client timer manipüle edilemez).

### E2E (Playwright — İLK!)

Kritik path'leri kapat:

- [ ] Register → login → hoca seç → study pack → mock exam → sonuç (full happy path).
- [ ] Upload flow: register → upload PDF → analiz → dashboard.
- [ ] Mobile (viewport 375×667) smoke.

### Yük Testi (k6 veya Artillery)

- 100 concurrent user, 10dk.
- Scenario: browse + upload + mock exam.
- Başarı: P95 hedefleri içinde, 0 error.

---

## Phase 4 — Community

### Unit

- [ ] `creditService` — earn/spend doğru bakiye.
- [ ] Approval logic: 3 farklı user → verified.
- [ ] Question voting: aynı user 1 oy.

### Integration

- [ ] Exam upload → 3 onay → verified badge.
- [ ] Spam detection: 10+ upload/gün → manuel review queue.

### Chaos / Security

- [ ] Credit race condition (concurrent spend).
- [ ] Spam exam yüklemesi → moderasyon queue'ya düşüyor mu?

---

## Phase 5 — DNA + Spaced Repetition

### Unit

- [ ] DNA aggregation — 50+ soru sonrası learning style belirleniyor.
- [ ] Spaced repetition SM-2 algoritması — interval doğru hesap.
- [ ] GPA simulator — 3 üniversite formülüyle doğru.

### Integration

- [ ] Mock exam → DNA update → next session güncel.
- [ ] Background job: spaced rep scheduler saatlik çalışır.

---

## Phase 6 — Voice + Multimodal

### Unit

- [ ] OCR service — basit not %90 doğruluk.
- [ ] LaTeX formül parse.

### E2E (Manuel + otomatize zor)

- [ ] Voice tutor 5sn içinde cevap başlar.
- [ ] Interruption sonrası kaldığı yerden devam.
- [ ] Network flaky → graceful degradation.

### Load

- 50 concurrent voice session.

---

## Phase 7 — B2B + Marketplace

### Unit

- [ ] Payment webhook handler — iyzico callback simule.
- [ ] Marketplace commission calc — %15, %30.
- [ ] Role-based access (hoca dashboard'a öğrenci erişemez).

### Integration

- [ ] Subscription lifecycle: create → renew → cancel.
- [ ] University SSO login.

### Security Audit

- [ ] Penetration test (external firm).
- [ ] KVKK compliance audit.
- [ ] Payment PCI-DSS scope (iyzico handle ediyor, check).

---

## Kalite Metrikleri

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Test coverage (unit) | > %60 | Vitest coverage report |
| CI pass rate | > %95 | GitHub Actions |
| Production error rate | < %1 | Sentry |
| AI output quality (user feedback) | > %75 positive | `AIFeedback` aggregation |
| Manual test completion (pre-release) | %100 | Checklist |

---

## Test Data

- **Test user:** `erdemacar1@stu.aydin.edu.tr` / `password123` (dev only).
- **Seed:** `npm run seed` (server) — 200 üni + 4500 hoca.
- **Gemini mock:** `server/src/services/llm/__mocks__/geminiProvider.ts` (Phase 1'de ekle).
- **Test fixtures:** `server/test/fixtures/` (PDF örnekleri, vb.).

---

## CI/CD Pipeline

**GitHub Actions workflow:**

```yaml
on: [pull_request, push: main]

jobs:
  lint:         # ESLint + Prettier check
  test-backend: # Vitest (unit + integration)
  test-frontend: # Vitest + testing-library
  build:        # TypeScript compile, Vite build
  e2e:          # Playwright (Phase 3+ enable)
```

---

## İlgili

- KPI: [`kpis.md`](./kpis.md)
- Risk: [`risks.md`](./risks.md)
- Performans: [`../architecture/performance-targets.md`](../architecture/performance-targets.md)
