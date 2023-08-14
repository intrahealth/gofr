const async = require('async');
const URI = require('urijs');
const fhirpath = require('fhirpath');
const express = require('express');

const router = express.Router();

const logger = require('../winston');
const fhirAxios = require('../modules/fhirAxios');
const dataSources = require('../modules/dataSources');
const mixin = require('../mixin');
const fhir = require('../fhir');
const dhis = require('../dhis');
const mcsd = require('../mcsd')();
const hapi = require('../hapi');
const config = require('../config');
const outcomes = require('../../config/operationOutcomes');

function destroyPartition(partitionName, partitionID) {
  logger.info(`Destroying partition ${partitionName}`);
  return new Promise((resolve, reject) => {
    const deleteResources = ['Location', 'Organization', 'HealthcareService', 'Basic', 'StructureDefinition', 'SearchParameter'];
    const promises = [];
    const expungeParams = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'expungeDeletedResources',
          valueBoolean: true,
        },
        {
          name: 'expungePreviousVersions',
          valueBoolean: true,
        },
        {
          name: 'expungeEverything',
          valueBoolean: true,
        },
        {
          name: 'count',
        },
      ],
    };
    for (const resource of deleteResources) {
      promises.push(new Promise((resolve, reject) => {
        fhirAxios.delete(resource, { _count: 0 }, partitionName).then(() => {
          fhirAxios.expunge(resource, expungeParams, partitionName).then(() => {
            resolve();
          }).catch((err) => {
            logger.error(err);
            reject();
          });
        }).catch((err) => {
          logger.error(err);
          reject();
        });
      }));
    }

    Promise.all(promises).then(() => {
      hapi.deletePartition({ partitionID }).then(() => resolve()).catch((err) => {
        logger.error(err);
        return reject();
      });
    }).catch(() => reject());
  });
}
function getLastUpdateTime(sources) {
  return new Promise((resolve) => {
    async.eachOfSeries(sources, (server, key, nxtServer) => {
      if (server.sourceType === 'FHIR') {
        fhir.getLastUpdate(server.id, (lastUpdate) => {
          if (lastUpdate) {
            sources[key].lastUpdate = lastUpdate;
          }
          return nxtServer();
        });
      } else if (server.sourceType === 'DHIS2') {
        if (server.password) {
          server.password = mixin.decrypt(server.password);
        }
        const auth = `Basic ${Buffer.from(`${server.username}:${server.password}`).toString('base64')}`;
        const dhis2URL = new URI(server.host);
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
          const pairDetails = pairRes.resource.extension && pairRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
          promises.push(new Promise((resolve, reject) => {
            const src1Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
            const src2Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
            const pairExt = mixin.flattenExtension(pairDetails.extension);
            const partId = pairExt['http://gofr.org/fhir/StructureDefinition/partition'].reference;
            const partRes = partsRes.find(part => part.resource.id === partId.split('/')[1]);
            const partDetails = partRes.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
            const partExt = mixin.flattenExtension(partDetails.extension);
            const userId = partExt['http://gofr.org/fhir/StructureDefinition/owner'][0].find(ext => ext.url === 'userID').valueReference.reference;
            const ownerName = usersRes.find(usr => usr.resource.id === userId.split('/')[1]).resource.name[0].text;
            const whereSharedUsers = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser').extension.where(url='user').valueReference.reference";
            const _sharedUsers = fhirpath.evaluate(partRes.resource, whereSharedUsers);
            const sharedUsers = [];
            for (const user of _sharedUsers) {
              sharedUsers.push({
                id: user.split('/')[1],
                name: usersRes.find(usr => usr.resource.id === user.split('/')[1]).resource.name[0].text,
              });
            }

            const whereActiveUsers = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='activeUsers').valueReference.reference";
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
              const src1Part = partsRes.find(part => part.resource.id === fhirpath.evaluate(src1Res.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/datasource').extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').valueReference.reference")[0].split('/')[1]);
              const src2Part = partsRes.find(part => part.resource.id === fhirpath.evaluate(src2Res.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/datasource').extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').valueReference.reference")[0].split('/')[1]);
              const pair = {
                id: pairRes.resource.id,
                name: fhirpath.evaluate(
                  partRes.resource,
                  "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString",
                )[0],
                display: fhirpath.evaluate(
                  pairRes.resource,
                  "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/datasource').extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString",
                )[0],
                source1: {
                  id: src1Ext.valueReference.reference.split('/')[1],
                  name: fhirpath.evaluate(src1Part.resource, "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString")[0],
                  display: src1Ext.valueReference.display,
                  user: {
                    id: fhirpath.evaluate(
                      src1Part.resource,
                      "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/owner').extension.where(url='userID').valueReference.reference",
                    )[0].split('/')[1],
                  },
                },
                source2: {
                  id: src2Ext.valueReference.reference.split('/')[1],
                  name: fhirpath.evaluate(
                    src2Part.resource,
                    "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/name').valueString",
                  )[0],
                  display: src2Ext.valueReference.display,
                  user: {
                    id: fhirpath.evaluate(
                      src2Part.resource,
                      "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/owner').extension.where(url='userID').valueReference.reference",
                    )[0].split('/')[1],
                  },
                },
                user: {
                  id: userId.split('/')[1],
                  name: ownerName,
                },
                sharedUsers,
                activeUsers,
                status: fhirpath.evaluate(
                  pairRes.resource,
                  "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/datasourcepair').extension.where(url='http://gofr.org/fhir/StructureDefinition/status').valueString",
                )[0],
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
          const pairDetails = entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
          for (const index in pairDetails.extension) {
            if (pairDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/status' && pairDetails.extension[index].valueString === 'active') {
              pairDetails.extension[index].valueString = 'inactive';
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
          const pairDetails = entry.resource.extension && entry.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
          for (const index in pairDetails.extension) {
            if (pairDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/shared') {
              for (const sharedIndex in pairDetails.extension[index].extension) {
                if (pairDetails.extension[index].extension[sharedIndex].url === 'activeUsers' && pairDetails.extension[index].extension[sharedIndex].valueReference.reference === userID) {
                  pairDetails.extension[index].extension.splice(sharedIndex, 1);
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
      const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
      const whereSharedUsers = "Basic.extension.where(url='http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser').extension.where(url='user').valueReference.reference";
      const sharedUsers = fhirpath.evaluate(partition.resource, whereSharedUsers);
      if (userID && sharedUsers.includes(`Person/${userID}`)) {
        isShared = true;
        for (const sharedIndex in partDetails.extension) {
          if (partDetails.extension[sharedIndex].url === 'http://gofr.org/fhir/StructureDefinition/shared') {
            for (const sharedUserIndex in partDetails.extension[sharedIndex].extension) {
              if (partDetails.extension[sharedIndex].extension[sharedUserIndex].url === 'http://gofr.org/fhir/StructureDefinition/shareduser') {
                const index = partDetails.extension[sharedIndex].extension[sharedUserIndex].extension.findIndex(sharedUser => sharedUser.url === 'user' && sharedUser.valueReference.reference === `Person/${userID}`);
                if (index !== -1) {
                  partDetails.extension[sharedIndex].extension[sharedUserIndex].extension.splice(index, 1);
                }
              }
              const index = partDetails.extension[sharedIndex].extension.findIndex(shared => shared.url === 'activeUsers' && shared.valueReference.reference === `Person/${userID}`);
              if (index !== -1) {
                partDetails.extension[sharedIndex].extension.splice(index, 1);
              }
            }
          }
        }
      }
      let partitionID;
      const partIdExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
      if (partIdExt) {
        partitionID = partIdExt.valueInteger;
      } else {
        return reject();
      }
      let partitionName;
      const partitionNameExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/name');
      if (partitionNameExt) {
        partitionName = partitionNameExt.valueString;
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
        const mappingUrl = fhirAxios.__genUrl(partitionName);
        mcsd.cleanCache(`url_${mappingUrl}`, true);
        destroyPartition(partitionName, partitionID).then(() => {
          fhirAxios.delete('Basic', { _id: pair.resource.id }, 'DEFAULT').then(() => resolve()).catch((err) => {
            logger.error(err);
            return reject();
          });
        }).catch(() => reject());
      }
    });
  });
}

router.post('/addSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'add-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const fields = req.body
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
        url: 'http://gofr.org/fhir/StructureDefinition/datasource',
        extension: [{
          url: 'http://gofr.org/fhir/StructureDefinition/partition',
          valueReference: {
            reference: partitionID,
          },
        }],
      }],
    };
    resource.extension[0].extension.push({
      url: 'http://gofr.org/fhir/StructureDefinition/name',
      valueString: fields.name,
    });
    if (fields.host) {
      resource.extension[0].extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/host',
        valueString: fields.host,
      });
    }
    if (fields.sourceType) {
      resource.extension[0].extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/sourceType',
        valueString: fields.sourceType,
      });
    }
    if (fields.source) {
      resource.extension[0].extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/source',
        valueString: fields.source,
      });
    }
    if (fields.username) {
      resource.extension[0].extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/username',
        valueString: fields.username,
      });
    }
    if (fields.password) {
      resource.extension[0].extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/password',
        valueString: mixin.encrypt(fields.password),
      });
    }
    const partitionExtInd = partition.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
    partition.extension[partitionExtInd].extension.push({
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
      resource.extension[0].extension.push({
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

router.post('/editSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'adddatasource');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const fields = req.body
  logger.info('Received a request to edit a data source');
  fhirAxios.read('Basic', fields.id.split('/')[1], '', 'DEFAULT').then((source) => {
    let password;
    if (fields.password) {
      password = mixin.encrypt(fields.password);
    }
    const dsDetails = source.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
    for (const index in dsDetails.extension) {
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/name' && fields.display) {
        dsDetails.extension[index].valueString = fields.display;
      }
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/host' && fields.host) {
        dsDetails.extension[index].valueString = fields.host;
      }
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/sourceType' && fields.sourceType) {
        dsDetails.extension[index].valueString = fields.sourceType;
      }
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/source' && fields.source) {
        dsDetails.extension[index].valueString = fields.source;
      }
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/username' && fields.username) {
        dsDetails.extension[index].valueString = fields.username;
      }
      if (dsDetails.extension[index].url === 'http://gofr.org/fhir/StructureDefinition/password' && password) {
        dsDetails.extension[index].valueString = password;
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

router.get('/getSource/:userID/:orgId?', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'get-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  let isAdmin = false;
  if (req.user.permissions['*'] && req.user.permissions['*']['*']) {
    isAdmin = true;
  }
  dataSources.getSources({ isAdmin, orgId: req.params.orgId, userID: req.params.userID }).then((sources) => {
    getLastUpdateTime(sources).then(() => {
      logger.info(`returning list of ${sources.length} data sources`);
      res.status(200).json({
        sources,
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).send('An error has occured while getting data source');
    });
  }).catch(err => res.status(500).send());
});

router.get('/getSourceDetails/:partitionID', (req, res) => {
  const id = req.params.partitionID;
  const allowed = req.user.hasPermissionByName('special', 'custom', 'view-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const searchParams = {
    _id: id,
    _revinclude: 'Basic:datasourcepartition',
    _include: ['Basic:partitionowner', 'Basic:partitionshareduser'],
  };
  fhirAxios.searchAll('Basic', searchParams, 'DEFAULT').then((data) => {
    if (!data.entry || data.entry.length === 0) {
      return res.status(404).send();
    }
    const datasource = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-datasource')).resource;
    const whereGeneratedFrom = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/datasource').extension.where(url='http://gofr.org/fhir/StructureDefinition/generatedFrom')";
    const _generatedFrom = fhirpath.evaluate(datasource, whereGeneratedFrom);
    const generatedFrom = [];
    for (const gen of _generatedFrom) {
      generatedFrom.push({
        name: gen.valueString,
        value: gen.valueString,
      });
    }
    const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition')).resource;
    const usersRes = data.entry.filter(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-person-user'));

    const whereShareToAll = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareToAll')";
    const _shareToAll = fhirpath.evaluate(partition, whereShareToAll);
    const shareToAll = {};
    _shareToAll.forEach((shall) => {
      if (shall.url === 'activated') {
        shareToAll.activated = shall.valueBoolean;
      } else {
        shareToAll.activated = false;
      }
      if (shall.url === 'limitByUserLocation') {
        shareToAll.limitByUserLocation = shall.valueBoolean;
      } else {
        shareToAll.limitByUserLocation = false;
      }
    });

    const whereSharedUsers = "Basic.extension.where('http://gofr.org/fhir/StructureDefinition/partition').extension.where(url='http://gofr.org/fhir/StructureDefinition/shared').extension.where(url='http://gofr.org/fhir/StructureDefinition/shareduser')";
    const _sharedUsers = fhirpath.evaluate(partition, whereSharedUsers);
    const sharedUsers = [];
    _sharedUsers.forEach((shareduser) => {
      const user = shareduser.extension.find(ext => ext.url === 'user');
      const locationLimits = shareduser.extension.filter(ext => ext.url === 'locationLimit');
      const userpermissions = shareduser.extension.filter(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/userpermission');
      const limits = [];
      locationLimits.forEach((limit) => {
        limits.push(limit.valueReference.reference);
      });
      const permissions = [];
      const resources = ['Location', 'Organization', 'HealthcareService'];
      userpermissions.forEach((permission) => {
        const resource = permission.extension.find(ext => ext.url === 'resource');
        const constraint = permission.extension.find(ext => ext.url === 'constraint');
        const resourcepermissions = permission.extension.filter(ext => ext.url === 'permission');
        let entity;
        if (!resources.includes(resource.valueCode)) {
          return;
        }
        let facility_constraint = '';
        let profiles = config.get('profiles:facility');
        for (const profile of profiles) {
          if (!facility_constraint) {
            facility_constraint = `meta.profile contains '${profile}'`;
          } else {
            facility_constraint += ` and meta.profile contains '${profile}'`;
          }
        }
        let jurisdiction_constraint = '';
        profiles = config.get('profiles:jurisdiction');
        for (const profile of profiles) {
          if (!jurisdiction_constraint) {
            jurisdiction_constraint = `meta.profile contains '${profile}'`;
          } else {
            jurisdiction_constraint += ` and meta.profile contains '${profile}'`;
          }
        }
        if (resource.valueCode === 'Location' && facility_constraint === constraint.valueString) {
          entity = 'Facility';
        } else if (resource.valueCode === 'Location' && jurisdiction_constraint === constraint.valueString) {
          entity = 'Jurisdiction';
        } else if (resource.valueCode === 'HealthcareService') {
          entity = 'Healthcare Services';
        } else if (resource.valueCode === 'Organization') {
          entity = 'Organizations';
        }
        resourcepermissions.forEach((resPerm) => {
          let hReadablePermission;
          let permissionsId;
          if (resPerm.valueCode === 'write') {
            hReadablePermission = `Add/Update ${entity}`;
          } else if (resPerm.valueCode === 'read') {
            hReadablePermission = `View ${entity}`;
          }
          permissionsId = `${resPerm.valueCode}_`;
          if (resource.valueCode === 'Organization') {
            permissionsId += 'organization';
          } else if (resource.valueCode === 'HealthcareService') {
            permissionsId += 'service';
          } else if (resource.valueCode === 'Location' && facility_constraint === constraint.valueString) {
            permissionsId += 'facility';
          } else if (resource.valueCode === 'Location' && jurisdiction_constraint === constraint.valueString) {
            permissionsId += 'jurisdiction';
          }
          permissions.push({
            id: permissionsId,
            text: hReadablePermission,
            resource: resource.valueCode,
            permission: resPerm.valueCode,
            constraint,
          });
        });
      });
      const userid = user.valueReference.reference.split('/')[1];
      sharedUsers.push({
        id: userid,
        name: usersRes.find(usr => usr.resource.id === userid).resource.name[0].text,
        limits,
        permissions,
      });
    });
    return res.json({
      generatedFrom,
      sharedUsers,
    });
  });
});

router.get('/countLevels', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'view-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
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
            const dsDetails = src.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
            const levelMapping = {};
            const levelMapExt = dsDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
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
            return callback(false, {});
          });
        },
        levelMapping2(callback) {
          fhirAxios.read('Basic', source2Id, '', 'DEFAULT').then((src) => {
            const dsDetails = src.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
            const levelMapping = {};
            const levelMapExt = dsDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
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
            return callback(false, {});
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

router.post('/updatePermissions', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'share-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to update data source permissions');
  const fields = req.body
  const permissions = JSON.parse(fields.permissions);
  const { user, partition } = fields;
  const _permissions = generatePermissions(permissions);
  fhirAxios.read('Basic', partition, '', 'DEFAULT').then((dsrcPartition) => {
    if (!dsrcPartition || !dsrcPartition.extension) {
      logger.error(err);
      logger.error('An error occured while updating datasource permissions');
      return res.status(500).send('An error occured while sharing data source');
    }
    const partDetails = dsrcPartition.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
    let sharedIndex = partDetails.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
    if (sharedIndex === -1) {
      partDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/shared',
        extension: [],
      });
      sharedIndex = 0;
    }
    const userExists = partDetails.extension[sharedIndex].extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shareduser' && ext.extension.find(shareExt => shareExt.url === 'user' && shareExt.valueReference.reference === `Person/${user}`));
    if (userExists !== -1) {
      partDetails.extension[sharedIndex].extension.splice(userExists, 1);
    }
    const userIndex = partDetails.extension[sharedIndex].extension.push({
      url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
      extension: [],
    });
    partDetails.extension[sharedIndex].extension[userIndex - 1].extension.push({
      url: 'user',
      valueReference: {
        reference: `Person/${user}`,
      },
    }, ..._permissions);
    fhirAxios.update(dsrcPartition, 'DEFAULT').then(() => {
      logger.info('Data source permissions updated successfully');
      return res.status(200).send();
    }).catch((err) => {
      logger.error(err);
      logger.error('An error occured while updating datasource permissions');
      res.status(500).send('An error occured while sharing data source');
    });
  }).catch((err) => {
    logger.error(err);
    logger.error('An error occured while updating datasource permissions');
    res.status(500).send('An error occured while sharing data source');
  });
});

router.post('/shareSource', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'share-data-source');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to share data source');
  const fields = req.body
  const users = JSON.parse(fields.users);
  const permissions = JSON.parse(fields.permissions);
  const _permissions = generatePermissions(permissions);
  const { limitLocationId } = fields;
  fhirAxios.search('Basic', { _id: fields.shareSource, _include: 'Basic:datasourcepartition' }, 'DEFAULT').then((data) => {
    const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
    const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
    let sharedIndex = partDetails.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
    if (sharedIndex === -1) {
      partDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/shared',
        extension: [],
      });
      sharedIndex = 0;
    }
    share(partDetails.extension[sharedIndex].extension, _permissions);
    function share(extension, permissions) {
      users.forEach((user) => {
        const userExists = extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shareduser' && ext.extension.find(shareExt => shareExt.url === 'user' && shareExt.valueReference.reference === `Person/${user}`));
        if (userExists !== -1) {
          extension.splice(userExists, 1);
        }
        const userIndex = extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
          extension: [],
        });
        extension[userIndex - 1].extension.push({
          url: 'user',
          valueReference: {
            reference: `Person/${user}`,
          },
        }, ...permissions);
        if (limitLocationId) {
          extension[userIndex - 1].extension.push({
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

router.post('/createSourcePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'create-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const fields = req.body
  let {
    source1, source2, userID, dhis2OrgId, singlePair,
  } = fields;
  try {
    singlePair = JSON.parse(singlePair);
  } catch (error) {
    logger.error(error);
  }
  const pairName = fields.name;
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
          return res.status(400).json({ error: 'Single pair limit is active and a pair already exists, cant create more pairs' });
        }
        const database = mixin.toTitleCase(source1.display + userID + source2.display);
        hapi.addPartition({ name: database, description: 'mapping data source', userID }).then(async (partitionID) => {
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

          let source1Res;
          let source2Res;
          searchParams = {
            _id: `${source1.id},${source2.id}`,
          };
          try {
            const sources = await fhirAxios.search('Basic', searchParams, 'DEFAULT');
            source1Res = sources.entry && sources.entry.find(entry => entry.resource.id === source1.id);
            source2Res = sources.entry && sources.entry.find(entry => entry.resource.id === source2.id);
          } catch (error) {
            logger.error(error);
            return res.status(500).send();
          }
          const ds1Details = source1Res.resource.extension && source1Res.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
          const ds2Details = source2Res.resource.extension && source2Res.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
          const levelExt1 = ds1Details.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
          const levelExt2 = ds2Details.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/levelMapping');
          await mcsd.createFakeOrgID(database).catch((err) => {
            logger.error(err);
          });
          const resource = {
            resourceType: 'Basic',
            meta: {
              profile: [
                'http://gofr.org/fhir/StructureDefinition/gofr-datasource-pair',
                'http://gofr.org/fhir/StructureDefinition/gofr-datasource',
              ],
            },
            extension: [{
              url: 'http://gofr.org/fhir/StructureDefinition/datasourcepair',
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
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/recoStatus',
                valueString: 'in-progress',
              }],
            }, {
              url: 'http://gofr.org/fhir/StructureDefinition/datasource',
              extension: [{
                url: 'http://gofr.org/fhir/StructureDefinition/partition',
                valueReference: {
                  reference: partitionID,
                },
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/name',
                valueString: `${pairName}`,
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/sourceType',
                valueString: 'merging',
              }, {
                url: 'http://gofr.org/fhir/StructureDefinition/source',
                valueString: 'merging',
              }],
            }],
          };

          let generatedFrom = [];
          const srcs1 = fhirpath.evaluate(
            ds1Details,
            "extension.where(url='http://gofr.org/fhir/StructureDefinition/generatedFrom').valueString",
          );
          const srcs2 = fhirpath.evaluate(
            ds2Details,
            "extension.where(url='http://gofr.org/fhir/StructureDefinition/generatedFrom').valueString",
          );
          generatedFrom = generatedFrom.concat(srcs1);
          generatedFrom = generatedFrom.concat(srcs2);
          generatedFrom.push(source1.display);
          generatedFrom.push(source2.display);
          generatedFrom = [...new Set(generatedFrom)];
          for (const src of generatedFrom) {
            resource.extension[1].extension.push({
              url: 'http://gofr.org/fhir/StructureDefinition/generatedFrom',
              valueString: src,
            });
          }
          if (levelExt1) {
            resource.extension[1].extension.push({
              url: 'http://gofr.org/fhir/StructureDefinition/levelMapping',
              valueString: levelExt1.valueString,
            });
          } else if (levelExt2) {
            resource.extension[1].extension.push({
              url: 'http://gofr.org/fhir/StructureDefinition/levelMapping',
              valueString: levelExt2.valueString,
            });
          }
          const partitionExtInd = partition.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
          partition.extension[partitionExtInd].extension.push({
            url: 'http://gofr.org/fhir/StructureDefinition/shared',
            extension: [{
              url: 'shareToSameOrgid',
              valueBoolean: false,
            }, {
              url: 'http://gofr.org/fhir/StructureDefinition/shareToAll',
              extension: [{
                url: 'activated',
                valueBoolean: false,
              }, {
                url: 'limitByUserLocation',
                valueBoolean: false,
              }],
            }],
          });

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

          // get active pair and deactivate
          Promise.all([deactivatePair(userID), deactivateSharedPair(userID)]).then(() => {
            fhirAxios.create(bundle, 'DEFAULT').then(() => {
              const levelMapping = {};
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
          }).catch(() => res.status(500).send());
        });
      });
    } else {
      return res.status(400).send();
    }
  });
});

