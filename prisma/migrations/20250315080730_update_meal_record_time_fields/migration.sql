/*
  Warnings:

  - You are about to drop the column `createdAt` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recordDate` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recordTime` on the `MealRecord` table. All the data in the column will be lost.
  - Added the required column `eaten_at` to the `MealRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eaten_date` to the `MealRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MealRecord_recordDate_idx";

-- DropIndex
DROP INDEX "MealRecord_userId_recordDate_idx";

-- AlterTable
ALTER TABLE "MealRecord" DROP COLUMN "createdAt",
DROP COLUMN "recordDate",
DROP COLUMN "recordTime",
ADD COLUMN     "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eaten_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eaten_date" DATE NOT NULL;

-- CreateIndex
CREATE INDEX "MealRecord_userId_eaten_date_idx" ON "MealRecord"("userId", "eaten_date");

-- CreateIndex
CREATE INDEX "MealRecord_eaten_date_idx" ON "MealRecord"("eaten_date");
