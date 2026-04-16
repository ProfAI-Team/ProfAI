# ProfAI — Doküman İndeksi

Bu klasör ProfAI'ın **stratejik, mimari ve operasyonel** dokümantasyonudur. Üç ana giriş noktası:

- **Yeni misin / ürünü öğreniyor musun?** → [`vision/00-executive-summary.md`](./vision/00-executive-summary.md)
- **Kod yazıyor musun?** → [`roadmap/README.md`](./roadmap/README.md) (aktif faz: Phase 1)
- **Karar mı verilecek?** → [`tasks/open-questions.md`](./tasks/open-questions.md)

---

## Klasör Haritası

```
docs/
├── README.md                          ← buradasın
├── ProfAI_Vision_and_Roadmap.md       ← v1 master kaynak (supersede eden yapılandırılmış dosyalar aşağıda)
│
├── vision/                            ← NEDEN (strateji, pazar, persona)
│   ├── 00-executive-summary.md        ← 1 sayfalık özet
│   ├── 01-vision-positioning.md       ← vizyon + tagline + konumlandırma
│   ├── 02-problem-market.md           ← problem, pazar boyutu, rakip
│   ├── 03-personas.md                 ← birincil/ikincil/üçüncül persona
│   ├── 04-strategic-pillars.md        ← 5 sütun (insight / yardım / topluluk / DNA / tahmin)
│   ├── 05-moat-competition.md         ← defansibilite
│   └── 06-business-model.md           ← freemium, B2B, marketplace
│
├── roadmap/                           ← NE (faz faz yol haritası)
│   ├── README.md                      ← 7 faz özet + durum tablosu
│   ├── phase-0-baseline.md            ← mevcut MVP (tamamlandı)
│   ├── phase-1-style-profile.md       ← SIRADAKİ
│   ├── phase-2-study-packs.md
│   ├── phase-3-mock-exams.md
│   ├── phase-4-community.md
│   ├── phase-5-academic-dna.md
│   ├── phase-6-multimodal.md
│   └── phase-7-b2b-marketplace.md
│
├── architecture/                      ← NASIL (teknik kararlar)
│   ├── current-stack.md               ← Phase 0 mimari + endpoint envanteri
│   ├── target-stack.md                ← Phase 5+ hedef mimari
│   ├── ai-pipeline.md                 ← Gemini / prompt / cache / cost
│   ├── data-model-evolution.md        ← Prisma schema faz faz
│   └── performance-targets.md         ← P50/P95/P99 hedefleri
│
├── operations/                        ← İŞLETİM (risk, test, ölçüm, demo)
│   ├── risks.md                       ← konsolide risk matrisi
│   ├── testing-strategy.md            ← faz bazlı test planı
│   ├── kpis.md                        ← North Star + faz hedefleri
│   └── demo-plan.md                   ← 20-25 dk demo senaryosu
│
├── tasks/                             ← YAP (task breakdown)
│   ├── README.md                      ← task yönetimi genel bakış
│   ├── phase-1-breakdown.md           ← Phase 1 detaylı task listesi
│   └── open-questions.md              ← karar bekleyen konular
│
├── killer-moments.md                  ← "Aha" UX senaryoları (ürün sezgisi)
│
├── ProfAI_Project_Plan.xlsx           ← manuel Excel planı (ayrıca güncellenir)
├── ProfAI_UML_Diagrams.drawio         ← UML diyagramı (faz başı güncellenir)
│
└── _archive/                          ← eski yapının dondurulmuş kopyası
    ├── ProfAI_Product_Documentation.md
    ├── ProfAI_Risk_Analysis.md
    ├── ProfAI_Risk_Analysis_v2.md
    ├── ProfAI_Testing_and_Success_Criteria.md
    ├── ProfAI_Demo_Plan.md
    ├── JIRA_TASK_STRUCTURE.md
    ├── ProfAI_Vision_and_Roadmap_v1_MASTER.md
    └── _NEXT_SESSION_PROMPT.md
```

---

## Nasıl Okumalı

| Rol / Durum | Öncelikle Oku |
|-------------|---------------|
| **Geliştirici — aktif sprint** | `CLAUDE.md` → `roadmap/phase-1-style-profile.md` → `tasks/phase-1-breakdown.md` → ilgili `architecture/*.md` |
| **Yeni ekip üyesi** | `vision/00-executive-summary.md` → `vision/04-strategic-pillars.md` → `roadmap/README.md` → `architecture/current-stack.md` |
| **Ürün kararı** | `vision/03-personas.md` → `vision/04-strategic-pillars.md` → `tasks/open-questions.md` |
| **Mimari karar** | `architecture/target-stack.md` → `architecture/ai-pipeline.md` → `architecture/data-model-evolution.md` |
| **Sunum / demo hazırlığı** | `operations/demo-plan.md` → `killer-moments.md` → `operations/kpis.md` |
| **Risk / hukuk** | `operations/risks.md` → `vision/06-business-model.md` |

---

## Güncelleme Kuralları

- **Vision dosyaları** yavaş değişir — major pivot'ta (Phase 0 → Phase 5 arası 1-2 revizyon beklenir).
- **Roadmap dosyaları** her faz sonunda güncellenir: bir önceki faz "tamamlandı" olarak işaretlenir, gerçekleşen sonuçlar eklenir.
- **Architecture dosyaları** schema değiştiğinde aynı PR'da güncellenir.
- **Operations (risks, kpis)** yeni özellik eklendiğinde senkron edilir.
- **Tasks** sprint yönetimiyle birlikte günlük değişir.
- Her doküman altında **"Versiyon Geçmişi"** tablosu var — kim, ne, ne zaman.

---

## İlgili Dosyalar

- Kök rehber: [`../CLAUDE.md`](../CLAUDE.md)
- Frontend: [`../client/CLAUDE.md`](../client/CLAUDE.md)
- Backend: [`../server/CLAUDE.md`](../server/CLAUDE.md)
- v1 master (tarihi): [`ProfAI_Vision_and_Roadmap.md`](./ProfAI_Vision_and_Roadmap.md)

**Scratchpad (yaşayan çalışma defterleri — session hafızası):**
- [`../SCRATCHPAD.md`](../SCRATCHPAD.md) — kök, cross-cutting
- [`../client/SCRATCHPAD.md`](../client/SCRATCHPAD.md) — frontend
- [`../server/SCRATCHPAD.md`](../server/SCRATCHPAD.md) — backend

Scratchpad → open-questions → faz dokümanı akışı: düşünce olgunlaştıkça yukarıdan aşağıya taşınır.
