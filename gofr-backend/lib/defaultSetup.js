/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const axios = require('axios');
const URI = require('urijs');
require('./connection');
const config = require('./config');
const logger = require('./winston');
const models = require('./models');
const mixin = require('./mixin')();

function initializeTasks() {
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

  for (const task of tasks) {
    const taskModel = new models.TasksModel(task);
    taskModel.save((err, data) => {
      if (err) {
        logger.error('An error has occured while adding default tasks');
      }
    });
  }
}

const loadFSHFiles = async () => {
  // const installed = config.get('app:installed');
  // if (installed) {
  //   return;
  // }
  const fshDir = config.get('builtFSHFIles');
  const dirs = await fs.readdirSync(`${__dirname}/${fshDir}`);
  const dirPromises = [];
  const filesPromises = [];
  for (const dir of dirs) {
    dirPromises.push(new Promise(async (resolve, reject) => {
      const files = await fs.readdirSync(`${__dirname}/${fshDir}/${dir}`);
      for (const file of files) {
        filesPromises.push(new Promise((resolve, reject) => {
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
                resolve();
              }).catch((err) => {
                logger.error(err);
                reject();
              });
            } else {
              logger.info(`Saving ${fhir.resourceType} - ${fhir.id}`);
              const url = URI(config.get('mCSD:url')).segment(config.get('mCSD:registryDB')).segment(fhir.resourceType).segment(fhir.id)
                .toString();
              axios.put(url, fhir).then((res) => {
                logger.info(`${url}: ${res.status}`);
                logger.info(res.headers['content-location']);
                resolve();
              }).catch((err) => {
                logger.error(err);
                logger.error(JSON.stringify(err.response.data, null, 2));
                reject();
              });
            }
          });
        }));
      }
      Promise.all(filesPromises).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    }));
  }
  Promise.all(dirPromises).then(() => {
    logger.info('Done loading FSH files');
    // mixin.updateConfigFile(['app', 'installed'], true, () => {
    //   logger.info('Done loading FSH files');
    // });
  }).catch(() => {
    logger.error('Done loading FSH files with errors');
  });
};

module.exports = {
  initialize: () => {
    initializeTasks();
    loadFSHFiles();
  },
};
