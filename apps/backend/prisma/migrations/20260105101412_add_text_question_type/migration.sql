-- AlterEnum
ALTER TYPE "FeedbackType" ADD VALUE 'text';

-- AlterTable
ALTER TABLE "FeedbackAnswer" ADD COLUMN     "answerText" TEXT;
