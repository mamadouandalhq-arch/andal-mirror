/*
  Warnings:

  - A unique constraint covering the columns `[receipt_id]` on the table `FeedbackResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResult_receipt_id_key" ON "FeedbackResult"("receipt_id");
