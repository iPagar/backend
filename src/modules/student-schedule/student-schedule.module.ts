import { Module } from "@nestjs/common";
import { StudentScheduleController } from "./student-schedule.controller";

@Module({
  controllers: [StudentScheduleController],
  providers: [],
})
export class StudentScheduleModule {}
