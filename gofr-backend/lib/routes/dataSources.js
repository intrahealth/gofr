const async = require('async');
const URI = require('urijs');
const fhirpath = require('fhirpath');
const formidable = require('formidable');
const express = require('express');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');
const mixin = require('../mixin');
const fhir = require('../fhir')();
const dhis = require('../dhis')();
const mcsd = require('../mcsd')();
const hapi = require('../hapi');
const config = require('../config');
const outcomes = require('../../config/operationOutcomes');

function getLastUpdateTime(sources) {
  return new Promise((resolve) => {
    async.eachOfSeries(sources, (server, key, nxtServer) => {
      if (server.sourceType === 'FHIR') {
        fhir.getLastUpdate(server.name, (lastUpdate) => {
          if (lastUpdate) {
            sources[key].lastUpdate = lastUpdate;
          }
          return nxtServer();
        });
      } else if (server.sourceType === 'DHIS2') {
        const password = '';
        if (server.password) {
          server = mixin.decrypt(extensions.password);
        }
        const auth = `Basic ${Buffer.from(`${server.username}:${password}`).toString('base64')}`;
        const dhis2URL = URL.parse(extensions.host);
        dhis.getLastUpdate(server.name, dhis2URL, auth, (lastUpdate) => {
          if (lastUpdate) {
            sources[key].lastUpdate = lastUpdate.split('.').shift();
          }
          return nxtServer();
        });
      } else {
        return nxtServer();
      }
    }, () => resolve(sources));
  });
}

