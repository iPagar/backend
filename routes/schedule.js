const express = require("express");

const router = express.Router();
const { validationResult } = require("express-validator");
const createError = require("http-errors");
const db = require("manager-schedule");
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

//  (async () => {
//    await db.drop();
//    await db.update(
//      new RegExp(/Бакалавриат/),
//      new RegExp(/курс/),
// new RegExp(/417842|415796|415797|415798/)
//    );

//    await db.update(
//      new RegExp(/Магистратура/),
//      new RegExp(/курс/),
//      new RegExp(/415800|415801|416606|416607/)
// );

//    await db.update(
// new RegExp(/Специалитет/),
//      new RegExp(/курс|занятий/),
//      new RegExp(/415799/)
// );

// await db.update(new RegExp(/Аспирантура/), new RegExp(/Расписание/));
//  })().then(() => console.log(1));

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

router.put("/schedule/favourite", (req, res, next) => {
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
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        next(logErr(err));
      });
  }
});

router.get("/schedule/groups", (req, res, next) => {
  const errors = validationResult(req);
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

router.get("/schedule/lessons", (req, res, next) => {
  const errors = validationResult(req);
  const { stgroup, group } = req.query;
  const day = new Date(req.query.day);

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getLessons(stgroup, group, day)
      .then((lessons) => {
        if (lessons) {
          res.send(
            lessons.sort(
              (a, b) =>
                new Date(a.start_date).getHours() -
                new Date(b.start_date).getHours()
            )
          );
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/favourite", (req, res, next) => {
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

router.get("/schedule/groups", (req, res, next) => {
  const errors = validationResult(req);

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

router.get("/schedule/stgroup", (req, res, next) => {
  const errors = validationResult(req);
  const { stgroup } = req.query;

  if (!errors.isEmpty()) {
    next(logErr(errors, 400));
  } else {
    db.getStgroup(stgroup)
      .then((stgroup) => {
        if (stgroup) {
          res.send(stgroup);
        } else next(logErr(errors));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get("/schedule/file", (req, res, next) => {
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
