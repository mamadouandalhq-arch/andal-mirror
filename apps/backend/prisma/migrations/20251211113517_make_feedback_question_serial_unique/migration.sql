/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `FeedbackQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeedbackQuestion_serialNumber_key" ON "FeedbackQuestion"("serialNumber");