function getPairsFromSource(source) {
  return new Promise((resolve, reject) => {
    let pairs = [];
    async.parallel({
      source1: (callback) => {
        const searchParams = {
          _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
          pairsource1: source,
        };
        fhirAxios.search('Basic', searchParams, 'DEFAULT').then((data) => {
          if (data.entry) {
            pairs = pairs.concat(data.entry);
          }
          return callback(null);
        }).catch((error) => {
          logger.error(error);
          callback(error);
        });
      },
      source2: (callback) => {
        const searchParams = {
          _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
          pairsource2: source,
        };
        fhirAxios.search('Basic', searchParams, 'DEFAULT').then((data) => {
          if (data.entry) {
            pairs = pairs.concat(data.entry);
          }
          return callback(null);
        }).catch((error) => {
          logger.error(error);
          callback(error);
        });
      },
    }, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(pairs);
    });
  });
}
function getSourcePair({ userID, dhis2OrgId }) {
  return new Promise((resolve, reject) => {
    const pairs = [];
    let resources = [];
    async.parallel({
      owning: (callback) => {
        const searchParams = {
          _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
          partitionowner: `Person/${userID}`,
          _revinclude: 'Basic:pairpartition',
          _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
        };
        fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
          if (data.entry) {
            resources = resources.concat(data.entry);
          }
          return callback(null);
        }).catch(err => callback(err));
      },
      shared: (callback) => {
        const searchParams = {
          _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
          partitionshareduser: `Person/${userID}`,
          _revinclude: 'Basic:pairpartition',
          _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
        };
        fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
          if (data.entry) {
            resources = resources.concat(data.entry);
          }
          return callback(null);
        }).catch(err => callback(err));
      },
      sameOrgId: (callback) => {
        if (!dhis2OrgId) {
          return callback(null);
        }
        const searchParams = {
          _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
          partitiondhis2orgid: dhis2OrgId,
          _revinclude: 'Basic:pairpartition',
          _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
        };
        fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
          if (data.entry) {
            resources = resources.concat(data.entry);
          }
          return callback(null);
        }).catch(err => callback(err));
      },
    }, (err) => {
      if (err) {
        return reject(err);
      }
      if (resources.length > 0) {
        let partsRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
        const pairsRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
        const sourcesRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource'));
        const usersRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-person-user'));
        const promises = [];
        for (const pairRes of pairsRes) {
          promises.push(new Promise((resolve, reject) => {
            const src1Ext = pairRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
            const src2Ext = pairRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
            const pairExt = mixin.flattenExtension(pairRes.resource.extension);
            const partId = pairExt['http://gofr.org/fhir/StructureDefinition/partition'].reference;
            const partRes = partsRes.find(part => part.resource.id === partId.split('/')[1]);
            const partExt = mixin.flattenExtension(partRes.resource.extension);
            const userId = partExt['http://gofr.org/fhir/StructureDefinition/owner'][0].find(ext => ext.url === 'userID').valueReference.reference;
            const ownerName = usersRes.find(usr => usr.resource.id === userId.split('/')[1]).resource.name[0].text;
            const whereSharedUsers = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser').extension.where(url='user').valueReference.reference";
            const _sharedUsers = fhirpath.evaluate(partRes.resource, whereSharedUsers);

            const sharedUsers = [];
            for (const user of _sharedUsers) {
              sharedUsers.push({
                id: user.split('/')[1],
                name: usersRes.find(usr => usr.resource.id === user.split('/')[1]).resource.name[0].text,
              });
            }

            const whereActiveUsers = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='activeUsers').valueReference.reference";
            const _activeUsers = fhirpath.evaluate(partRes.resource, whereActiveUsers);
            const activeUsers = [];
            for (const user of _activeUsers) {
              activeUsers.push({
                id: user.split('/')[1],
                name: usersRes.find(usr => usr.resource.id === user.split('/')[1]).resource.name[0].text,
              });
            }
            let src1Res = sourcesRes.find(source => source.resource.id === src1Ext.valueReference.reference.split('/')[1]);
            let src2Res = sourcesRes.find(source => source.resource.id === src2Ext.valueReference.reference.split('/')[1]);
            const getSourcesResources = new Promise((resolve, reject) => {
              if (src1Res && src2Res) {
                return resolve();
              }
              const searchParams = {
                _id: `${src1Ext.valueReference.reference.split('/')[1]},${src2Ext.valueReference.reference.split('/')[1]}`,
                _include: 'Basic:datasourcepartition',
              };
              fhirAxios.search('Basic', searchParams, 'DEFAULT').then((response) => {
                src1Res = response.entry && response.entry.find(entry => entry.resource.id === src1Ext.valueReference.reference.split('/')[1]);
                src2Res = response.entry && response.entry.find(entry => entry.resource.id === src2Ext.valueReference.reference.split('/')[1]);
                partsRes = partsRes.concat(response.entry && response.entry.filter(entry => entry.resource.meta && entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition')));
                if (!src1Res || !src2Res) {
                  return reject();
                }
                return resolve();
              });
            });
            getSourcesResources.then(() => {
              const src1Part = partsRes.find(part => part.resource.id === fhirpath.evaluate(src1Res.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').valueReference.reference")[0].split('/')[1]);
              const src2Part = partsRes.find(part => part.resource.id === fhirpath.evaluate(src2Res.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').valueReference.reference")[0].split('/')[1]);

              const pair = {
                id: pairRes.resource.id,
                source1: {
                  id: src1Ext.valueReference.reference.split('/')[1],
                  name: fhirpath.evaluate(src1Part.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString")[0],
                  display: src1Ext.valueReference.display,
                  user: {
                    id: fhirpath.evaluate(src1Part.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/owner').extension.where(url='userID').valueReference.reference")[0].split('/')[1],
                  },
                },
                source2: {
                  id: src2Ext.valueReference.reference.split('/')[1],
                  name: fhirpath.evaluate(src2Part.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString")[0],
                  display: src2Ext.valueReference.display,
                  user: {
                    id: fhirpath.evaluate(src2Part.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/owner').extension.where(url='userID').valueReference.reference")[0].split('/')[1],
                  },
                },
                user: {
                  id: userId.split('/')[1],
                  name: ownerName,
                },
                sharedUsers,
                activeUsers,
                status: fhirpath.evaluate(pairRes.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/status').valueString")[0],
              };
              pairs.push(pair);
              resolve();
            }).catch((err) => {
              logger.error(err);
              reject();
            });
          }));
        }
        Promise.all(promises).then(() => {
          resolve(pairs);
        }).catch((err) => {
          logger.error(err);
          reject();
        });
      } else {
        resolve(pairs);
      }
    });
  });
}

function deactivatePair(userID) {
  return new Promise((resolve, reject) => {
    fhirAxios.searchAll('Basic', { _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition', partitionowner: userID, _revinclude: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
      if (data.entry) {
        const bundle = {
          resourceType: 'Bundle',
          type: 'batch',
          entry: [],
        };
        const pairsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
        for (const entry of pairsRes) {
          for (const index in entry.resource.extension) {
            if (entry.resource.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/status' && entry.resource.extension[index].valueString === 'active') {
              entry.resource.extension[index].valueString = 'inactive';
              bundle.entry.push({
                resource: entry.resource,
                request: {
                  method: 'PUT',
                  url: `Basic/${entry.resource.id}`,
                },
              });
            }
          }
        }
        if (bundle.entry.length > 0) {
          fhirAxios.create(bundle, 'DEFAULT').then(() => resolve()).catch((err) => {
            logger.error(err);
            return reject();
          });
        } else {
          return resolve();
        }
      } else {
        return resolve();
      }
    });
  });
}

function deactivateSharedPair(userID) {
  return new Promise((resolve, reject) => {
    fhirAxios.search('Basic', { _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition', partitionsharedactiveuser: userID, _revinclude: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
      if (data.entry) {
        const bundle = {
          resourceType: 'Bundle',
          type: 'batch',
          entry: [],
        };
        const pairsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
        for (const entry of pairsRes) {
          for (const index in entry.resource.extension) {
            if (entry.resource.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/shared') {
              for (const sharedIndex in entry.resource.extension[index].extension) {
                if (entry.resource.extension[index].extension[sharedIndex].url === 'activeUsers' && entry.resource.extension[index].extension[sharedIndex].valueReference.reference === userID) {
                  entry.resource.extension[index].extension.splice(sharedIndex, 1);
                  bundle.entry.push({
                    resource: entry.resource,
                    request: {
                      method: 'PUT',
                      url: `Basic/${entry.resource.id}`,
                    },
                  });
                }
              }
            }
          }
        }
        if (bundle.entry.length > 0) {
          fhirAxios.create(bundle, 'DEFAULT').then(() => resolve()).catch((err) => {
            logger.error(err);
            return reject();
          });
        } else {
          return resolve();
        }
      } else {
        return resolve();
      }
    });
  });
}

function deleteSourcePair({ pairID, userID }) {
  return new Promise((resolve, reject) => {
    if (!pairID) {
      return reject('No pairID passed');
    }
    logger.info(`Received a request to delete data source pair with id ${pairID}`);
    const searchParams = { _id: pairID, _include: 'Basic:pairpartition' };
    fhirAxios.search('Basic', searchParams, 'DEFAULT').then((data) => {
      if (!data || !data.entry || data.entry.length !== 2) {
        logger.error(`No data source pair/partition found for data source pair with id ${pairID} found`);
        return reject();
      }
      let isShared = false;
      const pair = data.entry.find(entry => entry.resource.meta && entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
      const partition = data.entry.find(entry => entry.resource.meta && entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const whereSharedUsers = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser').extension.where(url='user').valueReference.reference";
      const sharedUsers = fhirpath.evaluate(partition.resource, whereSharedUsers);
      if (userID && sharedUsers.includes(`Person/${userID}`)) {
        isShared = true;
        for (const sharedIndex in partition.resource.extension) {
          if (partition.resource.extension[sharedIndex].url === 'http://gofr.org/fhir/StructureDefinition/shared') {
            for (const sharedUserIndex in partition.resource.extension[sharedIndex].extension) {
              if (partition.resource.extension[sharedIndex].extension[sharedUserIndex].url === 'http://gofr.org/fhir/StructureDefinition/shareduser') {
                const index = partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension.findIndex(sharedUser => sharedUser.url === 'user' && sharedUser.valueReference.reference === `Person/${userID}`);
                if (index !== -1) {
                  partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension.splice(index, 1);
                }
              }
              const index = partition.resource.extension[sharedIndex].extension.findIndex(shared => shared.url === 'activeUsers' && shared.valueReference.reference === `Person/${userID}`);
              if (index !== -1) {
                partition.resource.extension[sharedIndex].extension.splice(index, 1);
              }
            }
          }
        }
      }
      let partitionID;
      const partIdExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
      const partNameExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/name');
      if (partIdExt) {
        partitionID = partIdExt.valueInteger;
      } else {
        return reject();
      }
      if (isShared) {
        fhirAxios.update(partition.resource, 'DEFAULT').then(() => {
          resolve();
        }).catch((err) => {
          logger.error(err);
          return reject();
        });
      } else {
        fhirAxios.delete('Basic', { _id: pair.resource.id }, 'DEFAULT').then(() => {
          const mappingUrl = fhirAxios.__genUrl(partNameExt.valueString);
          mcsd.cleanCache(`url_${mappingUrl}`, true);
          hapi.deletePartition({ partitionID }).then(() => {
            resolve();
          }).catch((err) => {
            logger.error(err);
            return reject();
          });
        }).catch((err) => {
          logger.error(err);
          return reject();
        });
      }
    });
  });
}

router.post('/addSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'add-data-source');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    logger.info('Received a request to add a new data source');
    const createPartition = new Promise((resolve, reject) => {
      if (!fields.partitionID) {
        const database = mixin.toTitleCase(fields.name + fields.userID);
        hapi.addPartition({ name: database, description: 'reco data source', userID: fields.userID }).then(async (partitionID) => {
          await mcsd.createFakeOrgID(database).catch((err) => {
            logger.error(err);
          });
          resolve(partitionID);
        }).catch((err) => {
          logger.error((err));
          return reject();
        });
      } else {
        logger.error('here');
        return resolve(fields.partitionID);
      }
    });
    createPartition.then(async (partitionID) => {
      let partition;
      try {
        partition = await fhirAxios.read('Basic', partitionID.split('/')[1], '', 'DEFAULT');
      } catch (error) {
        logger.error(error);
        return res.status(500).send();
      }
      if (!partition) {
        return res.status(500).send();
      }
      if (!fields.shareToSameOrgid) {
        fields.shareToSameOrgid = false;
      }
      if (!fields.shareToAll) {
        fields.shareToAll = false;
      }
      if (!fields.limitByUserLocation) {
        fields.limitByUserLocation = false;
      }
      const resource = {
        resourceType: 'Basic',
        meta: {
          profile: ['http://gofr.org/fhir/StructureDefinition/gofr-datasource'],
        },
        extension: [{
          url: 'http://gofr.org/fhir/StructureDefinition/partition',
          valueReference: {
            reference: partitionID,
          },
        }],
      };
      resource.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/name',
        valueString: fields.name,
      });
      if (fields.host) {
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/host',
          valueString: fields.host,
        });
      }
      if (fields.sourceType) {
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/sourceType',
          valueString: fields.sourceType,
        });
      }
      if (fields.source) {
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/source',
          valueString: fields.source,
        });
      }
      if (fields.username) {
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/username',
          valueString: fields.username,
        });
      }
      if (fields.password) {
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/password',
          valueString: mixin.encrypt(fields.password),
        });
      }
      partition.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/shared',
        extension: [{
          url: 'shareToSameOrgid',
          valueBoolean: fields.shareToSameOrgid,
        }, {
          url: 'http://gofr.org/fhir/StructureDefinition/shareToAll',
          extension: [{
            url: 'activated',
            valueBoolean: fields.shareToAll,
          }, {
            url: 'limitByUserLocation',
            valueBoolean: fields.limitByUserLocation,
          }],
        }],
      });
      if (fields.levelData) {
        let levelData;
        try {
          levelData = JSON.parse(fields.levelData);
        } catch (error) {
          levelData = fields.levelData;
        }
        const levels = Object.keys(levelData);
        const dbLevel = {};
        for (const level of levels) {
          if (level.startsWith('level') && levelData[level]) {
            dbLevel[level] = levelData[level];
          }
        }
        dbLevel.code = levelData.code;
        dbLevel.facility = levelData.facility;
        resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/levelMapping',
          valueString: JSON.stringify(dbLevel),
        });
      }
      const bundle = {
        resourceType: 'Bundle',
        type: 'batch',
        entry: [{
          resource: partition,
          request: {
            method: 'PUT',
            url: `Basic/${partition.id}`,
          },
        }, {
          resource,
          request: {
            method: 'POST',
            url: 'Basic',
          },
        }],
      };
      fhirAxios.create(bundle, 'DEFAULT').then(() => {
        let password = '';
        if (fields.password) {
          password = mixin.encrypt(fields.password);
        }
        return res.status(200).json({
          status: 'done',
          password,
        });
      }).catch((err) => {
        logger.error(err);
        res.status(500).send();
      });
    }).catch(() => res.status(500).send());
  });
});

