/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "teachers_id_key" ON "teachers"("id");
