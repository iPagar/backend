import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentEntity } from "../entities/student.entity";
import { SemesterEntity } from "../entities/semester.entity";
import { MarkEntity } from "../entities/mark.entity";
import { RatingEntity } from "../entities/rating.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      SemesterEntity,
      MarkEntity,
      RatingEntity,
    ]),
  ],
  controllers: [StudentsController],
})
export class StudentsModule {}
