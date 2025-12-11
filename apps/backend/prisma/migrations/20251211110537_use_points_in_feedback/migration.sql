/*
  Warnings:

  - You are about to drop the column `earnedCents` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `pointsValue` on the `Receipt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeedbackResult" DROP COLUMN "earnedCents",
ADD COLUMN     "pointsValue" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "pointsValue";
