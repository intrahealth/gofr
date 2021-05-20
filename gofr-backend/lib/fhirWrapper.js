const request = require('request');
const URI = require('urijs');
const async = require('async');
const isJSON = require('is-json');
const logger = require('./winston');
const config = require('./config');

module.exports = {
  /**
   * @param {FHIRResource} resource
   * @param {Array} extraPath // i.e ['_history]
   * @param {FHIRURL} url
   * @param {ResourceID} id // id of a resource
   * @param {Integer} count
   * @param {Object} callback
   */
  getResource({
    resource,
    extraPath = [],
    noCaching = false,
    partition,
    url,
    id,
    query,
    count,
  }) {
    return new Promise((resolve, reject) => {
      let resourceData = {};
      resourceData.entry = [];
      if (!url) {
        if (!partition) {
          partition = config.get('mCSD:registryDB');
        }
        url = URI(config.get('mCSD:url')).segment(partition).segment(resource);
        for (const path of extraPath) {
          url.segment(path);
        }
        if (id) {
          url.segment(id);
        }
        if (count && !isNaN(count)) {
          url.addQuery('_count', count);
        } else {
          count = 0;
        }
        if (query) {
          const queries = query.split('&');
          for (const qr of queries) {
            const qrArr = qr.split('=');
            if (qrArr.length !== 2) {
              logger.error(qrArr);
              logger.error('Invalid query supplied, stop getting resources');
              return reject();
            }
            url.addQuery(qrArr[0], qrArr[1]);
            if (qrArr[0] === '_count') {
              count = true;
            }
          }
        }
        url = url.toString();
      } else {
        count = true;
      }
      logger.info(`Getting ${url} from server`);
      let headers = {};
      if (noCaching) {
        headers = {
          'Cache-Control': 'no-cache',
        };
      }
      async.doWhilst(
        (callback) => {
          const options = {
            url,
            withCredentials: true,
            auth: {
              username: config.get('mCSD:username'),
              password: config.get('mCSD:password'),
            },
            headers,
          };
          url = false;
          request.get(options, (err, res, body) => {
            if (res && (res.statusCode < 200 || res.statusCode > 299)) {
              logger.error(body);
            }
            if (err) {
              logger.error(err);
            }
            if (!isJSON(body)) {
              logger.error(options);
              logger.error(body);
              logger.error(`Non JSON has been returned while getting data for resource ${resource}`);
              return callback(null, false);
            }
            body = JSON.parse(body);
            if (id && body || body.resourceType !== 'Bundle') {
              resourceData = body;
            } else if (body.entry && body.entry.length > 0) {
              if (count) {
                resourceData = {
                  ...body,
                };
              } else {
                resourceData.entry = resourceData.entry.concat(body.entry);
              }
            } else {
              resourceData = { ...body };
              resourceData.entry = [];
            }
            let next = body.link && body.link.find(link => link.relation === 'next');

            if (err || res.statusCode < 200 || res.statusCode > 299) {
              next = false;
            }
            if (!count || (count && !isNaN(count) && resourceData.entry && resourceData.entry.length < count)) {
              if (next) {
                url = next.url;
              }
            }
            if (!id) {
              resourceData.link = body.link;
            }
            return callback(null, url);
          });
        },
        () => url !== false,
        () => resolve(resourceData),
      );
    });
  },

  deleteResource(resource, partition, callback) {
    if (!partition) {
      partition = config.get('mCSD:registryDB');
    }
    const url = URI(config.get('mCSD:url'))
      .segment(partition)
      .segment(resource)
      .toString();
    const options = {
      url,
      withCredentials: true,
      auth: {
        username: config.get('mCSD:username'),
        password: config.get('mCSD:password'),
      },
    };
    request.delete(options, (err, res, body) => {
      if (err) {
        logger.error(err);
        return callback(err);
      }
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 399)) {
        return callback(true);
      }
      callback(err, body);
    });
  },

  saveResource({
    resourceData,
    partition,
  }, callback) {
    logger.info('Saving resource data');
    if (!partition) {
      partition = config.get('mCSD:registryDB');
    }
    const url = URI(config.get('mCSD:url')).segment(partition).toString();
    const options = {
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      auth: {
        username: config.get('mCSD:username'),
        password: config.get('mCSD:password'),
      },
      json: resourceData,
    };
    request.post(options, (err, res, body) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        logger.error(`saving ${JSON.stringify(resourceData, 0, 2)}`);
        logger.error(JSON.stringify(body, 0, 2));
        err = true;
      }
      if (err) {
        logger.error(err);
        return callback(err, body);
      }
      logger.info('Resource(s) data saved successfully');
      callback(err, body);
    });
  },

  '$meta-delete': function ({
    resourceParameters,
    partition,
    resourceType,
    resourceID,
  }) {
    return new Promise((resolve) => {
      if (!partition) {
        partition = config.get('mCSD:registryDB');
      }
      const url = URI(config.get('mCSD:url'))
        .segment(partition)
        .segment(resourceType)
        .segment(resourceID)
        .segment('$meta-delete')
        .toString();
      const options = {
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        auth: {
          username: config.get('mCSD:username'),
          password: config.get('mCSD:password'),
        },
        json: resourceParameters,
      };
      request.post(options, (err, res, body) => {
        if (err || !res.statusCode || (res.statusCode < 200 && res.statusCode > 299)) {
          return reject();
        }
        return resolve();
      });
    });
  },
};
