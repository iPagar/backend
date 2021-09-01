const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const q = require("../services/queries");

router.put("/ol/add", function (req, res, next) {
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
		q.addOl(params.vk_user_id)
			.then((student) => {
				if (student) res.send(student);
				else next(createError(createError(404)));
			})
			.catch((err) => {
				next(createError(err));
			});
	}
});

router.get("/ol/my", function (req, res, next) {
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
		q.myOl(params.vk_user_id)
			.then((student) => {
				if (student) res.send(student[0].count > 0);
				else next(createError(createError(404)));
			})
			.catch((err) => {
				next(createError(err));
			});
	}
});

router.get("/ol/number", function (req, res, next) {
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
		q.numberOl()
			.then((number) => {
				if (number) res.send(number[0].count);
				else next(createError(createError(404)));
			})
			.catch((err) => {
				next(createError(err));
			});
	}
});

module.exports = router;
