-- CreateTable
CREATE TABLE "FoodUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "calories" INTEGER,
    "servingSize" VARCHAR(50),
    "imageUrl" TEXT,
    "recordDate" DATE NOT NULL,
    "recordTime" TIME NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodUpload_userId_recordDate_idx" ON "FoodUpload"("userId", "recordDate");

-- AddForeignKey
ALTER TABLE "FoodUpload" ADD CONSTRAINT "FoodUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
