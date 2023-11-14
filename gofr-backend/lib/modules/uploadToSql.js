const { pool, escapeLiteral } = require("./postgres");
const logger = require('../winston');

module.exports = {
  createTable: (table) => {
    console.log(`create table if not exists ${table}(id TEXT PRIMARY KEY, code TEXT, otherid TEXT, tag TEXT, name TEXT, latitude double precision, longitude double precision, parent TEXT REFERENCES ${table}(id) )`);
    return pool.query(`create table if not exists ${table}(id TEXT PRIMARY KEY, code TEXT, otherid TEXT, tag TEXT, name TEXT, latitude double precision, longitude double precision, parent TEXT REFERENCES ${table}(id) )`)
  },
  dropTable: (table) => {
    return pool.query(`drop table ${table}`)
  },
  buildSQL: (values, queries, table) => {
    let fields = ['uuid', 'id', 'code', 'name', 'lat', 'long', 'parentUUID']
    for(let field of fields) {
      if(!values[field]) {
        if(field === "lat" || field == "long" || field === "parentUUID") {
          values[field] = null
        } else {
          values[field] = ""
        }
      }
    }
    if(values.parentUUID) {
      values.parentUUID = `'${values.parentUUID}'`
    }
    if(values.code && !Array.isArray(values.code)) {
      values.code = [values.code]
    } else if(!values.code) {
      values.code = []
    }
    if(values.id && !Array.isArray(values.id)) {
      values.id = [values.id]
    } else if(!values.id) {
      values.id = []
    }
    values.id = JSON.stringify(values.id)
    values.code = JSON.stringify(values.code)
    let query = `insert into ${table} (id, code, otherid, name, latitude, longitude, parent) values ('${values.uuid}', '${values.code}', '${values.id}', ${escapeLiteral(values.name)}, ${values.lat}, ${values.long}, ${values.parentUUID})`
    queries.push(query)
  },
  saveSQL: (queries) => {
    return new Promise(async(resolve) => {
      for(let qr of queries) {
        await pool.query(qr).catch((err) => {
          logger.error(err);
        })
      }
      return resolve()
    })
  }
}