/*
  Warnings:

  - You are about to drop the column `google_type` on the `TypeActivite` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TypeActivite_google_type_key";

-- AlterTable
ALTER TABLE "TypeActivite" DROP COLUMN "google_type";

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "google_type" TEXT NOT NULL,
    "keywords" TEXT[],
    "typeActiviteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_typeActiviteId_fkey" FOREIGN KEY ("typeActiviteId") REFERENCES "TypeActivite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
