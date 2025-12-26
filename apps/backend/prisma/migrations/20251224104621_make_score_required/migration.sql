/*
  Warnings:

  - Made the column `score` on table `FeedbackOption` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FeedbackOption" ALTER COLUMN "score" SET NOT NULL;