router.post('/editSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'adddatasource');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    logger.info('Received a request to edit a data source');
    fhirAxios.read('Basic', fields.id.split('/')[1], '', 'DEFAULT').then((source) => {
      let password;
      if (fields.password) {
        password = this.encrypt(fields.password);
      }
      for (const index in source.extension) {
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/name' && fields.name) {
          source.extension[index].valueString = fields.name;
        }
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/host' && fields.host) {
          source.extension[index].valueString = fields.host;
        }
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/sourceType' && fields.sourceType) {
          source.extension[index].valueString = fields.sourceType;
        }
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/source' && fields.source) {
          source.extension[index].valueString = fields.source;
        }
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/username' && fields.username) {
          source.extension[index].valueString = fields.username;
        }
        if (source.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/password' && password) {
          source.extension[index].valueString = password;
        }
      }
      fhirAxios.update(source, 'DEFAULT').then(() => {
        logger.info('Data source edited sucessfully');
        return res.status(200).send({
          status: 'done',
          password,
        });
      }).catch((err) => {
        logger.error(err);
        res.status(500).json({
          error: 'Unexpected error occured,please retry',
        });
      });
    }).catch((err) => {
      logger.error(err);
      res.status(500).json({
        error: 'Unexpected error occured,please retry',
      });
    });
  });
});

