const { Pool, escapeLiteral } = require("pg");
const config = require('../config');

const pool = new Pool({
  database: config.get('database:dbname'),
  user: config.get('database:username'),
  password: config.get('database:password'),
  port: config.get('database:port'),
  host: config.get('database:host')
});
module.exports = { pool, escapeLiteral };