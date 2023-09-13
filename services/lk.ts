import axios from "axios";
import rateLimit from "axios-rate-limit";

// sets max 2 requests per 1 second, other will be delayed
// note maxRPS is a shorthand for perMilliseconds: 1000, and it takes precedence
// if specified both with maxRequests and perMilliseconds
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});

const pathSemesters = "https://lk.stankin.ru/webapi/api2/semesters";
const pathMarks = "https://lk.stankin.ru/webapi/api2/marks";

export type LkMark = {
  title: string;
  num: string;
  value: number;
  factor: number;
};

async function getMarks(
  student: number,
  password: string,
  semester: string
): Promise<LkMark[]> {
  const options = {
    method: "POST",
    url: pathMarks,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    data: {
      student,
      password,
      semester,
    },
    json: true,
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

  const marks = (await http(options)).data as [
    {
      title: string;
      num: string;
      value: number;
      factor: number;
    }
  ];
  return marks.filter(
    (mark) => mark.title !== "Рейтинг" && mark.title !== "Накопленный Рейтинг"
  );
}

async function getSemesters(
  student: number,
  password: string
): Promise<string[]> {
  const options = {
    method: "POST",
    url: pathSemesters,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    data: {
      student,
      password,
    },
  };

  if (student >= 999000 && student <= 999999) {
    return ["2019-осень"];
  }
  const response = await http(options);
  return response.data.semesters;
}

async function getStudent(
  student: number,
  password: string
): Promise<{
  stgroup: string;
  surname: string;
  initials: string;
}> {
  const options = {
    method: "POST",
    url: pathSemesters,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      student,
      password,
    },
  };

  if (student >= 999000 && student <= 999999) {
    return {
      surname: "Тест",
      initials: "Тест",
      stgroup: `Тест-${Math.floor(Math.random() * (15 - 10)) + 10}`,
    };
  }

  const response = (await http(options)).data;
  return {
    stgroup: response.stgroup,
    surname: response.surname,
    initials: response.initials,
  };
}

export { getStudent, getSemesters, getMarks };
