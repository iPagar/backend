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

-- DropForeignKey
ALTER TABLE "teachers_comments" DROP CONSTRAINT "teachers_comments_id_fkey";

-- DropForeignKey
ALTER TABLE "teachers_reactions" DROP CONSTRAINT "teachers_reactions_id_fkey";

ALTER TABLE "students" DROP CONSTRAINT "students_id_key";

UPDATE "likes" SET "from_id" = (SELECT "student" FROM "students" WHERE "id" = "likes"."from_id");
-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "likes" SET "to_id" = (SELECT "student" FROM "students" WHERE "id" = "likes"."to_id");
-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "marks" SET "studentId" = (SELECT "student" FROM "students" WHERE "id" = "marks"."studentId");
-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "messages" SET "from_id" = (SELECT "student" FROM "students" WHERE "id" = "messages"."from_id");
-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("student") ON DELETE NO ACTION ON UPDATE NO ACTION;

UPDATE "messages" SET "to_id" = (SELECT "student" FROM "students" WHERE "id" = "messages"."to_id");
-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("student") ON DELETE NO ACTION ON UPDATE NO ACTION;

UPDATE "ol" SET "id" = (SELECT "student" FROM "students" WHERE "id" = "ol"."id");
-- AddForeignKey
ALTER TABLE "ol" ADD CONSTRAINT "ol_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("student") ON DELETE NO ACTION ON UPDATE NO ACTION;

UPDATE "ratings" SET "id" = (SELECT "student" FROM "students" WHERE "id" = "ratings"."id");
-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "teachers_comments" SET "id" = (SELECT "student" FROM "students" WHERE "id" = "teachers_comments"."id");
-- AddForeignKey
ALTER TABLE "teachers_comments" ADD CONSTRAINT "teachers_comments_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "teachers_reactions" SET "id" = (SELECT "student" FROM "students" WHERE "id" = "teachers_reactions"."id");
-- AddForeignKey
ALTER TABLE "teachers_reactions" ADD CONSTRAINT "teachers_reactions_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("student") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" DROP COLUMN "id";