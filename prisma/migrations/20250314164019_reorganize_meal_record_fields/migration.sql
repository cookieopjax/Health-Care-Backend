/*
  Warnings:

  - Added the required column `mealType` to the `MealRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealRecord" ADD COLUMN     "mealType" "MealType" NOT NULL;

-- CreateIndex
CREATE INDEX "MealRecord_recordDate_idx" ON "MealRecord"("recordDate");

-- CreateIndex
CREATE INDEX "MealRecord_foodName_idx" ON "MealRecord"("foodName");
