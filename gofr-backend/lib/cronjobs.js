/* eslint-disable no-underscore-dangle */
const cron = require('node-cron');
const async = require('async');
const uuid4 = require('uuid/v4');
const mixin = require('./mixin');
const config = require('./config');
const dhis = require('./dhis');
const fhir = require('./fhir');
const logger = require('./winston');
const fhirAxios = require('./modules/fhirAxios');

const topOrgName = config.get('mCSD:fakeOrgName');

function getCrontime(callback) {
  return
  fhirAxios.read('Parameters', 'gofr-general-config', '', 'DEFAULT').then((response) => {
    const resData = response.parameter.find(param => param.name === 'config');
    const adminConfig = JSON.parse(resData.valueString);
    if (adminConfig.datasetsAutosyncTime) {
      return callback(adminConfig.datasetsAutosyncTime);
    }
    callback();
  });
}

getCrontime((time) => {
  if (!time) {
    time = '*/15 * * * *';
  }
  cron.schedule(time, () => {
    logger.info('Running cronjob for auto data source sync');
    fhirAxios.searchAll('Basic', { sourceType: 'DHIS2,FHIR', _include: 'Basic:datasourcepartition' }, 'DEFAULT').then((response) => {
      const partsRes = response.entry && response.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const sourcesRes = response.entry && response.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource'));
      async.eachSeries(sourcesRes, (entry, nxtDtSrc) => {
        const autoSync = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/autoSync');
        const source = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source');
        if (autoSync && autoSync.valueBoolean && source && source.valueString === 'syncServer') {
          const partitionRef = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
          if (!partitionRef) {
            return nxtDtSrc();
          }
          const partRes = partsRes.find(part => part.resource.id === partitionRef.valueReference.reference.split('/')[1]);
          const name = partRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/name');
          const host = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/host');
          const sourceType = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/sourceType');
          let username = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/username');
          let password = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/password');
          if (password) {
            password = mixin.decrypt(password.valueString);
          }
          if (username) {
            username = username.valueString;
          }
          const clientId = uuid4();
          if (sourceType.valueString === 'DHIS2') {
            dhis.sync(
              host.valueString,
              username,
              password,
              name.valueString,
              clientId,
              topOrgName,
              false,
              false,
              false,
              false,
            );
          } else if (sourceType.valueString === 'FHIR') {
            fhir.sync(
              entry.resource.id,
              host.valueString,
              username,
              password,
              'update',
              name.valueString,
              clientId,
              topOrgName,
            );
          }
        } else {
          return nxtDtSrc();
        }
      }, () => {
        logger.info('Done running cronjob for auto data source sync');
      });
    });
  });
});
