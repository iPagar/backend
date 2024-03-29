const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// moduli
function getStudent(id) {
  return new Promise((resolve, reject) =>
    pool.query(
      `SELECT id, "vkUserId", surname, initials, stgroup, notify FROM students WHERE "vkUserId" = ($1)`,
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
      `SELECT DISTINCT students.id as "studentId", students.password, "VkUser"."id" as "vkUserId", "VkUser"."notify" FROM marks INNER JOIN students ON students.id = marks."studentId" INNER JOIN "VkUser" ON "VkUser".id = students."vkUserId" WHERE semester = ($1) AND stgroup not like CONCAT('%', 'Тест','%')`,
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

function createStudent(studentId, password, surname, initials, stgroup) {
  return new Promise((resolve, reject) =>
    pool.query(
      "INSERT INTO students (id, password, surname, initials, stgroup) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, surname = EXCLUDED.surname, initials = EXCLUDED.initials, stgroup = EXCLUDED.stgroup, id = EXCLUDED.id, is_deleted = EXCLUDED.is_deleted RETURNING *",
      [studentId, password, surname, initials, stgroup],
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

function createMark(studentId, semester, subject, module, value, factor) {
  return new Promise((resolve, reject) =>
    pool.query(
      `INSERT INTO marks ("studentId", semester, subject, module, value, factor) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ("studentId", semester, subject, module) DO UPDATE SET value = EXCLUDED.value, factor = EXCLUDED.factor`,
      [studentId, semester, subject, module, value, factor],
      (error) => {
        if (error) {
          return reject(error);
        }
        return resolve({ subject, module, value, factor });
      }
    )
  );
}

function deleteMark(id) {
  return new Promise((resolve, reject) =>
    pool.query("DELETE FROM marks WHERE id = $1", [id], (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve(results.rowCount);
    })
  );
}

function createRating(studentId, semester, rating) {
  return new Promise((resolve, reject) =>
    pool.query(
      `INSERT INTO ratings VALUES ($1, $2, $3) ON CONFLICT (id, semester) DO UPDATE SET rating = EXCLUDED.rating`,
      [studentId, semester, rating],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rowCount);
      }
    )
  );
}

function getMarks(studentId, semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `select subject, module, value, factor from marks where "studentId" = ($1) and semester = ($2)`,
      [studentId, semester],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows);
      }
    )
  );
}

function getStudentRatingAndNumberInTheListBySemester(id, semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `with allratings as (
        select ROW_number() over (order by ratings.rating desc) as number, students.surname, students.id, students.stgroup, "vkUserId", ratings.rating, ratings.semester 
        from students 
        inner join ratings on ratings.id = students.id
        where students.is_deleted != TRUE 
          and semester = ($2) 
          and stgroup not like CONCAT('%', 'Тест','%') 
      )
      select distinct number, id, stgroup, rating, "vkUserId"
      from allratings
      where id = ($1)
      order by number asc`,
      [id, semester],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results.rows[0]);
      }
    )
  );
}

function getRating(semester, search, page, limit) {
  return new Promise((resolve, reject) => {
    const queryData = `with allratings as (
        select ROW_number() over (order by ratings.rating desc) as number,
               students.surname, students.id, students.stgroup, "vkUserId",
               ratings.rating, ratings.semester 
        from students 
        inner join ratings on ratings.id = students.id 
        where students.is_deleted != TRUE 
          and semester = $1 
          and stgroup not like CONCAT('%', 'Тест','%') 
      ) 
      select distinct number, id, stgroup, rating, "vkUserId"
      from allratings 
      where lower(surname) like CONCAT('%', trim(lower($2)),'%') 
         or lower(stgroup) like CONCAT('%', trim(lower($2)),'%') 
         or CAST(id AS TEXT) LIKE CAST($2 AS TEXT) 
      order by number asc 
      LIMIT $4 OFFSET ($3 - 1) * $4
      `;

    const queryCount = `with allratings as (
        select students.id, students.stgroup, ratings.rating, ratings.semester, students.surname, "vkUserId"
        from students
        inner join ratings on ratings.id = students.id
        where students.is_deleted != TRUE
          and semester = $1
          and stgroup not like CONCAT('%', 'Тест','%')
      )
      select count(*) as total
      from allratings
      where lower(surname) like CONCAT('%', trim(lower($2)),'%')
         or lower(stgroup) like CONCAT('%', trim(lower($2)),'%')
         or CAST(id AS TEXT) LIKE CAST($2 AS TEXT)`;

    // Выполняем оба запроса параллельно
    Promise.all([
      pool.query(queryData, [semester, search, page, limit]),
      pool.query(queryCount, [semester, search]),
    ])
      .then(([dataResult, countResult]) => {
        const data = dataResult.rows;
        const total = parseInt(countResult.rows[0].total, 10);
        resolve({ data, total });
      })
      .catch((error) => reject(error));
  });
}

function getAllRating(semester) {
  return new Promise((resolve, reject) =>
    pool.query(
      `with allratings as (select ROW_number() over (order by ratings.rating desc) as number, students.surname, students.id, students.stgroup, "students.vkUserId", ratings.rating, ratings.semester from students inner join ratings on ratings.id = students.id where students.is_deleted != TRUE and semester = ($1) ) select distinct number, id, stgroup, rating, "vkUserId" from allratings order by number asc`,
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
      `select ROW_number() over (order by ratings.rating desc) as number, students.id, "vkUserId", ratings.rating from ratings inner join students on ratings.id = students.id where students.is_deleted != TRUE and stgroup = ($1) AND semester = ($2) order by rating desc`,
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

function setNotify(vkUserId, notify) {
  return new Promise((resolve, reject) =>
    pool.query(
      `UPDATE "VkUser" SET notify = ($2) WHERE id = ($1)`,
      [vkUserId, notify],
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
  getStudentRatingAndNumberInTheListBySemester,
};
