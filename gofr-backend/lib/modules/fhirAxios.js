const axios = require('axios');
const URL = require('url').URL;
const URI = require('urijs');
const Qs = require('qs');
const logger = require('../winston');
const config = require('../config');
const mixin = require('../mixin')();

axios.defaults.paramsSerializer = function (params) {
  if (params instanceof URLSearchParams) {
    return params.toString();
  }
  return Qs.stringify(params, { arrayFormat: 'repeat' });
};

class InvalidRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.response = {
      status: status || 400,
      body: {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'required',
            diagnostics: message,
          },
        ],
      },
    };
  }
}

const fhirAxios = {
  options: { base: undefined, username: undefined, password: undefined },
  baseUrl: undefined,
  configured: false,
  setOptions: (options) => {
    if (fhirAxios.configured) {
      throw new Error('fhirAxios has already been configured!');
    } else {
      options = options || {};
      fhirAxios.options.base = options.base || 'http://localhost:8080/hapi/fhir/';
      fhirAxios.options.username = options.username || '';
      fhirAxios.options.password = options.password || '';
      if (fhirAxios.options.base.slice(-1) !== '/') {
        fhirAxios.options.base += '/';
      }
      fhirAxios.baseUrl = new URL(fhirAxios.options.base);
      fhirAxios.configured = true;
    }
  },
  __genUrl: databasePartition => new Promise((resolve, reject) => {
    let database;
    let partition;
    const source = databasePartition.split(':');
    if (source.length === 2) {
      database = source[0];
      partition = source[1];
    } else if (source.length === 1) {
      partition = source[1];
      url.href.replace(config.get('mCSD:registryDB'), database);
    } else {
      logger.error('Doesnt know how to configure url');
      return reject();
    }
    if (!database) {
      database = config.get('mCSD:basePath');
    } else {
      database += '/fhir';
    }
    if (!partition) {
      partition = 'DEFAULT';
    }
    let url = new URI({
      protocol: config.get('mCSD:protocal').replace(':', ''),
      hostname: config.get('mCSD:host'),
      port: config.get('mCSD:port').toString(),
    });
    url = url.segment(database).segment(partition).toString();
    return resolve(url);
  }),
  __getAuth: () => {
    if (fhirAxios.options.username && fhirAxios.options.password) {
      return { username: fhirAxios.options.username, password: fhirAxios.options.password };
    }
    return {};
  },
  read: (resource, id, vid, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (resource === undefined) {
        reject(new InvalidRequestError('resource must be defined'));
      }
      url = new URL(url);
      url.pathname += resource;
      if (id !== undefined) {
        url.pathname += `/${id}`;
      }
      if (vid !== undefined) {
        url.pathname += `/_history/${vid}`;
      }

      const auth = fhirAxios.__getAuth();
      axios.get(url.href, { auth }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  search: (resource, params, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (resource === undefined) {
        reject(new InvalidRequestError('resource must be defined'));
      }
      url = new URL(url);
      url.pathname += resource;
      const auth = fhirAxios.__getAuth();

      axios.get(url.href, { auth, params, headers: { 'Cache-Control': 'no-cache' } }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  searchLink: url => new Promise((resolve, reject) => {
    const url = new URL(next.url);
    const auth = fhirAxios.__getAuth();

    axios.get(url.href, { auth, params }).then((response) => {
      resolve(response.data);
    }).catch((err) => {
      reject(err);
    });
  }),
  create: (resource, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (resource === undefined) {
        err = new InvalidRequestError('resource must be defined');
        err.response = { status: 404 };
        reject(err);
      }
      url = new URL(url);
      let partitionName;
      if (partition.split(':').length === 2) {
        partitionName = partition.split(':')[1];
      } else if (partition.split(':').length === 1) {
        partitionName = partition;
      }
      if (resource.resourceType !== 'Bundle') {
        url.pathname += resource.resourceType;
        if (['Location', 'Organization'].includes(resource.resourceType)) {
          if (!resource.partOf || (resource.partOf && !resource.partOf.reference)) {
            resource.partOf = {
              reference: `${resource.resourceType}/${mixin.getTopOrgId(partitionName, resource.resourceType)}`,
            };
          }
        }
      } else if (resource.resourceType === 'Bundle') {
        for (const index in resource.entry) {
          const resType = resource.entry[index].resource.resourceType;
          console.log(resType);
          if (!resource.entry[index].resource.partOf && ['Location', 'Organization'].includes(resType)) {
            console.log(resType);
            resource.entry[index].resource.partOf = {
              reference: `${resType}/${mixin.getTopOrgId(partitionName, resType)}`,
            };
          }
          console.error(JSON.stringify(resource, 0, 2));
        }
      } else if (!(resource.type === 'transaction' || resource.type === 'batch')) {
        err = new InvalidRequestError("Bundles must of type 'transaction' or 'batch'");
        err.response = { status: 404 };
        reject(err);
      }
      const auth = fhirAxios.__getAuth();
      axios.post(url.href, resource, { auth }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  delete: (resource, id, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (resource === undefined) {
        reject(new InvalidRequestError('resource must be defined'));
      }
      if (id === undefined) {
        reject(new InvalidRequestError('id must be defined'));
      }
      url = new URL(url);
      url.pathname += `${resource}/${id}`;

      const auth = fhirAxios.__getAuth();
      axios.delete(url.href, { auth }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  update: (resource, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (resource === undefined) {
        reject(new InvalidRequestError('resource must be defined'));
      }
      if (!resource.hasOwnProperty('id') || !resource.id) {
        reject(new InvalidRequestError('resource must have an id field'));
      }
      url = new URL(url);
      url.pathname += `${resource.resourceType}/${resource.id}`;

      const auth = fhirAxios.__getAuth();
      axios.put(url.href, resource, { auth }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  expand: (valueset, params, complete, containsOnly, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      if (!valueset) {
        reject(new InvalidRequestError('valueset must be defined'));
      }
      url = new URL(url);
      url.pathname += `ValueSet/${valueset}/$expand`;

      const auth = fhirAxios.__getAuth();
      axios.get(url.href, { auth, params }).then((response) => {
        if (complete) {
          try {
            const total = response.data.expansion.total;
            let count;
            try {
              count = response.data.expansion.parameter.find(param => param.name === 'count').valueInteger;
            } catch (err) {
              count = total;
            }
            let offset = response.data.expansion.offset || 0;

            if (total > offset + count) {
              offset += count;
              const paging = { count, offset };
              const newparams = { ...params, ...paging };
              fhirAxios.expand(valueset, newparams, complete, containsOnly, partition).then((continued) => {
                if (containsOnly) {
                  resolve(response.data.expansion.contains.concat(continued));
                } else {
                  response.data.expansion.contains = response.data.expansion.contains.concat(continued.expansion.contains);
                  resolve(response.data);
                }
              }).catch((err) => {
                reject(err);
              });
            } else if (containsOnly) {
              resolve(response.data.expansion.contains);
            } else {
              resolve(response.data);
            }
          } catch (err) {
            reject(err);
          }
        } else if (containsOnly) {
          try {
            const total = response.data.expansion.total;
            if (total === response.data.expansion.contains.length) {
              resolve(response.data.expansion.contains);
            } else {
              reject(new InvalidRequestError("Unable to return only the contains element when the full expansion wasn't returned."));
            }
          } catch (err) {
            reject(err);
          }
        } else {
          resolve(response.data);
        }
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
  lookup: (params, partition) => new Promise((resolve, reject) => {
    fhirAxios.__genUrl(partition).then((url) => {
      url = new URL(url);
      url.pathname += 'CodeSystem/$lookup';
      url.searchParams.append('system', params.system);
      url.searchParams.append('code', params.code);

      const auth = fhirAxios.__getAuth();
      axios.get(url.href, { auth }).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  }),
};

// fhirAxios.setOptions({
//   base: URI(config.get('mCSD:url')).segment(config.get('mCSD:registryDB')).toString(),
//   username: config.get('mCSD:username'),
//   password: config.get('mCSD:password'),
// });

module.exports = fhirAxios;
