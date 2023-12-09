-- AlterTable
ALTER TABLE "students" ADD COLUMN     "vkUserId" TEXT;

-- CreateTable
CREATE TABLE "VkUser" (
    "id" TEXT NOT NULL,
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VkUser_pkey" PRIMARY KEY ("id")
);

-- Вставляем уникальные VK ID из students в VkUser с соответствующими значениями notify и isDeleted
INSERT INTO "VkUser" ("id", "notify", "isDeleted")
SELECT DISTINCT "id", "notify", "is_deleted" FROM "students"
ON CONFLICT ("id") DO NOTHING;

-- Обновляем vkUserId в students для соответствия с VkUser
UPDATE "students" SET "vkUserId" = "id";

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_vkUserId_fkey" FOREIGN KEY ("vkUserId") REFERENCES "VkUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
