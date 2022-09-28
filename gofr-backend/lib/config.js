const nconf = require('nconf');
const fhirConfig = require('./modules/fhirConfig');

nconf.argv()
  .env({ separator: '__' })
  .file(`${__dirname}/../config/default.json`);
nconf.set('REDIS_HOST', process.env.REDIS_HOST || '127.0.0.1');

nconf.getBool = key => fhirConfig.checkBoolean(nconf.get(key));

nconf.loadRemote = async () => {
  const fhirAxios = require('./modules/fhirAxios');
  const remoteConfigs = nconf.get('additionalConfig');
  if (remoteConfigs) {
    const configKeys = Object.keys(remoteConfigs);
    const publicKeys = Object.values(nconf.get('keys'));
    for (const conf of configKeys) {
      try {
        const response = await fhirAxios.read('Parameters', remoteConfigs[conf], '', 'DEFAULT');
        const newConfig = fhirConfig.parseRemote(response, publicKeys, nconf.getBool('security:disabled'));
        nconf.add(conf, { type: 'literal', store: newConfig });
      } catch (err) {
        console.error(`Unable to retrieve configuration Parameters ${remoteConfigs[conf]} from FHIR server (${nconf.get('fhir:base')})`);
        console.error(err.message);
        process.exit(1);
      }
    }
  }
};
module.exports = nconf;
