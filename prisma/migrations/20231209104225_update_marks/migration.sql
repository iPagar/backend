/*
  Warnings:

  - The primary key for the `marks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `marks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[studentId,semester,subject,module]` on the table `marks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `marks` table without a default value. This is not possible if the table is not empty.

*/
DROP TRIGGER IF EXISTS "history_marks_change" ON "marks";

-- DropForeignKey
ALTER TABLE "marks" DROP CONSTRAINT "marks_id_fkey";

-- AlterTable
ALTER TABLE "marks" DROP CONSTRAINT "marks_pkey",
ADD COLUMN     "studentId" INTEGER;

UPDATE "marks" SET "studentId" = "id";

ALTER TABLE "marks" ALTER COLUMN "studentId" SET NOT NULL;

ALTER TABLE "marks" DROP COLUMN "id", 
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "marks_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "marks_studentId_semester_subject_module_key" ON "marks"("studentId", "semester", "subject", "module");

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
