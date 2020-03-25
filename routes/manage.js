const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const db = require("../services/control");

router.post("/student", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getStudent(params.vk_user_id)
			.then(student => {
				if (student) res.send(student);
				else next(createError(createError(404)));
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.delete("/student", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.deleteStudent(params.vk_user_id)
			.then(student => {
				res.send();
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.put(
	"/student",
	[
		check("password")
			.isLength({ min: 1 })
			.withMessage("must be at least 1 chars long"),
		check("student").isLength({ min: 6, max: 6 })
	],
	function(req, res, next) {
		const errors = validationResult(req);
		const { params, student, password } = req.body;

		if (!errors.isEmpty()) {
			next(
				createError(
					400,
					errors
						.array()
						.map(error => `${error.param} ${error.msg}`)
						.toString()
				)
			);
		} else {
			db.registerStudent(student, password, params.vk_user_id)
				.then(response => {
					res.send();
				})
				.catch(err => {
					next(createError(err));
				});
		}
	}
);

router.post(
	"/marks",
	[
		check("semester")
			.isLength({ min: 10, max: 10 })
			.withMessage("must be at least 10 chars long")
	],
	function(req, res, next) {
		const errors = validationResult(req);
		const { params, semester } = req.body;

		if (!errors.isEmpty()) {
			next(
				createError(
					400,
					errors
						.array()
						.map(error => `${error.param} ${error.msg}`)
						.toString()
				)
			);
		} else {
			db.getMarks(params.vk_user_id, semester)
				.then(response => {
					res.send(response);
				})
				.catch(err => {
					next(createError(err));
				});
		}
	}
);

router.post("/semesters", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getSemesters(params.vk_user_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/rating", function(req, res, next) {
	const errors = validationResult(req);
	const { params, semester, search, offset } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getRating(semester, search, offset)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/ratingst", function(req, res, next) {
	const errors = validationResult(req);
	const { params, semester } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getRatingStgroup(params.vk_user_id, semester)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/notify", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.notify(params.vk_user_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

//dating

router.post("/dater", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getStudent(params.vk_user_id)
			.then(student => {
				if (student)
					db.getDater(student.id).then(dater => {
						if (dater) res.send({ ...student, ...dater });
						else res.send({ ...student });
					});
				else next(createError(createError(404)));
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.put(
	"/dater",
	[
		check("description")
			.isLength({ min: 1 })
			.withMessage("must be at least 1 chars long"),
		check("photo").isLength({ min: 1 })
	],
	function(req, res, next) {
		const errors = validationResult(req);
		const { params, description, photo } = req.body;

		if (!errors.isEmpty()) {
			next(
				createError(
					400,
					errors
						.array()
						.map(error => `${error.param} ${error.msg}`)
						.toString()
				)
			);
		} else {
			db.createDater(params.vk_user_id, photo, description)
				.then(dater => {
					res.send();
				})
				.catch(err => {
					next(createError(err));
				});
		}
	}
);

router.delete("/dater", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.deleteDater(params.vk_user_id)
			.then(dater => {
				res.send();
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/discover", function(req, res, next) {
	const errors = validationResult(req);
	const { params } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.discoverDaters(params.vk_user_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/like", check("to_id").isLength({ min: 1 }), function(
	req,
	res,
	next
) {
	const errors = validationResult(req);
	const { params, to_id } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.createLike(params.vk_user_id, to_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/matches", function(req, res, next) {
	const errors = validationResult(req);
	const { params, to_id } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.matches(params.vk_user_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/messages", function(req, res, next) {
	const errors = validationResult(req);
	const { params, from_id } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.getMessages(params.vk_user_id, from_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.put("/message", function(req, res, next) {
	const errors = validationResult(req);
	const { params, to_id, text } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.sendMessage(params.vk_user_id, to_id, text)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

router.post("/readmessage", function(req, res, next) {
	const errors = validationResult(req);
	const { params, id } = req.body;

	if (!errors.isEmpty()) {
		next(
			createError(
				400,
				errors
					.array()
					.map(error => `${error.param} ${error.msg}`)
					.toString()
			)
		);
	} else {
		db.readMessage(params.vk_user_id, id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

module.exports = router;
