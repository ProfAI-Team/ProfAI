-- CreateTable
CREATE TABLE "professor_style_profiles" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "aggregatedData" JSONB NOT NULL,
    "geminiSummary" TEXT NOT NULL,
    "topTopics" JSONB NOT NULL,
    "evolution" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "examSourceCount" INTEGER NOT NULL,
    "geminiVersion" TEXT NOT NULL,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "regenerationStartedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professor_style_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_call_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "feature" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callId" TEXT,
    "feature" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professor_style_profiles_professorId_key" ON "professor_style_profiles"("professorId");

-- CreateIndex
CREATE INDEX "professor_style_profiles_isStale_idx" ON "professor_style_profiles"("isStale");

-- CreateIndex
CREATE INDEX "ai_call_logs_userId_idx" ON "ai_call_logs"("userId");

-- CreateIndex
CREATE INDEX "ai_call_logs_feature_idx" ON "ai_call_logs"("feature");

-- CreateIndex
CREATE INDEX "ai_call_logs_createdAt_idx" ON "ai_call_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_feedback_userId_idx" ON "ai_feedback"("userId");

-- CreateIndex
CREATE INDEX "ai_feedback_feature_idx" ON "ai_feedback"("feature");

-- AddForeignKey
ALTER TABLE "professor_style_profiles" ADD CONSTRAINT "professor_style_profiles_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_callId_fkey" FOREIGN KEY ("callId") REFERENCES "ai_call_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
