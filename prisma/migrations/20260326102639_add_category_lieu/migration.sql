/*
  Warnings:

  - You are about to drop the column `osmKey` on the `TypeActivite` table. All the data in the column will be lost.
  - You are about to drop the column `osmValue` on the `TypeActivite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TypeActivite" DROP COLUMN "osmKey",
DROP COLUMN "osmValue",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'catering.restaurant';
