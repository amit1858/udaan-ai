-- CreateTable
CREATE TABLE "VoiceLabConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "paidEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxRequests" INTEGER NOT NULL DEFAULT 6
);

-- CreateTable
CREATE TABLE "VoiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "speaker" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostPaise" INTEGER NOT NULL DEFAULT 0,
    "inputCharacters" INTEGER,
    "inputSeconds" REAL,
    "requestId" TEXT,
    "error" TEXT,
    "httpStatus" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
