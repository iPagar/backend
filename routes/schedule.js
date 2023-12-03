const express = require("express");

const router = express.Router();
const { validationResult } = require("express-validator");
const createError = require("http-errors");
const db = require("../services/mongo-driver").default;
const ms = require("../services/manager-schedule");
// sheduler

// running a task every hour
// cron.schedule("30 3 * * **", async () => {
// 	await db.drop();
// 	await db.update(
// 		new RegExp(/Бакалавриат|Магистратура|Специалитет/),
// 		new RegExp(/курс|занятий/)
// 	);
// 	await db.update(new RegExp(/Аспирантура/), new RegExp(/Расписание/));
// });

// (async () => {
//   try {
//     await db.drop();
//     await ms.update(
//       new RegExp(/Бакалавриат/),
//       new RegExp(/^1 курс$|^2 курс$|^3 курс$|^4 курс$/)
//     );
//     await ms.update(
//       new RegExp(/Специалитет/),
//       new RegExp(/Расписание занятий/)
//     );
//     await ms.update(new RegExp(/Магистратура/), new RegExp(/^1 курс$|^2 курс/));
//     await ms.update(new RegExp(/Аспирантура/), new RegExp(/Расписание/));
//   } catch (err) {
//     console.log(err);
//   }
// })().then(() => console.log(1));

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
      break;
    default:
      return createError(404);
  }
}

router.put("/schedule/favourite", function (req, res, next) {
  const errors = validationResult(req);
  const {
    stgroup,
    group,
    params: { vk_user_id: id },
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.insertFavourite(id, stgroup, group)
      .then((response) => {
        res.sendStatus(200);
      })
      .catch((err) => {
        next(logErr(err));
      });
  }
});

router.get("/schedule/groups", function (req, res, next) {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { stgroup } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getGroups(stgroup)
      .then((lessons) => {
        if (lessons) {
          res.send(lessons);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/lessons", function (req, res, next) {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;
  const { stgroup, group } = req.query;
  const day = new Date(req.query.day);

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getLessons(stgroup, group, day)
      .then((lessons) => {
        if (lessons) {
          const filtered = lessons
            .sort(
              (a, b) =>
                new Date(a.start_date).getHours() -
                new Date(b.start_date).getHours()
            )
            .filter(
              (lesson, index, self) =>
                index ===
                self.findIndex(
                  (obj) =>
                    obj.start_date?.toString() ===
                      lesson.start_date?.toString() &&
                    obj.end_date?.toString() === lesson.end_date?.toString()
                )
            );

          res.send(filtered);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/favourite", function (req, res, next) {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getFavourites(id)
      .then((favourites) => {
        res.send(favourites);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/groups", function (req, res, next) {
  const errors = validationResult(req);
  const {
    params: { vk_user_id: id },
    stgroup,
  } = req.body;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getGroups(groups)
      .then((groups) => {
        if (groups) {
          res.send(groups);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/stgroup", function (req, res, next) {
  const errors = validationResult(req);
  const { stgroup } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getStgroup(stgroup)
      .then((stgroup) => {
        if (stgroup) {
          res.send(
            stgroup.filter(
              (group, index, self) =>
                index === self.findIndex((obj) => obj.name === group.name)
            )
          );
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/file", function (req, res, next) {
  const errors = validationResult(req);
  const { stgroup } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getFile(stgroup)
      .then((file) => {
        if (file) {
          res.setHeader("Content-Type", "application/pdf");
          res.send(file.file);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

module.exports = router;
