const Pool = require("pg").Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: 5432
});

function getStudent(id) {
	return new Promise((resolve, reject) =>
		pool.query(
			"SELECT student, surname, initials, stgroup, id, notify FROM students WHERE id = ($1)",
			[id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows[0]);
			}
		)
	);
}

function getStudentsBySemester(semester) {
	return new Promise((resolve, reject) =>
		pool.query(
			"SELECT DISTINCT student, password, students.id, students.notify FROM marks INNER JOIN students ON students.id = marks.id WHERE semester = ($1)",
			[semester],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function getSemesters(id) {
	return new Promise((resolve, reject) =>
		pool.query(
			"SELECT ARRAY(SELECT DISTINCT semester FROM marks WHERE id = ($1))",
			[id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows[0].array);
			}
		)
	);
}

function createStudent(student, password, surname, initials, stgroup, id) {
	return new Promise((resolve, reject) =>
		pool.query(
			"INSERT INTO students VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (student) DO UPDATE SET password = EXCLUDED.password, surname = EXCLUDED.surname, initials = EXCLUDED.initials, stgroup = EXCLUDED.stgroup, id = EXCLUDED.id RETURNING *",
			[student, password, surname, initials, stgroup, id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function deleteStudent(id) {
	return new Promise((resolve, reject) =>
		pool.query(
			"DELETE FROM students WHERE id = $1",
			[id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rowCount);
			}
		)
	);
}

function createSemester(semester) {
	return new Promise((resolve, reject) =>
		pool.query(
			"INSERT INTO semesters VALUES ($1) ON CONFLICT DO NOTHING",
			[semester],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(semester);
			}
		)
	);
}

function createMark(id, semester, subject, module, value, factor) {
	return new Promise((resolve, reject) =>
		pool.query(
			"INSERT INTO marks VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id, semester, subject, module) DO UPDATE SET value = EXCLUDED.value",
			[id, semester, subject, module, value, factor],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve({ subject, module, value, factor });
			}
		)
	);
}

function createRating(id, semester, rating) {
	return new Promise((resolve, reject) =>
		pool.query(
			"INSERT INTO ratings VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
			[id, semester, rating],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rowCount);
			}
		)
	);
}

function getMarks(id, semester) {
	return new Promise((resolve, reject) =>
		pool.query(
			`select subject, module, value, factor from marks where id = ($1) and semester = ($2)`,
			[id, semester],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function getRating(semester, search, offset) {
	return new Promise((resolve, reject) =>
		pool.query(
			`with allratings as (select ROW_number() over (order by ratings.rating desc) as number, students.surname, students.id, students.stgroup, ratings.rating, ratings.semester from students inner join ratings on ratings.id = students.id where semester = ($1) AND stgroup not like CONCAT('%', 'Тест','%') ) select distinct number, id, stgroup, rating from allratings where lower(surname) like CONCAT('%', trim(lower($2)),'%') OR lower(stgroup) like CONCAT('%', trim(lower($2)),'%') OR CAST(id AS TEXT) LIKE CAST(($2) AS TEXT) order by number asc limit 10 offset ($3) * 10`,
			[semester, search, offset],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function getRatingStgroup(stgroup, semester) {
	return new Promise((resolve, reject) =>
		pool.query(
			`select ROW_number() over (order by ratings.rating desc) as number, students.id, ratings.rating from ratings inner join students on ratings.id = students.id where stgroup = ($1) AND semester = ($2) order by rating desc`,
			[stgroup, semester],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function notify(id) {
	return new Promise((resolve, reject) =>
		pool.query(
			`UPDATE students SET notify = NOT notify WHERE id = ($1)`,
			[id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve();
			}
		)
	);
}

function getLastSemesters() {
	return new Promise((resolve, reject) =>
		pool.query(
			`SELECT ARRAY(SELECT semester FROM (SELECT ROW_NUMBER() OVER(ORDER BY semester DESC), * FROM semesters) AS g WHERE row_number <= 2)`,
			[],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows[0].array);
			}
		)
	);
}

module.exports = {
	createMark,
	createSemester,
	getStudent,
	getSemesters,
	createStudent,
	deleteStudent,
	createRating,
	getMarks,
	getRating,
	getRatingStgroup,
	getLastSemesters,
	getStudentsBySemester,
	notify
};
