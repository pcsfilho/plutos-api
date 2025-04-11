/*
  Warnings:

  - You are about to drop the column `name` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `notify` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `title` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "notify",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;
