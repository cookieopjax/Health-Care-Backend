/*
  Warnings:

  - You are about to drop the column `allergens` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `cuisineType` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `healthScore` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `isProcessed` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `MealRecord` table. All the data in the column will be lost.
  - You are about to drop the column `servingSize` on the `MealRecord` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MealRecord_foodName_idx";

-- DropIndex
DROP INDEX "MealRecord_recordDate_idx";

-- AlterTable
ALTER TABLE "MealRecord" DROP COLUMN "allergens",
DROP COLUMN "confidence",
DROP COLUMN "cuisineType",
DROP COLUMN "healthScore",
DROP COLUMN "ingredients",
DROP COLUMN "isProcessed",
DROP COLUMN "mealType",
DROP COLUMN "servingSize";
