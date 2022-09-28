
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');

const router = express.Router();
const formidable = require('formidable');
const request = require('request');
const redis = require('redis');

const json2csv = require('json2csv').parse;
const async = require('async');
const config = require('../config');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const mixin = require('../mixin');
const mcsd = require('../mcsd')();
const scores = require('../scores')();

const logger = require('../winston');
const outcomes = require('../../config/operationOutcomes');
const fhirAxios = require('../modules/fhirAxios');

const levelMaps = config.get('levelMaps');

function recoStatus(pairId) {
  return new Promise((resolve) => {
    if (pairId.split('/').length === 2) {
      pairId = pairId.split('/')[1];
    }
    fhirAxios.read('Basic', pairId, '', 'DEFAULT').then((pair) => {
      const pairDetails = pair.extension && pair.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
      const status = pairDetails.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/recoStatus');
      if (status) {
        return resolve(status.valueString);
      }
      return resolve('Done');
    }).catch((err) => {
      logger.error(err);
      return resolve('Done');
    });
  });
}
router.get('/reconcile', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'data-source-reconciliation');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const {
    totalSource1Levels,
    totalSource2Levels,
    recoLevel,
    clientId,
    partition1,
    partition2,
    mappingPartition,
    id,
  } = req.query;
  let {
    source1LimitOrgId,
    source2LimitOrgId,
    getPotential,
  } = req.query;
  if (source1LimitOrgId.length === 0) {
    source1LimitOrgId = [mixin.getTopOrgId(partition1, 'Location')];
  }
  if (source2LimitOrgId.length === 0) {
    source2LimitOrgId = [mixin.getTopOrgId(partition2, 'Location')];
  }
  let {
    parentConstraint,
  } = req.query;
  try {
    parentConstraint = JSON.parse(parentConstraint);
  } catch (error) {
    logger.error(error);
  }
  try {
    getPotential = JSON.parse(getPotential);
  } catch (error) {
    logger.error(error);
  }
  // remove parent contraint for the first level
  if (recoLevel == 2) {
    parentConstraint = false;
  }
  if (!partition1 || !partition2 || !recoLevel) {
    logger.error({
      error: 'Missing source1 or source2 or reconciliation Level or userID',
    });
    res.status(400).json({
      error: 'Missing source1 or source2 or reconciliation Level or userID',
    });
  } else {
    if (!id) {
      res.status(200).send();
    }
    logger.info('Getting scores');
    const {
      orgid,
    } = req.query;
    let mcsdSource2All = null;
    let mcsdSource1All = null;

    const scoreRequestId = `scoreResults${clientId}`;
    let scoreResData = JSON.stringify({
      status: '1/3 - Loading Source2 and Source1 Data',
      error: null,
      percent: null,
    });
    redisClient.set(scoreRequestId, scoreResData, 'EX', 1200);
    async.parallel({
      source2Locations(callback) {
        mcsd.getLocationChildren({
          database: partition2,
          parent: source2LimitOrgId[0],
        }, (mcsdSource2) => {
          mcsdSource2All = mcsdSource2;
          let level;
          if (recoLevel === totalSource1Levels) {
            level = totalSource2Levels;
          } else {
            level = recoLevel;
          }

          if (levelMaps[orgid] && levelMaps[orgid][recoLevel]) {
            level = levelMaps[orgid][recoLevel];
          }
          mcsd.filterLocations(mcsdSource2, source2LimitOrgId[0], level, mcsdSource2Level => callback(false, mcsdSource2Level));
        });
      },
      source1Loations(callback) {
        mcsd.getLocationChildren({
          database: partition1,
          parent: source1LimitOrgId[0],
        }, (mcsdSource1) => {
          mcsdSource1All = mcsdSource1;
          if (id) {
            const locations = mcsdSource1.entry.filter(entry => entry.resource.id == id);
            const mcsdSource1Locations = {};
            if (locations.length > 0) {
              mcsdSource1Locations.total = 1;
              mcsdSource1Locations.entry = [];
              mcsdSource1Locations.entry = mcsdSource1Locations.entry.concat(locations);
              mcsdSource1Locations.total = 1;
            } else {
              mcsdSource1Locations.total = 0;
            }
            return callback(null, mcsdSource1Locations);
          }
          mcsd.filterLocations(mcsdSource1, source1LimitOrgId[0], recoLevel, mcsdSource1Level => callback(false, mcsdSource1Level));
        });
      },
      mappingData(callback) {
        mcsd.getLocations(mappingPartition, mcsdMapped => callback(false, mcsdMapped));
      },
    }, (error, results) => {
      if (recoLevel == totalSource1Levels) {
        scores.getBuildingsScores(
          results.source1Loations,
          results.source2Locations,
          results.mappingData,
          mcsdSource2All,
          mcsdSource1All,
          partition1,
          partition2,
          mappingPartition,
          recoLevel,
          totalSource1Levels,
          clientId,
          parentConstraint,
          getPotential, (scoreResults, source2Unmatched, totalAllMapped, totalAllFlagged, totalAllIgnored, totalAllNoMatch) => {
            const source1TotalAllNotMapped = (mcsdSource1All.entry.length - 1) - totalAllMapped;
            const responseData = {
              scoreResults,
              source2Unmatched,
              recoLevel,
              source2TotalRecords: results.source2Locations.entry.length,
              source2TotalAllRecords: mcsdSource2All.entry.length - 1,
              totalAllMapped,
              totalAllFlagged,
              totalAllNoMatch,
              totalAllIgnored,
              source1TotalAllNotMapped,
              source1TotalAllRecords: mcsdSource1All.entry.length - 1,
            };
            scoreResData = JSON.stringify({
              status: 'Done',
              error: null,
              percent: 100,
              responseData,
              stage: 'last',
            });
            redisClient.set(scoreRequestId, scoreResData, 'EX', 1200);
            if (id) {
              res.status(200).json(scoreResData);
            }
            logger.info('Score results sent back');
          },
        );
      } else {
        scores.getJurisdictionScore(
          results.source1Loations,
          results.source2Locations,
          results.mappingData,
          mcsdSource2All,
          mcsdSource1All,
          partition1,
          partition2,
          mappingPartition,
          recoLevel,
          totalSource1Levels,
          clientId,
          parentConstraint,
          getPotential,
          (scoreResults, source2Unmatched, totalAllMapped, totalAllFlagged, totalAllIgnored, totalAllNoMatch) => {
            const source1TotalAllNotMapped = (mcsdSource1All.entry.length - 1) - totalAllMapped;
            const responseData = {
              scoreResults,
              source2Unmatched,
              recoLevel,
              source2TotalRecords: results.source2Locations.entry.length,
              source2TotalAllRecords: mcsdSource2All.entry.length - 1,
              totalAllMapped,
              totalAllFlagged,
              totalAllNoMatch,
              totalAllIgnored,
              source1TotalAllNotMapped,
              source1TotalAllRecords: mcsdSource1All.entry.length - 1,
            };
            scoreResData = JSON.stringify({
              status: 'Done',
              error: null,
              percent: 100,
              responseData,
              stage: 'last',
            });
            redisClient.set(scoreRequestId, scoreResData, 'EX', 1200);
            if (id) {
              res.status(200).json(scoreResData);
            }
            logger.info('Score results sent back');
          },
        );
      }
    });
  }
});

