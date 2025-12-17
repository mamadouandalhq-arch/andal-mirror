/*
  Warnings:

  - You are about to drop the column `serialNumber` on the `FeedbackQuestion` table. All the data in the column will be lost.
  - Added the required column `surveyId` to the `FeedbackResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FeedbackQuestion_serialNumber_key";

-- AlterTable
ALTER TABLE "FeedbackQuestion" DROP COLUMN "serialNumber";

-- AlterTable
ALTER TABLE "FeedbackResult" ADD COLUMN     "surveyId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FeedbackSurvey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyQuestion_questionId_surveyId_key" ON "SurveyQuestion"("questionId", "surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyQuestion_surveyId_order_key" ON "SurveyQuestion"("surveyId", "order");

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "FeedbackSurvey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "FeedbackSurvey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
