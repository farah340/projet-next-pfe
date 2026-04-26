/*
  Warnings:

  - You are about to drop the column `population` on the `Zone` table. All the data in the column will be lost.
  - You are about to drop the column `superficie` on the `Zone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Zone" DROP COLUMN "population",
DROP COLUMN "superficie";
