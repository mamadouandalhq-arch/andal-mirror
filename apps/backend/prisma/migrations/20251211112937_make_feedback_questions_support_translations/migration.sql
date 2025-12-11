/*
  Warnings:

  - You are about to drop the column `options` on the `FeedbackQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `FeedbackQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeedbackQuestion" DROP COLUMN "options",
DROP COLUMN "text";

-- CreateTable
CREATE TABLE "FeedbackQuestionTranslation" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "FeedbackQuestionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackQuestionTranslation_questionId_lang_key" ON "FeedbackQuestionTranslation"("questionId", "lang");

-- AddForeignKey
ALTER TABLE "FeedbackQuestionTranslation" ADD CONSTRAINT "FeedbackQuestionTranslation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
