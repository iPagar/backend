import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { GetStudentScheduleDto } from "./dto/get-student-schedule.dto";
import { mongo } from "../../../dbs/config";
import { isWithinInterval, differenceInCalendarDays } from "date-fns";
import { logger } from "../../../config/winston";

@Controller("student-schedule")
@ApiTags("student-schedule")
export class StudentScheduleController {
  @Get(":stgroup")
  @ApiParam({
    name: "stgroup",
    example: "АСП-21-01(09-5)",
  })
  async getStudentSchedule(
    @Query() dto: GetStudentScheduleDto,
    @Param("stgroup") stgroup: string
  ) {
    const lessons = await this.findLessonsForDate(stgroup, dto.date);

    return lessons;
  }

  async findLessonsForDate(stgroup: string, targetDateString: string) {
    const db = await mongo;

    try {
      const collection = db.collection("lessons");

      // Коррекция и парсинг интересующей даты
      const targetDate = targetDateString;

      const lessons = await collection
        .find({
          stgroup,
        })
        .toArray();

      const filteredLessons = lessons.filter((lesson) => {
        const startDate = lesson.start_date.toISOString().split("T")[0];
        const endDate = lesson.end_date.toISOString().split("T")[0];

        // Проверка для однократных занятий
        if (lesson.repeat === "once") {
          return isWithinInterval(targetDate, {
            start: startDate,
            end: endDate,
          });
        }

        // Проверка, что дата находится внутри семестра
        if (!isWithinInterval(targetDate, { start: startDate, end: endDate })) {
          return false;
        }

        const daysDifference = differenceInCalendarDays(targetDate, startDate);

        // Для еженедельного повторения
        if (lesson.repeat === "к.н." && daysDifference % 7 === 0) {
          return true;
        }

        // Для повторения через неделю
        if (lesson.repeat === "ч.н." && daysDifference % 14 === 0) {
          return true;
        }

        return false;
      });

      return filteredLessons;
    } catch (err) {
      logger.error("Error while fetching lessons", err);
    }
  }
}
