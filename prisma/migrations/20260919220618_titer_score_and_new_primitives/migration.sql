-- CreateEnum
CREATE TYPE "MoatType" AS ENUM ('PROMPT', 'PROPRIETARY_DATA', 'WORKFLOW', 'DISTRIBUTION', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "BidWindowStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ComparableSource" AS ENUM ('CLOSED_DEAL', 'PUBLIC_COMP');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "confidential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fallbackProvider" TEXT,
ADD COLUMN     "grossMarginAt2xTokenPrice" DECIMAL(5,2),
ADD COLUMN     "inferenceCostPctOfRevenue" DECIMAL(5,2),
ADD COLUMN     "moatType" "MoatType",
ADD COLUMN     "modelRiskVerdict" TEXT,
ADD COLUMN     "primaryModelProvider" TEXT,
ADD COLUMN     "providerFeatureOverlapNotes" TEXT,
ADD COLUMN     "transferChecklist" TEXT;

-- CreateTable
CREATE TABLE "TiterScore" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "revenueDurability" INTEGER NOT NULL,
    "modelDependencyRisk" INTEGER NOT NULL,
    "transferComplexity" INTEGER NOT NULL,
    "operationalLoad" INTEGER NOT NULL,
    "evidenceStrength" INTEGER NOT NULL,
    "rubricVersion" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "scoredBy" TEXT NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TiterScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofRun" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "harnessVersion" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL,
    "successRate" DECIMAL(5,2) NOT NULL,
    "p50Ms" INTEGER NOT NULL,
    "p95Ms" INTEGER NOT NULL,
    "costPerTaskUsd" DECIMAL(10,4) NOT NULL,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "ranAt" TIMESTAMP(3) NOT NULL,
    "artifactUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidWindow" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "reservePrice" DECIMAL(14,2) NOT NULL,
    "status" "BidWindowStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "BidWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "bidWindowId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WindDownLead" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "monthlyRevenue" DECIMAL(14,2),
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WindDownLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValuationLead" (
    "id" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "mrr" DECIMAL(14,2) NOT NULL,
    "momGrowth" DECIMAL(6,2),
    "churn" DECIMAL(6,2),
    "inferenceCostPct" DECIMAL(5,2),
    "email" TEXT NOT NULL,
    "estimatedLow" DECIMAL(14,2) NOT NULL,
    "estimatedHigh" DECIMAL(14,2) NOT NULL,
    "provisionalGrade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparable" (
    "id" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "sizeBand" TEXT NOT NULL,
    "multiple" DECIMAL(6,2) NOT NULL,
    "source" "ComparableSource" NOT NULL,
    "dealDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comparable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiterScore_assetId_key" ON "TiterScore"("assetId");

-- CreateIndex
CREATE INDEX "ProofRun_assetId_ranAt_idx" ON "ProofRun"("assetId", "ranAt");

-- CreateIndex
CREATE UNIQUE INDEX "BidWindow_assetId_key" ON "BidWindow"("assetId");

-- CreateIndex
CREATE INDEX "Bid_bidWindowId_idx" ON "Bid"("bidWindowId");

-- CreateIndex
CREATE INDEX "Comparable_assetType_sizeBand_idx" ON "Comparable"("assetType", "sizeBand");

-- AddForeignKey
ALTER TABLE "TiterScore" ADD CONSTRAINT "TiterScore_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofRun" ADD CONSTRAINT "ProofRun_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidWindow" ADD CONSTRAINT "BidWindow_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidWindowId_fkey" FOREIGN KEY ("bidWindowId") REFERENCES "BidWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

