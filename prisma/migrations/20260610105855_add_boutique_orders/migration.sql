/*
  Warnings:

  - You are about to drop the column `barberIdAssigned` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `coupeId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `validatedAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `BarberAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicePrice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `prix` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServicePrice" DROP CONSTRAINT "ServicePrice_serviceId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "barberIdAssigned",
DROP COLUMN "cancelledAt",
DROP COLUMN "completedAt",
DROP COLUMN "coupeId",
DROP COLUMN "validatedAt";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "prix" INTEGER NOT NULL;

-- DropTable
DROP TABLE "BarberAvailability";

-- DropTable
DROP TABLE "ServicePrice";

-- DropEnum
DROP TYPE "ClientType";

-- CreateTable
CREATE TABLE "BoutiqueOrder" (
    "id" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "shippingMethod" TEXT NOT NULL,
    "shippingCost" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "finalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoutiqueOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoutiqueOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix" INTEGER NOT NULL,

    CONSTRAINT "BoutiqueOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoutiquePayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoutiquePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoutiqueOrder_clientPhone_idx" ON "BoutiqueOrder"("clientPhone");

-- CreateIndex
CREATE INDEX "BoutiqueOrder_status_idx" ON "BoutiqueOrder"("status");

-- CreateIndex
CREATE INDEX "BoutiqueOrderItem_orderId_idx" ON "BoutiqueOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "BoutiqueOrderItem_productId_idx" ON "BoutiqueOrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BoutiquePayment_orderId_key" ON "BoutiquePayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BoutiquePayment_transactionId_key" ON "BoutiquePayment"("transactionId");

-- AddForeignKey
ALTER TABLE "BoutiqueOrderItem" ADD CONSTRAINT "BoutiqueOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BoutiqueOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoutiqueOrderItem" ADD CONSTRAINT "BoutiqueOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoutiquePayment" ADD CONSTRAINT "BoutiquePayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BoutiqueOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
