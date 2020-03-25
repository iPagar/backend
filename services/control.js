const db = require("./queries");
const lk = require("../services/lk");
//sheduler
const cron = require("node-cron");
const VkBot = require("node-vk-bot-api");

const async = require("async");

const bot = new VkBot(process.env.VK_BOT);

//running a task every hour
cron.schedule("0 * * * *", () => {
	update();
});
// update();
function update() {
	return db
		.getLastSemesters()
		.then(semesters => {
			return Promise.all(
				semesters.map(semester => {
					return db.getStudentsBySemester(semester).then(students => {
						return async.parallelLimit(
							students.map(response => {
								const {
									student,
									password,
									id,
									notify
								} = response;
								console.log(id);

								if (notify)
									return async.parallelLimit(
										db
											.getMarks(id, semester)
											.then(prevMarks => {
												return registerStudent(
													student,
													password,
													id
												).then(() => {
													return db
														.getMarks(id, semester)
														.then(newMarks => {
															let text = "";

															const updatedMarks = newMarks.filter(
																newMark => {
																	const found = prevMarks.some(
																		prevMark => {
																			return (
																				newMark.subject ===
																					prevMark.subject &&
																				newMark.module ===
																					prevMark.module &&
																				newMark.value ===
																					prevMark.value
																			);
																		}
																	);

																	return !found;
																}
															);

															if (
																updatedMarks.length &&
																semester !==
																	semesters[0]
															)
																text += `${semester}\n\n`;

															const sortedMarks = [];

															for (let element of updatedMarks) {
																let existingGroups = sortedMarks.filter(
																	group =>
																		group.subject ===
																		element.subject
																);
																if (
																	existingGroups.length >
																	0
																) {
																	existingGroups[0].marks[
																		`${element.module}`
																	] =
																		element.value;
																} else {
																	let newGroup = {
																		marks: {
																			[`${element.module}`]: element.value
																		},
																		subject:
																			element.subject,
																		factor:
																			element.factor
																	};
																	sortedMarks.push(
																		newGroup
																	);
																}
															}

															sortedMarks.map(
																sortedMark => {
																	text += `${sortedMark.subject}\n`;

																	const length = Object.keys(
																		sortedMark.marks
																	).length;
																	sortedModules = Object.keys(
																		sortedMark.marks
																	)
																		.sort()
																		.map(
																			(
																				module,
																				i
																			) => {
																				if (
																					length >
																						1 &&
																					i <
																						length -
																							1
																				)
																					text += `${module}: ${sortedMark.marks[module]}, `;
																				else
																					text += `${module}: ${sortedMark.marks[module]}\n\n`;
																			}
																		);
																}
															);

															if (text.length)
																// 	// console.log(
																// 	// 	text
																// 	// );
																return bot.sendMessage(
																	id,
																	text
																);
														});
												});
											}),
										1,
										console.log(2)
									);
								else
									return async.parallelLimit(
										registerStudent(student, password, id),
										1,
										console.log(3)
									);
							}),
							1,

							console.log(1)
						);
					});
				})
			);
		})
		.catch(err => {
			console.log(err);
		});
}

function getStudent(id) {
	return db.getStudent(id);
}

function deleteStudent(id) {
	return db.deleteStudent(id);
}

function registerStudent(student, password, id) {
	return lk.getStudent(student, password).then(response => {
		const { surname, initials, stgroup } = response;

		return db
			.createStudent(student, password, surname, initials, stgroup, id)
			.then(response => {
				return updateSemesters(student, password, id);
			})
			.then(semesters => {
				return Promise.all(
					semesters.map(semester => {
						return updateMarks(student, password, id, semester);
					})
				).then(() => {
					return Promise.all(
						semesters.map(semester => {
							return updateRatings(student, id, semester);
						})
					);
				});
			});
	});
}

function updateSemesters(student, password, id) {
	return lk.getSemesters(student, password).then(semesters => {
		return Promise.all(
			semesters.map(semester => {
				return db.createSemester(semester);
			})
		);
	});
}

function updateMarks(student, password, id, semester) {
	return lk.getMarks(student, password, semester).then(marks => {
		return Promise.all(
			marks.map(mark => {
				const { title, num, value, factor } = mark;

				return db.createMark(id, semester, title, num, value, factor);
			})
		);
	});
}

function getMarks(id, semester) {
	return db.getMarks(id, semester).then(marks => {
		const groups = [];

		for (let element of marks) {
			let existingGroups = groups.filter(
				group => group.subject === element.subject
			);
			if (existingGroups.length > 0) {
				existingGroups[0].marks[`${element.module}`] = element.value;
			} else {
				let newGroup = {
					marks: {
						[`${element.module}`]: element.value
					},
					subject: element.subject,
					factor: element.factor
				};
				groups.push(newGroup);
			}
		}

		return groups;
	});
}

function getSemesters(id) {
	return db.getSemesters(id).then(semesters => semesters.sort());
}

function updateRatings(student, id, semester) {
	return getMarks(id, semester).then(subjects => {
		const isAll = subjects.every(subject => {
			return Object.keys(subject.marks).every(module => {
				const value = subject.marks[module];

				return value > 0;
			});
		});

		if (isAll) {
			let sum = 0;
			let sumFactor = 0;

			subjects.map(subject => {
				let sumFactorSubject = 0;
				let sumSubject = 0;

				const factor = parseFloat(subject.factor);

				Object.keys(subject.marks).map(module => {
					const value = subject.marks[module];

					if (module === "М1") {
						sumFactorSubject += 3;
						sumSubject += value * 3;
					} else if (module === "М2") {
						sumFactorSubject += 2;
						sumSubject += value * 2;
					} else if (module === "З") {
						sumFactorSubject += 5;
						sumSubject += value * 5;
					} else if (module === "К") {
						sumFactorSubject += 5;
						sumSubject += value * 5;
					} else if (module === "Э") {
						sumFactorSubject += 7;
						sumSubject += value * 7;
					}
				});

				sumFactor += factor;
				sum += (sumSubject / sumFactorSubject) * factor;
			});

			const rating = (sum /= sumFactor);

			return db.createRating(id, semester, rating);
		}
	});
}

function getRating(semester, search, offset) {
	return db.getRating(semester, search, offset);
}

function getRatingStgroup(id, semester) {
	return db
		.getStudent(id)
		.then(student => db.getRatingStgroup(student.stgroup, semester));
}

function notify(id) {
	return db.notify(id);
}

//dating

// [999222, 999223, 999224, 999225, 999226].map(id => {
// 	registerStudent(id, 85, id).then(() =>
// 		createDater(
// 			id,
// 			"https://avatars.mds.yandex.net/get-pdb/1813549/b56723b6-6eef-47b8-b0a0-7e458bbeac78/s1200",
// 			"some descro[toewrw fksddlksanf aslfmasldm  daslkmdlkmflkmf "
// 		)
// 	);
// });

function discoverDaters(id) {
	return db.discoverDaters(id);
}

function createLike(from_id, to_id) {
	return db.createLike(from_id, to_id);
}

function matches(id) {
	return db.matches(id);
}

module.exports = {
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
	matches
};
