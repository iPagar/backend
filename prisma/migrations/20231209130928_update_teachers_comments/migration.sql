/*
  Warnings:

  - The primary key for the `teachers_comments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `teachers_comments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[vkUserId,name]` on the table `teachers_comments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vkUserId` to the `teachers_comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teachers_comments" DROP CONSTRAINT "teachers_comments_id_fkey";

-- AlterTable
ALTER TABLE "teachers_comments" DROP CONSTRAINT "teachers_comments_pkey";

ALTER TABLE "teachers_comments" ADD COLUMN "vkUserId" TEXT;
UPDATE "teachers_comments" SET "vkUserId" = (SELECT "VkUser"."id" FROM "students" INNER JOIN "VkUser" ON "VkUser"."id" = "students"."vkUserId" WHERE "students"."student" = "teachers_comments"."id");
ALTER TABLE "teachers_comments" ALTER COLUMN "vkUserId" SET NOT NULL;
ALTER TABLE "teachers_comments" DROP COLUMN "id";
ALTER TABLE "teachers_comments" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "teachers_comments" ADD CONSTRAINT "teachers_comments_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_comments_vkUserId_name_key" ON "teachers_comments"("vkUserId", "name");

-- AddForeignKey
ALTER TABLE "teachers_comments" ADD CONSTRAINT "teachers_comments_vkUserId_fkey" FOREIGN KEY ("vkUserId") REFERENCES "VkUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
