const nconf = require('nconf');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);
nconf.set('REDIS_HOST', process.env.REDIS_HOST || '127.0.0.1');

module.exports = nconf;
