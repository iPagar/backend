/*
  Warnings:

  - The primary key for the `schoolarship` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `end_date` to the `schoolarship` table without a default value. This is not possible if the table is not empty.
  - Made the column `value` on table `schoolarship` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "schoolarship" DROP CONSTRAINT "schoolarship_pkey",
ADD COLUMN     "end_date" TIMESTAMP(6) NOT NULL DEFAULT '1970-01-01 00:00:00',
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "value" SET NOT NULL,
ADD CONSTRAINT "schoolarship_pkey" PRIMARY KEY ("id");

-- remove default
ALTER TABLE "schoolarship" ALTER COLUMN "end_date" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SchoolarshipFiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "SchoolarshipFiles_pkey" PRIMARY KEY ("id")
);
