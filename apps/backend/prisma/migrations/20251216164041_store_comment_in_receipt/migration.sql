/*
  Warnings:

  - You are about to drop the column `comment` on the `FeedbackResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeedbackResult" DROP COLUMN "comment";

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "comment" TEXT;
