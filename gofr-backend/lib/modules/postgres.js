const { Pool, escapeLiteral } = require("pg");

const pool = new Pool({
  database: "gofr",
  user: "hapi",
  password: "hapi",
  port: 5432,
  host: "localhost",
});

module.exports = { pool, escapeLiteral };