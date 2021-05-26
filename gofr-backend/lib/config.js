const nconf = require('nconf');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);

nconf.set('DB_HOST', process.env.DB_HOST || 'localhost');
nconf.set('DB_NAME', process.env.DB_NAME || 'GOFR');
nconf.set('DB_USER', process.env.DB_USER || '');
nconf.set('DB_PASSWORD', process.env.DB_PASSWORD || '');
nconf.set('DB_PORT', process.env.DB_PORT || '27017');
nconf.set('REDIS_HOST', process.env.REDIS_HOST || '127.0.0.1');
if (process.env.FHIR_BASE_URL) {
  nconf.set('mCSD:url', process.env.FHIR_BASE_URL);
}
nconf.set('server:port', process.env.GOFR_PORT || nconf.get('server:port'));

module.exports = nconf;
