const cron = require("node-cron");
const Markup = require("node-vk-bot-api/lib/markup");
const VkBot = require("node-vk-bot-api");
const rp = require("request-promise");
const db = require("./queries");
const lk = require("./lk");
import { logger } from "../config/winston";
import { vkGroup } from "../src/common/utils/vk";

const bot = new VkBot({
  token: process.env.VK_BOT,
});

// running a task every
cron.schedule(
  "0 7-19/2 * * *",
  () => {
    update();
  },
  {
    scheduled: process.env.NODE_ENV === "production",
  }
);

async function update() {
  const started = new Date().toISOString();
  logger.info("Updating students", {
    started,
  });
  const lastSemesters = await db.getLastSemesters();
  const prevStudents = await db.getStudentsBySemester(lastSemesters[1]);
  const nowStudents = await db.getStudentsBySemester(lastSemesters[0]);

  const uniqueStudents = new Map();

  prevStudents.concat(nowStudents).forEach((student) => {
    uniqueStudents.set(student.studentId, student);
  });

  const students = Array.from(uniqueStudents.values());

  logger.info(`Updating students`, {
    studentsLength: students.length,
  });

  for (const i in students) {
    await updateStudent(lastSemesters[1], students[i], false).then(() => {
      new Promise((resolve) => {
        setTimeout(() => resolve(), 150);
      });
    });
    await updateStudent(lastSemesters[0], students[i], true).then(() => {
      new Promise((resolve) => {
        setTimeout(() => resolve(), 150);
      });
    });
  }
  logger.info("Updating students finished", {
    started,
    finished: new Date().toISOString(),
    duration: new Date().getTime() - new Date(started).getTime(),
  });
}

async function updateStudent(semester, stud, isLast) {
  const { studentId, password, vkUserId, notify } = stud;

  try {
    // updating semesters list
    await updateSemesters(studentId, password);
    // update student settings
    const lkStudent = await lk.getStudent(studentId, password);

    const { surname, initials, stgroup } = lkStudent;

    await db.createStudent(studentId, password, surname, initials, stgroup);
    await updateRatings(studentId, semester);

    // update marks
    const updatedMarks = await updateMarksBySemester(
      semester,
      studentId,
      password
    );
    logger.info(`Updated student marks`, {
      studentId,
      semester,
      updatedMarksLength: updatedMarks.length,
    });

    // update rating
    await updateRatings(studentId, semester);

    if (notify) {
      const isMessagesAllowed =
        await vkGroup.api.messages.isMessagesFromGroupAllowed({
          group_id: 183639424,
          user_id: vkUserId,
        });

      const isAllowed = !!isMessagesAllowed.is_allowed;

      if (isAllowed !== notify) {
        await db.setNotify(vkUserId, isAllowed);
        logger.info(`Updating student property notify`, {
          studentId,
          semester,
          isAllowed,
        });
      }
    }

    if (updatedMarks && updatedMarks.length > 0 && notify) {
      const notifyText = await makeNotifyText(
        studentId,
        updatedMarks,
        semester,
        isLast
      );
      logger.info(`Sending message to student`, {
        studentId,
        semester,
      });
      await bot.sendMessage(
        vkUserId,
        notifyText.text,
        null,
        notifyText.keyboard
      );
      logger.info(`Sent message to student`, {
        studentId,
        semester,
      });
    }
  } catch (e) {
    logger.error(`Error updating student`, {
      studentId,
      semester,
      stack: e.stack,
    });
  }
}

async function makeNotifyText(studentId, updatedMarks, semester, isLast) {
  let text = "";

  if (updatedMarks.length && !isLast) text += `${semester}\n\n`;

  const sortedMarks = [];

  for (let element of updatedMarks) {
    let existingGroups = sortedMarks.filter(
      (group) => group.subject === element.title
    );
    if (existingGroups.length > 0) {
      existingGroups[0].marks[`${element.num}`] = element.value;
    } else {
      let newGroup = {
        marks: {
          [`${element.num}`]: element.value,
        },
        subject: element.title,
        factor: element.factor,
      };
      sortedMarks.push(newGroup);
    }
  }

  sortedMarks.forEach((sortedMark) => {
    text += `${sortedMark.subject}\n`;

    const { length } = Object.keys(sortedMark.marks);
    Object.keys(sortedMark.marks)
      .sort()
      .forEach((module, i) => {
        if (length > 1 && i < length - 1)
          text += `${module}: ${sortedMark.marks[module]}, `;
        else text += `${module}: ${sortedMark.marks[module]}\n\n`;
      });
  });

  const rating = await db.getRatingById(studentId, semester);

  const keyboard = Markup.keyboard(
    [
      Markup.button({
        action: {
          type: "open_app",
          app_id: "7010368",
          label: "Смотреть оценки",
          payload: JSON.stringify({
            url: "https://vk.com/stankin.moduli#marks",
          }),
          hash: "marks",
        },
      }),
    ],
    {
      columns: 1,
    }
  ).inline();

  if (rating.length) {
    text += `Рейтинг: ${rating[0].rating}\n\n`;
  }

  return { text, keyboard };
}

