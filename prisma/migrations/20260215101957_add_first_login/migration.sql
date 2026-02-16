/*
  Warnings:

  - You are about to drop the column `firstLogin` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "firstLogin";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstLogin" BOOLEAN NOT NULL DEFAULT true;
