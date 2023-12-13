/*
  Warnings:

  - The primary key for the `teachers_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `teachers_reactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[vkUserId,name]` on the table `teachers_reactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vkUserId` to the `teachers_reactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teachers_reactions" DROP CONSTRAINT "teachers_reactions_id_fkey";

-- AlterTable
ALTER TABLE "teachers_reactions" DROP CONSTRAINT "teachers_reactions_pkey";

ALTER TABLE "teachers_reactions" ADD COLUMN "vkUserId" TEXT;
UPDATE "teachers_reactions" SET "vkUserId" = (SELECT "VkUser"."id" FROM "students" INNER JOIN "VkUser" ON "VkUser"."id" = "students"."vkUserId" WHERE "students"."student" = "teachers_reactions"."id");
ALTER TABLE "teachers_reactions" ALTER COLUMN "vkUserId" SET NOT NULL;
ALTER TABLE "teachers_reactions" DROP COLUMN "id";
ALTER TABLE "teachers_reactions" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "teachers_reactions" ADD CONSTRAINT "teachers_reactions_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_reactions_vkUserId_name_key" ON "teachers_reactions"("vkUserId", "name");

-- AddForeignKey
ALTER TABLE "teachers_reactions" ADD CONSTRAINT "teachers_reactions_vkUserId_fkey" FOREIGN KEY ("vkUserId") REFERENCES "VkUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