router.get('/matchedLocations', (req, res) => {
  logger.info(`Received a request to return matched Locations in ${req.query.type} format for ${req.query.source1}${req.query.source2}`);
  const {
    partition1,
    partition2,
    mappingPartition,
    type,
  } = req.query;
  let {
    source1LimitOrgId,
    source2LimitOrgId,
  } = req.query;
  const topOrgId1 = mixin.getTopOrgId(partition1, 'Location');
  const topOrgId2 = mixin.getTopOrgId(partition2, 'Location');
  if (source1LimitOrgId.length === 0) {
    source1LimitOrgId = [topOrgId1];
  }
  if (source2LimitOrgId.length === 0) {
    source2LimitOrgId = [topOrgId2];
  }
  const matched = [];

  const flagCode = config.get('mapping:flagCode');
  const flagCommentCode = config.get('mapping:flagCommentCode');
  const matchCommentsCode = config.get('mapping:matchCommentsCode');
  const noMatchCode = config.get('mapping:noMatchCode');
  const ignoreCode = config.get('mapping:ignoreCode');
  const autoMatchedCode = config.get('mapping:autoMatchedCode');
  const manualllyMatchedCode = config.get('mapping:manualllyMatchedCode');

  mcsd.getLocations(mappingPartition, (mapped) => {
    if (type === 'FHIR') {
      logger.info('Sending back matched locations in FHIR specification');
      const mappedmCSD = {
        resourceType: 'Bundle',
        type: 'document',
        entry: [],
      };
      async.eachOf(mapped.entry, (entry, key, nxtEntry) => {
        if (entry.resource.meta.hasOwnProperty('tag')) {
          const flagged = entry.resource.meta.tag.find(tag => tag.code == flagCode);
          const noMatch = entry.resource.meta.tag.find(tag => tag.code == noMatchCode);
          const ignore = entry.resource.meta.tag.find(tag => tag.code == ignoreCode);
          if (noMatch || ignore || flagged) {
            delete mapped.entry[key];
          }
          return nxtEntry();
        }
        return nxtEntry();
      }, () => {
        mappedmCSD.entry = mappedmCSD.entry.concat(mapped.entry);
        return res.status(200).json(mappedmCSD);
      });
    } else {
      const source1Fields = ['source 1 name', 'source 1 ID'];
      const source2Fields = ['source 2 name', 'source 2 ID'];
      const levelMapping1 = JSON.parse(req.query.levelMapping1);
      const levelMapping2 = JSON.parse(req.query.levelMapping2);
      async.each(mapped.entry, (entry, nxtmCSD) => {
        let status,
          flagged,
          noMatch,
          ignore,
          autoMatched,
          manuallyMatched,
          matchCommentsTag,
          flagCommentsTag;
        if (entry.resource.meta.hasOwnProperty('tag')) {
          flagged = entry.resource.meta.tag.find(tag => tag.code == flagCode);
          noMatch = entry.resource.meta.tag.find(tag => tag.code == noMatchCode);
          ignore = entry.resource.meta.tag.find(tag => tag.code == ignoreCode);
          autoMatched = entry.resource.meta.tag.find(tag => tag.code == autoMatchedCode);
          manuallyMatched = entry.resource.meta.tag.find(tag => tag.code == manualllyMatchedCode);
          matchCommentsTag = entry.resource.meta.tag.find(tag => tag.code == matchCommentsCode);
          flagCommentsTag = entry.resource.meta.tag.find(tag => tag.code == flagCommentCode);
        }
        if (noMatch || ignore || flagged) {
          return nxtmCSD();
        }
        let comment;
        if (matchCommentsTag && matchCommentsTag.hasOwnProperty('display')) {
          comment = matchCommentsTag.display;
        }
        if (autoMatched) {
          status = 'Automatically Matched';
        } else {
          status = 'Manually Matched';
        }
        let source1ID = entry.resource.identifier.find(id => id.system === 'https://digitalhealth.intrahealth.org/source1');
        if (source1ID) {
          source1ID = source1ID.value.split('/').pop();
        } else {
          source1ID = '';
        }
        let source2ID = entry.resource.identifier.find(id => id.system === 'https://digitalhealth.intrahealth.org/source2');
        if (source2ID) {
          source2ID = source2ID.value.split('/').pop();
        } else {
          source2ID = '';
        }

        let source1Name = '';
        if (entry.resource.alias) {
          source1Name = entry.resource.alias.join(', ');
        }
        matched.push({
          'source 1 name': source1Name,
          'source 1 ID': source1ID,
          'source 2 name': entry.resource.name,
          'source 2 ID': source2ID,
          Status: status,
          Comments: comment,
        });
        return nxtmCSD();
      }, () => {
        async.series({
          source1mCSD(callback) {
            mcsd.getLocations(partition1, mcsd => callback(null, mcsd));
          },
          source2mCSD(callback) {
            mcsd.getLocations(partition2, mcsd => callback(null, mcsd));
          },
        }, (error, response) => {
          // remove unmapped levels
          const levels1 = Object.keys(levelMapping1);
          for (const level of levels1) {
            if (!levelMapping1[level] || levelMapping1[level] == 'null' || levelMapping1[level] == 'undefined' || levelMapping1[level] == 'false') {
              delete levelMapping1[level];
            }
          }

          const levels2 = Object.keys(levelMapping2);
          for (const level of levels2) {
            if (!levelMapping2[level] || levelMapping2[level] == 'null' || levelMapping2[level] == 'undefined' || levelMapping2[level] == 'false') {
              delete levelMapping2[level];
            }
          }
          // end of removing unmapped levels

          // get level of a facility
          const levelsArr1 = [];
          async.eachOf(levelMapping1, (level, key, nxtLevel) => {
            if (key.startsWith('level')) {
              levelsArr1.push(parseInt(key.replace('level', '')));
            }
            return nxtLevel();
          });
          const source1FacilityLevel = levelsArr1.length + 1;
          levelsArr1.push(source1FacilityLevel);

          const levelsArr2 = [];
          async.eachOf(levelMapping2, (level, key, nxtLevel) => {
            if (key.startsWith('level')) {
              levelsArr2.push(parseInt(key.replace('level', '')));
            }
            return nxtLevel();
          });
          const source2FacilityLevel = levelsArr2.length + 1;
          levelsArr2.push(source2FacilityLevel);
          // end of getting level of a facility

          let matchedCSV;
          async.each(levelsArr1, (srcLevel, nxtLevel) => {
            // increment level by one, because level 1 is a fake country/location
            level = srcLevel + 1;
            let thisFields = [];
            const parentsFields1 = [];
            const parentsFields2 = [];
            thisFields = thisFields.concat(source1Fields);
            // push other headers
            async.eachOf(levelMapping1, (level, key, nxtLevel) => {
              if (!key.startsWith('level')) {
                return nxtLevel();
              }
              let keyNum = key.replace('level', '');
              keyNum = parseInt(keyNum);
              if (keyNum >= srcLevel) {
                return nxtLevel();
              }
              parentsFields1.push(`Source1 ${level}`);
              thisFields.push(`Source1 ${level}`);
            });

            thisFields = thisFields.concat(source2Fields);
            async.eachOf(levelMapping2, (level, key, nxtLevel) => {
              if (!key.startsWith('level')) {
                return nxtLevel();
              }
              let keyNum = key.replace('level', '');
              keyNum = parseInt(keyNum);
              if (keyNum >= srcLevel) {
                return nxtLevel();
              }
              parentsFields2.push(`Source2 ${level}`);
              thisFields.push(`Source2 ${level}`);
            });
            thisFields = thisFields.concat(['Status', 'Comments']);
            // end of pushing other headers
            const levelMatched = [];
            mcsd.filterLocations(response.source1mCSD, topOrgId1, level, (mcsdLevel) => {
              async.each(mcsdLevel.entry, (source1Entry, nxtEntry) => {
                const thisMatched = matched.filter(mapped => mapped['source 1 ID'] === source1Entry.resource.id);
                if (!thisMatched || thisMatched.length === 0) {
                  return nxtEntry();
                }
                const thisMatched1 = {};
                const thisMatched2 = {};
                // spliting content of thisMatched so that we can append source1 parents after source 1 data and source2 parents
                // after source2 data
                thisMatched1['source 1 ID'] = thisMatched[0]['source 1 ID'];
                thisMatched1['source 1 name'] = thisMatched[0]['source 1 name'];
                thisMatched2['source 2 ID'] = thisMatched[0]['source 2 ID'];
                thisMatched2['source 2 name'] = thisMatched[0]['source 2 name'];
                // end of splitting content of thisMatched

                // getting parents
                async.series({
                  source1Parents(callback) {
                    mcsd.getLocationParentsFromData(source1Entry.resource.id, response.source1mCSD, 'names', (parents) => {
                      parents = parents.slice(0, parents.length - 1);
                      parents.reverse();
                      async.eachOf(parentsFields1, (parent, key, nxtParnt) => {
                        thisMatched1[parent] = parents[key];
                        return nxtParnt();
                      }, () => callback(null, thisMatched1));
                    });
                  },
                  source2Parents(callback) {
                    mcsd.getLocationParentsFromData(thisMatched[0]['source 2 ID'], response.source2mCSD, 'names', (parents) => {
                      parents = parents.slice(0, parents.length - 1);
                      parents.reverse();
                      for (const key in parentsFields2) {
                        const parent = parentsFields2[key];
                        thisMatched2[parent] = parents[key];
                      }
                      thisMatched2.Status = thisMatched[0].Status;
                      thisMatched2.Comments = thisMatched[0].Comments;
                      return callback(null, thisMatched2);
                    });
                  },
                }, (error, respo) => {
                  levelMatched.push(Object.assign(respo.source1Parents, respo.source2Parents));
                  return nxtEntry();
                });
              }, () => {
                if (levelMatched.length > 0) {
                  const csvString = json2csv(levelMatched, {
                    thisFields,
                  });
                  let colHeader;
                  if (levelMapping1[`level${srcLevel}`]) {
                    colHeader = levelMapping1[`level${srcLevel}`];
                  } else {
                    colHeader = 'Facilities';
                  }
                  if (!matchedCSV) {
                    matchedCSV = colHeader + os.EOL + csvString + os.EOL;
                  } else {
                    matchedCSV = matchedCSV + os.EOL + os.EOL + colHeader + os.EOL + csvString + os.EOL;
                  }
                }
                return nxtLevel();
              });
            });
          }, () => {
            res.status(200).send(matchedCSV);
          });
        });
      });
    }
  });
});

