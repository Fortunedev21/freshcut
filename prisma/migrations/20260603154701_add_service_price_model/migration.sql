/*
  Warnings:

  - The values [COIFFEUR,BOSS] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `prix` on the `Service` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('ADULTE', 'ETUDIANT', 'ENFANT');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'SUPER_ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "barberIdAssigned" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "coupeId" TEXT,
ADD COLUMN     "validatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "prix";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "ServicePrice" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientType" "ClientType" NOT NULL,
    "prix" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberAvailability" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServicePrice_serviceId_idx" ON "ServicePrice"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePrice_serviceId_clientType_key" ON "ServicePrice"("serviceId", "clientType");

-- CreateIndex
CREATE INDEX "BarberAvailability_barberId_dayOfWeek_idx" ON "BarberAvailability"("barberId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ServicePrice" ADD CONSTRAINT "ServicePrice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
