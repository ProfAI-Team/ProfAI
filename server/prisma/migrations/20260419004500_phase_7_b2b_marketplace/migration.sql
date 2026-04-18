-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'HOCA', 'TUTOR', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "universityAccountId" TEXT;

-- CreateTable
CREATE TABLE "tutors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "hourlyRate" INTEGER NOT NULL,
    "specializations" JSONB NOT NULL,
    "availability" JSONB NOT NULL,
    "rating" DOUBLE PRECISION,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutoring_sessions" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "feedback" TEXT,
    "price" INTEGER NOT NULL,
    "meetingUrl" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "tutoring_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_items" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "previewText" TEXT,
    "tags" JSONB NOT NULL,
    "rating" DOUBLE PRECISION,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_accounts" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "ssoMetadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_universityAccountId_idx" ON "users"("universityAccountId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_userId_key" ON "tutors"("userId");

-- CreateIndex
CREATE INDEX "tutors_status_idx" ON "tutors"("status");

-- CreateIndex
CREATE INDEX "tutors_rating_idx" ON "tutors"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "tutoring_sessions_paymentId_key" ON "tutoring_sessions"("paymentId");

-- CreateIndex
CREATE INDEX "tutoring_sessions_tutorId_scheduledAt_idx" ON "tutoring_sessions"("tutorId", "scheduledAt");

-- CreateIndex
CREATE INDEX "tutoring_sessions_studentId_scheduledAt_idx" ON "tutoring_sessions"("studentId", "scheduledAt");

-- CreateIndex
CREATE INDEX "tutoring_sessions_status_idx" ON "tutoring_sessions"("status");

-- CreateIndex
CREATE INDEX "marketplace_items_approved_type_idx" ON "marketplace_items"("approved", "type");

-- CreateIndex
CREATE INDEX "marketplace_items_sellerId_idx" ON "marketplace_items"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_externalId_key" ON "payments"("externalId");

-- CreateIndex
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "university_accounts_universityId_key" ON "university_accounts"("universityId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_universityAccountId_fkey" FOREIGN KEY ("universityAccountId") REFERENCES "university_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoring_sessions" ADD CONSTRAINT "tutoring_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 7 (task 7.3 + 7.10) — pgvector embedding columns for tutor
-- matching + marketplace search. `Unsupported("vector(768)")` in the
-- Prisma schema makes the columns invisible to the Prisma Client type
-- system (read/write via $executeRaw only). Ivfflat indexes on cosine
-- distance give the matching + search queries O(log n) scan behaviour
-- at Phase 7 scale; lists = 100 is the pgvector default sweet-spot
-- below ~100k rows.
ALTER TABLE "tutors" ADD COLUMN "embedding" vector(768);
ALTER TABLE "marketplace_items" ADD COLUMN "embedding" vector(768);
CREATE INDEX "tutors_embedding_idx" ON "tutors" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
CREATE INDEX "marketplace_items_embedding_idx" ON "marketplace_items" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
