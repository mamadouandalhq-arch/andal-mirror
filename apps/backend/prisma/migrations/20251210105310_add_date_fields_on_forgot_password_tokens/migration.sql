/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ForgotPasswordToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `ForgotPasswordToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ForgotPasswordToken" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ForgotPasswordToken_userId_key" ON "ForgotPasswordToken"("userId");
