/*
  Warnings:

  - You are about to drop the column `category` on the `TypeActivite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_type]` on the table `TypeActivite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TypeActivite" DROP COLUMN "category",
ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "google_type" TEXT,
ADD COLUMN     "radius" INTEGER NOT NULL DEFAULT 1500;

-- CreateIndex
CREATE UNIQUE INDEX "TypeActivite_google_type_key" ON "TypeActivite"("google_type");