router.get('/getSource/:userID/:role/:orgId?', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'view-data-source');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  let resources = [];
  async.parallel({
    owning: (callback) => {
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      if (req.params.role !== 'Admin') {
        searchParams.partitionowner = `Person/${req.params.userID}`;
      }
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
        if (data.entry) {
          resources = resources.concat(data.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    },
    sharedUser: (callback) => {
      if (req.params.role === 'Admin') {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitionshareduser: `Person/${req.params.userID}`,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    },
    sharedAll: (callback) => {
      if (req.params.role === 'Admin') {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitionshareall: true,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    },
    sameOrgid: (callback) => {
      if (req.params.role === 'Admin' || !req.params.orgId) {
        return callback(null);
      }
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-partition',
        partitiondhis2orgid: req.params.orgId,
        partitionsharesameorgid: true,
        _revinclude: 'Basic:datasourcepartition',
        _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((parts) => {
        if (parts.entry) {
          resources = resources.concat(parts.entry);
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    },
  }, () => {
    const sources = [];
    if (resources.length > 0) {
      const partsRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const sourcesRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource'));
      const usersRes = resources.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-person-user'));
      sourcesRes.forEach((entry) => {
        const exists = sources.find(src => src.id === entry.resource.id);
        if (exists) {
          return;
        }
        const sourceExt = mixin.flattenExtension(entry.resource.extension);
        const partId = sourceExt['http://gofr.org/fhir/StructureDefinition/partition'].reference;
        const partRes = partsRes.find(part => part.resource.id === partId.split('/')[1]);
        const partExt = mixin.flattenExtension(partRes.resource.extension);
        const userId = partExt['http://gofr.org/fhir/StructureDefinition/owner'][0].find(ext => ext.url === 'userID').valueReference.reference;
        const owner = usersRes.find(usr => usr.resource.id === userId.split('/')[1]).resource.name[0].text;

        const whereShareToAll = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareToAll').extension";
        const _shareToAll = fhirpath.evaluate(partRes.resource, whereShareToAll);
        const shareToAll = {};
        _shareToAll.forEach((shall) => {
          if (shall.url === 'activated') {
            shareToAll.activated = shall.valueBoolean;
          }
          if (shall.url === 'limitByUserLocation') {
            shareToAll.limitByUserLocation = shall.valueBoolean;
          }
        });

        const whereSharedUsers = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser')";
        const _sharedUsers = fhirpath.evaluate(partRes.resource, whereSharedUsers);
        const sharedUsers = [];
        _sharedUsers.forEach((shareduser) => {
          const user = shareduser.extension.find(ext => ext.url === 'user');
          const locationLimits = shareduser.extension.filter(ext => ext.url === 'locationLimit');
          const limits = [];
          locationLimits.forEach((limit) => {
            limits.push(limit.valueReference.reference);
          });
          const userid = user.valueReference.reference.split('/')[1];
          sharedUsers.push({
            id: userid,
            name: usersRes.find(usr => usr.resource.id === userid).resource.name[0].text,
            limits,
          });
        });
        const source = {
          id: entry.resource.id,
          source: sourceExt['http://gofr.org/fhir/StructureDefinition/source'],
          sourceType: sourceExt['http://gofr.org/fhir/StructureDefinition/sourceType'],
          name: partExt['http://gofr.org/fhir/StructureDefinition/name'],
          display: sourceExt['http://gofr.org/fhir/StructureDefinition/name'],
          username: sourceExt['http://gofr.org/fhir/StructureDefinition/username'],
          password: sourceExt['http://gofr.org/fhir/StructureDefinition/password'],
          host: sourceExt['http://gofr.org/fhir/StructureDefinition/host'],
          owner,
          sharedUsers,
          shareToAll,
          userID: userId.split('/')[1],
          createdTime: partExt['http://gofr.org/fhir/StructureDefinition/createdTime'],
        };
        sources.push(source);
      });
    }
    getLastUpdateTime(sources).then(() => {
      logger.info(`returning list of ${sources.length} data sources`);
      res.status(200).json({
        sources,
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).send('An error has occured while getting data source');
    });
  });
});

router.get('/countLevels', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'viewdatasource');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  logger.info('Received a request to get total levels');
  const sourcesLimitOrgId = JSON.parse(req.query.sourcesLimitOrgId);
  const {
    source1DB, source2DB, source1Id, source2Id,
  } = req.query;
  let { source1LimitOrgId, source2LimitOrgId } = sourcesLimitOrgId;
  if (source1LimitOrgId.length === 0) {
    source1LimitOrgId = [mixin.getTopOrgId(req.query.source1DB, 'Location')];
  }
  if (source2LimitOrgId.length === 0) {
    source2LimitOrgId = [mixin.getTopOrgId(req.query.source2DB, 'Location')];
  }

  async.parallel({
    Source1Levels(callback) {
      mcsd.countLevels(source1DB, source1LimitOrgId[0], (err, source1TotalLevels) => {
        logger.info(`Received total source1 levels of ${source1TotalLevels}`);
        return callback(err, source1TotalLevels);
      });
    },
    Source2Levels(callback) {
      mcsd.countLevels(source2DB, source2LimitOrgId[0], (err, source2TotalLevels) => {
        logger.info(`Received total source2 levels of ${source2TotalLevels}`);
        return callback(err, source2TotalLevels);
      });
    },
    getLevelMapping(callback) {
      async.parallel({
        levelMapping1(callback) {
          fhirAxios.read('Basic', source1Id, '', 'DEFAULT').then((src) => {
            const levelMapping = {};
            const levelMapExt = src.extension && src.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
            if (levelMapExt) {
              let levelMappingData = levelMapExt.valueString;
              try {
                levelMappingData = JSON.parse(levelMappingData);
              } catch (error) {
                logger.error(error);
                return callback(error, levelMapping);
              }
              if (levelMappingData) {
                for (const level in levelMappingData) {
                  let levelData = levelMappingData[level];
                  try {
                    levelData = JSON.parse(levelData);
                  } catch (error) {

                  }
                  if (levelData && levelData !== 'undefined' && level != '$init') {
                    levelMapping[level] = levelMappingData[level];
                  }
                }
              }
              return callback(false, levelMapping);
            }
          });
        },
        levelMapping2(callback) {
          fhirAxios.read('Basic', source2Id, '', 'DEFAULT').then((src) => {
            const levelMapping = {};
            const levelMapExt = src.extension && src.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
            if (levelMapExt) {
              let levelMappingData = levelMapExt.valueString;
              try {
                levelMappingData = JSON.parse(levelMappingData);
              } catch (error) {
                logger.error(error);
                return callback(error, levelMapping);
              }
              if (levelMappingData) {
                for (const level in levelMappingData) {
                  let levelData = levelMappingData[level];
                  try {
                    levelData = JSON.parse(levelData);
                  } catch (error) {

                  }
                  if (levelData && levelData !== 'undefined' && level != '$init') {
                    levelMapping[level] = levelMappingData[level];
                  }
                }
              }
              return callback(false, levelMapping);
            }
          });
        },
      }, (err, mappings) => callback(false, mappings));
    },
  }, (err, results) => {
    if (err) {
      logger.error(err);
      res.status(400).json({
        error: err,
      });
    } else {
      if (Object.keys(results.getLevelMapping.levelMapping1).length == 0) {
        results.getLevelMapping.levelMapping1 = generateLevelMapping(results.Source1Levels);
      }
      if (Object.keys(results.getLevelMapping.levelMapping2).length == 0) {
        results.getLevelMapping.levelMapping2 = generateLevelMapping(results.Source2Levels);
      }
      const recoLevel = 2;
      res.status(200).json({
        totalSource1Levels: results.Source1Levels,
        totalSource2Levels: results.Source2Levels,
        recoLevel,
        levelMapping: results.getLevelMapping,
      });
    }
  });

  function generateLevelMapping(totalLevels) {
    const levelMapping = {};
    for (let k = 1; k < totalLevels; k++) {
      levelMapping[`level${k}`] = `level${k}`;
    }
    levelMapping.facility = `level${totalLevels}`;
    return levelMapping;
  }
});

router.post('/shareSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'share-data-source');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  logger.info('Received a request to share data source');
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const users = JSON.parse(fields.users);
    const { limitLocationId } = fields;
    fhirAxios.search('Basic', { _id: fields.shareSource, _include: 'Basic:datasourcepartition' }, 'DEFAULT').then((data) => {
      const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const sharedIndex = partition.resource.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
      if (sharedIndex !== -1) {
        const sharedUserIndex = partition.resource.extension[sharedIndex].extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shareduser');
        if (sharedUserIndex !== -1) {
          partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension = [];
          share(partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension);
        } else {
          const length = partition.resource.extension[sharedIndex].extension.push({
            url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
            extension: [],
          });
          share(partition.resource.extension[sharedIndex].extension[length - 1].extension);
        }
      } else {
        if (!partition.resource.extension) {
          partition.resource.extension = [];
        }
        const length = partition.resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/shared',
          extension: [{
            url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
            extension: [],
          }],
        });
        share(partition.resource.extension[length - 1].extension[0].extension);
      }
      function share(extension) {
        users.forEach((user) => {
          extension.push({
            url: 'user',
            valueReference: {
              reference: `Person/${user}`,
            },
          });
          if (limitLocationId) {
            extension.push({
              url: 'locationLimit',
              valueReference: {
                reference: limitLocationId,
              },
            });
          }
        });
      }
      fhirAxios.update(partition.resource, 'DEFAULT').then(() => {
        logger.info('Data source shared successfully');
        return res.status(200).send();
      }).catch((err) => {
        logger.error(err);
        logger.error('An error occured while sharing data source');
        res.status(500).send('An error occured while sharing data source');
      });
    }).catch((err) => {
      logger.error(err);
      logger.error('An error occured while sharing data source');
      res.status(500).send('An error occured while sharing data source');
    });
  });
});

