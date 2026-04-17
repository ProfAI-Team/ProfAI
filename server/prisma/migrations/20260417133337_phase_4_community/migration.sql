-- CreateEnum
CREATE TYPE "StudyGroupStatus" AS ENUM ('SUGGESTED', 'ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_credits" (
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "history" JSONB[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credits_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "exam_approvals" (
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_approvals_pkey" PRIMARY KEY ("examId","userId")
);

-- CreateTable
CREATE TABLE "question_votes" (
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" INTEGER NOT NULL,
    "cameOnExam" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_votes_pkey" PRIMARY KEY ("questionId","userId")
);

-- CreateTable
CREATE TABLE "post_exam_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "courseId" TEXT,
    "examDate" TIMESTAMP(3) NOT NULL,
    "reportedTopics" JSONB NOT NULL,
    "notes" TEXT,
    "selfReportedGrade" INTEGER,
    "selfReportedLetter" TEXT,
    "anonymizedHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_exam_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_groups" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "courseId" TEXT,
    "examDate" TIMESTAMP(3),
    "externalLink" TEXT,
    "status" "StudyGroupStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudyGroupMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "exam_approvals_examId_idx" ON "exam_approvals"("examId");

-- CreateIndex
CREATE INDEX "exam_approvals_userId_idx" ON "exam_approvals"("userId");

-- CreateIndex
CREATE INDEX "question_votes_questionId_idx" ON "question_votes"("questionId");

-- CreateIndex
CREATE INDEX "question_votes_userId_idx" ON "question_votes"("userId");

-- CreateIndex
CREATE INDEX "post_exam_reports_professorId_idx" ON "post_exam_reports"("professorId");

-- CreateIndex
CREATE INDEX "post_exam_reports_examDate_idx" ON "post_exam_reports"("examDate");

-- CreateIndex
CREATE UNIQUE INDEX "post_exam_reports_userId_professorId_examDate_key" ON "post_exam_reports"("userId", "professorId", "examDate");

-- CreateIndex
CREATE INDEX "study_groups_professorId_idx" ON "study_groups"("professorId");

-- CreateIndex
CREATE INDEX "study_groups_examDate_idx" ON "study_groups"("examDate");

-- CreateIndex
CREATE UNIQUE INDEX "_StudyGroupMembers_AB_unique" ON "_StudyGroupMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_StudyGroupMembers_B_index" ON "_StudyGroupMembers"("B");

-- AddForeignKey
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_approvals" ADD CONSTRAINT "exam_approvals_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_approvals" ADD CONSTRAINT "exam_approvals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_exam_reports" ADD CONSTRAINT "post_exam_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyGroupMembers" ADD CONSTRAINT "_StudyGroupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyGroupMembers" ADD CONSTRAINT "_StudyGroupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
