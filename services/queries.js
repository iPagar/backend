const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// moduli
function getStudent(id) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT student, surname, initials, stgroup, id, notify FROM students WHERE id = ($1) and is_deleted != TRUE",
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

function getMarksHistory(student) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT semester, subject, module, prev_value, next_value, operation, created_at FROM history_marks WHERE student = ($1) ORDER BY created_at DESC",
      [student],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function getStudentsBySemester(semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT DISTINCT student, password, students.id, students.notify FROM marks INNER JOIN students ON students.id = marks.id WHERE semester = ($1) AND stgroup not like CONCAT('%', 'Тест','%')",
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
      "INSERT INTO students VALUES ($1, $2, $3, $4, $5, $6, FALSE) ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, surname = EXCLUDED.surname, initials = EXCLUDED.initials, stgroup = EXCLUDED.stgroup, id = EXCLUDED.id, student = EXCLUDED.student, is_deleted = EXCLUDED.is_deleted RETURNING *",
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

function addVkStats(id, vkPlatform, vkRef, vkIsFavorite) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO vk_ref_platform VALUES (default,$1, $2, $3, $4) RETURNING *",
      [id, vkPlatform, vkRef, vkIsFavorite],
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
      "DELETE FROM students WHERE id = ($1) RETURNING *",
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
      (error) => {
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
      "INSERT INTO marks VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id, semester, subject, module) DO UPDATE SET value = EXCLUDED.value, factor = EXCLUDED.factor",
      [id, semester, subject, module, value, factor],
      (error) => {
        if (error) {
          return reject(error);
        }
        return resolve({ subject, module, value, factor });
      }
    )
  );
}

function deleteMark(id, semester, subject, module) {
  return new Promise((resolve, reject) =>
    pool.query(
      "DELETE FROM marks WHERE id = $1 AND semester = $2 AND subject = $3 AND module = $4",
      [id, semester, subject, module],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rowCount);
      }
    )
  );
}

function createRating(id, semester, rating) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO ratings VALUES ($1, $2, $3) ON CONFLICT (id, semester) DO UPDATE SET rating = EXCLUDED.rating",
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
      `with allratings as (select ROW_number() over (order by ratings.rating desc) as number, students.surname, students.id, students.stgroup, ratings.rating, ratings.semester from students inner join ratings on ratings.id = students.id where students.is_deleted != TRUE and semester = ($1) AND stgroup not like CONCAT('%', 'Тест','%') ) select distinct number, id, stgroup, rating from allratings where lower(surname) like CONCAT('%', trim(lower($2)),'%') OR lower(stgroup) like CONCAT('%', trim(lower($2)),'%') OR CAST(id AS TEXT) LIKE CAST(($2) AS TEXT) order by number asc limit 10 offset ($3) * 10`,
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

function getAllRating(semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `with allratings as (select ROW_number() over (order by ratings.rating desc) as number, students.surname, students.id, students.stgroup, ratings.rating, ratings.semester from students inner join ratings on ratings.id = students.id where students.is_deleted != TRUE and semester = ($1) ) select distinct number, id, stgroup, rating from allratings order by number asc`,
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

function getAllModules(semester, subject, module) {
  return new Promise((resolve, reject) =>
    pool.query(
      `select * from marks where semester = ($1) and module = ($2) and id = ($3)`,
      [semester, module, subject],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function getRatingById(id, semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `select round(rating) as rating from ratings where id = ($1) and semester = ($2)`,
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

function deleteRatingById(id, semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `delete from ratings where id = ($1) and semester = ($2)`,
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

function getRatingStgroup(stgroup, semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `select ROW_number() over (order by ratings.rating desc) as number, students.id, ratings.rating from ratings inner join students on ratings.id = students.id where students.is_deleted != TRUE and stgroup = ($1) AND semester = ($2) order by rating desc`,
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
      (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      }
    )
  );
}

function setNotify(id, notify2) {
  return new Promise((resolve, reject) =>
    pool.query(
      `UPDATE students SET notify = ($2) WHERE id = ($1)`,
      [id, notify2],
      (error) => {
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

// dating
function discoverDaters(id) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT id FROM students LEFT JOIN likes ON students.id = from_id WHERE id != ($1) order by random() limit 1",
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

function createLike(fromId, toId) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO likes VALUES ($1, $2)",
      [fromId, toId],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function matches(id) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT * FROM likes WHERE to_id = ($1) OR from_id = ($1)",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function getMessages(toId, fromId) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT * FROM messages WHERE to_id = ($1) OR from_id = ($2)",
      [toId, fromId],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function sendMessage(fromId, toId, text) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO messages VALUES(($1), ($2), ($3))",
      [fromId, toId, text],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function readMessage(toId, id) {
  return new Promise((resolve, reject) =>
    pool.query(
      "UPDATE messages SET read = TRUE WHERE to_id = ($1) AND id = ($2)",
      [toId, id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

// OL
function addOl(id) {
  return new Promise((resolve, reject) =>
    pool.query("INSERT INTO ol VALUES($1)", [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results.rows);
    })
  );
}

function myOl(id) {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT COUNT(*) FROM ol WHERE id = ($1)",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function numberOl() {
  return new Promise((resolve, reject) =>
    pool.query("SELECT COUNT(*) FROM ol", [], (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results.rows);
    })
  );
}

function getSchoolarship() {
  return new Promise((resolve, reject) =>
    pool.query("SELECT * FROM schoolarship", [], (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results.rows);
    })
  );
}

// schedule

function getSchStudents() {
  return new Promise((resolve, reject) =>
    pool.query(
      "SELECT uuid_in(md5(random()::text || clock_timestamp()::text)::cstring) as id,fio, stgroup FROM sch",
      [],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function getIsMe(id) {
  return new Promise((resolve, reject) =>
    pool.query("SELECT * FROM sch where id = ($1)", [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results.rows);
    })
  );
}

function addMe(id, fio, stgroup) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO sch VALUES ($1, $2, $3)",
      [id, fio, stgroup],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

module.exports = {
  createMark,
  deleteMark,
  createSemester,
  getStudent,
  getSemesters,
  createStudent,
  deleteStudent,
  createRating,
  getMarks,
  getAllRating,
  getRating,
  getRatingById,
  getRatingStgroup,
  getLastSemesters,
  getStudentsBySemester,
  notify,
  discoverDaters,
  createLike,
  matches,
  getMessages,
  sendMessage,
  readMessage,
  getAllModules,
  addVkStats,
  setNotify,
  deleteRatingById,
  addOl,
  myOl,
  numberOl,
  getSchStudents,
  getIsMe,
  addMe,
  getSchoolarship,
  getMarksHistory,
};
