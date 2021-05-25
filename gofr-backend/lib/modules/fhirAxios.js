const axios = require('axios');
const URL = require('url').URL;
const URI = require('urijs');
const Qs = require('qs');
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
  __getAuth: () => {
    if (fhirAxios.options.username && fhirAxios.options.password) {
      return { username: fhirAxios.options.username, password: fhirAxios.options.password };
    }
    return {};
  },
  read: (resource, id, vid) => new Promise((resolve, reject) => {
    if (resource === undefined) {
      reject(new InvalidRequestError('resource must be defined'));
    }
    const url = new URL(fhirAxios.baseUrl.href);
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
  }),
  search: (resource, params) => new Promise((resolve, reject) => {
    if (resource === undefined) {
      reject(new InvalidRequestError('resource must be defined'));
    }
    const url = new URL(fhirAxios.baseUrl.href);
    url.pathname += resource;
    const auth = fhirAxios.__getAuth();

    // axios.get( url.href, { auth, params } ).then( (response) => {
    axios.get(url.href, { auth, params, headers: { 'Cache-Control': 'no-cache' } }).then((response) => {
      resolve(response.data);
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
  create: (resource, database) => new Promise((resolve, reject) => {
    console.error(resource);
    if (resource === undefined) {
      err = new InvalidRequestError('resource must be defined');
      err.response = { status: 404 };
      reject(err);
    }
    const url = new URL(fhirAxios.baseUrl.href);
    let topOrgId;
    if (!database) {
      topOrgId = mixin.getTopOrgId(config.get('mCSD:registryDB'));
    } else {
      url.href.replace(config.get('mCSD:registryDB'), database);
      topOrgId = mixin.getTopOrgId(database);
    }
    if (resource.resourceType !== 'Bundle') {
      url.pathname += resource.resourceType;
      if (resource.resourceType === 'Location') {
        if (!resource.partOf || (resource.partOf && !resource.partOf.reference)) {
          resource.partOf = {
            reference: `Location/${topOrgId}`,
          };
        }
      }
    } else if (!(resource.type === 'transaction' || resource.type === 'batch')) {
      err = new InvalidRequestError("Bundles must of type 'transaction' or 'batch'");
      err.response = { status: 404 };
      reject(err);
    }

    const auth = fhirAxios.__getAuth();
    console.log(url.href);
    axios.post(url.href, resource, { auth }).then((response) => {
      resolve(response.data);
    }).catch((err) => {
      reject(err);
    });
  }),
  delete: (resource, id) => new Promise((resolve, reject) => {
    if (resource === undefined) {
      reject(new InvalidRequestError('resource must be defined'));
    }
    if (id === undefined) {
      reject(new InvalidRequestError('id must be defined'));
    }
    const url = new URL(fhirAxios.baseUrl.href);
    url.pathname += `${resource}/${id}`;

    const auth = fhirAxios.__getAuth();
    axios.delete(url.href, { auth }).then((response) => {
      resolve(response.data);
    }).catch((err) => {
      reject(err);
    });
  }),
  update: resource => new Promise((resolve, reject) => {
    if (resource === undefined) {
      reject(new InvalidRequestError('resource must be defined'));
    }
    if (!resource.hasOwnProperty('id') || !resource.id) {
      reject(new InvalidRequestError('resource must have an id field'));
    }
    const url = new URL(fhirAxios.baseUrl.href);
    url.pathname += `${resource.resourceType}/${resource.id}`;

    const auth = fhirAxios.__getAuth();
    axios.put(url.href, resource, { auth }).then((response) => {
      resolve(response.data);
    }).catch((err) => {
      reject(err);
    });
  }),
  expand: (valueset, params, complete, containsOnly) => new Promise((resolve, reject) => {
    if (!valueset) {
      reject(new InvalidRequestError('valueset must be defined'));
    }
    const url = new URL(fhirAxios.baseUrl.href);
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
            fhirAxios.expand(valueset, newparams, complete, containsOnly).then((continued) => {
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
  }),
  lookup: params => new Promise((resolve, reject) => {
    const url = new URL(fhirAxios.baseUrl.href);
    url.pathname += 'CodeSystem/$lookup';
    url.searchParams.append('system', params.system);
    url.searchParams.append('code', params.code);

    const auth = fhirAxios.__getAuth();
    axios.get(url.href, { auth }).then((response) => {
      resolve(response.data);
    }).catch((err) => {
      reject(err);
    });
  }),
};

fhirAxios.setOptions({
  base: URI(config.get('mCSD:url')).segment(config.get('mCSD:registryDB')).toString(),
  username: config.get('mCSD:username'),
  password: config.get('mCSD:password'),
});

module.exports = fhirAxios;
