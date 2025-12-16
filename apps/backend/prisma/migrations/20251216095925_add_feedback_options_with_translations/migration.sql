/*
  Warnings:

  - You are about to drop the column `answer` on the `FeedbackAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `FeedbackQuestionTranslation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeedbackAnswer" DROP COLUMN "answer",
ADD COLUMN     "answerKeys" TEXT[];

-- AlterTable
ALTER TABLE "FeedbackQuestionTranslation" DROP COLUMN "options";

-- CreateTable
CREATE TABLE "FeedbackOption" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "FeedbackOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackOptionTranslation" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "FeedbackOptionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackOption_questionId_key_key" ON "FeedbackOption"("questionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackOption_questionId_order_key" ON "FeedbackOption"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackOptionTranslation_optionId_language_key" ON "FeedbackOptionTranslation"("optionId", "language");

-- AddForeignKey
ALTER TABLE "FeedbackOption" ADD CONSTRAINT "FeedbackOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackOptionTranslation" ADD CONSTRAINT "FeedbackOptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "FeedbackOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
