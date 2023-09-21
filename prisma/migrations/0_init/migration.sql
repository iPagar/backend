-- CreateTable
CREATE TABLE "comments" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "score" SMALLINT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATE NOT NULL DEFAULT (now() + '03:00:00'::interval),
    "text" VARCHAR,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "copy" (
    "student" INTEGER,
    "password" VARCHAR(30),
    "surname" VARCHAR(30),
    "initials" VARCHAR(30),
    "stgroup" VARCHAR(30),
    "id" INTEGER,
    "notify" BOOLEAN,
    "is_deleted" BOOLEAN
);

-- CreateTable
CREATE TABLE "history_marks" (
    "id" SERIAL NOT NULL,
    "student" INTEGER,
    "semester" VARCHAR(10),
    "subject" VARCHAR(200),
    "module" VARCHAR(2),
    "prev_value" INTEGER,
    "next_value" INTEGER,
    "operation" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "likes" (
    "to_id" INTEGER NOT NULL,
    "from_id" INTEGER NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("to_id","from_id")
);

-- CreateTable
CREATE TABLE "marks" (
    "id" INTEGER NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "module" VARCHAR(2) NOT NULL,
    "value" INTEGER NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "marks_pkey" PRIMARY KEY ("id","semester","subject","module")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "from_id" INTEGER,
    "to_id" INTEGER,
    "text" VARCHAR(500) NOT NULL,
    "read" BOOLEAN DEFAULT false,
    "sendtime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ol" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "ol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" INTEGER NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id","semester")
);

-- CreateTable
CREATE TABLE "sch" (
    "id" INTEGER NOT NULL,
    "fio" VARCHAR(20) NOT NULL,
    "stgroup" VARCHAR(20) NOT NULL,

    CONSTRAINT "sch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schoolarship" (
    "start_date" TIMESTAMP(6) NOT NULL,
    "type" SMALLINT NOT NULL,
    "value" SMALLINT,

    CONSTRAINT "schoolarship_pkey" PRIMARY KEY ("start_date","type")
);

-- CreateTable
CREATE TABLE "semesters" (
    "semester" VARCHAR(30) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("semester")
);

-- CreateTable
CREATE TABLE "students" (
    "student" INTEGER NOT NULL,
    "password" VARCHAR(30),
    "surname" VARCHAR(30),
    "initials" VARCHAR(30),
    "stgroup" VARCHAR(30),
    "id" INTEGER NOT NULL,
    "notify" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student")
);

-- CreateTable
CREATE TABLE "teachers" (
    "name" VARCHAR(250) NOT NULL,
    "position" VARCHAR(250) NOT NULL,
    "qualification" VARCHAR(20) NOT NULL,
    "updatedAt" DATE,
    "createdAt" DATE,
    "subjects" TEXT NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "teachers_comments" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "comment" VARCHAR NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE NOT NULL DEFAULT (now() + '03:00:00'::interval),

    CONSTRAINT "teachers_comments_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "teachers_reactions" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "reaction" INTEGER NOT NULL,

    CONSTRAINT "teachers_reactions_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "vk_ref_platform" (
    "number" SERIAL NOT NULL,
    "id" INTEGER NOT NULL,
    "vk_platform" VARCHAR NOT NULL,
    "vk_ref" VARCHAR NOT NULL,
    "vk_is_favorite" VARCHAR NOT NULL,

    CONSTRAINT "vk_ref_platform_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_id_key" ON "students"("id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_name_fkey" FOREIGN KEY ("name") REFERENCES "teachers"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "history_marks" ADD CONSTRAINT "history_marks_semester_fkey" FOREIGN KEY ("semester") REFERENCES "semesters"("semester") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_semester_fkey" FOREIGN KEY ("semester") REFERENCES "semesters"("semester") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ol" ADD CONSTRAINT "ol_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_semester_fkey" FOREIGN KEY ("semester") REFERENCES "semesters"("semester") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers_comments" ADD CONSTRAINT "teachers_comments_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_comments" ADD CONSTRAINT "teachers_comments_name_fkey" FOREIGN KEY ("name") REFERENCES "teachers"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers_reactions" ADD CONSTRAINT "teachers_reactions_id_fkey" FOREIGN KEY ("id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers_reactions" ADD CONSTRAINT "teachers_reactions_name_fkey" FOREIGN KEY ("name") REFERENCES "teachers"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

