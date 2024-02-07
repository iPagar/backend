import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { StudentsModule } from "./modules/students/students.module";
import { MarksModule } from "./modules/marks/marks.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { TeachersModule } from "./modules/teachers/teachers.module";
import { ScheduleModule } from "@nestjs/schedule";
import { BackupService } from "../services/backup-mongo";
import { ScheduleService } from "../services/schedule-service";
dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DB_URL,
      autoLoadEntities: true,
    }),
    StudentsModule,
    MarksModule,
    TeachersModule,
  ],
  providers: [PrismaService, BackupService, ScheduleService],
  controllers: [AppController],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
