-- CreateTable
CREATE TABLE "mock_exams" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "studyPackId" TEXT,
    "noteIds" TEXT[],
    "noteHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 90,
    "sectionBreakdown" JSONB,
    "geminiVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exam_sessions" (
    "id" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "prediction" JSONB,
    "topicGaps" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpentSec" INTEGER,
    "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mock_exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mock_exams_userId_idx" ON "mock_exams"("userId");

-- CreateIndex
CREATE INDEX "mock_exams_professorId_idx" ON "mock_exams"("professorId");

-- CreateIndex
CREATE INDEX "mock_exams_expiresAt_idx" ON "mock_exams"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "mock_exams_userId_professorId_noteHash_promptVersion_key" ON "mock_exams"("userId", "professorId", "noteHash", "promptVersion");

-- CreateIndex
CREATE INDEX "mock_exam_sessions_userId_idx" ON "mock_exam_sessions"("userId");

-- CreateIndex
CREATE INDEX "mock_exam_sessions_mockExamId_idx" ON "mock_exam_sessions"("mockExamId");

-- AddForeignKey
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exams" ADD CONSTRAINT "mock_exams_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_sessions" ADD CONSTRAINT "mock_exam_sessions_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "mock_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_sessions" ADD CONSTRAINT "mock_exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
