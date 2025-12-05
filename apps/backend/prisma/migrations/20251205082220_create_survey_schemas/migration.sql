-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('single', 'multiple');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "serial_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" "SurveyType" NOT NULL,
    "options" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResult" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'not_started',
    "total_questions" INTEGER NOT NULL,
    "answered_questions" INTEGER NOT NULL DEFAULT 0,
    "earned_cents" INTEGER NOT NULL DEFAULT 0,
    "current_question_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "SurveyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL,
    "survey_result_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResult_user_id_receipt_id_key" ON "SurveyResult"("user_id", "receipt_id");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnswer_survey_result_id_question_id_key" ON "SurveyAnswer"("survey_result_id", "question_id");

-- AddForeignKey
ALTER TABLE "SurveyResult" ADD CONSTRAINT "SurveyResult_current_question_id_fkey" FOREIGN KEY ("current_question_id") REFERENCES "SurveyQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResult" ADD CONSTRAINT "SurveyResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResult" ADD CONSTRAINT "SurveyResult_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_survey_result_id_fkey" FOREIGN KEY ("survey_result_id") REFERENCES "SurveyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "SurveyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
