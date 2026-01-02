-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "subscriptionId" INTEGER;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "monthOfYear" INTEGER,
    "expectedAmount" DOUBLE PRECISION NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "matchPattern" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "lastPaidDate" TIMESTAMP(3),
    "lastPaidAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_walletId_idx" ON "Subscription"("walletId");

-- CreateIndex
CREATE INDEX "Subscription_nextDueDate_idx" ON "Subscription"("nextDueDate");

-- CreateIndex
CREATE INDEX "Subscription_matchPattern_idx" ON "Subscription"("matchPattern");

-- CreateIndex
CREATE INDEX "Transaction_subscriptionId_idx" ON "Transaction"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
