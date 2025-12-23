-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('pending', 'approved', 'completed', 'rejected');

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pointsAmount" INTEGER NOT NULL,
    "dollarAmount" DECIMAL(10,2) NOT NULL,
    "paypalEmail" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "adminComment" TEXT,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
