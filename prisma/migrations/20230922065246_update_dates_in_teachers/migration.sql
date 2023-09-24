/*
  Warnings:

  - Made the column `updatedAt` on table `teachers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "teachers" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
