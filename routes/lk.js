const rp = require("request-promise");

function getMarks(student, password, semester) {
  const pathMarks = "https://lk.stankin.ru/webapi/api2/marks/";

  const options = {
    method: "POST",
    uri: pathMarks,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    form: {
      student: student,
      password: password,
      semester: `${semester.year}-${semester.season.toLocaleLowerCase()}`,
    },
  };

  if (student >= 999000 && student <= 999999)
    return new Promise((resolve, reject) => {
      db.getMarks(student, 2018, "Осень").then((stud) => {
        resolve({
          semester: semester,
          marks: [
            {
              title: "Рейтинг",
              М1: Math.floor(Math.random() * (54 - 25)) + 25,
              factor: 0,
            },
            {
              title: "Зельеварение",
              М1: Math.floor(Math.random() * (45 - 25)) + 25,
              М2: Math.floor(Math.random() * (45 - 25)) + 25,
              Э: 25,
              factor: 2,
            },
            {
              title: "Трансфигурация",
              М1: Math.floor(Math.random() * (45 - 25)) + 25,
              М2: Math.floor(Math.random() * (45 - 25)) + 25,
              Э: Math.floor(Math.random() * (45 - 25)) + 25,
              factor: 3,
            },
            {
              title: "Изучение Древних рун",
              М1: Math.floor(Math.random() * (45 - 25)) + 25,
              М2: Math.floor(Math.random() * (45 - 25)) + 25,
              З: Math.floor(Math.random() * (45 - 25)) + 25,
              factor: 1,
            },
            {
              title: "Уход за магическими существами",
              М1: Math.floor(Math.random() * (45 - 25)) + 25,
              М2: Math.floor(Math.random() * (45 - 25)) + 25,
              З: Math.floor(Math.random() * (45 - 25)) + 25,
              К: Math.floor(Math.random() * (45 - 25)) + 25,
              factor: 3,
            },
            {
              title: "Травология ",
              М1: 25,
              М2: 25,
              З: 25,
              factor: 2,
            },
          ],
        });
      });
    });
  else
    return new Promise((resolve, reject) =>
      rp(options)
        .then((response) => JSON.parse(response))
        .then((marks) => {
          marks = marks
            .reduce((sortMarks, mark, i) => {
              const title = marks[i].title;
              const factor = marks[i].factor;
              if (!sortMarks.some((sortMark) => sortMark.title === title)) {
                sortMarks[i] = {
                  title: title,
                  factor: +factor,
                };

                marks
                  .filter((mark) => mark.title === title)
                  .forEach(
                    (mark) => (sortMarks[i][`${mark.num}`] = mark.value)
                  );
              }

              return sortMarks;
            }, [])
            .filter((mark) => mark);

          resolve({
            semester: semester,
            marks: marks,
          });
        })
    );
}

function getSemesters(student, password) {
  const pathSemesters = "https://lk.stankin.ru/webapi/api2/semesters/";

  const options = {
    method: "POST",
    uri: pathSemesters,
    form: {
      student: student,
      password: password,
    },
    json: true,
  };

  if (student >= 999000 && student <= 999999)
    return new Promise((resolve, reject) => {
      resolve({
        semesters: [{ year: 2018, season: "Осень" }],
        surname: "Тест",
        initials: "Тест",
        stgroup: `Тест-${Math.floor(Math.random() * (15 - 10)) + 10}`,
      });
    });
  else
    return new Promise((resolve, reject) =>
      rp(options)
        .then((response) =>
          response.semesters.map((semester) => {
            const year = semester.substring(0, 4);
            const season =
              semester.charAt(5).toLocaleUpperCase() + semester.slice(6);

            return { year: year, season: season };
          })
        )
        .then((resp) => {
          const semester = {
            stgroup: response.stgroup,
            surname: response.surname,
            initials: response.initials,
            semesters: resp,
          };

          resolve(semester);
        })
    );
}

module.exports = { getSemesters, getMarks };
