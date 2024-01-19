//1 - Ф.И.О. преподавателя, реализующего программу
//2 - Должность преподавателя
//3 - Перечень преподаваемых дисциплин
//4 - Уровень образования
//5 - Квалификация
//6 - Учёная степень педагогического работника (при наличии)
//7 - Учёное звание педагогического работника (при наличии)
//8 - Наименование направления подготовки и (или) специальности педагогического работника
//9 - Сведения о повышении квалификации и (или) профессиональной переподготовке педагогического работника (при наличии)
//10 - Общий стаж работы
//11 - Стаж работы педагогического работника по специальности

import axios from "axios";
import { z } from "zod";
import rateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";

const teacherAxios = rateLimit(
  axios.create({
    baseURL: "https://stankin.ru/api_entry.php",
    timeout: 900000,
  }),
  {
    maxRequests: 1,
    perMilliseconds: 1000,
  }
);
axiosRetry(teacherAxios, { retries: 3 });

export type Teacher = {
  name: string;
  position: string;
  disciplines: string;
  educationLevel: string;
  qualification: string;
  academicDegree: string;
  academicRank: string;
  trainingDirection: string;
  training: string;
  generalExperience: string;
  experienceInSpecialty: string;
};

const TeacherSchema = z.object({
  name: z.string(),
  position: z.string(),
  disciplines: z.string(),
  educationLevel: z.string(),
  qualification: z.string(),
  academicDegree: z.string(),
  academicRank: z.string(),
  trainingDirection: z.string(),
  training: z.string(),
  generalExperience: z.string(),
  experienceInSpecialty: z.string(),
});

const teachersMock: Teacher[] = [
  {
    name: "Крюков Василий Викторович",
    position: "доцент",
    disciplines: "Математика",
    educationLevel: "Высшее",
    qualification: "Высшая",
    academicDegree: "кандидат физико-математических наук",
    academicRank: "доцент",
    trainingDirection: "Математика и механика",
    training: "Высшее",
    generalExperience: "27",
    experienceInSpecialty: "27",
  },
];

export async function getTeachersFromWebsite(): Promise<Teacher[]> {
  try {
    const response = await teacherAxios.post("", {
      action: "getJSONTable",
      data: { id: 128 },
    });
    const teachers = JSON.parse(response.data.data.json_table.json).list.filter(
      (teacher: any) => !teacher.config.isHeader
    );

    const parsedTeachers = teachers.map((teacher: any) => {
      return {
        name: teacher.row[0].rows[0].value,
        position: teacher.row[1].rows[0].value,
        disciplines: teacher.row[2].rows[0].value,
        educationLevel: teacher.row[3].rows[0].value,
        qualification: teacher.row[4].rows[0].value,
        academicDegree: teacher.row[5].rows[0].value,
        academicRank: teacher.row[6].rows[0].value,
        trainingDirection: teacher.row[7].rows[0].value,
        training: teacher.row[8].rows[0].value,
        generalExperience: teacher.row[9].rows[0].value,
        experienceInSpecialty: teacher.row[10].rows[0].value,
      };
    });

    if (
      !parsedTeachers.every(
        (teacher: any) => TeacherSchema.safeParse(teacher).success
      )
    ) {
      throw new Error("Invalid teachers data");
    }

    return parsedTeachers;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeacherDetail(name: string) {
  const optionsSearchInfo = {
    body: {
      action: "search",
      data: {
        type: "users",
        query: name,
        page: 1,
        count: 20,
      },
    },
  };

  try {
    const searchInfoResponse = await teacherAxios.post(
      "",
      {
        ...optionsSearchInfo.body,
      },
      {
        timeout: 1000,
        "axios-retry": {
          retries: 0,
        },
      }
    );
    const infoResponse = searchInfoResponse.data as any;

    if (typeof infoResponse === "string") {
      return {};
    }

    if (infoResponse) {
      if (infoResponse.data.founded.length > 0) {
        const { id } = infoResponse.data.founded[0];
        const subdivisionId =
          infoResponse.data.founded[0].payload.subdivision_id;

        const optionsTeacherInfo = {
          body: {
            action: "getStuff",
            data: { subdivision_id: subdivisionId },
          },
        };
        const teacherInfoResponse = await teacherAxios.post(
          "",
          {
            ...optionsTeacherInfo.body,
          },
          {
            timeout: 1000,
            "axios-retry": {
              retries: 0,
            },
          }
        );
        const teacherResponse = teacherInfoResponse.data as any;
        if (typeof teacherResponse === "string") {
          return {};
        }
        if (teacherResponse) {
          const { email, phone, avatar } = teacherResponse.data.filter(
            (row: any) => row.user.id === id
          )[0].user;

          return {
            email: email !== "example@mail.com" ? email : null,
            phone,
            avatar,
          };
        }
      }
    }
  } catch (e) {
    return {};
  }

  return {};
}
