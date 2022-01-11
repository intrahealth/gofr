/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const exec = require('child_process').exec;
const axios = require('axios');
const URI = require('urijs');
const async = require('async');
const moment = require('moment');
const config = require('./config');
const logger = require('./winston');
const mixin = require('./mixin');
const fhirAxios = require('./modules/fhirAxios');

const loadKeycloakData = () => new Promise((resolve, reject) => {
  const installed = config.get('app:installed');
  const idp = config.get('app:idp');
  if (installed || idp !== 'keycloak') {
    return resolve();
  }

  let keycloakInstalledLocation = config.get('keycloak:installedLocation');
  const last = keycloakInstalledLocation.slice(-1);
  if (last !== '/') {
    keycloakInstalledLocation += '/';
  }
  const kcadm = `${keycloakInstalledLocation}bin/kcadm.sh`;
  const keycloakBase = config.get('keycloak:baseURL');
  const adminUser = config.get('keycloak:adminUser');
  const adminPassword = config.get('keycloak:adminPassword');
  async.parallel({
    realm: (callback) => {
      exec(`sh ${kcadm} config credentials --server ${keycloakBase} --realm master --user ${adminUser} --password ${adminPassword}`, (err, stdout, stderr) => {
        if (err) {
          return callback(err);
        }
        if (stdout) {
          logger.info(stdout);
        }
        if (stderr) {
          logger.info(stderr);
        }

        exec(`sh ${kcadm} create realms -f ${__dirname}/../../resources/keycloak/realm.json`, (err, stdout, stderr) => {
          if (err) {
            return callback(err);
          }
          if (stdout) {
            logger.info(stdout);
          }
          if (stderr) {
            logger.info(stderr);
          }
          return callback();
        });
      });
    },
    theme: (callback) => {
      exec(`cp -r ${__dirname}/../../resources/keycloak/themes/gofr ${keycloakInstalledLocation}themes`, (err, stdout, stderr) => {
        if (err) {
          return callback(err);
        }
        if (stdout) {
          logger.info(stdout);
        }
        if (stderr) {
          logger.info(stderr);
        }
        return callback();
      });
    },
  }, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

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
          url: 'http://gofr.org/fhir/StructureDefinition/partition',
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
          url: 'http://gofr.org/fhir/StructureDefinition/datasource',
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
  const promises = [];
  dirs.forEach((dir) => {
    promises.push(new Promise(async (resolve, reject) => {
      let files = [];
      if (dir.split('.').length >= 2 && dir.split('.')[dir.split('.').length - 1] === 'json') {
        files.push(dir);
        dir = null;
      } else {
        try {
          files = await fs.readdirSync(`${__dirname}/${fshDir}/${dir}`);
        } catch (error) {
          logger.error(error);
          return reject();
        }
      }
      let errorOccured = false;
      async.eachSeries(files, (file, nxtFile) => {
        let fullpath;
        if (dir) {
          fullpath = `${__dirname}/${fshDir}/${dir}/${file}`;
        } else {
          fullpath = `${__dirname}/${fshDir}/${file}`;
        }
        fs.readFile(fullpath, { encoding: 'utf8', flag: 'r' }, (err, data) => {
          if (err) {
            logger.error(err);
            errorOccured = true;
          }
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
              errorOccured = true;
              logger.error(err);
              logger.error(`fullpath ${JSON.stringify(err.response.data, null, 2)}`);
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
              errorOccured = true;
              logger.error(err);
              logger.error(`fullpath ${JSON.stringify(err.response.data, null, 2)}`);
              return nxtFile();
            });
          }
        });
      }, () => {
        if (errorOccured) {
          return reject();
        }
        return resolve();
      });
    }));
  });

  Promise.all(promises).then(() => {
    logger.info('Done loading FSH files');
    resolvePar();
  }).catch(() => {
    logger.error('reject');
    rejectPar(true);
  });
});

module.exports = {
  initialize: () => new Promise((resolve, reject) => {
    let errorOccured = false;
    async.series([
      (callback) => {
        loadKeycloakData().then(() => callback(null)).catch((err) => {
          errorOccured = true;
          logger.error(err);
          return callback(null);
        });
      },
      (callback) => {
        Promise.all([loadDefaultConfig(), loadFSHFiles()]).then(() => {
          const idp = config.get('app:idp');
          if (idp === 'keycloak') {
            const kcadmin = require('./modules/keycloakAdminClient');
            setTimeout(() => {
              kcadmin.loadTasksToKeycloak().then(() => callback(null)).catch((err) => {
                errorOccured = true;
                logger.error(err);
                return callback(null);
              });
            }, 1000);
          } else {
            return callback(null);
          }
        }).catch((err) => {
          errorOccured = true;
          logger.error(err);
          return callback(null);
        });
      },
      (callback) => {
        addDataPartition().then(() => callback(null)).catch((err) => {
          errorOccured = true;
          logger.error(err);
          return callback(null);
        });
      },
    ], () => {
      if (errorOccured) {
        return reject();
      }
      mixin.updateConfigFile(['app', 'installed'], true, () => {
        logger.info('Done loading Default data');
        return resolve();
      });
    });
  }),
};
