-- CreateTable
CREATE TABLE "student_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_packs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "noteIds" TEXT[],
    "noteHash" TEXT NOT NULL,
    "topicSummaries" JSONB NOT NULL,
    "practiceQuestions" JSONB NOT NULL,
    "profStylePatterns" JSONB NOT NULL,
    "geminiVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_packs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_notes_userId_idx" ON "student_notes"("userId");

-- CreateIndex
CREATE INDEX "student_notes_courseId_idx" ON "student_notes"("courseId");

-- CreateIndex
CREATE INDEX "study_packs_userId_idx" ON "study_packs"("userId");

-- CreateIndex
CREATE INDEX "study_packs_professorId_idx" ON "study_packs"("professorId");

-- CreateIndex
CREATE INDEX "study_packs_expiresAt_idx" ON "study_packs"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "study_packs_userId_professorId_noteHash_promptVersion_key" ON "study_packs"("userId", "professorId", "noteHash", "promptVersion");

-- AddForeignKey
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_packs" ADD CONSTRAINT "study_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_packs" ADD CONSTRAINT "study_packs_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
