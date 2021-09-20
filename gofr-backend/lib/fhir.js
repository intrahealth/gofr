const request = require('request');
const URI = require('urijs');
const uuid4 = require('uuid/v4');
const async = require('async');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const moment = require('moment');
const mcsd = require('./mcsd')();
const mixin = require('./mixin');
const config = require('./config');
const logger = require('./winston');
const fhirAxios = require('./modules/fhirAxios');

const fhir = {
  sync: (id, host, username, password, mode, name, clientId, topOrgName) => {
    const fhirSyncRequestId = `fhirSyncRequest${clientId}`;
    const fhirSyncRequest = JSON.stringify({
      status: '1/2 - Loading all data from the FHIR Server specified',
      error: null,
      percent: null,
    });
    redisClient.set(fhirSyncRequestId, fhirSyncRequest);

    const database = name;
    const topOrgId = mixin.getTopOrgId(database, 'Location');
    let saveBundle = {
      id: uuid4(),
      resourceType: 'Bundle',
      type: 'batch',
      entry: [],
    };
    fhir.getLastUpdate(id, (lastUpdated) => {
      let url;
      const baseURL = URI(host).segment('Location').segment('_history').addQuery('_count', 200);
      if (mode === 'update') {
        url = baseURL.addQuery('_since', `${lastUpdated}`);
      }
      url = baseURL.toString();

      lastUpdated = moment().format('YYYY-MM-DDTHH:mm:ss');
      const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
      const locations = {
        entry: [],
      };
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
            if (body.entry) {
              locations.entry = locations.entry.concat(body.entry);
            }
            const next = body.link.find(link => link.relation == 'next');
            if (next) {
              url = next.url;
            }
            return callback(false, url);
          });
        },
        () => url != false,
        () => {
          let countSaved = 0;
          const totalRows = locations.entry.length;
          let count = 0;

          // adding the fake orgid as the top orgid
          const fhir = {
            resourceType: 'Location',
            id: topOrgId,
            status: 'active',
            mode: 'instance',
          };
          fhir.identifier = [{
            system: 'https://digitalhealth.intrahealth.org/source1',
            value: topOrgId,
          }];
          fhir.physicalType = {
            coding: [{
              system: 'http://hl7.org/fhir/location-physical-type',
              code: 'jdn',
              display: 'Jurisdiction',
            }],
            text: 'Jurisdiction',
          };
          const url = URI(config.get('mCSD:url'))
            .segment(database)
            .segment('Location')
            .segment(fhir.id)
            .toString();
          const options = {
            url: url.toString(),
            headers: {
              'Content-Type': 'application/fhir+json',
            },
            json: fhir,
          };
          request.put(options, (err, res, body) => {
            if (err) {
              logger.error('An error occured while saving the top org of hierarchy, this will cause issues with reconciliation');
            }
          });
          async.each(locations.entry, (entry, nxtEntry) => {
            if (!entry.resource.hasOwnProperty('partOf') || !entry.resource.partOf.reference) {
              entry.resource.partOf = {
                reference: `Location/${topOrgId}`,
                display: topOrgName,
              };
            }
            count++;
            saveBundle.entry.push(entry);
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
              mcsd.saveLocations(tmpBundle, database, (err, res, body) => {
                countSaved += tmpBundle.entry.length;
                const percent = parseFloat((countSaved * 100 / totalRows).toFixed(2));
                const fhirSyncRequest = JSON.stringify({
                  status: '2/2 Writing Data Into Server',
                  error: null,
                  percent,
                });
                redisClient.set(fhirSyncRequestId, fhirSyncRequest);
                return nxtEntry();
              });
            } else {
              return nxtEntry();
            }
          }, () => {
            logger.info(`Done syncing FHIR Server ${host}`);
            setLastUpdated(lastUpdated, id);
            const fhirSyncRequest = JSON.stringify({
              status: 'Done',
              error: null,
              percent: 100,
            });
            redisClient.set(fhirSyncRequestId, fhirSyncRequest);
          });
        },
      );
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
