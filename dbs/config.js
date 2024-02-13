const { Pool } = require("pg");
const { MongoClient } = require("mongodb");

const postgres = new Pool({
  connectionString: process.env.DB_URL,
});

// Connection URL
const url = process.env.MONGO_URL;

// Database Name
const dbName = process.env.MONGO_DATABASE;

// Use connect method to connect to the server
const mongo = new MongoClient(url, {
  useUnifiedTopology: true,
})
  .connect()
  .then((client) => {
    const db = client.db(dbName);

    return db;
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e);

    throw e;
  });

module.exports = { postgres, mongo };