router.get('/unmatchedLocations', (req, res) => {
  const {
    partition1,
    partition2,
    mappingPartition,
    type,
  } = req.query;
  let {
    source1LimitOrgId,
    source2LimitOrgId,
  } = req.query;
  const levelMapping1 = JSON.parse(req.query.levelMapping1);
  const levelMapping2 = JSON.parse(req.query.levelMapping2);
  const topOrgId1 = mixin.getTopOrgId(partition1, 'Location');
  const topOrgId2 = mixin.getTopOrgId(partition2, 'Location');
  if (source1LimitOrgId.length === 0) {
    source1LimitOrgId = [topOrgId1];
  }
  if (source2LimitOrgId.length === 0) {
    source2LimitOrgId = [topOrgId2];
  }

  if (type == 'FHIR') {
    async.series({
      source1mCSD(callback) {
        mcsd.getLocationChildren({
          database: partition1,
          parent: source1LimitOrgId[0],
        }, mcsdRes => callback(null, mcsdRes));
      },
      source2mCSD(callback) {
        mcsd.getLocationChildren({
          database: partition2,
          parent: source2LimitOrgId[0],
        }, mcsdRes => callback(null, mcsdRes));
      },
    }, (error, response) => {
      async.parallel({
        source1Unmatched(callback) {
          scores.getUnmatched(response.source1mCSD, response.source1mCSD, mappingPartition, true, 'source1', null, (unmatched, mcsdUnmatched) => callback(null, {
            unmatched,
            mcsdUnmatched,
          }));
        },
        source2Unmatched(callback) {
          scores.getUnmatched(response.source2mCSD, response.source2mCSD, mappingPartition, true, 'source2', null, (unmatched, mcsdUnmatched) => callback(null, {
            unmatched,
            mcsdUnmatched,
          }));
        },
      }, (error, response) => {
        if (type === 'FHIR') {
          return res.status(200).json({
            unmatchedSource1mCSD: response.source1Unmatched.mcsdUnmatched,
            unmatchedSource2mCSD: response.source2Unmatched.mcsdUnmatched,
          });
        }
      });
    });
  } else if (type == 'CSV') {
    const fields = [];
    fields.push('id');
    fields.push('name');
    const levels = Object.keys(levelMapping1);

    async.parallel({
      source1mCSD(callback) {
        mcsd.getLocationChildren({
          database: partition1,
          parent: source1LimitOrgId[0],
        }, mcsdRes => callback(null, mcsdRes));
      },
      source2mCSD(callback) {
        mcsd.getLocationChildren({
          database: partition2,
          parent: source2LimitOrgId[0],
        }, (mcsdRes) => {
          callback(null, mcsdRes);
        });
      },
    }, (error, response) => {
      // remove unmapped levels
      async.each(levels, (level, nxtLevel) => {
        if (!levelMapping1[level] || levelMapping1[level] == 'null' || levelMapping1[level] == 'undefined' || levelMapping1[level] == 'false') {
          delete levelMapping1[level];
        }
        if (!levelMapping2[level] || levelMapping2[level] == 'null' || levelMapping2[level] == 'undefined' || levelMapping2[level] == 'false') {
          delete levelMapping2[level];
        }
      });
      // end of removing unmapped levels

      // get level of a facility
      const levelsArr1 = [];
      for (const key in levelMapping1) {
        if (key.startsWith('level')) {
          levelsArr1.push(parseInt(key.replace('level', '')));
        }
      }
      const source1FacilityLevel = levelsArr1.length + 1;
      levelsArr1.push(source1FacilityLevel);

      const levelsArr2 = [];
      for (const key in levelMapping2) {
        if (key.startsWith('level')) {
          levelsArr2.push(parseInt(key.replace('level', '')));
        }
      }
      const source2FacilityLevel = levelsArr2.length + 1;
      levelsArr2.push(source2FacilityLevel);
      // end of getting level of a facility
      let unmatchedSource1CSV;
      let unmatchedSource2CSV;
      async.parallel({
        source1(callback) {
          async.each(levelsArr1, (srcLevel, nxtLevel) => {
            // increment level by one, because level 1 is a fake country/location
            const level = srcLevel + 1;
            let thisFields = [];
            const parentsFields = [];
            thisFields = thisFields.concat(fields);
            async.eachOf(levelMapping1, (level, key, nxtLevel) => {
              if (!key.startsWith('level')) {
                return nxtLevel();
              }
              let keyNum = key.replace('level', '');
              keyNum = parseInt(keyNum);
              if (keyNum >= srcLevel) {
                return nxtLevel();
              }
              parentsFields.push(level);
              thisFields.push(level);
            });
            mcsd.filterLocations(response.source1mCSD, source1LimitOrgId[0], level, (mcsdLevel) => {
              scores.getUnmatched(response.source1mCSD, mcsdLevel, mappingPartition, true, 'source1', parentsFields, (unmatched) => {
                if (unmatched.length > 0) {
                  thisFields.push('status');
                  thisFields.push('comment');
                  const csvString = json2csv(unmatched, {
                    thisFields,
                  });
                  let colHeader;
                  if (levelMapping1[`level${srcLevel}`]) {
                    colHeader = levelMapping1[`level${srcLevel}`];
                  } else {
                    colHeader = 'Facilities';
                  }
                  if (!unmatchedSource1CSV) {
                    unmatchedSource1CSV = colHeader + os.EOL + csvString + os.EOL;
                  } else {
                    unmatchedSource1CSV = unmatchedSource1CSV + os.EOL + os.EOL + colHeader + os.EOL + csvString + os.EOL;
                  }
                }
                return nxtLevel();
              });
            });
          }, () => callback(false, unmatchedSource1CSV));
        },
        source2(callback) {
          async.each(levelsArr2, (srcLevel, nxtLevel) => {
            // increment level by one, because level 1 is a fake country/location
            const level = srcLevel + 1;
            let thisFields = [];
            const parentsFields = [];
            thisFields = thisFields.concat(fields);
            async.eachOf(levelMapping2, (level, key, nxtLevel) => {
              if (!key.startsWith('level')) {
                return nxtLevel();
              }
              let keyNum = key.replace('level', '');
              keyNum = parseInt(keyNum);
              if (keyNum >= srcLevel) {
                return nxtLevel();
              }
              parentsFields.push(level);
              thisFields.push(level);
            });

            mcsd.filterLocations(response.source2mCSD, source2LimitOrgId[0], level, (mcsdLevel) => {
              scores.getUnmatched(response.source2mCSD, mcsdLevel, mappingPartition, true, 'source2', parentsFields, (unmatched) => {
                if (unmatched.length > 0) {
                  thisFields.push('status');
                  thisFields.push('comment');
                  const csvString = json2csv(unmatched, {
                    thisFields,
                  });
                  let colHeader;
                  if (levelMapping2[`level${srcLevel}`]) {
                    colHeader = levelMapping2[`level${srcLevel}`];
                  } else {
                    colHeader = 'Facilities';
                  }
                  if (!unmatchedSource2CSV) {
                    unmatchedSource2CSV = colHeader + os.EOL + csvString + os.EOL;
                  } else {
                    unmatchedSource2CSV = unmatchedSource2CSV + os.EOL + os.EOL + colHeader + os.EOL + csvString + os.EOL;
                  }
                }
                return nxtLevel();
              });
            });
          }, () => callback(false, unmatchedSource2CSV));
        },
      }, (error, response) => res.status(200).send({
        unmatchedSource1CSV: response.source1,
        unmatchedSource2CSV: response.source2,
      }));
    });
  }
});

