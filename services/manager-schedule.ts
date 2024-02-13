require("dotenv").config();
import moodle from "./moodle-fetcher";
import { getFile } from "./schedule-parser";
import mongo from "./mongo-driver";
import { SubjectType } from "rector-schedule-parser";
import * as fs from "fs";
import crypto from "crypto";
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

export type Schedules = Record<
  string,
  {
    lessons: {
      stgroup: string;
      subject: string;
      audience: string;
      group: string;
      teacher: string;
      type: SubjectType;
      start_date: Date;
      end_date: Date;
      repeat: string;
    }[];
    pdf: {
      stgroup: string;
      name: string;
      file: unknown;
      fileCreatedAt: Date;
      hash: string;
    };
  }
>;

async function downloadFromMoodle(courseExp: RegExp, folderExp: RegExp) {
  return await moodle(dir, courseExp, folderExp);
}

async function update({
  files,
  season,
  year,
}: {
  files: string[];
  season: "spring" | "autumn";
  year: number;
}): Promise<Schedules> {
  const promises = files.map(async (filename) => {
    return {
      filename,
      file: await getFile(`${dir}/${filename}`),
      hash: await calculateFileHash(`${dir}/${filename}`),
    };
  });
  let stgroups: Record<
    string,
    {
      lessons: {
        stgroup: string;
        subject: string;
        audience: string;
        group: string;
        teacher: string;
        type: SubjectType;
        start_date: Date;
        end_date: Date;
        repeat: string;
      }[];
      pdf: {
        stgroup: string;
        name: string;
        file: unknown;
        fileCreatedAt: Date;
        hash: string;
      };
    }
  > = {};

  await Promise.allSettled(promises).then((results) => {
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { file, parsed, fileCreatedAt } = result.value.file;
        const hash = result.value.hash;
        const stgroup: string = parsed[0].stgroup;
        const filename = result.value.filename;

        stgroups[stgroup] = {
          lessons: parsed,
          pdf: {
            stgroup: stgroup,
            name: filename,
            file,
            fileCreatedAt,
            hash,
          },
        };
      } else {
        console.log(result.reason);
      }
    });
  });

  Object.keys(stgroups).forEach((stgroup) => {
    const group = stgroups[stgroup];
    let lessons = group.lessons;

    if (season === "spring") {
      // check for spring semester lessons date
      lessons = lessons.filter((lesson) => {
        const startDate = lesson.start_date.toISOString().split("T")[0];
        return (
          startDate.split("-")[1] >= "02" && startDate.split("-")[1] < "09"
        );
      });
    } else {
      // check for autumn semester lessons date
      lessons = lessons.filter((lesson) => {
        const startDate = lesson.start_date.toISOString().split("T")[0];
        return startDate.split("-")[1] >= "09";
      });
    }

    lessons = lessons.map((lesson) => {
      return {
        ...lesson,
        start_date: new Date(lesson.start_date.setFullYear(year)),
        end_date: new Date(lesson.end_date.setFullYear(year)),
      };
    });
  });

  return stgroups;
}

function insertFilesAndLessons(files: any, lessons: any) {
  return Promise.all([insertFiles(files), insertLessons(lessons)]);
}

// Функция для вычисления хеша файла
function calculateFileHash(
  filePath: string,
  algorithm = "sha256"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
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
  insertFiles,
  insertLessons,
  downloadFromMoodle,
};
