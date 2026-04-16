# Veri Modeli Evrimi

Prisma schema'nın faz faz evrimi. Ham dosya: [`server/prisma/schema.prisma`](../../server/prisma/schema.prisma).

---

## Phase 0 — Mevcut Modeller

Altı temel model:

| Model | Amaç |
|-------|------|
| `User` | Auth + profil (email, password, name, university, department) |
| `Professor` | Hoca (name, department, university) |
| `Course` | Ders (code, name, professorId) |
| `Exam` | Sınav (courseId, examType enum, year, semester, fileUrl, uploadedById) |
| `ExamAnalysis` | AI analizi (questionCount, questionTypes, topicDistribution, difficultyScore, summary) |
| `ProfessorRating` | Puanlama (difficultyScore, fairnessScore, comment) |

**Enum:** `ExamType = MIDTERM | FINAL | MAKEUP`.

---

## Phase 1 — Style Profile Cache

```prisma
model ProfessorStyleProfile {
  id              String    @id @default(uuid())
  professorId     String    @unique
  professor       Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)

  aggregatedData  Json
  geminiSummary   String    @db.Text
  topTopics       Json
  evolution       Json
  metrics         Json

  examSourceCount Int
  geminiVersion   String
  isStale         Boolean   @default(false)

  generatedAt     DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([professorId])
  @@index([isStale])
}

model AICallLog {   // Cost tracking + free-tier flag
  id           String   @id @default(uuid())
  userId       String?
  feature      String
  provider     String
  model        String
  inputTokens  Int
  outputTokens Int
  costUsd      Float    // paid-tier tahmini, her zaman populate
  freeTier     Boolean  @default(true)
  latencyMs    Int
  cacheHit     Boolean  @default(false)
  success      Boolean
  errorCode    String?
  createdAt    DateTime @default(now())
}

model AIFeedback {  // Kalite loop
  id        String   @id @default(uuid())
  userId    String
  feature   String
  callId    String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
}
```

**Invalidasyon hook:** Yeni exam analiz edildiğinde `ProfessorStyleProfile.isStale = true`.

---

## Phase 2 — Student Notes + Study Pack

```prisma
model StudentNote {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title         String
  courseId      String?
  course        Course?  @relation(fields: [courseId], references: [id])
  fileUrl       String
  extractedText String   @db.Text
  wordCount     Int
  createdAt     DateTime @default(now())

  @@index([userId])
}

model StudyPack {
  id                String   @id @default(uuid())
  userId            String
  professorId       String
  noteIds           String[]
  topicSummaries    Json
  practiceQuestions Json
  profStylePatterns Json
  geminiVersion     String
  generatedAt       DateTime @default(now())

  @@index([userId])
  @@index([professorId])
}
```

---

## Phase 3 — Mock Exams

```prisma
model MockExam {
  id            String   @id @default(uuid())
  userId        String
  professorId   String
  studyPackId   String?
  title         String
  questions     Json
  durationMin   Int      @default(90)
  geminiVersion String
  createdAt     DateTime @default(now())
}

model MockExamSession {
  id          String    @id @default(uuid())
  mockExamId  String
  mockExam    MockExam  @relation(fields: [mockExamId], references: [id])
  userId      String
  answers     Json
  score       Float?
  feedback    Json?
  prediction  Json?
  startedAt   DateTime  @default(now())
  completedAt DateTime?

  @@index([userId])
}
```

---

## Phase 4 — Community

```prisma
model UserCredit {
  userId    String   @id
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance   Int      @default(0)
  history   Json[]
  updatedAt DateTime @updatedAt
}

model ExamApproval {
  examId    String
  exam      Exam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  userId    String
  approved  Boolean
  createdAt DateTime @default(now())

  @@id([examId, userId])
}

model QuestionVote {
  questionId  String
  userId      String
  vote        Int
  cameOnExam  Boolean?
  createdAt   DateTime @default(now())

  @@id([questionId, userId])
}

model PostExamReport {
  id             String   @id @default(uuid())
  userId         String
  professorId    String
  courseId       String?
  examDate       DateTime
  reportedTopics Json
  notes          String?
  createdAt      DateTime @default(now())

  @@index([professorId])
}

model StudyGroup {
  id            String    @id @default(uuid())
  professorId   String
  courseId      String?
  examDate      DateTime?
  members       User[]
  externalLink  String?
  createdAt     DateTime  @default(now())

  @@index([professorId])
}
```

---

## Phase 5 — Academic DNA

