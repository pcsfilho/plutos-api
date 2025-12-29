/*
  Warnings:

  - You are about to drop the column `userId` on the `Wallet` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CHECKING_ACCOUNT', 'SAVINGS', 'CREDIT_CARD', 'CASH');

-- CreateEnum
CREATE TYPE "BankProvider" AS ENUM ('NUBANK', 'INTER', 'C6', 'GENERIC');

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "importedFrom" TEXT;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "userId",
ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "closingDay" INTEGER,
ADD COLUMN     "creditLimit" DOUBLE PRECISION,
ADD COLUMN     "dueDay" INTEGER,
ADD COLUMN     "type" "WalletType" NOT NULL DEFAULT 'CHECKING_ACCOUNT';

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "AccountType" NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryRule" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "walletId" INTEGER,
    "pattern" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportHistory" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "walletId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "bankProvider" "BankProvider" NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "importedRows" INTEGER NOT NULL,
    "duplicatedRows" INTEGER NOT NULL,
    "errorRows" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- CreateIndex
CREATE INDEX "CategoryRule_accountId_idx" ON "CategoryRule"("accountId");

-- CreateIndex
CREATE INDEX "CategoryRule_pattern_idx" ON "CategoryRule"("pattern");

-- CreateIndex
CREATE INDEX "ImportHistory_accountId_idx" ON "ImportHistory"("accountId");

-- CreateIndex
CREATE INDEX "Transaction_walletId_date_amount_description_idx" ON "Transaction"("walletId", "date", "amount", "description");

-- CreateIndex
CREATE INDEX "Wallet_accountId_idx" ON "Wallet"("accountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryRule" ADD CONSTRAINT "CategoryRule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryRule" ADD CONSTRAINT "CategoryRule_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryRule" ADD CONSTRAINT "CategoryRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportHistory" ADD CONSTRAINT "ImportHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportHistory" ADD CONSTRAINT "ImportHistory_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
