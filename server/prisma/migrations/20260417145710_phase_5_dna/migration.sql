-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "academic_dna" (
    "userId" TEXT NOT NULL,
    "learningStyle" TEXT,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "totalQuestionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctRate" DOUBLE PRECISION,
    "preferredDifficulty" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_dna_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "confidence_scores" (
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "lastQuestionCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "confidence_scores_pkey" PRIMARY KEY ("userId","topic")
);

-- CreateTable
CREATE TABLE "grade_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "letterGrade" TEXT,
    "credit" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "university" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaced_repetitions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "interval" INTEGER NOT NULL,
    "easiness" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "lapseCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spaced_repetitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "confidence_scores_userId_idx" ON "confidence_scores"("userId");

-- CreateIndex
CREATE INDEX "grade_records_userId_idx" ON "grade_records"("userId");

-- CreateIndex
CREATE INDEX "grade_records_userId_semester_idx" ON "grade_records"("userId", "semester");

-- CreateIndex
CREATE INDEX "spaced_repetitions_userId_nextReview_idx" ON "spaced_repetitions"("userId", "nextReview");

-- CreateIndex
CREATE UNIQUE INDEX "spaced_repetitions_userId_questionId_key" ON "spaced_repetitions"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "academic_dna" ADD CONSTRAINT "academic_dna_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidence_scores" ADD CONSTRAINT "confidence_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_records" ADD CONSTRAINT "grade_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaced_repetitions" ADD CONSTRAINT "spaced_repetitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
