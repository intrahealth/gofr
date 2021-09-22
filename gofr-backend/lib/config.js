const nconf = require('nconf');

nconf.argv()
  .env({ separator: ':' })
  .file(`${__dirname}/../config/default.json`);

nconf.set('REDIS_HOST', process.env.REDIS_HOST || '127.0.0.1');
if (process.env.FHIR_BASE_URL) {
  nconf.set('mCSD:url', process.env.FHIR_BASE_URL);
}
nconf.set('server:port', process.env.GOFR_PORT || nconf.get('server:port'));

module.exports = nconf;
