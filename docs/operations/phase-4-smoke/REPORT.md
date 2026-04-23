# Phase 4 Visual Smoke — 2026-04-17

**Fixture seeder:** `server/scripts/seed-phase-4-fixture.ts` (demo user
kredi ledger'ı + 10 post-exam report + study group + pending exam).
**Viewports:** 1440×900 (desktop) + 390×844 (mobile).
**Theme:** dark (sistem varsayılanı).

## Senaryo Listesi

| # | Rota | Viewport | Gözlem |
|---|------|----------|--------|
| 1 | `/credits` · Bakiye tab | 1440 dark | CreditBadge Navbar'da "20 kredi" pill; Bakiye kartı + earn/spend kurallar tablosu, ikonlar + artı/eksi tabular-nums hizalı |
| 2 | `/credits` · Geçmiş tab | 1440 dark | 6 ledger satırı yeni→eski, type icon (TrendingUp/Down) + reason stringleri i18n'li (`Sınav onaylandı`, `Sınav sonrası raporu`, `Deneme sınavı üretimi`), tarih `toLocaleString()` |
| 3 | `/approve-exams` | 1440 dark | Eyebrow + hero + kart listesi; course code+name, hoca adı, MIDTERM pill, reason input + Yanlış / Doğru butonlar; fixture + mevcut seeded sınavlar — sırası newest-first |
| 4 | `/study-groups` | 1440 dark | 4 üye kartı, Öneri rozeti, Bağlantıyı aç (renkli) + Bağlantıyı değiştir (outline) CTA'lar |
| 5 | `/post-exam-reports/new?professorId=test` | 1440 dark fullpage | KVKK banner (primary soft), grid form + ReportedTopicsEditor (topic + Birkaç + slider 3 + sil butonu) + Raporu gönder (+5 kredi) CTA |
| 6 | `/professors/:id` (altına scroll) | 1440 dark | AggregatedExamInsights + HighPerformerStrategy side-by-side; Scrum Rolleri ×10 + %100 rozet, disclaimer copy doğru |
| 7 | `/approve-exams` | 390 dark | Mobile layout: hamburger nav, kartlar dikey stack, reason input full-width, CTA row wrap |
| 8 | `/study-groups` link modal | 1440 dark | ExternalLinkModal overlay: PII warning kartı (amber), URL input placeholder `https://chat.whatsapp.com/...`, Vazgeç + Bağlantıyı kaydet butonlar |

## Bulgular

- **0 bug** — tüm senaryolar beklentiye uyuyor.
- Navbar CreditBadge canlı query (30sn stale) doğru; balance 20 (seed history gösterir: +10 +5 -5 +10 +5 -5 = 20, iki kez koşulduğu için).
- i18n parity 447↔447 taşıyor; tüm community.* stringleri Türkçe render oluyor, placeholder interpolasyonları ({{count}}, {{threshold}}, {{balance}}) beklendiği gibi dolduruldu.
- k-anonymity davranışı fixture'da 10 rapor olduğu için `ready` path'e düştü — topic frequency mode (`Çokça`) + ×10 rozet + high-performer %100 coverage Disclaimer görünür.
- Study group status pill'leri "Öneri" → SUGGESTED eşleşmesi i18n'de doğru.
- Exit / auto-submit akışları smoke dışı (Phase 3'te kapsanmış, Phase 4'te değişmedi).

## Bilinen Sınırlar

- Fixture seeder tekrar çalıştırılabilir; ama `erdemacar1` demo kullanıcısının ledger'ı birikiyor (wipe sadece `phase4fixture-` email prefix'ini siler). İleride isterseniz demo kullanıcı credit reset'i ayrı bir flag ile.
- Yeni seeded exam'lar test fixture'ı çok sayıda olduğu için approval wall uzun görünüyor — prod'da aynı durum user-generated exam'lar için geçerli olmayacak.
- Fast-path manual QA gerekenler: 3-onay eşiği → verified propagation zincirini gerçek Gemini cold generate gerektiriyor; Phase 3 pattern'ıyla bu smoke dışı tutuldu.
