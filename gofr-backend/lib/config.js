const nconf = require('nconf');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);

nconf.set('REDIS_HOST', process.env.REDIS_HOST || '127.0.0.1');
nconf.set('server:port', process.env.GOFR_PORT || nconf.get('server:port'));
module.exports = nconf;