async function updateMarksBySemester(semester, studentId, password) {
  const prevMarks = await db.getMarks(studentId, semester);

  try {
    const newMarks = await lk.getMarks(studentId, password, semester);

    const updatedMarks = newMarks.reduce((updatedMarks, newMark, i) => {
      const { title, num, value } = newMark;

      const isPresented = prevMarks.some(
        (prevMark) => prevMark.subject === title && prevMark.module === num
      );

      if (isPresented) {
        const isNumChanged = prevMarks.some(
          (prevMark) =>
            prevMark.subject === title &&
            prevMark.module === num &&
            prevMark.value !== value
        );

        if (isNumChanged) updatedMarks.push(newMarks[i]);
        else return updatedMarks;
      } else updatedMarks.push(newMarks[i]);

      return updatedMarks;
    }, []);

    const deletedMarks = prevMarks.reduce((deletedMarks, prevMark) => {
      const { subject, module } = prevMark;

      const isPresented = newMarks.some(
        (newMark) => newMark.title === subject && newMark.num === module
      );

      if (!isPresented) {
        deletedMarks.push(prevMark);
      }

      return deletedMarks;
    }, []);

    if (deletedMarks.length > 0)
      await Promise.all(
        deletedMarks.map((mark) => {
          const { id } = mark;

          return db.deleteMark(id);
        })
      );

    await Promise.all(
      newMarks.map((mark) => {
        const { title, num, value, factor } = mark;

        return db.createMark(studentId, semester, title, num, value, factor);
      })
    );

    return updatedMarks;
  } catch (e) {
    if (e.statusCode !== 401) {
      console.log(studentId, e, "updating marks");
    } else {
      console.log(studentId, e, "updating marks");
      return [];
    }
  }
}

function notifyStud(semester, stud, semesters) {
  return new Promise((resolve) => {
    const { student, password, id, notify } = stud;
    // if (student === 116065)
    // 	console.log(semester, student, password, id, notify);
    return db
      .getMarks(id, semester)
      .then((prevMarks) =>
        registerStudent(student, password, id).then(() =>
          db.getMarks(id, semester).then(async (newMarks) => {
            if (notify) {
              let text = "";

              const updatedMarks = newMarks.filter((newMark) => {
                const found = prevMarks.some(
                  (prevMark) =>
                    newMark.subject === prevMark.subject &&
                    newMark.module === prevMark.module &&
                    newMark.value === prevMark.value
                );

                return !found;
              });

              if (updatedMarks.length && semester !== semesters[0])
                text += `${semester}\n\n`;

              const sortedMarks = [];

              for (let element of updatedMarks) {
                let existingGroups = sortedMarks.filter(
                  (group) => group.subject === element.subject
                );
                if (existingGroups.length > 0) {
                  existingGroups[0].marks[`${element.module}`] = element.value;
                } else {
                  let newGroup = {
                    marks: {
                      [`${element.module}`]: element.value,
                    },
                    subject: element.subject,
                    factor: element.factor,
                  };
                  sortedMarks.push(newGroup);
                }
              }

              sortedMarks.forEach((sortedMark) => {
                text += `${sortedMark.subject}\n`;
              });

              if (text.length) {
                await db.getRatingById(id, semester).then((resp) => {
                  const keyboard = Markup.keyboard(
                    [
                      Markup.button({
                        action: {
                          type: "open_app",
                          app_id: "7010368",
                          label: "Смотреть оценки",
                          payload: JSON.stringify({
                            url: "https://vk.com/stankin.moduli#marks",
                          }),
                          hash: "marks",
                        },
                      }),
                    ],
                    {
                      columns: 1,
                    }
                  ).inline();

                  if (resp.length) {
                    const { rating } = resp[0];

                    text += `Рейтинг: ${rating}\n\n`;
                  }
                  console.log(id, text);
                  bot.sendMessage(id, text, null, keyboard);
                });
              }

              resolve();
            } else resolve();
          })
        )
      )
      .catch((err) => {
        if (err.statusCode === 401)
          console.log(`${student}: ${err.response.statusMessage}`);
        else console.log(`${student} ошибка`);
        resolve();
      });
  });
}

function getStudent(id) {
  return db.getStudent(id);
}

function deleteStudent(id) {
  return db.deleteStudent(id);
}

