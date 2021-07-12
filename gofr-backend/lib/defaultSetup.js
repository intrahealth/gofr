/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const axios = require('axios');
const URI = require('urijs');
const async = require('async');
require('./connection');
const config = require('./config');
const logger = require('./winston');
const models = require('./models');
const mixin = require('./mixin')();

function initializeTasks() {
  return new Promise((resolve, reject) => {
    const installed = config.get('app:installed');
    if (installed) {
      return resolve();
    }
    const tasks = [{
      name: 'facility_registry_can_add_facility',
      display: 'Can add new facility registry facility',
    }, {
      name: 'facility_registry_can_add_service',
      display: 'Can add new service',
    }, {
      name: 'facility_registry_can_add_jurisdiction',
      display: 'Can add new facility registry jurisdiction',
    }, {
      name: 'facility_registry_can_add_terminologies',
      display: 'Can add facility registry terminologies',
    }, {
      name: 'facility_registry_can_view_facility',
      display: 'Can view new facility registry facility',
    }, {
      name: 'facility_registry_can_view_service',
      display: 'Can view new service',
    }, {
      name: 'facility_registry_can_view_jurisdiction',
      display: 'Can view new facility registry jurisdiction',
    }, {
      name: 'facility_registry_can_view_terminologies',
      display: 'Can view facility registry terminologies',
    }, {
      name: 'facility_registry_can_view_update_facility_details_requests_report',
      display: 'Can view facility registry requests to update facility details',
    }, {
      name: 'facility_registry_can_view_new_facility_requests_report',
      display: 'Can view facility registry requests to create new facility',
    }, {
      name: 'facility_registry_can_edit_facility',
      display: 'Can edit facility registry facility',
    }, {
      name: 'facility_registry_can_edit_update_facility_details_request',
      display: 'Can edit facility registry request to update facility details',
    }, {
      name: 'facility_registry_can_edit_new_facility_request',
      display: 'Can edit facility registry request to create new facility',
    }, {
      name: 'facility_registry_can_edit_jurisdiction',
      display: 'Can edit facility registry jurisdiction',
    }, {
      name: 'facility_registry_can_edit_service',
      display: 'Can edit facility registry service',
    }, {
      name: 'facility_registry_can_edit_terminologies',
      display: 'Can edit facility registry terminologies',
    }, {
      name: 'facility_registry_can_delete_facility',
      display: 'Can delete new facility registry facility',
    }, {
      name: 'facility_registry_can_delete_service',
      display: 'Can delete new service',
    }, {
      name: 'facility_registry_can_delete_jurisdiction',
      display: 'Can delete new facility registry jurisdiction',
    }, {
      name: 'facility_registry_can_delete_terminologies',
      display: 'Can delete facility registry terminologies',
    }, {
      name: 'facility_registry_can_delete_new_facility_request',
      display: 'Can delete facility registry request to create new facility',
    }, {
      name: 'facility_registry_can_delete_update_facility_details_request',
      display: 'Can delete facility registry request to update facility details',
    }, {
      name: 'facility_registry_can_request_new_facility',
      display: 'Can request addition of new facility',
    }, {
      name: 'facility_registry_can_request_update_of_facility_details',
      display: 'Can request update of facility details',
    }, {
      name: 'facility_registry_can_approve_update_facility_details_requests',
      display: 'Can approve facility registry requests to update facility details',
    }, {
      name: 'facility_registry_can_approve_new_facility_request',
      display: 'Can approve facility registry requests to add new facility',
    }, {
      name: 'facility_registry_can_reject_update_facility_details_requests',
      display: 'Can reject facility registry requests to update facility details',
    }, {
      name: 'facility_registry_can_reject_new_facility_request',
      display: 'Can reject facility registry requests to add new facility',
    }];

    const promises = [];
    for (const task of tasks) {
      promises.push((new Promise((resSave, rejSave) => {
        const taskModel = new models.TasksModel(task);
        taskModel.save((err, data) => {
          if (err) {
            logger.error('An error has occured while adding default tasks');
            return rejSave();
          }
          return resSave();
        });
      })));
    }
    Promise.all(promises).then(() => {
      resolve();
    }).catch(() => {
      reject();
    });
  });
}

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
            const url = URI(config.get('mCSD:url')).segment(config.get('mCSD:registryDB')).toString();
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
            const url = URI(config.get('mCSD:url')).segment(config.get('mCSD:registryDB')).segment(fhir.resourceType).segment(fhir.id)
              .toString();
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
    Promise.all([initializeTasks(), loadFSHFiles()]).then(() => {
      mixin.updateConfigFile(['app', 'installed'], true, () => {
        logger.info('Done loading FSH files');
        resolve();
      });
    }).catch((err) => {
      logger.error('Some errors occured');
      reject(err);
    });
  }),
};
