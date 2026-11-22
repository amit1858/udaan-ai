-- Development migration only. Replit Publish manages production schema.
CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemoSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Sale" (
    "date" TEXT NOT NULL,
    "orders" INTEGER NOT NULL,
    "revenue" INTEGER NOT NULL,
    "variableCosts" INTEGER NOT NULL,
    CONSTRAINT "Sale_pkey" PRIMARY KEY ("date")
);
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "parentExperimentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "sellingPrice" INTEGER NOT NULL,
    "makingCost" INTEGER NOT NULL,
    "promotionBudget" INTEGER NOT NULL,
    "expectedUnits" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 7,
    "actualUnits" INTEGER,
    "actualPromotionSpend" INTEGER,
    "feedback" TEXT,
    "observations" TEXT,
    "synthetic" BOOLEAN NOT NULL DEFAULT false,
    "timeline" TEXT NOT NULL,
    "learning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProviderCall" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProviderCall_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VoiceLabConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "paidEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxRequests" INTEGER NOT NULL DEFAULT 6,
    CONSTRAINT "VoiceLabConfig_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VoiceRequest" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "speaker" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostPaise" INTEGER NOT NULL DEFAULT 0,
    "inputCharacters" INTEGER,
    "inputSeconds" DOUBLE PRECISION,
    "requestId" TEXT,
    "error" TEXT,
    "httpStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoiceRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Experiment_sessionId_createdAt_idx" ON "Experiment"("sessionId", "createdAt");
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "DemoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "DemoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
