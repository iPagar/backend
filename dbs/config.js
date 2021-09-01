const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const postgres = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connection URL
const url = process.env.MONGO_URL;

// Database Name
const dbName = process.env.MONGO_DATABASE;

// Use connect method to connect to the server
const mongo = new MongoClient.connect(url, {
  useUnifiedTopology: true,
}).then((client) => {
  const db = client.db(dbName);

  return db;
});

module.exports = { postgres, mongo };
