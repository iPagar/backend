import * as fs from "fs";
import { parse } from "rector-schedule-parser";

async function parseFile(path: string) {
  const lessons = await parse(path);
  return lessons
    .map((lesson) => {
      const { stgroup, subject, audience, group, teacher, type, start_time } =
        lesson;

      const oneDay = lesson.dates.map((date) => {
        //год, месяц(0 - 11), день, часы, минуты
        const newDate = new Date(
          new Date(Date.now()).getFullYear(),
          Number(date.match(/\d{2}$/)) - 1,
          Number(date.match(/^\d{2}/)),
          Number(start_time.match(/^\d{1,2}/)![0]),
          Number(start_time.match(/\d{1,2}$/)![0])
        );

        return {
          stgroup,
          subject,
          audience,
          group,
          teacher,
          type,
          start_date: newDate,
          end_date: newDate,
          repeat: "once",
        };
      });

      const repeatDay = lesson.periods.map((period) => {
        const { start_date, end_date, repeat } = period;

        //год, месяц(0 - 11), день, часы, минуты
        const startDate = new Date(
          new Date(Date.now()).getFullYear(),
          Number(start_date.match(/\d{2}$/)) - 1,
          Number(start_date.match(/^\d{2}/)),
          Number(start_time.match(/^\d{1,2}/)![0]),
          Number(start_time.match(/\d{1,2}$/)![0])
        );

        const endDate = new Date(
          new Date(Date.now()).getFullYear(),
          Number(end_date.match(/\d{2}$/)) - 1,
          Number(end_date.match(/^\d{2}/)),
          Number(start_time.match(/^\d{1,2}/)![0]),
          Number(start_time.match(/\d{1,2}$/)![0])
        );

        return {
          stgroup,
          subject,
          audience,
          group,
          teacher,
          type,
          start_date: startDate,
          end_date: endDate,
          repeat,
        };
      });

      return [...oneDay, ...repeatDay];
    })
    .flat();
}

// parseFile("./schedules/МДС-20-01.pdf").then((r) => {
// 	console.log(r);
// });

function fileToBuffer(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function (err, data) {
      if (err) throw err;

      resolve(data.toString("base64"));
    });
  });
}

async function getFile(path: string) {
  const filename = path.match(/(?<name>[А-яа-я\d-() ]*)\.pdf/)!.groups!.name;

  const file = await fileToBuffer(path);
  const fileCreatedAt = new Date(fs.statSync(path).birthtime);
  const parsed = await parseFile(path);
  return { filename, file, parsed, fileCreatedAt };
}

export { getFile, parse };
