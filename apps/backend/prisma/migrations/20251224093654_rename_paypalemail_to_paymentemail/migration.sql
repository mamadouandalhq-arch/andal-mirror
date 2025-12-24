/*
  Warnings:

  - You are about to drop the column `paypalEmail` on the `Redemption` table. All the data in the column will be lost.
  - Added the required column `paymentEmail` to the `Redemption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Redemption" DROP COLUMN "paypalEmail",
ADD COLUMN     "paymentEmail" TEXT NOT NULL;