router.post('/shareSourcePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'share-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to share data source pair');
  const fields = req.body
  const users = JSON.parse(fields.users);
  const permissions = JSON.parse(fields.permissions);
  const _permissions = generatePermissions(permissions);
  const { limitLocationId } = fields;
  fhirAxios.search('Basic', { _id: fields.sharePair, _include: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
    const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
    const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
    let sharedIndex = partDetails.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
    if (sharedIndex === -1) {
      partDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/shared',
        extension: [],
      });
      sharedIndex = 0;
    }
    share(partDetails.extension[sharedIndex].extension, _permissions);
    function share(extension, permissions) {
      users.forEach((user) => {
        const userExists = extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shareduser' && ext.extension.find(shareExt => shareExt.url === 'user' && shareExt.valueReference.reference === `Person/${user}`));
        if (userExists !== -1) {
          extension.splice(userExists, 1);
        }
        const userIndex = extension.push({
          url: 'http://gofr.org/fhir/StructureDefinition/shareduser',
          extension: [],
        });
        extension[userIndex - 1].extension.push({
          url: 'user',
          valueReference: {
            reference: `Person/${user}`,
          },
        }, ...permissions);
        if (limitLocationId) {
          extension[userIndex - 1].extension.push({
            url: 'locationLimit',
            valueReference: {
              reference: limitLocationId,
            },
          });
        }
      });
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

router.post('/activatePair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'activate-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to activate shared data source pair');
  const fields = req.body
  const { id, userID } = fields;
  Promise.all([deactivatePair(userID), deactivateSharedPair(userID)]).then(() => {
    fhirAxios.read('Basic', id, '', 'DEFAULT').then((data) => {
      const pairDetails = data.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
      const status = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/status');
      status.valueString = 'active';
      fhirAxios.update(data, 'DEFAULT').then(() => {
        res.status(200).send();
      }).catch((err) => {
        logger.error(err);
        return res.status(500).send();
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(200).send();
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

router.post('/activateSharedPair', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'activate-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to activate shared data source pair');
  const fields = req.body
  const { pairID, userID } = fields;
  Promise.all([deactivatePair(userID), deactivateSharedPair(userID)]).then(() => {
    fhirAxios.search('Basic', { _id: pairID, _include: 'Basic:pairpartition' }, 'DEFAULT').then((data) => {
      const partition = data.entry.find(entry => entry.resource.meta.profile.includes('http://gofr.org/fhir/StructureDefinition/gofr-partition'));
      if (!partition) {
        logger.error(`Pair ${pairID} Not Found`);
        return res.status(500).send();
      }
      const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
      const sharedIndex = partDetails.extension.findIndex(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/shared');
      if (sharedIndex !== -1) {
        const exists = partDetails.extension[sharedIndex].extension.find(ext => ext.url === 'activeUsers' && ext.valueReference.reference === `Person/${userID}`);
        if (!exists) {
          partDetails.extension[sharedIndex].extension.push({
            url: 'activeUsers',
            valueReference: {
              reference: `Person/${userID}`,
            },
          });
        }
      } else {
        if (!partDetails.extension) {
          partDetails.extension = [];
        }
        partDetails.extension.push({
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
    }).catch((err) => {
      logger.error(err);
      return res.status(500).send();
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

router.post('/resetDataSourcePair/:userID', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'deactivate-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received a request to reset data source pair');
  Promise.all([deactivatePair(req.params.userID), deactivateSharedPair(req.params.userID)]).then(() => {
    res.status(200).send();
  }).catch((err) => {
    res.status(500).send();
  });
});

router.get('/getSourcePair/:userID/:dhis2OrgId?', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'get-source-pair');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
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
          const pairDetails = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
          const src1Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
          const src2Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
          const partition = partsRes.find(part => pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition' && ext.valueReference.reference.split('/')[1] === part.resource.id));
          const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
          let owner;
          if (partition) {
            const ownerExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/owner');
            if (ownerExt) {
              const userExt = ownerExt.extension.find(ext => ext.url === 'userID');
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
        async.each(pairsRes, (pair, nxtPair) => {
          const pairDetails = pair.resource.extension && pair.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
          const src1Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source1');
          const src2Ext = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/source2');
          const partition = partsRes.find(part => pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition' && ext.valueReference.reference.split('/')[1] === part.resource.id));
          const partDetails = partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
          let partitionOwner;
          if (partition) {
            const ownerExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/owner');
            if (ownerExt) {
              const userExt = ownerExt.extension.find(ext => ext.url === 'userID');
              partitionOwner = userExt.valueReference.reference;
            }
          }
          if (partitionOwner) {
            fhirAxios.read(partitionOwner.split('/')[0], partitionOwner.split('/')[1], '', 'DEFAULT').then((resp) => {
              const owner = {
                id: resp.id,
                name: '',
              };
              if (resp.name) {
                if (resp.name[0].text) {
                  owner.name = resp.name[0].text;
                } else {
                  if (resp.name[0].given) {
                    owner.name = resp.name[0].given.join(' ');
                  }
                  if (resp.name[0].family) {
                    owner.name += resp.name[0].family;
                  }
                }
              }
              pairs.push({
                source1Name: src1Ext.valueReference.display,
                source2Name: src2Ext.valueReference.display,
                owner,
              });
              return nxtPair();
            });
          } else {
            pairs.push({
              source1Name: src1Ext.valueReference.display,
              source2Name: src2Ext.valueReference.display,
              owner: {
                id: partitionOwner.split('/')[1],
              },
            });
            return nxtPair();
          }
        }, () => callback(null));
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
    return res.status(403).json(outcomes.DENIED);
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
    const partDetails = partition.resource.extension && partition.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partition');
    let partitionID;
    const partIdExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/partitionID');
    if (partIdExt) {
      partitionID = partIdExt.valueInteger;
    } else {
      return res.status(500).send();
    }
    let partitionName;
    const partitionNameExt = partDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/name');
    if (partitionNameExt) {
      partitionName = partitionNameExt.valueString;
    } else {
      return res.status(500).send();
    }
    destroyPartition(partitionName, partitionID).then(() => {
      const baseUrl = fhirAxios.__genUrl(partitionName);
      mcsd.cleanCache(`url_${baseUrl}`, true);
      fhirAxios.delete('Basic', { _id: id }, 'DEFAULT').then(() => {
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
    return res.status(403).json(outcomes.DENIED);
  }
  const {
    pairId,
    userID,
    pairOwner,
  } = req.query;
  deleteSourcePair({ pairID: pairId, userID }).then(() => {
    const src1DB = mixin.toTitleCase(req.query.source1Name + pairOwner);
    const src2DB = mixin.toTitleCase(req.query.source2Name + pairOwner);
    const src1Url = fhirAxios.__genUrl(src1DB);
    const src2Url = fhirAxios.__genUrl(src2DB);
    mcsd.cleanCache(`url_${src1Url}`, true);
    mcsd.cleanCache(`url_${src2Url}`, true);
    return res.status(200).send();
  }).catch((err) => {
    logger.error(err);
    return res.status(500).send();
  });
});

router.post('/updateDatasetAutosync', (req, res) => {
  logger.info('Received a request to edit a data source auto sync');
  const fields = req.body
  fields.enabled = JSON.parse(fields.enabled);
  fhirAxios.read('Basic', fields.id, '', 'DEFAULT').then((dataSource) => {
    let updated = false;
    const dsDetails = dataSource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasource');
    dsDetails.extension.forEach((ext, index) => {
      if (ext.url === 'http://gofr.org/fhir/StructureDefinition/autoSync') {
        dsDetails.extension[index].valueBoolean = fields.enabled;
        updated = true;
      }
    });
    if (!updated) {
      dsDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/autoSync',
        valueBoolean: fields.enabled,
      });
    }
    fhirAxios.update(dataSource, 'DEFAULT').catch((err) => {
      logger.error(err);
    });
  }).catch((err) => {
    logger.error(err);
  });
});

function generatePermissions(permissions) {
  const _permissions = [{
    url: 'http://gofr.org/fhir/StructureDefinition/userpermission',
    extension: [{
      url: 'resource',
      valueCode: 'metadata',
    }, {
      url: 'permission',
      valueCode: 'read',
    }],
  }];
  permissions.forEach((permission) => {
    if (permission.split('_')[1] === 'facility') {
      let constraint = '';
      const profiles = config.get('profiles:facility');
      for (const profile of profiles) {
        if (!constraint) {
          constraint = `meta.profile contains '${profile}'`;
        } else {
          constraint += ` and meta.profile contains '${profile}'`;
        }
      }
      const permsExist = _permissions.findIndex(
        perm => perm.extension.find(
          ext => ext.url === 'resource' && ext.valueCode === 'Location',
        ) && perm.extension.find(
          ext => ext.url === 'constraint' && ext.valueString === constraint,
        ),
      );
      if (permsExist !== -1) {
        _permissions[permsExist].extension.push({
          url: 'permission',
          valueCode: permission.split('_')[0],
        });
      } else {
        _permissions.push({
          url: 'http://gofr.org/fhir/StructureDefinition/userpermission',
          extension: [{
            url: 'resource',
            valueCode: 'Location',
          }, {
            url: 'permission',
            valueCode: permission.split('_')[0],
          }, {
            url: 'constraint',
            valueString: constraint,
          }],
        });
      }
    } else if (permission.split('_')[1] === 'jurisdiction') {
      let constraint = '';
      const profiles = config.get('profiles:jurisdiction');
      for (const profile of profiles) {
        if (!constraint) {
          constraint = `meta.profile contains '${profile}'`;
        } else {
          constraint += ` and meta.profile contains '${profile}'`;
        }
      }
      const permsExist = _permissions.findIndex(
        perm => perm.extension.find(
          ext => ext.url === 'resource' && ext.valueCode === 'Location',
        ) && perm.extension.find(
          ext => ext.url === 'constraint' && ext.valueString === constraint,
        ),
      );
      if (permsExist !== -1) {
        _permissions[permsExist].extension.push({
          url: 'permission',
          valueCode: permission.split('_')[0],
        });
      } else {
        _permissions.push({
          url: 'http://gofr.org/fhir/StructureDefinition/userpermission',
          extension: [{
            url: 'resource',
            valueCode: 'Location',
          }, {
            url: 'permission',
            valueCode: permission.split('_')[0],
          }, {
            url: 'constraint',
            valueString: constraint,
          }],
        });
      }
    } else if (permission.split('_')[1] === 'organization') {
      const permsExist = _permissions.findIndex(perm => perm.extension.find(ext => ext.url === 'resource' && ext.valueCode === 'Organization'));
      if (permsExist !== -1) {
        _permissions[permsExist].extension.push({
          url: 'permission',
          valueCode: permission.split('_')[0],
        });
      } else {
        _permissions.push({
          url: 'http://gofr.org/fhir/StructureDefinition/userpermission',
          extension: [{
            url: 'resource',
            valueCode: 'Organization',
          }, {
            url: 'permission',
            valueCode: permission.split('_')[0],
          }],
        });
      }
    } else if (permission.split('_')[1] === 'service') {
      const permsExist = _permissions.findIndex(perm => perm.extension.find(ext => ext.url === 'resource' && ext.valueCode === 'HealthcareService'));
      if (permsExist !== -1) {
        _permissions[permsExist].extension.push({
          url: 'permission',
          valueCode: permission.split('_')[0],
        });
      } else {
        _permissions.push({
          url: 'http://gofr.org/fhir/StructureDefinition/userpermission',
          extension: [{
            url: 'resource',
            valueCode: 'HealthcareService',
          }, {
            url: 'permission',
            valueCode: permission.split('_')[0],
          }],
        });
      }
    }
  });
  return _permissions;
}
module.exports = router;
