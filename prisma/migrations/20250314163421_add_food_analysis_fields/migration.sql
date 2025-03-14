-- AlterTable
ALTER TABLE "MealRecord" ADD COLUMN     "allergens" TEXT[],
ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "cuisineType" TEXT,
ADD COLUMN     "fiber" DOUBLE PRECISION,
ADD COLUMN     "healthScore" DOUBLE PRECISION,
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "isProcessed" BOOLEAN,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "sugar" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "MealRecord_foodName_idx" ON "MealRecord"("foodName");
