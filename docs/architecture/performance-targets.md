# Performans Hedefleri

---

## Endpoint Latency Hedefleri

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| Page load (frontend) | 200ms | 500ms | 1s |
| Search / filter | 100ms | 300ms | 500ms |
| Auth (login/register) | 200ms | 500ms | 1s |
| Professor detail (cache hit) | 100ms | 300ms | 500ms |
| Professor style profile (cache hit) | 100ms | 400ms | 800ms |
| Professor style profile (cache miss, Gemini) | 5s | 15s | 30s |
| Exam upload + analyze | 5s | 15s | 30s |
| Study pack generate | 15s | 45s | 90s |
| Mock exam generate | 30s | 90s | 180s |
| Mock exam submit + grade | 10s | 30s | 60s |
| Voice tutor initial response | 1s | 3s | 5s |

Not: Gemini-bound endpoint'lerde P99 çoğu zaman dış API'ye bağlı. Circuit breaker + fallback Phase 4+.

---

## Frontend Bundle Hedefleri

| Metrik | Hedef |
|--------|-------|
| Initial JS | < 200KB gzip |
| Initial CSS | < 30KB gzip |
| Total initial load | < 500KB gzip |
| TTI (Time to Interactive) | < 3s mobile 3G |
| LCP | < 2.5s |
| CLS | < 0.1 |

**Ölçüm:** Lighthouse + real user monitoring (Plausible Web Vitals — Phase 2+).

---

## Backend Resource Hedefleri

### Phase 0-1 (Single VPS)

| Metrik | Hedef |
|--------|-------|
| API server RAM | < 512MB |
| Postgres RAM | < 1GB |
| Concurrent connections | < 50 |
| CPU (avg) | < %30 |
| Disk I/O | < 100 IOPS |

### Phase 3+ (Ölçeklendikten sonra)

| Metrik | Hedef |
|--------|-------|
| API server RAM | < 1GB per instance |
| Postgres connections | < 80% pool |
| Redis hit rate | > %80 |
| Gemini cache hit rate | > %60 |

---

## AI Cost Hedefleri

Detaylı breakdown: [`ai-pipeline.md`](./ai-pipeline.md#cost-tracking).

**Toplam aylık bütçe hedefi:**

| Faz | Hedef Aylık |
|-----|-------------|
| Phase 1 | < $100 |
| Phase 2 | < $500 |
| Phase 3 | < $2K |
| Phase 4 | < $5K |
| Phase 5 | < $8K |
| Phase 6 | < $15K |
| Phase 7 | < $30K |

Hedef aşılırsa: cache + rate limit + free tier sıkılaştırma.

---

## Uptime Hedefleri

| Faz | SLO |
|-----|-----|
| Phase 0-1 | 99.0% (7.2 saat/ay downtime) — tolerable |
| Phase 2-4 | 99.5% (3.6 saat/ay) |
| Phase 5+ | 99.9% (43 dk/ay) — production-grade |

**İstisnalar:** Gemini dış kaynaklı outage'lar SLO'dan çıkarılır; fallback Phase 4+.

---

## Ölçüm Stratejisi

| Metric | Tool | Phase |
|--------|------|-------|
| API latency | Express middleware + Prometheus | Phase 2 |
| Frontend Web Vitals | Plausible / web-vitals | Phase 2 |
| Error rate | Sentry | Phase 1 |
| Uptime | UptimeRobot / Better Uptime | Phase 2 |
| AI cost | `AICallLog` + dashboard | Phase 1 |
| DB query slow log | Postgres `log_min_duration` | Phase 2 |
| Bundle size | Vite build + size-limit CI | Phase 1 |

---

## Performans Testleri

### Yük Testi (k6 veya Artillery)

**Phase 3'te yap:**

- 100 concurrent user, 10dk süre.
- Scenarios: browse + upload + mock exam.
- Başarı: P95 hedefler içinde, 0 error.

### Stress Test (Phase 5'te)

- 1000 concurrent user.
- Başarı: graceful degradation (503 yerine yavaş response).

---

## Optimizasyon Öncelikleri

**Phase 1'de yap:**

1. Database query audit — N+1 var mı? `prisma.professor.findMany({ include })` ile preload.
2. Recharts lazy-load (sadece analiz sayfasında).
3. Image optimization — BoringAvatars client-side yeterli, placeholder yok.
4. Gzip + brotli enable (nginx / Caddy).

**Phase 2-3'te yap:**

1. React Query eklendi → stale-while-revalidate cache.
2. Route-level code split (React.lazy).
3. Postgres indeksler (yukarıdaki liste).

**Phase 4+ — gerekirse:**

1. CDN (Cloudflare).
2. Redis cache (Gemini response).
3. Read replica.

---

## İlgili

- Mevcut stack: [`current-stack.md`](./current-stack.md)
- Hedef stack: [`target-stack.md`](./target-stack.md)
- AI cost detay: [`ai-pipeline.md`](./ai-pipeline.md)
- Test stratejisi: [`../operations/testing-strategy.md`](../operations/testing-strategy.md)
