const express = require('express');
const { check, validationResult } = require('express-validator');
const createError = require('http-errors');
const rp = require('request-promise');
const db = require('../services/control');
const q = require('../services/queries');

const router = express.Router();

router.post('/student', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    q.addVkStats(
      params.vk_user_id,
      params.vk_platform,
      params.vk_ref,
      params.vk_is_favorite
    );
    db.getStudent(params.vk_user_id)
      .then((student) => {
        if (student) res.send(student);
        else next(createError(createError(404)));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get('/additional', async (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    try {
      const optionsVk = {
        method: 'GET',
        uri: 'https://api.vk.com/method/groups.isMember',
        qs: {
          group_id: 183639424,
          user_id: params.vk_user_id,
          v: 5.126,
          access_token: process.env.VK_BOT,
        },
        json: true,
      };
      const isMemberGroup = await rp(optionsVk).then(
        (response) => response.response
      );

      res.send({
        isMemberGroup,
        isFavorite: +params.vk_is_favorite,
      });
    } catch (err) {
      next(createError(err));
    }
  }
});

router.delete('/student', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.deleteStudent(params.vk_user_id)
      .then(() => {
        res.send();
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put(
  '/student',
  [
    check('password')
      .isLength({ min: 1 })
      .withMessage('must be at least 1 chars long'),
    check('student').isLength({ min: 6, max: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    const { params, student, password } = req.body;
    if (!errors.isEmpty()) {
      next(
        createError(
          400,
          errors
            .array()
            .map((error) => `${error.param} ${error.msg}`)
            .toString()
        )
      );
    } else {
      db.registerStudent(student, password, params.vk_user_id)
        .then(async (response) => {
          res.send(response);
        })
        .catch((err) => {
          next(createError(err));
        });
    }
  }
);

router.post(
  '/marks',
  [
    check('semester')
      .isLength({ min: 10, max: 10 })
      .withMessage('must be at least 10 chars long'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    const { params, semester } = req.body;

    if (!errors.isEmpty()) {
      next(
        createError(
          400,
          errors
            .array()
            .map((error) => `${error.param} ${error.msg}`)
            .toString()
        )
      );
    } else {
      db.getMarks(params.vk_user_id, semester)
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          next(createError(err));
        });
    }
  }
);

router.get('/scholarships', (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    q.getSchoolarship()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/semesters', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getSemesters(params.vk_user_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/allrating', (req, res, next) => {
  const errors = validationResult(req);
  const { semester } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getAllRating(semester)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/allmodules', (req, res, next) => {
  const errors = validationResult(req);
  const { semester, subject, module } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getAllModules(semester, subject, module)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/rating', (req, res, next) => {
  const errors = validationResult(req);
  const { semester, search, offset } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getRating(semester, search, offset)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/ratingst', (req, res, next) => {
  const errors = validationResult(req);
  const { params, semester } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getRatingStgroup(params.vk_user_id, semester)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/notify', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.notify(params.vk_user_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

// dating

router.post('/dater', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getStudent(params.vk_user_id)
      .then((student) => {
        if (student)
          db.getDater(student.id).then((dater) => {
            if (dater) res.send({ ...student, ...dater });
            else res.send({ ...student });
          });
        else next(createError(createError(404)));
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put(
  '/dater',
  [
    check('description')
      .isLength({ min: 1 })
      .withMessage('must be at least 1 chars long'),
    check('photo').isLength({ min: 1 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    const { params, description, photo } = req.body;

    if (!errors.isEmpty()) {
      next(
        createError(
          400,
          errors
            .array()
            .map((error) => `${error.param} ${error.msg}`)
            .toString()
        )
      );
    } else {
      db.createDater(params.vk_user_id, photo, description)
        .then(() => {
          res.send();
        })
        .catch((err) => {
          next(createError(err));
        });
    }
  }
);

router.delete('/dater', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.deleteDater(params.vk_user_id)
      .then(() => {
        res.send();
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/discover', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.discoverDaters(params.vk_user_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/like', check('to_id').isLength({ min: 1 }), (req, res, next) => {
  const errors = validationResult(req);
  const { params, to_id } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.createLike(params.vk_user_id, to_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/matches', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.matches(params.vk_user_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/messages', (req, res, next) => {
  const errors = validationResult(req);
  const { params, from_id } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getMessages(params.vk_user_id, from_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.put('/message', (req, res, next) => {
  const errors = validationResult(req);
  const { params, to_id, text } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.sendMessage(params.vk_user_id, to_id, text)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/readmessage', (req, res, next) => {
  const errors = validationResult(req);
  const { params, id } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.readMessage(params.vk_user_id, id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

// schedule
router.get('/sch/students', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getSchStudents()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.get('/sch/isme', (req, res, next) => {
  const errors = validationResult(req);
  const { params } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.getIsMe(params.vk_user_id)
      .then((response) => {
        res.send({ isme: !!response.length });
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

router.post('/sch/addme', async (req, res, next) => {
  const errors = validationResult(req);
  const { params, fio, stgroup } = req.body;

  if (!errors.isEmpty()) {
    next(
      createError(
        400,
        errors
          .array()
          .map((error) => `${error.param} ${error.msg}`)
          .toString()
      )
    );
  } else {
    db.addMe(params.vk_user_id, fio, stgroup)
      .then(() => {
        res.send();
      })
      .catch((err) => {
        next(createError(err));
      });
  }
});

module.exports = router;
