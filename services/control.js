const cron = require('node-cron');
const Markup = require('node-vk-bot-api/lib/markup');
const VkBot = require('node-vk-bot-api');
const rp = require('request-promise');
const db = require('./queries');
const lk = require('./lk');

const bot = new VkBot({
  token: process.env.VK_BOT,
});

// running a task every hour
cron.schedule('0 * * * *', () => {
  update();
});

async function checkAllowedMessages(students) {
  for (const i in students) {
    // if (students[i].student === 318219)
    console.log(i);
    const options = {
      method: 'POST',
      uri: `https://api.vk.com/method/messages.isMessagesFromGroupAllowed?group_id=183639424&user_id=${students[i].id}&v=5.126&access_token=${process.env.VK_BOT}`,
      json: true,
    };
    await new Promise((resolve) => {
      setTimeout(
        () =>
          rp(options).then((r) => {
            console.log(students[i].id, r.response.is_allowed);
            db.setNotify(students[i].id, r.response.is_allowed);
            resolve();
          }),
        15
      );
    });
  }
}

function update() {
  db.getLastSemesters()
    .then(async (semesters) => {
      const prevStudents = await db.getStudentsBySemester(semesters[1]);
      const nowStudents = await db.getStudentsBySemester(semesters[0]);

      const students = Array.from(
        new Set(
          prevStudents
            .concat(nowStudents)
            .map((student) => JSON.stringify(student))
        )
      ).map((student) => JSON.parse(student));

      // await checkAllowedMessages(students);

      for (const i in students) {
        // if (students[i].student === 318219)
        console.log(i);
        await updateStudent(semesters[1], students[i], false).then(() => {
          new Promise((resolve) => {
            setTimeout(() => resolve(), 150);
          });
        });
        await updateStudent(semesters[0], students[i], true).then(() => {
          new Promise((resolve) => {
            setTimeout(() => resolve(), 150);
          });
        });
      }
      console.log('vse');
    })
    .catch((err) => console.log(err));
}

async function updateStudent(semester, stud, isLast) {
  const { student, password, id, notify } = stud;

  // updating semesters list
  try {
    await updateSemesters(student, password, id);

    // update student settings
    await lk.getStudent(student, password).then((response) => {
      const { surname, initials, stgroup } = response;

      return db.createStudent(
        student,
        password,
        surname,
        initials,
        stgroup,
        id
      );
    });
    await updateRatings(id, semester);
  } catch (e) {
    console.log(student, e.statusCode, 'lk.getStudent');
  }

  // update marks
  try {
    const updatedMarks = await updateMarksBySemester(
      semester,
      student,
      password,
      id
    );

    // update rating
    await updateRatings(id, semester);

    if (updatedMarks.length) console.log(student, updatedMarks);

    if (updatedMarks.length > 0 && notify) {
      const notifyText = await makeNotifyText(
        id,
        updatedMarks,
        semester,
        isLast
      );
      await bot.sendMessage(id, notifyText.text, null, notifyText.keyboard);
    }
  } catch (e) {
    console.log(e, 'lk.getMarks');
    // return updateStudent(semester, stud, isLast);
  }
}

async function makeNotifyText(id, updatedMarks, semester, isLast) {
  let text = '';

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

  sortedMarks.foreach((sortedMark) => {
    text += `${sortedMark.subject}\n`;

    const { length } = Object.keys(sortedMark.marks);
    Object.keys(sortedMark.marks)
      .sort()
      .foreach((module, i) => {
        if (length > 1 && i < length - 1)
          text += `${module}: ${sortedMark.marks[module]}, `;
        else text += `${module}: ${sortedMark.marks[module]}\n\n`;
      });
  });

  const rating = await db.getRatingById(id, semester);

  const keyboard = Markup.keyboard(
    [
      Markup.button({
        action: {
          type: 'open_app',
          app_id: '7010368',
          label: 'Смотреть оценки',
          payload: JSON.stringify({
            url: 'https://vk.com/stankin.moduli#marks',
          }),
          hash: 'marks',
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

async function updateMarksBySemester(semester, student, password, id) {
  const prevMarks = await db.getMarks(id, semester);

  try {
    const newMarks = await lk.getMarks(student, password, semester);

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
          const { subject, module } = mark;

          return db.deleteMark(id, semester, subject, module);
        })
      );

    await Promise.all(
      newMarks.map((mark) => {
        const { title, num, value, factor } = mark;

        return db.createMark(id, semester, title, num, value, factor);
      })
    );

    return updatedMarks;
  } catch (e) {
    if (e.statusCode !== 401) {
      console.log(student, e.statusCode, 'updating marks');
      // return updateMarksBySemester(semester, student, password, id);
    } else {
      console.log(student, e.statusCode, 'updating marks');
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
              let text = '';

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

              sortedMarks.foreach((sortedMark) => {
                text += `${sortedMark.subject}\n`;
              });

              if (text.length) {
                await db.getRatingById(id, semester).then((resp) => {
                  const keyboard = Markup.keyboard(
                    [
                      Markup.button({
                        action: {
                          type: 'open_app',
                          app_id: '7010368',
                          label: 'Смотреть оценки',
                          payload: JSON.stringify({
                            url: 'https://vk.com/stankin.moduli#marks',
                          }),
                          hash: 'marks',
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

function updateSemesters(student, password) {
  return lk
    .getSemesters(student, password)
    .then((semesters) =>
      Promise.all(semesters.map((semester) => db.createSemester(semester)))
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

function getMarks(id, semester) {
  return db.getMarks(id, semester).then((marks) => {
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
  });
}

function getSemesters(id) {
  return db.getSemesters(id).then((semesters) => semesters.sort());
}

function updateRatings(id, semester) {
  return getMarks(id, semester).then((subjects) => {
    const isAll =
      subjects.length > 0
        ? subjects.every((subject) =>
            Object.keys(subject.marks).every((module) => {
              const value = subject.marks[module];
              const factor = parseFloat(subject.factor);

              return value >= 25 && factor > 0;
            })
          )
        : false;

    if (isAll) {
      let sum = 0;
      let sumFactor = 0;

      subjects.foreach((subject) => {
        let sumFactorSubject = 0;
        let sumSubject = 0;

        const factor = parseFloat(subject.factor);

        Object.keys(subject.marks).foreach((module) => {
          const value = subject.marks[module];

          if (module === 'М1') {
            sumFactorSubject += 3;
            sumSubject += value * 3;
          } else if (module === 'М2') {
            sumFactorSubject += 2;
            sumSubject += value * 2;
          } else if (module === 'З') {
            sumFactorSubject += 5;
            sumSubject += value * 5;
          } else if (module === 'К') {
            sumFactorSubject += 5;
            sumSubject += value * 5;
          } else if (module === 'Э') {
            sumFactorSubject += 7;
            sumSubject += value * 7;
          }
        });

        sumFactor += factor;
        sum += (sumSubject / sumFactorSubject) * factor;
      });

      const rating = sum / sumFactor;

      return db.createRating(id, semester, rating);
    }

    return db.deleteRatingById(id, semester);
  });
}

function getRating(semester, search, offset) {
  return db.getRating(semester, search, offset);
}

function getAllModules(semester, subject, module) {
  return db.getAllModules(semester, subject, module);
}

async function getMarksHistory(id) {
  const student = await db.getStudent(id);
  return db.getMarksHistory(student.student);
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
  getMarksHistory
};
