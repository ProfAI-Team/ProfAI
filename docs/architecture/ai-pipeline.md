# AI Pipeline

Bu doküman Gemini ile konuşma stratejisini, prompt yönetimini, cache politikasını ve maliyet kontrolünü tanımlar.

---

## Mevcut Durum (Phase 0)

```
server/src/services/
├── analysisService.ts          ← PDF → Gemini → ExamAnalysis
└── llm/
    └── geminiProvider.ts       ← Gemini client (env'den model + key okur)
```

- Model: `gemini-2.5-flash-lite` (env `GEMINI_MODEL` override edilebilir).
- API key: root `.env` → `GEMINI_API_KEY`.
- Structured output: `responseMimeType: "application/json"` + response schema.
- Cache: yok (her çağrı yeni).
- Cost tracking: yok (Phase 1'de eklenecek).
- Retry/fallback: yok (hata → 500).

---

## Hedef Soyutlama (Phase 1+)

```ts
// server/src/services/aiService.ts (Phase 1'de eklenecek)
interface AIService {
  analyzeExam(pdfText: string): Promise<ExamAnalysis>          // Phase 0 ✓
  generateStyleSummary(profile: ProfileInput): Promise<string>  // Phase 1
  generateStudyPack(notes: string, profile): Promise<Pack>      // Phase 2
  generateMockExam(profile, pack, count): Promise<MockExam>     // Phase 3
  gradeAnswer(q, answer, rubric): Promise<Grade>                // Phase 3
  voiceTutor(audio, context): Promise<AudioStream>              // Phase 6
  ocrImage(imageUrl): Promise<OCRResult>                        // Phase 6
}
```

**Her metot şunları yapar:**

1. **Input validation** (Zod schema)
2. **Cache check** (Redis; key = normalized input hash + feature + version)
3. **Provider call** (Gemini primary; Claude fallback Phase 4+)
4. **Response parse** (structured output validate)
5. **Cost tracking** (`AICallLog` tablosu)
6. **Quality logging** (response sample, user feedback)
7. **Response return**

---

## Provider Abstraction

```ts
// server/src/services/llm/provider.ts
interface LLMProvider {
  name: 'gemini' | 'claude' | 'openai'
  generate(params: GenerateParams): Promise<GenerateResult>
  supportsStreaming: boolean
  supportsMultimodal: boolean
  supportsVoice: boolean
}

// Orchestrator (Phase 4+)
class AIOrchestrator {
  async call(feature: Feature, params): Promise<Result> {
    for (const provider of this.providers) {
      try {
        return await provider.generate(...)
      } catch (err) {
        if (err instanceof RateLimitError) continue
        if (err instanceof QuotaError) continue
        throw err
      }
    }
  }
}
```

**Phase 0-3:** Sadece Gemini.
**Phase 4+:** Claude Haiku fallback (Gemini down/rate-limited olduğunda).

---

## Prompt Library

Her feature için prompt dosyası: `server/src/prompts/`.

```
server/src/prompts/
├── analyze-exam.ts        ← Phase 0 (mevcut, analysisService'de inline)
├── style-summary.ts       ← Phase 1 eklenecek
├── study-pack.ts          ← Phase 2
├── mock-exam.ts           ← Phase 3
├── grade-answer.ts        ← Phase 3
└── voice-tutor.ts         ← Phase 6
```

**Prompt yapısı:**

```ts
// Örnek: style-summary.ts
export const styleSummaryPrompt = {
  version: 'v1',                     // cache invalidation için
  systemInstruction: `Sen Türk üniversite öğrencisine yönelik bir akademik AI'sın. ...`,
  template: (input) => `
    Hoca: ${input.profName}
    Son 5 sınav aggregate verisi:
    ${JSON.stringify(input.aggregated)}

    3-4 cümlelik özet yaz, samimi ama akademik tonda. ...
  `,
  responseSchema: { ... },           // structured output
}
```

**Kurallar:**

- Prompt'ta **kullanıcı input'unu direkt gömme** — template değişkenlerle gömün (injection prevention).
- Her prompt **version** field'ı tutar. Yeni versiyon = cache invalidation.
- Prompt değişikliği PR'da review — kalite feedback loop var.

---

## Cache Stratejisi

| Feature | Cache Key | TTL | Invalidasyon |
|---------|-----------|-----|--------------|
| Exam analysis | `exam:{id}:{pdfHash}` | ∞ | Manual (admin endpoint) |
| Style profile | `prof:{id}:style:{version}` | ∞ | Yeni exam analiz edilince stale |
| Study pack | `pack:{notesHash}:{profId}:{version}` | 24h | Student note güncellenince |
| Mock exam | `mock:{profId}:{packId}:{version}` | 7g | Pack güncellenince |
| Voice tutor | — | Yok (streaming) | — |

**Phase 1:** in-process LRU (500 entry).
**Phase 3+:** Redis.

---

## Cost Tracking

ProfAI şu anda **Google AI Studio free tier**'da çalışıyor (15 req/dk, 1500 req/gün, 0 fatura). `AICallLog.costUsd` kolonu **her zaman paid-tier fiyatlandırmasına göre hesaplanır** — `freeTier=true` satırlar "eğer paid'e geçseydik bu ay ne olurdu?" projeksiyonu, `freeTier=false` satırlar gerçek harcama.

### `AICallLog` Tablosu (Phase 1'de eklendi, commit `3aed21b` + `add_ai_call_free_tier_flag`)

```prisma
model AICallLog {
  id           String   @id @default(uuid())
  userId       String?
  feature      String   // "analyze-exam" | "style-summary" | ...
  provider     String   // "gemini" | "claude"
  model        String   // "gemini-2.5-flash-lite"
  inputTokens  Int
  outputTokens Int
  costUsd      Float    // paid-tier pricing tahmini, her zaman dolu
  freeTier     Boolean  @default(true)  // gerçekte ödendi mi?
  latencyMs    Int
  cacheHit     Boolean  @default(false)
  success      Boolean
  errorCode    String?

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([feature])
  @@index([createdAt])
}
```

### `GEMINI_FREE_TIER` Env Flag

- Default: `true` (AI Studio free tier kullanılıyor).
- Paid (Google Cloud) billing'e geçilirse: `GEMINI_FREE_TIER=false` → yeni kayıtlar `freeTier=false` alır, gerçek fatura akışı.
- Migration yok — sadece env toggle.

### Rapor Örnekleri

```sql
-- Gerçek harcama (paid tier kullanılırsa):
SELECT SUM("costUsd") FROM ai_call_logs WHERE "freeTier" = false;

