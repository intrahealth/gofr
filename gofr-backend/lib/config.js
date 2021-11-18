const nconf = require('nconf');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);

module.exports = nconf;
