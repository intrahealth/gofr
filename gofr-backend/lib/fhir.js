const request = require('request');
const URI = require('urijs');
const uuid4 = require('uuid/v4');
const async = require('async');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const moment = require('moment');
const logger = require('./winston');
const fhirAxios = require('./modules/fhirAxios');
const { default: axios } = require('axios');

const fhir = {
  sync: (id, host, username, password, mode, name, clientId, topOrgName) => {
    const database = name;
    let reindex = false;
    let saveBundle = {
      id: uuid4(),
      resourceType: 'Bundle',
      type: 'batch',
      entry: [],
    };
    const fhirSyncRequestId = `fhirSyncRequest${clientId}`;
    fhir.getLastUpdate(id, (lastUpdated) => {
      let newLastUpdated = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
      let zoneOffset;
      const resources = ['Location', 'Organization', 'HealthcareService'];
      async.eachSeries(resources, (resource, nxtRes) => {
        let fhirSyncRequest = JSON.stringify({
          status: `${resource} - 1/2 - Loading data from remote FHIR Server`,
          error: null,
          percent: null,
        });
        redisClient.set(fhirSyncRequestId, fhirSyncRequest);
        let url;
        const baseURL = URI(host).segment(resource).segment('_history').addQuery('_count', 200);
        if (mode === 'update') {
          url = baseURL.addQuery('_since', `${lastUpdated}`);
        }
        url = baseURL.toString();


        const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
        const locations = {
          entry: [],
        };
        let offset = 0;
        async.doWhilst(
          (callback) => {
            const options = {
              url,
              headers: {
                Authorization: auth,
              },
            };
            url = false;
            request.get(options, (err, res, body) => {
              try {
                body = JSON.parse(body);
              } catch (error) {
                logger.error(error);
                return callback(false, false);
              }
              if (!zoneOffset && body.meta && body.meta.lastUpdated) {
                const time = body.meta.lastUpdated.split('+');
                if (body.meta.lastUpdated.split('+').length === 2) {
                  zoneOffset = `+${time[1]}`;
                } else if (body.meta.lastUpdated.split('-').length === 2) {
                  zoneOffset = `-${time[1]}`;
                }
              }
              if (body.entry) {
                locations.entry = locations.entry.concat(body.entry);
              }
              const next = body.link.find(link => link.relation == 'next');
              if (next) {
                url = next.url;
              }
              if (body.entry && body.entry.length > 0) {
                // if hapi server doesnt have support for returning the next cursor then use _getpagesoffset
                offset += body.entry.length;
                if (offset <= body.total && !url) {
                  const baseURL = URI(host)
                    .segment(resource)
                    .segment('_history')
                    .addQuery('_count', 200)
                    .addQuery('_getpagesoffset', offset);
                  if (mode === 'update') {
                    url = baseURL.addQuery('_since', `${lastUpdated}`);
                  }
                  url = baseURL.toString();
                }
              } else {
                url = false;
              }
              return callback(false, url);
            });
          },
          () => url != false,
          () => {
            let countSaved = 0;
            const totalRows = locations.entry.length;
            let count = 0;
            async.each(locations.entry, (entry, nxtEntry) => {
              if (!entry.resource) {
                return nxtEntry();
              }
              count++;
              saveBundle.entry.push({
                resource: entry.resource,
                request: {
                  method: 'PUT',
                  url: `${entry.resource.resourceType}/${entry.resource.id}`,
                },
              });
              if (saveBundle.entry.length >= 250 || totalRows === count) {
                const tmpBundle = {
                  ...saveBundle,
                };
                saveBundle = {
                  id: uuid4(),
                  resourceType: 'Bundle',
                  type: 'batch',
                  entry: [],
                };
                fhirAxios.create(tmpBundle, database).then(() => {
                  reindex = true;
                  countSaved += tmpBundle.entry.length;
                  const percent = parseFloat((countSaved * 100 / totalRows).toFixed(2));
                  fhirSyncRequest = JSON.stringify({
                    status: `${resource} - 2/2 Writing Data Into Server`,
                    error: null,
                    percent,
                  });
                  redisClient.set(fhirSyncRequestId, fhirSyncRequest);
                  return nxtEntry();
                }).catch((err) => {
                  logger.error(err);
                  return nxtEntry();
                });
              } else {
                return nxtEntry();
              }
            }, () => {
              logger.info(`Done syncing ${resource} FHIR Server ${host}`);
              return nxtRes();
            });
          },
        );
      }, () => {
        if (!zoneOffset) {
          zoneOffset = '+00:00';
        }
        newLastUpdated = moment(newLastUpdated).utc().utcOffset(zoneOffset).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        logger.info(`Done syncing FHIR Server ${host}`);
        setLastUpdated(newLastUpdated, id);
        const fhirSyncRequest = JSON.stringify({
          status: 'Done',
          error: null,
          percent: 100,
        });
        redisClient.set(fhirSyncRequestId, fhirSyncRequest);
        if (!reindex) {
          return;
        }
        const params = {
          resourceType: 'Parameters',
          parameter: [],
        };
        resources.forEach((resource) => {
          params.parameter.push({
            name: 'type',
            valueString: resource,
          });
        });
        const auth = fhirAxios.__getAuth();
        let url = fhirAxios.__genUrl(database);
        url = new URI(url).segment('$mark-all-resources-for-reindexing').toString();
        axios.post(url, params, { auth }).then((response) => {
          logger.info(response.data);
        }).catch((err) => {
          logger.error(err);
        });
      });
    });
  },
  getLastUpdate: (id, callback) => {
    fhirAxios.read('Basic', id, '', 'DEFAULT').then((dataSource) => {
      const lastUpdated = dataSource && dataSource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/lastUpdated');
      if (lastUpdated) {
        return callback(lastUpdated.valueDateTime);
      }
      return callback(false);
    }).catch((err) => {
      logger.error(err);
      return callback(false);
    });
  },
};

function setLastUpdated(lastUpdated, id) {
  fhirAxios.read('Basic', id, '', 'DEFAULT').then((dataSource) => {
    let updated = false;
    dataSource.extension.forEach((ext, index) => {
      if (ext.url === 'http://gofr.org/fhir/StructureDefinition/lastUpdated') {
        dataSource.extension[index].valueDateTime = lastUpdated;
        updated = true;
      }
    });
    if (!updated) {
      dataSource.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/lastUpdated',
        valueDateTime: lastUpdated,
      });
    }
    fhirAxios.update(dataSource, 'DEFAULT').catch((err) => {
      logger.error(err);
    });
  }).catch((err) => {
    logger.error(err);
  });
}
module.exports = fhir;