router.post('/createSourcePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'create-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    let {
      source1, source2, userID, dhis2OrgId, singlePair,
    } = fields;
    source1 = JSON.parse(source1);
    source2 = JSON.parse(source2);
    let searchParams = {
      _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
      pairsource1: source1.id,
      pairsource2: source2.id,
    };
    fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
      if (data.entry && data.entry.length === 0) {
        getSourcePair({ userID, dhis2OrgId }).then((pairs) => {
          if (pairs.length > 0 && singlePair) {
            logger.error('Single pair limit is active and a pair already exists, cant create more pairs');
            return res.status(400).send();
          }
          const database = mixin.toTitleCase(source1.display + userID + source2.display);
          hapi.addPartition({ name: database, description: 'mapping data source', userID }).then(async (partitionID) => {
            await mcsd.createFakeOrgID(database).catch((err) => {
              logger.error(err);
            });
            const resource = {
              resourceType: 'Basic',
              meta: {
                profile: ['http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'],
              },
              extension: [{
                url: 'http://gofr.org/fhir/StructureDefinition/partition',
                valueReference: {
                  reference: partitionID,
                },
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/source1',
                valueReference: {
                  reference: `Basic/${source1.id}`,
                  display: source1.display,
                },
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/source2',
                valueReference: {
                  reference: `Basic/${source2.id}`,
                  display: source2.display,
                },
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/status',
                valueString: 'active',
              }],
            };
            // get active pair and deactivate
            Promise.all([deactivatePair(userID), deactivateSharedPair(userID)]).then(() => {
              fhirAxios.create(resource, 'DEFAULT').then(() => {
                // get data sources
                searchParams = {
                  _id: `${source1.id},${source2.id}`,
                };
                fhirAxios.search('Basic', searchParams, 'DEFAULT').then((sources) => {
                  const source1Res = sources.entry && sources.entry.find(entry => entry.resource.id === source1.id);
                  const source2Res = sources.entry && sources.entry.find(entry => entry.resource.id === source2.id);
                  const levelMapping = {};
                  const levelExt1 = source1Res.resource.extension && source1Res.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
                  const levelExt2 = source2Res.resource.extension && source2Res.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
                  if (levelExt1) {
                    levelMapping.levelMapping1 = levelExt1.valueString;
                  }
                  if (levelExt2) {
                    levelMapping.levelMapping2 = levelExt2.valueString;
                  }
                  logger.info('Data source pair created');
                  return res.status(200).json(levelMapping);
                }).catch((error) => {
                  logger.error(error);
                  return res.status(500).send();
                });
              }).catch((error) => {
                logger.error(error);
                return res.status(500).send();
              });
            }).catch(() => res.status(500).send());
          });
        });
      } else {
        return res.status(400).send();
      }
    });
  });
});

