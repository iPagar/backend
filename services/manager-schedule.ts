require("dotenv").config();
import moodle from "./moodle-fetcher";
import { getFile } from "./schedule-parser";
import mongo from "./mongo-driver";
import { SubjectType } from "rector-schedule-parser";
const {
  insertLessons,
  insertFiles,
  insertFavourite,
  getFavourites,
  getLessons,
  getStgroup,
  getGroups,
  drop,
} = mongo;
const dir = `./schedules`;

function update(courseExp: RegExp, folderExp: RegExp) {
  return moodle(dir, courseExp, folderExp)
    .then(async (files: string[]) => {
      const promises = files.map((filename) => getFile(`${dir}/${filename}`));
      let lessons: {
        stgroup: string;
        subject: string;
        audience: string;
        group: string;
        teacher: string;
        type: SubjectType;
        start_date: Date;
        end_date: Date;
        repeat: string;
      }[] = [];
      const pdfs: { name: string; file: unknown }[] = [];

      await Promise.allSettled(promises).then((results) => {
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const { filename, file, parsed } = result.value;

            lessons = lessons.concat(parsed);
            pdfs.push({ name: filename, file });
          } else {
            console.log(result.reason);
          }
        });
      });

      return { pdfs, lessons };
    })
    .catch((err: any) => {
      console.log(err);
    });
}

function insertFilesAndLessons(files: any, lessons: any) {
  return Promise.all([insertFiles(files), insertLessons(lessons)]);
}

export default {
  drop,
  update,
  getFile,
  insertFavourite,
  getFavourites,
  getLessons,
  getStgroup,
  getGroups,
  insertFilesAndLessons,
};
