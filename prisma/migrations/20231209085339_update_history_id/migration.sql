-- AlterTable
ALTER TABLE "history_marks" DROP COLUMN "id",
ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "history_marks_pkey" PRIMARY KEY ("id");
