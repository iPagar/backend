import { Injectable } from "@nestjs/common";
import db from "../services/mongo-driver";
import ms from "./manager-schedule";
import { logger } from "../config/winston";

@Injectable()
export class ScheduleService {
  async updateSchedule(args: {
    steps: {
      courseExp: string;
      folderExp: string;
    }[];
  }) {
    try {
      logger.info("Updating schedule");
      await db.drop();
      logger.info("Dropped collection");
      for (const step of args.steps) {
        const result = await ms.update(
          new RegExp(step.courseExp),
          new RegExp(step.folderExp)
        );
        await ms.insertFilesAndLessons(result.pdfs, result.lessons);
      }
      logger.info("Updated schedule");
    } catch (err) {
      logger.error(`Error updating schedule: ${err}`);
    }
  }
}