router.post('/performMatch/:type', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'match-location');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received data for matching');
  const {
    type,
  } = req.params;
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const status = await recoStatus(fields.pairId);
    if (status !== 'in-progress') {
      return res.status(400).send({
        error: 'Reconciliation closed',
      });
    }
    if (!fields.partition1 || !fields.partition2) {
      logger.error({
        error: 'Missing partition1 or partition2',
      });
      res.status(400).json({
        error: 'Missing partition1 or partition2',
      });
      return;
    }
    const {
      partition1,
      partition2,
      mappingPartition,
      source1Id,
      source2Id,
      recoLevel,
      totalLevels,
      flagComment,
    } = fields;
    if (!source1Id || !source2Id) {
      logger.error({
        error: 'Missing either Source1 ID or Source2 ID or both',
      });
      res.status(400).json({
        error: 'Missing either Source1 ID or Source2 ID or both',
      });
      return;
    }
    mcsd.saveMatch(source1Id, source2Id, partition1, partition2, mappingPartition, recoLevel, totalLevels, type, false, flagComment, (err, matchComments) => {
      logger.info('Done matching');
      if (err) {
        logger.error(err);
        res.status(400).send({
          error: err,
        });
      } else {
        res.status(200).json({
          matchComments,
        });
      }
    });
  });
});

