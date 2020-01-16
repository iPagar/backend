const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const {
	getStudent,
	deleteStudent,
	registerStudent,
	getMarks,
	getRating,
	getRatingStgroup,
	getSemesters,
	notify
} = require("../services/control");

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
		getStudent(params.vk_user_id)
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
		deleteStudent(params.vk_user_id)
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
			registerStudent(student, password, params.vk_user_id)
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
			getMarks(params.vk_user_id, semester)
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
		getSemesters(params.vk_user_id)
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
		getRating(semester, search, offset)
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
		getRatingStgroup(params.vk_user_id, semester)
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
		notify(params.vk_user_id)
			.then(response => {
				res.send(response);
			})
			.catch(err => {
				next(createError(err));
			});
	}
});

module.exports = router;
