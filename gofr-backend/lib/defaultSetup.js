/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const axios = require('axios');
const URI = require('urijs');
const async = require('async');
const moment = require('moment');
const config = require('./config');
const logger = require('./winston');
const mixin = require('./mixin');
const fhirAxios = require('./modules/fhirAxios');

const addDataPartition = () => new Promise((resolve, reject) => {
  const installed = config.get('app:installed');
  if (installed) {
    return resolve();
  }
  const bundle = {
    resourceType: 'Bundle',
    type: 'batch',
    entry: [{
      resource: {
        resourceType: 'Basic',
        id: 'default-partition',
        meta: {
          profile: ['http://gofr.org/fhir/StructureDefinition/gofr-partition'],
        },
        extension: [{
          url: 'http://gofr.org/fhir/StructureDefinition/partitionID',
          valueInteger: 0,
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/name',
          valueString: 'DEFAULT',
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/owner',
          extension: [{
            url: 'userID',
            valueReference: {
              reference: 'Person/e9b41c35-7c85-46df-aeea-a4e8dbf0364e',
            },
          }],
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/shared',
          extension: [{
            url: 'shareToSameOrgid',
            valueBoolean: false,
          }, {
            url: 'http://gofr.org/fhir/StructureDefinition/shareToAll',
            extension: [{
              url: 'activated',
              valueBoolean: true,
            }, {
              url: 'limitByUserLocation',
              valueBoolean: false,
            }],
          }],
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/createdTime',
          valueDateTime: moment().format(),
        }],
      },
      request: {
        method: 'PUT',
        url: 'Basic/default-partition',
      },
    }, {
      resource: {
        resourceType: 'Basic',
        id: 'default-datasource',
        meta: {
          profile: ['http://gofr.org/fhir/StructureDefinition/gofr-datasource'],
        },
        extension: [{
          url: 'http://gofr.org/fhir/StructureDefinition/partition',
          valueReference: {
            reference: 'Basic/default-partition',
          },
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/name',
          valueString: 'DEFAULT',
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/sourceType',
          valueString: 'upload',
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/source',
          valueString: 'upload',
        }],
      },
      request: {
        method: 'PUT',
        url: 'Basic/default-datasource',
      },
    }],
  };
  fhirAxios.create(bundle, 'DEFAULT').then((response) => {
    resolve();
  }).catch((err) => {
    logger.error(err);
    reject();
  });
});

const loadDefaultConfig = () => new Promise((resolve, reject) => {
  const installed = config.get('app:installed');
  if (installed) {
    return resolve();
  }
  const resource = {
    resourceType: 'Parameters',
    id: 'gofr-general-config',
    parameter: [{
      name: 'config',
      valueString: '{}',
    }],
  };
  fhirAxios.update(resource, 'DEFAULT').then(() => {
    logger.info('General Config Saved');
    return resolve();
  }).catch((err) => {
    logger.error(err);
    reject();
  });
});

const loadFSHFiles = () => new Promise(async (resolvePar, rejectPar) => {
  const installed = config.get('app:installed');
  if (installed) {
    return resolvePar();
  }
  const fshDir = config.get('builtFSHFIles');
  const dirs = await fs.readdirSync(`${__dirname}/${fshDir}`);
  async.eachSeries(dirs, (dir, nxtDir) => {
    fs.readdir(`${__dirname}/${fshDir}/${dir}`, (err, files) => {
      async.eachSeries(files, (file, nxtFile) => {
        fs.readFile(`${__dirname}/${fshDir}/${dir}/${file}`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
          if (err) throw err;
          const fhir = JSON.parse(data);
          if (fhir.resourceType === 'Bundle'
              && (fhir.type === 'transaction' || fhir.type === 'batch')) {
            logger.info(`Saving ${fhir.type}`);
            const url = fhirAxios.__genUrl('DEFAULT');
            axios.post(url, fhir).then((res) => {
              logger.info(`${url}: ${res.status}`);
              logger.info(JSON.stringify(res.data, null, 2));
              return nxtFile();
            }).catch((err) => {
              logger.error(err);
              logger.error(`${__dirname}/${fshDir}/${dir}/${file} ${JSON.stringify(err.response.data, null, 2)}`);
              return nxtFile();
            });
          } else {
            logger.info(`Saving ${fhir.resourceType} - ${fhir.id}`);
            const url = new URI(fhirAxios.__genUrl('DEFAULT')).segment(fhir.resourceType).segment(fhir.id).toString();
            axios.put(url, fhir).then((res) => {
              logger.info(`${url}: ${res.status}`);
              logger.info(res.headers['content-location']);
              return nxtFile();
            }).catch((err) => {
              logger.error(err);
              logger.error(`${__dirname}/${fshDir}/${dir}/${file} ${JSON.stringify(err.response.data, null, 2)}`);
              return nxtFile();
            });
          }
        });
      }, () => nxtDir());
    });
  }, () => {
    logger.info('Done loading FSH files');
    resolvePar();
  });
});

module.exports = {
  initialize: () => new Promise((resolve, reject) => {
    async.series([
      (callback) => {
        Promise.all([loadDefaultConfig(), loadFSHFiles()]).then(() => callback(null)).catch((err) => {
          logger.error(err);
          return callback(err);
        });
      },
      (callback) => {
        addDataPartition().then(() => callback(null)).catch((err) => {
          logger.error(err);
          return callback(err);
        });
      },
    ], (err) => {
      if (err) {
        return reject();
      }
      mixin.updateConfigFile(['app', 'installed'], true, () => {
        logger.info('Done loading FSH files');
        return resolve();
      });
    });
  }),
};
