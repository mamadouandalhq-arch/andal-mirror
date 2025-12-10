/*
  Warnings:

  - You are about to drop the column `image_url` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `FeedbackAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `feedback_result_id` on the `FeedbackAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `FeedbackAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `FeedbackQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `serial_number` on the `FeedbackQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `answered_questions` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `current_question_id` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `earned_cents` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `receipt_id` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `total_questions` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `FeedbackResult` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `GiftCard` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `GiftCard` table. All the data in the column will be lost.
  - You are about to drop the column `gift_code` on the `GiftCard` table. All the data in the column will be lost.
  - You are about to drop the column `pdf_url` on the `GiftCard` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `points_value` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `receipt_url` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `points_balance` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[feedbackResultId,questionId]` on the table `FeedbackAnswer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,receiptId]` on the table `FeedbackResult` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrl` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedbackResultId` to the `FeedbackAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `FeedbackAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `FeedbackQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptId` to the `FeedbackResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `FeedbackResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FeedbackResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FeedbackResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `GiftCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptUrl` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FeedbackAnswer" DROP CONSTRAINT "FeedbackAnswer_feedback_result_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackAnswer" DROP CONSTRAINT "FeedbackAnswer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackResult" DROP CONSTRAINT "FeedbackResult_current_question_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackResult" DROP CONSTRAINT "FeedbackResult_receipt_id_fkey";

-- DropForeignKey
ALTER TABLE "FeedbackResult" DROP CONSTRAINT "FeedbackResult_user_id_fkey";

-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_user_id_fkey";

-- DropIndex
DROP INDEX "FeedbackAnswer_feedback_result_id_question_id_key";

-- DropIndex
DROP INDEX "FeedbackResult_receipt_id_key";

-- DropIndex
DROP INDEX "FeedbackResult_user_id_receipt_id_key";

-- DropIndex
DROP INDEX "User_google_id_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "image_url",
ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeedbackAnswer" DROP COLUMN "created_at",
DROP COLUMN "feedback_result_id",
DROP COLUMN "question_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feedbackResultId" TEXT NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeedbackQuestion" DROP COLUMN "created_at",
DROP COLUMN "serial_number",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "serialNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FeedbackResult" DROP COLUMN "answered_questions",
DROP COLUMN "completed_at",
DROP COLUMN "created_at",
DROP COLUMN "current_question_id",
DROP COLUMN "earned_cents",
DROP COLUMN "receipt_id",
DROP COLUMN "total_questions",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentQuestionId" TEXT,
ADD COLUMN     "earnedCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "receiptId" TEXT NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GiftCard" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "gift_code",
DROP COLUMN "pdf_url",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "giftCode" TEXT,
ADD COLUMN     "pdfUrl" TEXT;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "approved_at",
DROP COLUMN "created_at",
DROP COLUMN "points_value",
DROP COLUMN "receipt_url",
DROP COLUMN "user_id",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pointsValue" INTEGER,
ADD COLUMN     "receiptUrl" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_url",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "google_id",
DROP COLUMN "last_name",
DROP COLUMN "points_balance",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "pointsBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackAnswer_feedbackResultId_questionId_key" ON "FeedbackAnswer"("feedbackResultId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResult_userId_receiptId_key" ON "FeedbackResult"("userId", "receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "FeedbackQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResult" ADD CONSTRAINT "FeedbackResult_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackAnswer" ADD CONSTRAINT "FeedbackAnswer_feedbackResultId_fkey" FOREIGN KEY ("feedbackResultId") REFERENCES "FeedbackResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackAnswer" ADD CONSTRAINT "FeedbackAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
