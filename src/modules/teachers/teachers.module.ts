import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { TeachersController } from "./teachers.controller";

@Module({
  providers: [PrismaService],
  controllers: [TeachersController],
})
export class TeachersModule {}
