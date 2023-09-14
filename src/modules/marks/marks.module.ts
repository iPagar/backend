import { Module } from "@nestjs/common";
import { MarksController } from "./marks.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MarkEntity } from "../../entities/mark.entity";
import { StudentEntity } from "../../entities/student.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MarkEntity, StudentEntity])],
  controllers: [MarksController],
})
export class MarksModule {}