```prisma
model AcademicDNA {
  userId                 String   @id
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  learningStyle          String?
  strengths              Json
  weaknesses             Json
  totalQuestionsAnswered Int      @default(0)
  correctRate            Float?
  preferredDifficulty    String?
  updatedAt              DateTime @updatedAt
}

model ConfidenceScore {
  userId    String
  topic     String
  score     Float
  updatedAt DateTime @updatedAt

  @@id([userId, topic])
  @@index([userId])
}

model GradeRecord {
  id         String   @id @default(uuid())
  userId     String
  courseId   String?
  courseName String
  grade      Float
  credit     Int
  semester   String
  createdAt  DateTime @default(now())

  @@index([userId])
}

model SpacedRepetition {
  id           String    @id @default(uuid())
  userId       String
  questionId   String
  nextReview   DateTime
  interval     Int
  easiness     Float
  lastReviewed DateTime?

  @@index([userId, nextReview])
}
```

---

## Phase 6 — Multimodal

```prisma
model VoiceSession {
  id          String   @id @default(uuid())
  userId      String
  professorId String?
  durationSec Int
  transcript  String   @db.Text
  topics      Json
  createdAt   DateTime @default(now())

  @@index([userId])
}

model OCRResult {
  id            String   @id @default(uuid())
  userId        String
  fileUrl       String
  extractedText String   @db.Text
  latexFormulas Json
  createdAt     DateTime @default(now())

  @@index([userId])
}
```

---

## Phase 7 — B2B + Marketplace

```prisma
model Tutor {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  bio             String   @db.Text
  hourlyRate      Int
  specializations Json
  rating          Float?
  totalSessions   Int      @default(0)
  verifiedAt      DateTime?
  createdAt       DateTime @default(now())
}

model TutoringSession {
  id          String   @id @default(uuid())
  tutorId     String
  studentId   String
  scheduledAt DateTime
  durationMin Int
  status      String
  rating      Float?
  feedback    String?
  price       Int
}

model MarketplaceItem {
  id          String   @id @default(uuid())
  sellerId    String
  type        String
  title       String
  description String
  price       Int
  fileUrl     String
  rating      Float?
  totalSales  Int      @default(0)
  approved    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Payment {
  id         String   @id @default(uuid())
  userId     String
  type       String
  amount     Int
  status     String
  externalId String?
  createdAt  DateTime @default(now())
}

model UniversityAccount {
  id           String   @id @default(uuid())
  universityId String
  contactEmail String
  tier         String
  seats        Int
  renewalDate  DateTime
  createdAt    DateTime @default(now())
}
```

**Yeni rol sistemi:** `User.role` enum — `STUDENT | HOCA | UNIVERSITY_ADMIN | TUTOR | SUPER_ADMIN`.

---

## Migration Stratejisi

Her faz için **tek migration** (büyük schema hop'larından kaçın):

```bash
# Phase 1
npx prisma migrate dev --name phase_1_style_profile

# Phase 2
npx prisma migrate dev --name phase_2_study_packs

# ...
```

**Production deploy:**

```bash
npx prisma migrate deploy
```

**Rollback stratejisi:**

- Her schema değişikliği **additive** olmalı (field ekle, silme).
- Silme gerekiyorsa → iki faz: (1) kullanımı kaldır, (2) field'ı kaldır.
- Data migration gerekiyorsa: separate script, `prisma migrate` değil.

---

## İndeksler (performans önerileri)

Phase 0'da mevcut:

- `exams.courseId`, `exams.uploadedById` (FK otomatik)

Phase 1'den itibaren eklemek iyi olur:

- `professors.university` — ekser filter.
- `professors.department` — filter.
- `professors(university, department)` compound — faceted search hızlandırır.
- `exams(courseId, year DESC)` — sınav listeleme.
- `ratings.professorId` — rating aggregation.
- `users.email` (zaten `@unique`).

---

## Data Retention (GDPR/KVKK hazırlığı)

- **User silme:** Cascade delete. User → Exam → ExamAnalysis (uploadedBy FK).
- **Anonim aggregation:** k-anonymity ≥5 (Phase 4+).
- **Export:** JSON format, 48 saat içinde (Phase 5).
- **Audit log retention:** 2 yıl (compliance).

---

## İlgili

- Mevcut schema: [`../../server/prisma/schema.prisma`](../../server/prisma/schema.prisma)
- Mevcut mimari: [`current-stack.md`](./current-stack.md)
- AI pipeline: [`ai-pipeline.md`](./ai-pipeline.md)
- Faz roadmap: [`../roadmap/README.md`](../roadmap/README.md)
