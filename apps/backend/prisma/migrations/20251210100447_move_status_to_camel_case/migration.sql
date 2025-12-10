/*
  Warnings:

  - The values [in_progress] on the enum `FeedbackStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeedbackStatus_new" AS ENUM ('inProgress', 'completed');
ALTER TABLE "public"."FeedbackResult" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FeedbackResult" ALTER COLUMN "status" TYPE "FeedbackStatus_new" USING ("status"::text::"FeedbackStatus_new");
ALTER TYPE "FeedbackStatus" RENAME TO "FeedbackStatus_old";
ALTER TYPE "FeedbackStatus_new" RENAME TO "FeedbackStatus";
DROP TYPE "public"."FeedbackStatus_old";
ALTER TABLE "FeedbackResult" ALTER COLUMN "status" SET DEFAULT 'inProgress';
COMMIT;

-- AlterTable
ALTER TABLE "FeedbackResult" ALTER COLUMN "status" SET DEFAULT 'inProgress';
