/*
  Warnings:

  - You are about to drop the `SurveyAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyResult` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('single', 'multiple');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- DropForeignKey
ALTER TABLE "SurveyAnswer" DROP CONSTRAINT "SurveyAnswer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "SurveyAnswer" DROP CONSTRAINT "SurveyAnswer_survey_result_id_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResult" DROP CONSTRAINT "SurveyResult_current_question_id_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResult" DROP CONSTRAINT "SurveyResult_receipt_id_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResult" DROP CONSTRAINT "SurveyResult_user_id_fkey";

-- DropTable
DROP TABLE "SurveyAnswer";

-- DropTable
DROP TABLE "SurveyQuestion";

-- DropTable
DROP TABLE "SurveyResult";

-- DropEnum
DROP TYPE "SurveyStatus";

-- DropEnum
DROP TYPE "SurveyType";

-- CreateTable
CREATE TABLE "FeedbackQuestion" (
    "id" TEXT NOT NULL,
    "serial_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "options" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResult" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'not_started',
    "total_questions" INTEGER NOT NULL,
    "answered_questions" INTEGER NOT NULL DEFAULT 0,
    "earned_cents" INTEGER NOT NULL DEFAULT 0,
    "current_question_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "FeedbackResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackAnswer" (
    "id" TEXT NOT NULL,
    "feedback_result_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResult_user_id_receipt_id_key" ON "FeedbackResult"("user_id", "receipt_id");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackAnswer_feedback_result_id_question_id_key" ON "FeedbackAnswer"("feedback_result_id", "question_id");

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_current_question_id_fkey" FOREIGN KEY ("current_question_id") REFERENCES "FeedbackQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackAnswer" ADD CONSTRAINT "FeedbackAnswer_feedback_result_id_fkey" FOREIGN KEY ("feedback_result_id") REFERENCES "FeedbackResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackAnswer" ADD CONSTRAINT "FeedbackAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "FeedbackQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