-- "Paid'e geçsek bu ay ne olurdu" projeksiyonu:
SELECT feature, SUM("costUsd") AS projected_cost
FROM ai_call_logs WHERE "freeTier" = true
GROUP BY feature ORDER BY projected_cost DESC;

-- Rate-limit riski (free tier quota'ya yakınlık):
SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS calls
FROM ai_call_logs WHERE "freeTier" = true
GROUP BY day ORDER BY day DESC LIMIT 30;
```

### Dashboard (Phase 4'te)

- Daily cost breakdown by feature (projected vs. actual)
- Top 10 users by token consumption
- Free tier quota heatmap (günlük call adedi)
- Cost per conversion (cohort analysis — paid tier döneminde)

### Cost Budgets (hedefler)

| Feature | Hedef / call | Aylık hedef bütçe |
|---------|--------------|-------------------|
| analyze-exam | $0.02 | $500 (25K analiz) |
| style-summary | $0.01 | $100 |
| study-pack | $0.05 | $1K |
| mock-exam | $0.10 | $1K |
| grade-answer | $0.01 | $500 |
| voice-tutor | $0.30/dk | $2K (premium only) |

Bütçe aşım alert'i (Slack/email).

---

## Quality Monitoring

### User Feedback

- Her AI çıktısına **1-click thumbs up/down**.
- `AIFeedback` tablosu (Phase 1):

```prisma
model AIFeedback {
  id        String   @id @default(uuid())
  userId    String
  feature   String
  callId    String   // AICallLog bağı
  rating    Int      // -1 | 0 | 1
  comment   String?
  createdAt DateTime @default(now())
}
```

### Sample Review

- Her hafta 10 random AI output admin panelde review.
- Kötü çıktılar prompt iteration trigger eder.

---

## Structured Output

Gemini `responseMimeType: "application/json"` + `responseSchema`.

**Örnek (mevcut):**

```ts
const model = getGeminiModel()
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        questionTypes: { type: 'object' },
        topicDistribution: { type: 'array' },
        difficulty: { type: 'number' },
      },
    },
  },
})
```

**Avantaj:** Parse hatası çok az. Schema garanti.

---

## Güvenlik

- **Prompt injection:** Kullanıcı input'unu template variable olarak gömün, sistem instruction olarak değil.
- **Output sanitization:** Markdown rendering sırasında `dompurify` kullan (frontend).
- **PII leak:** Gemini'ye öğrenci email/ad gönderme — anonim ID kullan.
- **Rate limit per-user:** cost explosion'a karşı.

---

## İlgili

- Mevcut mimari: [`current-stack.md`](./current-stack.md)
- Hedef: [`target-stack.md`](./target-stack.md)
- Data model: [`data-model-evolution.md`](./data-model-evolution.md)
- Performans: [`performance-targets.md`](./performance-targets.md)
- Risk: [`../operations/risks.md`](../operations/risks.md)