router.post('/shareSourcePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'share-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  logger.info('Received a request to share data source pair');
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const users = JSON.parse(fields.users);
    fhirAxios.search('Basic', { _id: fields.sharePair, _include: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
      const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      const sharedIndex = partition.resource.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
      if (sharedIndex !== -1) {
        const sharedUserIndex = partition.resource.extension[sharedIndex].extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shareduser');
        if (sharedUserIndex !== -1) {
          partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension = [];
          share(partition.resource.extension[sharedIndex].extension[sharedUserIndex].extension);
        } else {
          const length = partition.resource.extension[sharedIndex].extension.push({
            url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
            extension: [],
          });
          share(partition.resource.extension[sharedIndex].extension[length - 1].extension);
        }
      } else {
        if (!partition.resource.extension) {
          partition.resource.extension = [];
        }
        const length = partition.resource.extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/shared',
          extension: [{
            url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
            extension: [],
          }],
        });
        share(partition.resource.extension[length - 1].extension[0].extension);
      }
      function share(extension) {
        for (const user of users) {
          extension.push({
            url: 'user',
            valueReference: {
              reference: `Person/${user}`,
            },
          });
        }
      }
      fhirAxios.update(partition.resource, 'DEFAULT').then(() => {
        logger.info('Data source pair shared successfully');
        getSourcePair({ userID: fields.userID, dhis2OrgId: fields.orgId }).then(pairs => res.status(200).json(pairs)).catch((err) => {
          logger.error(err);
          logger.error('An error has occured while getting data source pairs');
          res.status(500).send('An error has occured while getting data source pairs');
        });
      }).catch((err) => {
        logger.error(err);
        logger.error('An error occured while sharing data source pair');
        res.status(500).send('An error occured while sharing data source pair');
      });
    }).catch((err) => {
      logger.error(err);
      logger.error('An error occured while sharing data source pair');
      res.status(500).send('An error occured while sharing data source pair');
    });
  });
});

