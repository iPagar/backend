/*
  Warnings:

  - The primary key for the `students` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `student` on the `students` table. All the data in the column will be lost.
  - Added the required column `id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_from_id_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_to_id_fkey";

-- DropForeignKey
ALTER TABLE "marks" DROP CONSTRAINT "marks_studentId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_from_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_to_id_fkey";

-- DropForeignKey
ALTER TABLE "ol" DROP CONSTRAINT "ol_id_fkey";

-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_id_fkey";

-- AlterTable
ALTER TABLE "students" DROP CONSTRAINT "students_pkey";
ALTER TABLE "students" ADD COLUMN "id" INTEGER;
UPDATE "students" SET "id" = "student";
ALTER TABLE "students" DROP COLUMN "student";
ALTER TABLE "students" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "students" ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ol" ADD CONSTRAINT "ol_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
