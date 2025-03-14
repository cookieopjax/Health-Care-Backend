/*
  Warnings:

  - You are about to drop the `CalorieRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Food` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FoodUpload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalorieRecord" DROP CONSTRAINT "CalorieRecord_foodId_fkey";

-- DropForeignKey
ALTER TABLE "CalorieRecord" DROP CONSTRAINT "CalorieRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "FoodUpload" DROP CONSTRAINT "FoodUpload_userId_fkey";

-- DropTable
DROP TABLE "CalorieRecord";

-- DropTable
DROP TABLE "Food";

-- DropTable
DROP TABLE "FoodUpload";

-- CreateTable
CREATE TABLE "MealRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "servingSize" VARCHAR(50),
    "mealType" "MealType" NOT NULL,
    "imageUrl" TEXT,
    "notes" TEXT,
    "recordDate" DATE NOT NULL,
    "recordTime" TIME NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealRecord_userId_recordDate_idx" ON "MealRecord"("userId", "recordDate");

-- CreateIndex
CREATE INDEX "MealRecord_recordDate_idx" ON "MealRecord"("recordDate");

-- AddForeignKey
ALTER TABLE "MealRecord" ADD CONSTRAINT "MealRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
