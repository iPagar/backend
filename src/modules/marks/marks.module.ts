import { Module } from "@nestjs/common";
import { MarksController } from "./marks.controller";
import { PrismaService } from "../../prisma.service";

@Module({
  controllers: [MarksController],
  providers: [PrismaService],
})
export class MarksModule {}