function registerStudent(student, password, id) {
  return lk
    .getStudent(student, password)
    .then(async (response) => {
      const { surname, initials, stgroup } = response;

      return db
        .createStudent(student, password, surname, initials, stgroup, id)
        .then(() => updateSemesters(student, password, id))
        .then((semesters) => {
          return Promise.all(
            semesters.map((semester) =>
              updateMarks(student, password, id, semester)
            )
          ).then(() =>
            Promise.all(
              semesters.map((semester) => updateRatings(id, semester))
            )
          );
        });
    })
    .catch((e) => console.log(e));
}

export async function updateSemesters(student, password) {
  const semesters = await lk.getSemesters(student, password);

  return await Promise.all(
    semesters.map((semester) => db.createSemester(semester))
  );
}

function updateMarks(student, password, id, semester) {
  return lk.getMarks(student, password, semester).then((marks) =>
    Promise.all(
      marks.map((mark) => {
        const { title, num, value, factor } = mark;

        return db.createMark(id, semester, title, num, value, factor);
      })
    )
  );
}

async function getMarks(studentId, semester) {
  const marks = await db.getMarks(studentId, semester);
  const groups = [];
  for (let element of marks) {
    let existingGroups = groups.filter(
      (group) => group.subject === element.subject
    );
    if (existingGroups.length > 0) {
      existingGroups[0].marks[`${element.module}`] = element.value;
    } else {
      let newGroup = {
        marks: {
          [`${element.module}`]: element.value,
        },
        subject: element.subject,
        factor: element.factor,
      };
      groups.push(newGroup);
    }
  }
  return groups;
}

function getSemesters(id) {
  return db.getSemesters(id).then((semesters) => semesters.sort());
}

async function updateRatings(studentId, semester) {
  const subjects = await getMarks(studentId, semester);
  const isAll =
    subjects.length > 0
      ? subjects.every((subject) =>
          Object.keys(subject.marks).every((module) => {
            const value_1 = subject.marks[module];
            const factor = parseFloat(subject.factor);

            return value_1 >= 25 && factor > 0;
          })
        )
      : false;
  if (isAll) {
    let sum = 0;
    let sumFactor = 0;

    subjects.forEach((subject_1) => {
      let sumFactorSubject = 0;
      let sumSubject = 0;

      const factor_1 = parseFloat(subject_1.factor);

      Object.keys(subject_1.marks).forEach((module_1) => {
        const value_2 = subject_1.marks[module_1];

        if (module_1 === "М1") {
          sumFactorSubject += 3;
          sumSubject += value_2 * 3;
        } else if (module_1 === "М2") {
          sumFactorSubject += 2;
          sumSubject += value_2 * 2;
        } else if (module_1 === "З") {
          sumFactorSubject += 5;
          sumSubject += value_2 * 5;
        } else if (module_1 === "К") {
          sumFactorSubject += 5;
          sumSubject += value_2 * 5;
        } else if (module_1 === "Э") {
          sumFactorSubject += 7;
          sumSubject += value_2 * 7;
        }
      });

      sumFactor += factor_1;
      sum += (sumSubject / sumFactorSubject) * factor_1;
    });

    const rating = sum / sumFactor;

    return db.createRating(studentId, semester, rating);
  }
  return await db.deleteRatingById(studentId, semester);
}

function getRating(semester, search, offset) {
  return db.getRating(semester, search, offset);
}

function getAllModules(semester, subject, module) {
  return db.getAllModules(semester, subject, module);
}

async function getMarksHistory(id) {
  const student = await db.getStudent(id);
  return db.getMarksHistory(student.id);
}

function getRatingStgroup(id, semester) {
  return db
    .getStudent(id)
    .then((student) => db.getRatingStgroup(student.stgroup, semester));
}

function notify(id) {
  return db.notify(id);
}

function getAllRating(semester) {
  return db.getAllRating(semester);
}

// dating

function discoverDaters(id) {
  return db.discoverDaters(id);
}

function createLike(fromId, toId) {
  return db.createLike(fromId, toId);
}

function matches(id) {
  return db.matches(id);
}

// schedule
function getSchStudents() {
  return db.getSchStudents();
}

function getIsMe(id) {
  return db.getIsMe(id);
}

function addMe(id, fio, group) {
  return db.addMe(id, fio, group);
}

module.exports = {
  getAllRating,
  getStudent,
  deleteStudent,
  registerStudent,
  getMarks,
  getRating,
  getRatingStgroup,
  notify,
  getSemesters,
  discoverDaters,
  createLike,
  matches,
  getAllModules,
  getSchStudents,
  getIsMe,
  addMe,
  getMarksHistory,
};
