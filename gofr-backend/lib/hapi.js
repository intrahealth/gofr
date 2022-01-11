/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
const axios = require('axios');
const URI = require('urijs');
const moment = require('moment');
const logger = require('./winston');
const config = require('./config');
const fhirAxios = require('./modules/fhirAxios');

function getAvailableId() {
  return new Promise((resolve, reject) => {
    const searchParams = {
      _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
    };
    fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((partitions) => {
      const partitionIDs = [];
      for (const partition of partitions.entry) {
        const idExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
        if (idExt) {
          partitionIDs.push(idExt.valueInteger);
        }
      }
      partitionIDs.sort((a, b) => a - b);
      let id = 100;
      if (partitionIDs.length > 0) {
        id = partitionIDs[0];
      }
      for (const partitionID of partitionIDs) {
        if (partitionID == id) {
          id++;
        } else {
          break;
        }
      }
      resolve(id);
    }).catch((err) => {
      reject(err);
    });
  });
}

function addPartition({
  id, name, description, userID,
}) {
  return new Promise((resolve, reject) => {
    logger.info(`Adding partition with name ${name}`);
    const properId = new Promise((res, rej) => {
      if (id) {
        return res();
      }
      getAvailableId().then((newId) => {
        id = newId;
        return res();
      }).catch(err => rej(err));
    });
    properId.then(() => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [{
          name: 'id',
          valueInteger: id,
        }, {
          name: 'name',
          valueCode: name,
        }],
      };
      if (description) {
        parameters.parameter.push({
          name: 'description',
          valueString: description,
        });
      }

      let url = fhirAxios.__genUrl();
      url = URI(url)
        .segment('Parameters')
        .segment('$partition-management-create-partition')
        .toString();
      const options = {
        baseURL: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        auth: {
          username: config.get('mCSD:username'),
          password: config.get('mCSD:password'),
        },
        data: parameters,
      };
      axios(options).then(() => {
        const resource = {
          resourceType: 'Basic',
          meta: {
            profile: ['http://gofr.org/fhir/StructureDefinition/gofr-partition'],
          },
          extension: [{
            url: 'http://gofr.org/fhir/StructureDefinition/partition',
            extension: [{
              url: 'http://gofr.org/fhir/StructureDefinition/partitionID',
              valueInteger: id,
            }, {
              url: 'http://gofr.org/fhir/StructureDefinition/name',
              valueString: name,
            }, {
              url: 'http://gofr.org/fhir/StructureDefinition/owner',
              extension: [{
                url: 'userID',
                valueReference: {
                  reference: `Person/${userID}`,
                },
              }],
            }, {
              url: 'http://gofr.org/fhir/StructureDefinition/createdTime',
              valueDateTime: moment().format(),
            }],
          }],
        };
        fhirAxios.create(resource, 'DEFAULT').then((response) => {
          logger.info(`Partition with name ${name} added successfully`);
          return resolve(`Basic/${response.id}`);
        }).catch((err) => {
          logger.error('Failed to add partition into data sources');
          logger.error(err);
          return reject(err);
        });
      }).catch((err) => {
        logger.error('Failed to create partition');
        logger.error(err);
        reject(err);
      });
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  });
}

/**
 *
 * @param {resourcePartitionID} param0 resource id of the partition i.e Basic/123
 * @param {partitionID} param1 hapi partition id
 * @returns
 */
function deletePartition({ resourcePartitionID, partitionID }) {
  return new Promise((resolve, reject) => {
    logger.info('Deleting partition');
    if (!resourcePartitionID && !partitionID) {
      return reject(new Error('Partition id was not given'));
    }
    const getPartitionID = new Promise((resolve, reject) => {
      if (partitionID) {
        return resolve();
      }
      fhirAxios.read('Basic', resourcePartitionID.split('/')[1], '', 'DEFAULT').then((partition) => {
        const partIdExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
        if (partIdExt) {
          partitionID = partIdExt.valueInteger;
        } else {
          return reject();
        }
        return resolve();
      }).catch((err) => {
        logger.error(err);
        return reject(err);
      });
    });

    getPartitionID.then(() => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [{
          name: 'id',
          valueInteger: partitionID,
        }],
      };
      let url = fhirAxios.__genUrl();
      url = URI(url)
        .segment('Parameters')
        .segment('$partition-management-delete-partition')
        .toString();
      const options = {
        baseURL: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        auth: {
          username: config.get('mCSD:username'),
          password: config.get('mCSD:password'),
        },
        data: parameters,
      };
      axios(options).then(() => {
        const params = {
          partitionid: partitionID,
        };
        fhirAxios.delete('Basic', params, 'DEFAULT').then(() => {
          logger.info(`Partition with id ${partitionID} deleted successfully`);
          return resolve();
        }).catch((err) => {
          logger.error(err);
          return reject(err);
        });
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    }).catch(() => reject());
  });
}

module.exports = {
  addPartition,
  deletePartition,
};

// deletePartition({id:102})
// addPartition({
//   name: 'Mlw8607d293f5f8ce74ef85ec40f',
//   description: 'Requests Database',
// }).catch(() => {
//   logger.error();
// });
// deletePartition({id:106}).catch((err) => {
//   logger.error(err)
// })
