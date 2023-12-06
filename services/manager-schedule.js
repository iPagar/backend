require("dotenv").config();
const fs = require("fs");
const moodle = require("./moodle-fetcher");
const parser = require("./schedule-parser");
const {
  insertLessons,
  insertFiles,
  getFile,
  insertFavourite,
  removeFavourite,
  getFavourites,
  getLessons,
  getStgroup,
  getGroups,
  drop,
} = require("./mongo-driver").default;
const dir = `./schedules`;

function update(courseExp, folderExp) {
  return moodle(dir, courseExp, folderExp)
    .then(async (files) => {
      const promises = files.map((filename) => parser(`${dir}/${filename}`));
      let lessons = [];
      const pdfs = [];

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
    .then(async (resp) => {
      await insertFiles(resp.pdfs);
      return insertLessons(resp.lessons);
    })
    .catch((e) => console.log(e));
}

module.exports = {
  drop,
  update,
  getFile,
  insertFavourite,
  getFavourites,
  getLessons,
  getStgroup,
  getGroups,
};
