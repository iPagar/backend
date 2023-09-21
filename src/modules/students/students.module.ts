import { Module } from "@nestjs/common";
import { StudentsController } from "./students.controller";
import { PrismaService } from "../../prisma.service";

@Module({
  controllers: [StudentsController],
  providers: [PrismaService],
})
export class StudentsModule {}
