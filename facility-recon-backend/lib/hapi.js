/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
const axios = require('axios');
const URI = require('urijs');
const logger = require('./winston');
const config = require('./config');

function getAvailableId() {
  return new Promise((resolve, reject) => {
    const defaultDB = config.getConf('mCSD:registryDB');
    const url = URI(config.getConf('mCSD:url'))
      .segment(defaultDB)
      .segment('Parameters')
      .segment('21c5d62b-e8bc-44fe-a240-f1e07e81d0e1')
      .toString();
    const options = {
      baseURL: url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
      withCredentials: true,
      auth: {
        username: config.getConf('mCSD:username'),
        password: config.getConf('mCSD:password'),
      },
    };
    axios(options).then((response) => {
      if (response.statusCode === 404) {
        return resolve(102);
      }
      const tenPar = response.data.parameter.find(param => param.name === 'tenancies');
      if (!tenPar) {
        return resolve(102);
      }
      let tenancies = Buffer.from(tenPar.valueBase64Binary, 'base64').toString('ascii');
      try {
        tenancies = JSON.parse(tenancies);
      } catch (error) {
        logger.error(error);
        return reject(error);
      }
      tenancies.sort((a, b) => a.id - b.id);
      let id = 100;
      for (const tenancy of tenancies) {
        if (tenancy.id == id) {
          id++;
        } else {
          break;
        }
      }
      resolve(id);
    }).catch((err) => {
      if (err.response && (err.response.status === 404 || err.response.status === 410)) {
        return resolve(102);
      }
      reject(err);
    });
  });
}
function saveTenancyId(name, id) {
  return new Promise((resolve, reject) => {
    const defaultDB = config.getConf('mCSD:registryDB');
    const url = URI(config.getConf('mCSD:url'))
      .segment(defaultDB)
      .segment('Parameters')
      .segment('21c5d62b-e8bc-44fe-a240-f1e07e81d0e1')
      .toString();
    const options = {
      baseURL: url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
      withCredentials: true,
      auth: {
        username: config.getConf('mCSD:username'),
        password: config.getConf('mCSD:password'),
      },
    };
    let parameterResource;
    const populateParam = new Promise((res, rej) => {
      axios(options).then((response) => {
        for (const index in response.data.parameter) {
          const param = response.data.parameter[index];
          if (param.name === 'tenancies') {
            let tenancies = Buffer.from(param.valueBase64Binary, 'base64').toString('ascii');
            try {
              tenancies = JSON.parse(tenancies);
            } catch (error) {
              logger.error(error);
              return reject(error);
            }
            let exist = tenancies.find((ten) => {
              return ten.id === id
            })
            if(!exist) {
              tenancies.push({ name, id });
            }
            response.data.parameter[index].valueBase64Binary = Buffer.from(JSON.stringify(tenancies)).toString('base64');
            parameterResource = response.data;
            break;
          }
        }
        return res();
      }).catch((err) => {
        if (err.response && (err.response.status === 404 || err.response.status === 410)) {
          parameterResource = {
            resourceType: 'Parameters',
            id: '21c5d62b-e8bc-44fe-a240-f1e07e81d0e1',
            parameter: [{
              name: 'tenancies',
              valueBase64Binary: Buffer.from(JSON.stringify([{ name, id }])).toString('base64'),
            }],
          };
          return res();
        }
        return rej(err);
      });
    });

    populateParam.then(() => {
      if (!parameterResource) {
        return reject(new Error('un expected error has occured'));
      }
      const bundle = {
        resourceType: 'Bundle',
        type: 'batch',
        entry: [{
          resource: parameterResource,
          request: {
            method: 'PUT',
            url: `Parameters/${parameterResource.id}`,
          },
        }],
      };
      const url = URI(config.getConf('mCSD:url'))
        .segment(defaultDB)
        .toString();
      const options = {
        baseURL: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        auth: {
          username: config.getConf('mCSD:username'),
          password: config.getConf('mCSD:password'),
        },
        data: bundle,
      };
      axios(options).then(() => resolve()).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}
function deleteTenancyId(id) {
  return new Promise((resolve, reject) => {
    const defaultDB = config.getConf('mCSD:registryDB');
    const url = URI(config.getConf('mCSD:url'))
      .segment(defaultDB)
      .segment('Parameters')
      .segment('21c5d62b-e8bc-44fe-a240-f1e07e81d0e1')
      .toString();
    const options = {
      baseURL: url,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
      withCredentials: true,
      auth: {
        username: config.getConf('mCSD:username'),
        password: config.getConf('mCSD:password'),
      },
    };
    axios(options).then((response) => {
      let parameterResource;
      for (const index in response.data.parameter) {
        const param = response.data.parameter[index];
        if (param.name === 'tenancies') {
          let tenancies = Buffer.from(param.valueBase64Binary, 'base64').toString('ascii');
          try {
            tenancies = JSON.parse(tenancies);
          } catch (error) {
            logger.error(error);
            return reject(error);
          }
          const tenInd = tenancies.findIndex(ten => ten.id === id);
          if (tenInd !== -1) {
            tenancies.splice(tenInd, 1);
          }
          response.data.parameter[index].valueBase64Binary = Buffer.from(JSON.stringify(tenancies)).toString('base64');
          parameterResource = response.data;
          break;
        }
      }
      if (!parameterResource) {
        return reject(new Error('Un expected error has occured'));
      }
      const bundle = {
        resourceType: 'Bundle',
        type: 'batch',
        entry: [{
          resource: parameterResource,
          request: {
            method: 'PUT',
            url: `Parameters/${parameterResource.id}`,
          },
        }],
      };
      const url = URI(config.getConf('mCSD:url'))
        .segment(defaultDB)
        .toString();
      const options = {
        baseURL: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        auth: {
          username: config.getConf('mCSD:username'),
          password: config.getConf('mCSD:password'),
        },
        data: bundle,
      };
      axios(options).then(() => resolve()).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}
function addTenancy({ id, name, description }) {
  return new Promise((resolve, reject) => {
    logger.info(`Adding tenancy with name ${name}`);
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

      const url = URI(config.getConf('mCSD:url'))
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
          username: config.getConf('mCSD:username'),
          password: config.getConf('mCSD:password'),
        },
        data: parameters,
      };
      axios(options).then(() => {
        logger.info(`Tenancy with name ${name} added successfully`);
        saveTenancyId(name, id).then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  });
}

function deleteTenancy({ id, name }) {
  return new Promise((resolve, reject) => {
    logger.info(`Deleting tenancy with id ${id}`);
    if (!id && !name) {
      return reject(new Error('Neither tenany id nor name was given'));
    }

    const getTenId = new Promise((res, rej) => {
      if (id) {
        return res();
      }
      const defaultDB = config.getConf('mCSD:registryDB');
      const url = URI(config.getConf('mCSD:url'))
        .segment(defaultDB)
        .segment('Parameters')
        .segment('21c5d62b-e8bc-44fe-a240-f1e07e81d0e1')
        .toString();
      const options = {
        baseURL: url,
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
        withCredentials: true,
        auth: {
          username: config.getConf('mCSD:username'),
          password: config.getConf('mCSD:password'),
        },
      };
      axios(options).then((response) => {
        const tenPar = response.data.parameter.find(param => param.name === 'tenancies');
        if (!tenPar) {
          return rej();
        }
        let tenancies = Buffer.from(tenPar.valueBase64Binary, 'base64').toString('ascii');
        try {
          tenancies = JSON.parse(tenancies);
        } catch (error) {
          logger.error(error);
          return rej(error);
        }
        const tenancy = tenancies.find(ten => ten.name === name);
        if (tenancy) {
          id = tenancy.id;
        }
        return res();
      }).catch((err) => {
        if (err.response) {
          logger.error(err.response.data);
          logger.error(err.response.status);
          logger.error(err.response.headers);
        } else if (error.request) {
          logger.error(err.request);
        } else {
          logger.error('Error', err.message);
        }
        return rej();
      });
    });

    getTenId.then(() => {
      const parameters = {
        resourceType: 'Parameters',
        parameter: [{
          name: 'id',
          valueInteger: id,
        }],
      };

      const url = URI(config.getConf('mCSD:url'))
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
          username: config.getConf('mCSD:username'),
          password: config.getConf('mCSD:password'),
        },
        data: parameters,
      };
      axios(options).then(() => {
        deleteTenancyId(id).then(() => {
          logger.info(`Tenancy with id ${id} deleted successfully`);
          return resolve();
        }).catch((err) => {
          logger.error(err);
          return reject(err);
        });
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

module.exports = {
  addTenancy,
  deleteTenancy,
};

// deleteTenancy({id:102})
// addTenancy({
//   name: 'dfsddfd',
//   description: 'Requests Database',
// }).catch(() => {
//   logger.error();
// });
// deleteTenancy({id:106}).catch((err) => {
//   logger.error(err)
// })