router.post('/acceptFlag/:mappingPartition', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'accept-flagged-location');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received data for marking flag as a match');
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const status = await recoStatus(fields.pairId);
    if (status !== 'in-progress') {
      return res.status(400).send({
        error: 'Reconciliation closed',
      });
    }
    const {
      source1Id,
    } = fields;
    if (!source1Id) {
      logger.error({
        error: 'Missing source1Id',
      });
      res.status(400).json({
        error: 'Missing source1Id',
      });
      return;
    }
    mcsd.acceptFlag(source1Id, req.params.mappingPartition, (err) => {
      logger.info('Done marking flag as a match');
      if (err) {
        res.status(400).send({
          error: err,
        });
      } else res.status(200).send();
    });
  });
});

router.post('/noMatch/:type', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'match-location');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info('Received data for matching');
  const {
    type,
  } = req.params;
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const status = await recoStatus(fields.pairId);
    if (status !== 'in-progress') {
      return res.status(400).send({
        error: 'Reconciliation closed',
      });
    }
    const {
      partition1,
      partition2,
      mappingPartition,
      source1Id,
      recoLevel,
      totalLevels,
    } = fields;
    if (!partition1 || !partition2) {
      logger.error({
        error: 'Missing partition1 or partition2',
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(400).json({
        error: 'Missing partition1 or partition2',
      });
      return;
    }
    if (!source1Id) {
      logger.error({
        error: 'Missing either Source1 ID',
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(400).json({
        error: 'Missing either Source1 ID',
      });
      return;
    }

    mcsd.saveNoMatch(source1Id, partition1, partition2, mappingPartition, recoLevel, totalLevels, type, (err) => {
      logger.info('Done matching');
      if (err) {
        res.status(400).send({
          error: 'Un expected error has occured',
        });
      } else res.status(200).send();
    });
  });
});

