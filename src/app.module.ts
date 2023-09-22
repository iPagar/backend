import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { StudentsModule } from "./modules/students/students.module";
import { MarksModule } from "./modules/marks/marks.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DB_URL,
      autoLoadEntities: true,
    }),
    StudentsModule,
    MarksModule,
  ],
  providers: [PrismaService],
  controllers: [AppController],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
