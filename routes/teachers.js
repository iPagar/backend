const express = require("express");
const { validationResult } = require("express-validator");
const createError = require("http-errors");
const db = require("manager-teachers");
const rp = require("request-promise");
const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");
const newDb = require("../dbs/teachers");
const scheduleDb = require("../dbs/schedule");
const studentDb = require("../services/control");

const router = express.Router();

async function getTeacherDetail(name) {
  const path = "https://stankin.ru/api_entry.php";

  const optionsSearchInfo = {
    method: "POST",
    uri: path,
    body: {
      action: "search",
      data: {
        type: "users",
        query: name,
        page: 1,
        count: 20,
      },
    },
    timeout: 2000,
    json: true,
  };

  const searchInfo = await rp(optionsSearchInfo)
    .then((response) => {
      if (response) {
        if (response.data.founded.length > 0) {
          const { id } = response.data.founded[0];
          const subdivisionId = response.data.founded[0].payload.subdivision_id;

          return { id, subdivisionId };
        }
      } else return createError(404);
    })
    .catch(() => {
      if (process.env.env === "development") console.log("searchInfo", name);
    });

  if (searchInfo) {
    const optionsTeacherInfo = {
      method: "POST",
      uri: path,
      body: {
        action: "getStuff",
        data: { subdivision_id: searchInfo.subdivisionId },
      },
      json: true,
    };

    const teacherInfo = await await rp(optionsTeacherInfo)
      .then((response) => {
        if (response) {
          const { email, phone, avatar } = response.data.filter(
            (row) => row.user.id === searchInfo.id
          )[0].user;

          return {
            email: email !== "example@mail.com" ? email : null,
            phone,
            avatar,
          };
        } else return createError(404);
      })
      .catch(() => {
        if (process.env.env === "development") console.log("teacherInfo", name);
      });

    return teacherInfo;
  }
  return {};
}

function getStgroupTeachers(stgroup) {
  return scheduleDb.getTeachers(stgroup).then(async (teachers) => {
    const fios = [];

    for (let teacher of teachers) {
      firstName = teacher.match(/[А-я]*/)[0];
      secondName = teacher.slice(firstName.length + 1, firstName.length + 2);

      fios.push({ firstName, secondName });
    }

    const fiosT = new Set();
    for (let fio of fios) {
      const teachers = await newDb.getTeachers(null, null, fio.firstName);

      for (let teacher of teachers) {
        firstName = teacher.name.match(/[А-я]*/)[0];
        secondName = teacher.name.slice(
          firstName.length + 1,
          firstName.length + 2
        );

        if (
          fios.some((fio) => {
            return fio.firstName === firstName && fio.secondName === secondName;
          })
        ) {
          fiosT.add(JSON.stringify(teacher));
        }
      }
    }

    const myTeachers = [];
    for (let fio of fiosT) {
      myTeachers.push(JSON.parse(fio));
    }

    return myTeachers.sort((a, b) => b.count - a.count);
  });
}

function logErr(errors, code) {
  switch (code) {
    case 400:
      return createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      );
    default:
      return createError(404);
  }
}
router.get("/teachers/my", async (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    try {
      const { stgroup } = await studentDb.getStudent(id);
      let teachers = await getStgroupTeachers(stgroup);
      if (teachers) {
        teachers = teachers.map(async (teacher) => {
          const reactions = await newDb.getReactions(teacher.name);
          const teacherDetail = await getTeacherDetail(teacher.name);
          const comments = await newDb.getComments(teacher.name);
          const myReaction =
            (await newDb.getReactionsById(id, teacher.name))[0].count === 1;

          if (teacherDetail) {
            return {
              ...teacher,
              ...teacherDetail,

              reactions: { my: myReaction, data: reactions },
              comments: {
                my: comments.some((comment) => comment.id === id),
                length: comments.length,
              },
            };
          }
          return {
            ...teacher,
            reactions: { my: myReaction, data: reactions },
            comments: {
              my: comments.some((comment) => comment.id === id),
              length: comments.length,
            },
          };
        });
      }
      teachers = await Promise.all(teachers);

      res.send(teachers);
    } catch (errors) {
      next(createError(errors));
    }
  }
});

router.get("/teachers", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { offset, limit, name } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .getTeachers(offset, limit || 10, name)
      .then(async (teachers) => {
        if (teachers) {
          teachers = teachers.map(async (teacher) => {
            const reactions = await newDb.getReactions(teacher.name);
            const teacherDetail = await getTeacherDetail(teacher.name);
            const comments = await newDb.getComments(teacher.name);
            const myReaction =
              (await newDb.getReactionsById(id, teacher.name))[0].count === 1;

            if (teacherDetail) {
              return {
                ...teacher,
                ...teacherDetail,

                reactions: { my: myReaction, data: reactions },
                comments: {
                  my: comments.some((comment) => comment.id == id),
                  length: comments.length,
                },
              };
            }
            return {
              ...teacher,
              reactions: { my: myReaction, data: reactions },
              comments: {
                my: comments.some((comment) => comment.id === id),
                length: comments.length,
              },
            };
          });

          teachers = await Promise.all(teachers);

          res.send(teachers);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/teachers/reactions", (req, res, next) => {
  const errors = validationResult(req);
  const { name } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .getReactions(name)
      .then((reactions) => {
        if (reactions) {
          res.send(reactions);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/teachers/comments", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { name } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .getComments(name)
      .then((comments) => {
        comments
          .filter((comment) => !comment.is_public)
          .forEach((comment) => {
            if (comment.id !== parseInt(id, 10)) comment.id = uuidv4();
          });

        res.send(comments);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put("/teachers/reactions", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
    name,
    reaction,
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .putReaction(id, name, reaction)
      .then((comments) => {
        if (comments) {
          res.send(comments);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.delete("/teachers/reactions", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { name } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .deleteReaction(id, name)
      .then((comments) => {
        if (comments) {
          res.send("ok");
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put("/teachers/comments", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
    name,
    comment,
    isPublic,
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .putComment(id, name, comment, isPublic)
      .then((comments) => {
        if (comments) {
          res.send(comments);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.delete("/teachers/comments", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { name } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .deleteComment(id, name)
      .then((comments) => {
        if (comments) {
          res.send("ok");
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put("/teachers/comments/score", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
    name,
    to_id,
    score,
  } = req.body;

  if (!errors.isEmpty() || id === to_id) {
    next(logErr(errors, 400));
  } else {
    newDb
      .putScore(to_id, name, id, score)
      .then((scores) => {
        if (scores) {
          res.send(scores);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.delete("/teachers/comments/score", (req, res, next) => {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { name, to_id } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    newDb
      .deleteComment(to_id, name, id)
      .then((scores) => {
        if (scores) {
          res.send("ok");
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

module.exports = router;