router.post('/activateSharedPair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'activate-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  logger.info('Received a request to activate shared data source pair');
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    const { pairID, userID } = fields;
    Promise.all([deactivatePair(userID), deactivateSharedPair(userID)]).then(() => {
      fhirAxios.search('Basic', { _id: pairID, _include: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
        const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
        if (!partition) {
          logger.error(`Pair ${pairID} Not Found`);
          return res.status(500).send();
        }
        const sharedIndex = partition.resource.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
        if (sharedIndex !== -1) {
          const exists = partition.resource.extension[sharedIndex].extension.find(ext => ext.url === 'activeUsers' && ext.valueReference.reference === `Person/${userID}`);
          if (!exists) {
            partition.resource.extension[sharedIndex].extension.push({
              url: 'activeUsers',
              valueReference: {
                reference: `Person/${userID}`,
              },
            });
          }
        } else {
          if (!partition.resource.extension) {
            partition.resource.extension = [];
          }
          partition.resource.extension.push({
            url: 'http://gofr.org/fhir/StructureDefinition/shared',
            extension: [{
              url: 'activeUsers',
              valueReference: {
                reference: `Person/${userID}`,
              },
            }],
          });
        }
        fhirAxios.update(partition.resource, 'DEFAULT').then(() => {
          res.status(200).send();
        }).catch((err) => {
          logger.error(err);
          return res.status(500).send();
        });
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).send();
    });
  });
});

