/*
  Warnings:

  - A unique constraint covering the columns `[receiptId]` on the table `FeedbackResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResult_receiptId_key" ON "FeedbackResult"("receiptId");
