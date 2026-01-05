/*
  Warnings:

  - Added the required column `paymentMethod` to the `Redemption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Redemption" ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "paymentPhone" TEXT,
ALTER COLUMN "paymentEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;