router.post('/breakMatch', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'break-matched-location');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (!fields.partition1) {
      logger.error({
        error: 'Missing partition1',
      });
      res.status(400).json({
        error: 'Missing partition1',
      });
      return;
    }
    const status = await recoStatus(fields.pairId);
    if (status !== 'in-progress') {
      return res.status(400).send({
        error: 'Reconciliation closed',
      });
    }
    logger.info(`Received break match request for ${fields.source1Id}`);
    const { source1Id } = fields;

    mcsd.breakMatch(source1Id, fields.mappingPartition, fields.partition1, (err, results) => {
      if (err) {
        logger.error(err);
        return res.status(500).json({
          error: err,
        });
      }
      logger.info(`break match done for ${fields.source1Id}`);
      res.status(200).send(err);
    });
  });
});

router.post('/breakNoMatch/:type', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'break-matched-location');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const status = await recoStatus(fields.pairId);
    if (!fields.mappingPartition) {
      logger.error({
        error: 'Missing mapping partition',
      });
      res.status(500).json({
        error: 'Missing mapping partition',
      });
      return;
    }
    if (status !== 'in-progress') {
      return res.status(400).send({
        error: 'Reconciliation closed',
      });
    }
    logger.info(`Received break no match request for ${fields.source1Id}`);
    const { source1Id } = fields;
    if (!source1Id) {
      logger.error({
        error: 'Missing Source1 ID',
      });
      return res.status(500).json({
        error: 'Missing Source1 ID',
      });
    }

    mcsd.breakNoMatch(source1Id, fields.mappingPartition, (err) => {
      logger.info(`break no match done for ${fields.source1Id}`);
      res.status(200).send(err);
    });
  });
});

