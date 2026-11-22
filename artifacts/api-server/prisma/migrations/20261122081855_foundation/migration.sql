-- CreateTable
CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sale" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "orders" INTEGER NOT NULL,
    "revenue" INTEGER NOT NULL,
    "variableCosts" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DemoSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DemoSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Experiment_sessionId_createdAt_idx" ON "Experiment"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