router.post('/resetDataSourcePair/:userID', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'deactivate-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  logger.info('Received a request to reset data source pair');
  Promise.all([deactivatePair(req.params.userID), deactivateSharedPair(req.params.userID)]).then(() => {
    res.status(200).send();
  }).catch((err) => {
    res.status(500).send();
  });
});

router.get('/getSourcePair/:userID/:dhis2OrgId?', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'view-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  getSourcePair({ userID: req.params.userID, dhis2OrgId: req.params.dhis2OrgId }).then((pairs) => {
    res.status(200).json(pairs);
  }).catch(() => {
    res.status(500).send();
  });
});

router.get('/getPairForSource/:datasource', (req, res) => {
  logger.info('Received a request to get pairs associated with a datasource');
  const id = req.params.datasource;
  const pairs = [];
  async.parallel({
    source1: (callback) => {
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
        pairsource1: id,
        _include: 'Basic:pairpartition',
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
        const pairsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
        const partsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
        for (const pair of pairsRes) {
          const src1Ext = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
          const src2Ext = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
          const partition = partsRes.find(part => pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition' && ext.valueReference.reference.split('/')[1] === part.resource.id));
          let owner;
          if (partition) {
            const ownerExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/owner');
            if (ownerExt) {
              const userExt = ownerExt.find(ext => ext.url === 'userID');
              owner = userExt.valueReference.reference;
            }
          }
          pairs.push({
            source1Name: src1Ext.valueReference.display,
            source2Name: src2Ext.valueReference.display,
            owner,
          });
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
    source2: (callback) => {
      const searchParams = {
        _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
        pairsource2: id,
        _include: 'Basic:pairpartition',
      };
      fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
        const pairsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair'));
        const partsRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
        for (const pair of pairsRes) {
          const src1Ext = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
          const src2Ext = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
          const partition = partsRes.find(part => pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition' && ext.valueReference.reference.split('/')[1] === part.resource.id));
          let owner;
          if (partition) {
            const ownerExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/owner');
            if (ownerExt) {
              const userExt = ownerExt.find(ext => ext.url === 'userID');
              owner = userExt.valueReference.reference;
            }
          }
          pairs.push({
            source1Name: src1Ext.valueReference.display,
            source2Name: src2Ext.valueReference.display,
            owner,
          });
        }
        return callback(null);
      }).catch((err) => {
        logger.error(err);
        return callback(err);
      });
    },
  }, (err) => {
    if (err) {
      return res.status(500).send();
    }
    return res.status(200).json(pairs);
  });
});

router.delete('/deleteDataSource/:id', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'delete-data-source');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  const {
    id,
  } = req.params;
  logger.info(`Received request to delete data source with id ${id}`);
  const searchParams = { _profile: 'http://gofr.org/fhir/StructureDefinition/gofr-datasource', _id: id, _include: 'Basic:datasourcepartition' };
  fhirAxios.search('Basic', searchParams, 'DEFAULT').then((data) => {
    if (!data || !data.entry || data.entry.length !== 2) {
      logger.error(`No data source/partition found for data source with id ${req.params.id} found`);
      return res.status(500).send();
    }
    const source = data.entry.find(entry => entry.resource.meta && entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource'));
    const partition = data.entry.find(entry => entry.resource.meta && entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
    let partitionID;
    const partIdExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
    if (partIdExt) {
      partitionID = partIdExt.valueInteger;
    } else {
      return res.status(500).send();
    }
    fhirAxios.delete('Basic', { _id: id }, 'DEFAULT').then(() => {
      const partitionNameExt = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/name');
      const baseUrl = fhirAxios.__genUrl(partitionNameExt.valueString);
      mcsd.cleanCache(`url_${baseUrl}`, true);

      hapi.deletePartition({ partitionID }).then(() => {
        getPairsFromSource(id).then((pairs) => {
          async.eachSeries(pairs, (pair, nxt) => {
            deleteSourcePair((`Basic/${pair.resource.id}`)).then(() => nxt()).catch((err) => {
              logger.error(err);
              return res.status(500).send();
            });
          }, () => res.status(200).send());
        }).catch((err) => {
          logger.error(err);
          return res.status(500).send();
        });
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).send();
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

router.delete('/deleteSourcePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'delete-source-pair');
  if (!allowed) {
    return res.status(401).json(outcomes.DENIED);
  }
  const {
    pairId,
    userID,
    pairOwner,
  } = req.query;
  deleteSourcePair({ pairID: pairId, userID }).then(() => {
    const src1DB = mixin.toTitleCase(req.query.source1Name + pairOwner);
    const src2DB = mixin.toTitleCase(req.query.source2Name + pairOwner);
    const src1Url = URI(config.get('mCSD:url')).segment(src1DB);
    const src2Url = URI(config.get('mCSD:url')).segment(src2DB);
    mcsd.cleanCache(`url_${src1Url.toString()}`, true);
    mcsd.cleanCache(`url_${src2Url.toString()}`, true);
    return res.status(200).send();
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

module.exports = router;