router.get('/markRecoUnDone/:pairId', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'open-matching');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  logger.info(`received a request to mark reconciliation for ${req.params.pairId} as undone`);
  let { pairId } = req.params;
  if (pairId.split('/').length === 2) {
    pairId = pairId.split('/')[1];
  }
  fhirAxios.read('Basic', pairId, '', 'DEFAULT').then((pair) => {
    const pairDetails = pair.extension && pair.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
    let updated = false;
    pairDetails.extension.forEach((ext, index) => {
      if (ext.url === 'http://gofr.org/fhir/StructureDefinition/recoStatus') {
        pairDetails.extension[index].valueString = 'in-progress';
        updated = true;
      }
    });
    if (!updated) {
      pairDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/lastUpdated',
        valueString: 'in-progress',
      });
    }
    fhirAxios.update(pair, 'DEFAULT').then(() => {
      res.status(200).json({
        status: 'in-progress',
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).json({
        error: 'Unexpected error occured,please retry',
      });
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).json({
      error: 'Unexpected error occured,please retry',
    });
  });
});

router.get('/markRecoDone/:pairId', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'close-matching');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  let source1;
  let source2;
  logger.info(`received a request to mark reconciliation for ${req.params.pairId} as done`);
  let { pairId } = req.params;
  if (pairId.split('/').length === 2) {
    pairId = pairId.split('/')[1];
  }
  fhirAxios.read('Basic', pairId, '', 'DEFAULT').then((pair) => {
    const pairDetails = pair.extension && pair.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/datasourcepair');
    let updated = false;
    pairDetails.extension.forEach((ext, index) => {
      if (ext.url === 'http://gofr.org/fhir/StructureDefinition/recoStatus') {
        pairDetails.extension[index].valueString = 'Done';
        updated = true;
      } else if (ext.url === 'http://gofr.org/fhir/StructureDefinition/source1') {
        source1 = ext.valueReference.display;
      } else if (ext.url === 'http://gofr.org/fhir/StructureDefinition/source2') {
        source2 = ext.valueReference.display;
      }
    });
    if (!updated) {
      pairDetails.extension.push({
        url: 'http://gofr.org/fhir/StructureDefinition/lastUpdated',
        valueString: 'Done',
      });
    }
    fhirAxios.update(pair, 'DEFAULT').then(() => {
      sendNotification(() => {
        res.status(200).json({
          status: 'Done',
        });
      });
    }).catch((err) => {
      logger.error(err);
      return res.status(500).json({
        error: 'Unexpected error occured,please retry',
      });
    });
  }).catch((err) => {
    logger.error(err);
    return res.status(500).json({
      error: 'Unexpected error occured,please retry',
    });
  });

  function sendNotification(callback) {
    logger.info('received a request to send notification to endpoint regarding completion of reconciliation');
    fhirAxios.read('Parameters', 'gofr-general-config', '', 'DEFAULT').then((response) => {
      const resData = response.parameter.find(param => param.name === 'config');
      const adminConfig = JSON.parse(resData.valueString);
      if (adminConfig.recoProgressNotification
        && adminConfig.recoProgressNotification.enabled
        && adminConfig.recoProgressNotification.url
      ) {
        const {
          url,
          username,
          password,
        } = adminConfig.recoProgressNotification;
        const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
        const options = {
          url,
          headers: {
            Authorization: auth,
            'Content-Type': 'application/json',
          },
          json: {
            source1,
            source2,
            status: 'Done',
          },
        };
        request.post(options, (err, res, body) => {
          if (err) {
            logger.error(err);
            return callback(true, false);
          }
          return callback(false, body);
        });
      } else {
        return callback(false, false);
      }
    });
  }
});

router.get('/recoStatus/:pairId', (req, res) => {
  const allowed = req.user.hasPermissionByName('special', 'custom', 'view-matching-status');
  if (!allowed) {
    return res.status(403).json(outcomes.DENIED);
  }
  recoStatus(req.params.pairId).then((status) => {
    res.status(200).json({
      status,
    });
  }).catch(() => {
    res.status(500).send();
  });
});

module.exports = router;
