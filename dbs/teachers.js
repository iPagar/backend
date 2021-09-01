const { postgres } = require("./config.js");

function getTeachers(offset = 0, limit = null, search = "") {
	return new Promise((resolve, reject) =>
		postgres.query(
			"select a.name, count(b.reaction) from teachers as a left join teachers_reactions as b on b.name = a.name where a.name ilike '%' || ($3) || '%' group by a.name order by count(b.reaction) desc, a.name limit ($2) offset ($1)",
			[offset, limit, search],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function getReactions(name) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"select reaction, count(reaction)  from teachers_reactions where name = ($1) group by reaction order by count(reaction) desc",
			[name],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function getReactionsById(id, name) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"select count(reaction) from teachers_reactions where id = ($1) and name = ($2)",
			[id, name],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function putReaction(id, name, reaction) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"INSERT INTO teachers_reactions VALUES ($1, $2,  $3) ON CONFLICT(id, name) DO UPDATE SET reaction = EXCLUDED.reaction RETURNING *",
			[id, name, reaction],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function deleteReaction(id, name) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"DELETE FROM teachers_reactions WHERE id = $1 and name = $2",
			[id, name],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rowCount);
			}
		)
	);
}

function getComments(name) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"select *, to_char(created_at, 'YYYY-MM-DD') as created_at from teachers_comments where name = ($1)",
			[name],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function putComment(id, name, comment, isPublic) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"INSERT INTO teachers_comments VALUES ($1, $2,$3, $4) ON CONFLICT(id, name) DO UPDATE SET comment = EXCLUDED.comment, is_public = EXCLUDED.is_public, created_at = EXCLUDED.created_at RETURNING *",
			[id, name, comment, isPublic],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function deleteComment(id, name) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"DELETE FROM teachers_comments WHERE name = $2 and id = $1",
			[id, name],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rowCount);
			}
		)
	);
}

function putScore(id, name, from_id, score) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"INSERT INTO comments_scores VALUES ($1, $2, $3, $4) ON CONFLICT(id, name, from_id) DO UPDATE SET score = EXCLUDED.score RETURNING *",
			[id, name, from_id, score],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rows);
			}
		)
	);
}

function deleteScore(id, name, from_id) {
	return new Promise((resolve, reject) =>
		postgres.query(
			"DELETE FROM comments_scores WHERE id = $1 and name = $2 and from_id = $3",
			[id, name, from_id],
			(error, results) => {
				if (error) {
					return reject(error);
				}
				return resolve(results.rowCount);
			}
		)
	);
}

module.exports = {
	getReactions,
	putReaction,
	deleteReaction,
	getComments,
	putComment,
	deleteComment,
	putScore,
	deleteScore,
	getReactionsById,
	getTeachers,
};
