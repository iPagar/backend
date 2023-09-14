import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { StudentsModule } from "./modules/students/students.module";
import { MarksModule } from "./modules/marks/marks.module";
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
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
