const nconf = require('nconf');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);

console.log(JSON.stringify(process.env, 0, 2));
console.log(nconf.get("redis:host"));
module.exports = nconf;
