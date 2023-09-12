const rp = require("request-promise");

const pathSemesters = "https://lk.stankin.ru/webapi/api2/semesters/";
const pathMarks = "https://lk.stankin.ru/webapi/api2/marks/";

async function getMarks(student, password, semester) {
  const options = {
    method: "POST",
    uri: pathMarks,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    form: {
      student,
      password,
      semester,
    },
    json: true,
    timeout: 100,
  };

  if (student >= 999000 && student <= 999999) {
    return [
      {
        title: "Трансфигурация",
        num: "М1",
        value: Math.floor(Math.random() * (45 - 25)) + 25,
        factor: 3,
      },
      {
        title: "Трансфигурация",
        num: "М2",
        value: Math.floor(Math.random() * (45 - 25)) + 25,
        factor: 3,
      },
      {
        title: "Трансфигурация",
        num: "Э",
        value: Math.floor(Math.random() * (45 - 25)) + 25,
        factor: 3,
      },
    ];
  }

  const marks = await rp(options);
  return marks.filter(
    (mark) => mark.title !== "Рейтинг" && mark.title !== "Накопленный Рейтинг"
  );
}

async function getSemesters(student, password) {
  const options = {
    method: "POST",
    uri: pathSemesters,
    form: {
      student,
      password,
    },
    json: true,
    timeout: 100,
  };

  if (student >= 999000 && student <= 999999) {
    return ["2019-осень"];
  }
  const response = await rp(options);
  return response.semesters;
}

async function getStudent(student, password) {
  const options = {
    method: "POST",
    uri: pathSemesters,
    form: {
      student,
      password,
    },
    json: true,
    timeout: 100,
  };

  if (student >= 999000 && student <= 999999) {
    return {
      surname: "Тест",
      initials: "Тест",
      stgroup: `Тест-${Math.floor(Math.random() * (15 - 10)) + 10}`,
    };
  }

  const response = await rp(options);
  return {
    stgroup: response.stgroup,
    surname: response.surname,
    initials: response.initials,
  };
}

module.exports = { getStudent, getSemesters, getMarks };
