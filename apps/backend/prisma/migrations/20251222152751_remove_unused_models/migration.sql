/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GiftCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_categoryId_fkey";

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "status" SET DEFAULT 'awaitingFeedback';

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "GiftCard";
