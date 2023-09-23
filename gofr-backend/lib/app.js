
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsFinder = require('fs-finder');
const cors = require('cors');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const crypto = require('crypto');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const async = require('async');
const jwt = require('jsonwebtoken');
const defaultSetups = require('./defaultSetup.js');
const config = require('./config');
const user = require('./modules/user');
const outcomes = require('../config/operationOutcomes');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const store = new RedisStore({
  client: redisClient,
});

const topOrgName = config.get('mCSD:fakeOrgName');

const mixin = require('./mixin');
const UsersRouter = require('./routes/users');
const DataSourcesRouter = require('./routes/dataSources');
const MatchRouter = require('./routes/match');
const FRRouter = require('./routes/facilityRegistry');
const FRConfig = require('./routes/config');
const questionnaireRouter = require('./routes/questionnaire');
const facilitiesRequests = require('./routes/facilitiesRequests');
const fhirRouter = require('./routes/fhir');
const translatorRouter = require('./routes/core-apps/gofr-google-translator/index');
const gofrAppsRouter = require('./routes/apps');
const mcsd = require('./mcsd')();
const dhis = require('./dhis');
const fhir = require('./fhir');
const hapi = require('./hapi');
const scores = require('./scores')();

let keycloak;
const levelMaps = config.get('levelMaps');

const app = express();
app.use(fileUpload({
  createParentPath: true,
}));
const logger = require('./winston');
const { default: axios } = require('axios');

const cleanReqPath = function (req, res, next) {
  req.url = req.url.replace('//', '/');
  return next();
};

let configLoaded = false;

async function startUp() {
  const isLoggedIn = (req, res, next) => {
    if (req.method == 'OPTIONS'
      || req.path.startsWith('/auth/login')
      || req.path.startsWith('/auth/token')
      || req.path.startsWith('/auth')
      || req.path === '/getSignupConf'
      || req.path === '/config/getGeneralConfig'
      || req.path === '/users/addDhis2User'
      || req.path === '/translator/getTranslatedLanguages'
      || req.path.startsWith('/translator/getLocale/')
      || req.path.startsWith('/progress')
    ) {
      return next();
    }
    if (config.get('app:idp') === 'keycloak') {
      if (req.cookies && req.cookies.userObj) {
        req.user = user.restoreUser(JSON.parse(req.cookies.userObj));
        return keycloak.protect()(req, res, next);
      }
      // for backend processes making API Calls
      if (req.headers.authorization) {
        axios({
          url: `http://localhost:${config.get('server:port')}/auth`,
          method: 'POST',
          headers: {
            Authorization: req.headers.authorization,
          },
        }).then((resp) => {
          if (resp.data.resource) {
            req.user = user.restoreUser(resp.data);
            return keycloak.protect()(req, res, next);
          }
        }).catch((err) => {
          logger.error(err);
          return res.status(500).send();
        });
      }
    }
    if (config.get('app:idp') === 'gofr' || config.get('app:idp') === 'dhis2') {
      if ((!req.user || config.get('app:idp') === 'dhis2') && req.headers.authorization && req.headers.authorization.split(' ').length === 2) {
        // Only for Access using token when using gofr as IDP
        const token = req.headers.authorization.split(' ')[1];
        let decoded;
        jwt.verify(token, config.get('auth:secret'), (err, dec) => {
          if (!err) {
            decoded = dec;
          }
        });
        if (decoded && decoded.user) {
          req.user = user.restoreUser(decoded.user);
        }
      }
      if (!req.user) {
        return res.status(401).json(outcomes.NOTLOGGEDIN);
      }
      return next();
    }
  };
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.get('/isSessionActive', (req, res) => {
    res.status(200).send(true);
  });
  app.use(morgan('dev'));
  app.use(cleanReqPath);
  app.use(cookieParser());
  app.use(session({
    store,
    secret: config.get('session:secret') || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
  }));
  // const postInitialization = () => {
  require('./cronjobs');
  const AuthRouter = require('./routes/auth');
  if (config.get('app:idp') === 'keycloak') {
    keycloak = require('./modules/keycloakConnect').initKeycloak(store);
  }
  if (keycloak) {
    app.use(keycloak.middleware());
  } else {
    app.use(AuthRouter.passport.initialize());
    app.use(AuthRouter.passport.session());
  }
  app.use(express.static(path.join(config.get("app:site:path"), 'gui')));

  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
  app.use(isLoggedIn);
  // mounting site routes
  const siteRoutes = config.get('app:site:routes');
  for (const route in siteRoutes) {
    const routePath = path.join(config.get('app:site:path'), `routes/${siteRoutes[route].path}`);
    let mountPoint = `/${siteRoutes[route].mount}`;
    mountPoint = mountPoint.replace('//', '/');
    if (fs.existsSync(routePath)) {
      const siteRoute = require(routePath);
      try {
        app.use(mountPoint, siteRoute);
      } catch (error) {
        console.log(error);
      }
    } else {
      logger.error(`Route file defined with mount point ${mountPoint} was not found`);
    }
  }
  // end of mounting site routes
  app.use('/gofrapp', express.static(path.join(__dirname, 'apps')));
  app.use('/auth', AuthRouter);
  app.use('/users', UsersRouter);
  app.use('/datasource', DataSourcesRouter);
  app.use('/match', MatchRouter);
  app.use('/FR/', FRRouter);
  app.use('/config/', FRConfig);
  app.use('/fhir', questionnaireRouter);
  app.use('/fhir', fhirRouter);
  app.use('/facilitiesRequests', facilitiesRequests);
  app.use('/translator', translatorRouter);
  app.use('/apps', gofrAppsRouter);
  app.use('/gofrapp', express.static(path.join(__dirname, 'apps')));

  process.on('message', (message) => {
    if (message.content === 'clean') {
      mcsd.cleanCache(message.url, true);
    }
  });

  configLoaded = true

  app.get('/getLevelData/:source/:sourceOwner/:level', (req, res) => {
    const sourceOwner = req.params.sourceOwner;
    const db = mixin.toTitleCase(req.params.source + sourceOwner);
    const level = req.params.level;
    const levelData = [];
    const topOrgId = mixin.getTopOrgId(db, 'Location');
    mcsd.getLocations(db, (mcsdData) => {
      mcsd.filterLocations(mcsdData, topOrgId, level, (mcsdLevelData) => {
        async.each(mcsdLevelData.entry, (data, nxtData) => {
          levelData.push({
            text: data.resource.name,
            value: data.resource.id,
          });
          return nxtData();
        }, () => {
          res.status(200).json(levelData);
        });
      });
    });
  });

  app.post('/editLocation', (req, res) => {
    const fields = req.body
    const db = mixin.toTitleCase(fields.source + fields.sourceOwner);
    const id = fields.locationId;
    const name = fields.locationName;
    const parent = fields.locationParent;
    mcsd.editLocation(id, name, parent, db, (resp, err) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send();
      }
    });
  });

  app.get('/uploadAvailable/:source1/:source2', (req, res) => {
    if (!req.params.source1 || !req.params.source2) {
      logger.error({
        error: 'Missing Orgid',
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(400).json({
        error: 'Missing Orgid',
      });
    } else {
      logger.info(`Checking if data available for ${req.params.source1} and ${req.params.source2}`);
      async.parallel({
        source1Availability(callback) {
          mcsd.countLocations(req.params.source1, (total) => {
            if (total > 0) {
              return callback(false, true);
            }
            return callback(false, false);
          });
        },
        source2Availability(callback) {
          mcsd.countLocations(req.params.source2, (total) => {
            if (total > 0) {
              return callback(false, true);
            }
            return callback(false, false);
          });
        },
      }, (error, results) => {
        if (results.source1Availability && results.source2Availability) {
          res.status(200).json({
            dataUploaded: true,
          });
        } else {
          res.status(200).json({
            dataUploaded: false,
          });
        }
      });
    }
  });

  app.post('/dhisSync', (req, res) => {
    logger.info('received request to sync DHIS2 data');
    res.status(200).end();
    const fields = req.body
    const { mode } = fields;
    let full = true;
    if (mode === 'update') {
      full = false;
    }
    dhis.sync(
      fields.host,
      fields.username,
      fields.password,
      fields.name,
      fields.clientId,
      topOrgName,
      false,
      full,
      false,
      false,
    );
  });

  app.post('/fhirSync', (req, res) => {
    res.status(200).end();
    const fields = req.body
    logger.info(`Received a request to sync FHIR server ${fields.host}`);
    fhir.sync(
      fields.id,
      fields.host,
      fields.username,
      fields.password,
      fields.mode,
      fields.name,
      fields.clientId,
      topOrgName,
    );
  });

  app.get('/hierarchy', (req, res) => {
    const {
      partition,
      start,
      count,
    } = req.query;
    let {
      sourceLimitOrgId,
      id,
    } = req.query;
    if (!sourceLimitOrgId) {
      sourceLimitOrgId = mixin.getTopOrgId(partition, 'Location');
    }
    if (!id) {
      id = sourceLimitOrgId;
    }
    if (!partition) {
      logger.error({
        error: 'Missing partition',
      });
      res.status(400).json({
        error: 'Missing partition',
      });
    } else {
      logger.info(`Fetching Locations For ${partition}`);
      const locationReceived = new Promise((resolve, reject) => {
        mcsd.getLocationChildren({
          database: partition,
          parent: sourceLimitOrgId,
        }, (mcsdData) => {
          mcsd.getBuildingsFromData(mcsdData, (buildings) => {
            resolve({
              buildings,
              mcsdData,
            });
            logger.info(`Done Fetching ${partition} Locations`);
          });
        });
      });

      locationReceived.then((data) => {
        logger.info(`Creating ${partition} Grid`);
        mcsd.createGrid(id, sourceLimitOrgId, data.buildings, data.mcsdData, start, count, (grid, total) => {
          logger.info(`Done Creating ${partition} Grid`);
          res.status(200).json({
            grid,
            total,
          });
        });
      }).catch((err) => {
        logger.error(err);
      });
    }
  });

  app.get('/getImmediateChildren/:source/:sourceOwner/:parentID?', (req, res) => {
    const {
      source,
      sourceOwner,
    } = req.params;
    let {
      parentID,
    } = req.params;
    const db = mixin.toTitleCase(source + sourceOwner);
    if (!parentID) {
      parentID = mixin.getTopOrgId(db, 'Location');
    }
    logger.info(`Received a request to get immediate children of ${parentID}`);
    const children = [];
    mcsd.getImmediateChildren(db, parentID, (err, childrenData) => {
      async.each(childrenData.entry, (child, nxtChild) => {
        const isFacility = child.resource.physicalType.coding.find(coding => coding.code == 'bu');
        if (isFacility) {
          return nxtChild();
        }
        children.push({
          id: child.resource.id,
          name: child.resource.name,
          children: [],
        });
        return nxtChild();
      }, () => {
        logger.info(`Returning a list of children of ${parentID}`);
        res.status(200).json({
          children,
        });
      });
    });
  });

  app.get('/getTree/:partition/:sourceLimitOrgId?', (req, res) => {
    logger.info('Received a request to get location tree');
    if (!req.params.partition) {
      logger.error({
        error: 'Missing data partition',
      });
      res.status(400).json({
        error: 'Missing data partition',
      });
    } else {
      const {
        partition,
      } = req.params;
      let {
        sourceLimitOrgId,
      } = req.params;
      const topOrgId = mixin.getTopOrgId(partition, 'Location');
      if (!sourceLimitOrgId) {
        sourceLimitOrgId = topOrgId;
      }
      logger.info(`Fetching Locations For ${partition}`);
      async.parallel({
        locationChildren(callback) {
          mcsd.getLocationChildren({
            database: partition,
            parent: sourceLimitOrgId,
          }, (mcsdData) => {
            logger.info(`Done Fetching Locations For ${partition}`);
            return callback(false, mcsdData);
          });
        },
        parentDetails(callback) {
          if (sourceLimitOrgId === topOrgId) {
            return callback(false, false);
          }
          mcsd.getLocationByID(partition, sourceLimitOrgId, false, details => callback(false, details));
        },
      }, (error, response) => {
        logger.info(`Creating ${partition} Tree`);
        mcsd.createTree(response.locationChildren, sourceLimitOrgId, false, (tree) => {
          if (sourceLimitOrgId !== topOrgId) {
            tree = {
              text: response.parentDetails.entry[0].resource.name,
              id: req.params.sourceLimitOrgId,
              children: tree,
            };
          }
          logger.info(`Done Creating Tree for ${partition}`);
          res.status(200).json(tree);
        });
      });
    }
  });

  app.get('/mappingStatus/:source1/:source2/:source1Owner/:source2Owner/:level/:totalSource2Levels/:totalSource1Levels/:clientId/:userID', (req, res) => {
    logger.info('Getting mapping status');
    const {
      userID,
      source1Owner,
      source2Owner,
      totalSource2Levels,
      totalSource1Levels,
      clientId,
    } = req.params;
    let {
      source1LimitOrgId,
      source2LimitOrgId,
    } = req.query;
    const source1DB = mixin.toTitleCase(req.params.source1 + source1Owner);
    const source2DB = mixin.toTitleCase(req.params.source2 + source2Owner);
    if (source1LimitOrgId.length === 0) {
      source1LimitOrgId = [mixin.getTopOrgId(source1DB, 'Location')];
    }
    if (source2LimitOrgId.length === 0) {
      source2LimitOrgId = [mixin.getTopOrgId(source2DB, 'Location')];
    }
    const recoLevel = req.params.level;
    const statusRequestId = `mappingStatus${clientId}`;
    const statusResData = JSON.stringify({
      status: '1/2 - Loading Source2 and Source1 Data',
      error: null,
      percent: null,
    });
    redisClient.set(statusRequestId, statusResData, 'EX', 1200);

    const source2LocationReceived = new Promise((resolve, reject) => {
      mcsd.getLocationChildren({
        database: source2DB,
        parent: source2LimitOrgId[0],
      }, (mcsdSource2) => {
        mcsdSource2All = mcsdSource2;
        let level;
        if (recoLevel === totalSource1Levels) {
          level = totalSource2Levels;
        } else {
          level = recoLevel;
        }
        if (levelMaps[source2DB] && levelMaps[source2DB][recoLevel]) {
          level = levelMaps[source2DB][recoLevel];
        }
        mcsd.filterLocations(mcsdSource2, source2LimitOrgId[0], level, (mcsdSource2Level) => {
          resolve(mcsdSource2Level);
        });
      });
    }).catch((err) => {
      logger.error(err);
    });
    const source1LocationReceived = new Promise((resolve, reject) => {
      mcsd.getLocationChildren({
        database: source1DB,
        parent: source1LimitOrgId[0],
      }, (mcsdSource1) => {
        mcsd.filterLocations(mcsdSource1, source1LimitOrgId[0], recoLevel, (mcsdSource1Level) => {
          resolve(mcsdSource1Level);
        });
      });
    });
    const mappingDB = mixin.toTitleCase(req.params.source1 + userID + req.params.source2);
    const mappingLocationReceived = new Promise((resolve, reject) => {
      mcsd.getLocations(mappingDB, (mcsdMapped) => {
        resolve(mcsdMapped);
      });
    });
    Promise.all([source2LocationReceived, source1LocationReceived, mappingLocationReceived]).then((locations) => {
      const source2Locations = locations[0];
      const source1Locations = locations[1];
      const mappedLocations = locations[2];
      scores.getMappingStatus(source1Locations, source2Locations, mappedLocations, source1DB, clientId, (mappingStatus) => {
        res.status(200).json(mappingStatus);
      });
    });
  });

  app.get('/progress/:type/:clientId', (req, res) => {
    const {
      clientId,
      type,
    } = req.params;
    const progressRequestId = `${type}${clientId}`;
    redisClient.get(progressRequestId, (error, results) => {
      if (error) {
        logger.error(error);
        logger.error(`An error has occured while getting progress for ${type} and clientID ${clientId}`);
      }
      results = JSON.parse(results);
      res.status(200).json(results);
    });
  });

  app.get('/clearProgress/:type/:clientId', (req, res) => {
    const {
      clientId,
      type,
    } = req.params;
    logger.info(`Clearing progress data for ${type} and clientID ${clientId}`);
    const progressRequestId = `${type}${clientId}`;
    const data = JSON.stringify({
      status: null,
      error: null,
      percent: null,
      responseData: null,
    });
    redisClient.set(progressRequestId, data, (err, reply) => {
      if (err) {
        logger.error(err);
        logger.error(`An error has occured while clearing progress data for ${type} and clientID ${clientId}`);
      }
    });
    res.status(200).send();
  });

  app.get('/getUploadedCSV/:sourceOwner/:name', (req, res) => {
    logger.info('Received a request to export CSV file');
    const {
      sourceOwner,
    } = req.params;
    const name = mixin.toTitleCase(req.params.name);
    const filter = function (stat, path) {
      if (path.includes(`${sourceOwner}+${name}+`)) {
        return true;
      }
      return false;
    };
    let filePath;
    let timeStamp0;
    const files = fsFinder.from(`${__dirname}/csvUploads/`).filter(filter).findFiles((files) => {
      async.eachSeries(files, (file, nxtFile) => {
        const timeStamp1 = file.split('/').pop().replace('.csv', '').replace(`${sourceOwner}_${name}_`, '');
        if (!timeStamp0) {
          timeStamp0 = timeStamp1;
          filePath = file;
        } else if (moment(timeStamp1).isAfter(timeStamp0)) {
          timeStamp0 = timeStamp1;
          filePath = file;
        }
        return nxtFile();
      }, () => {
        if (filePath) {
          fs.readFile(filePath, (err, data) => {
            res.status(200).send(data);
          });
        } else {
          res.status(404).send('CSV file not found');
        }
      });
    });
  });
  app.post('/uploadCSV', (req, res) => {
    const fields = req.body
    const files = req.files
    logger.info(`Received Source1 Data with fields Mapping ${JSON.stringify(fields)}`);
    if (!fields.csvName) {
      logger.error({
        error: 'Missing CSV Name',
      });
      res.status(400).json({
        error: 'Missing CSV Name',
      });
      return;
    }
    const database = mixin.toTitleCase(fields.csvName + fields.userID);
    const expectedLevels = config.get('levels');
    const {
      clientId,
    } = fields;
    const uploadRequestId = `uploadProgress${clientId}`;
    let uploadReqPro = JSON.stringify({
      status: 'Request received by server',
      error: null,
      percent: null,
    });
    redisClient.set(uploadRequestId, uploadReqPro, 'EX', 1200);
    if (!Array.isArray(expectedLevels)) {
      logger.error('Invalid config data for key Levels ');
      res.status(400).json({
        error: 'Un expected error occured while processing this request',
      });
      res.end();
      return;
    }
    if (!files.file || !files.file.name) {
      logger.error('No file submitted for reconciliation');
      res.status(400).json({
        error: 'Please submit CSV file for facility reconciliation',
      });
      return res.end();
    }
    const fullPath = `${__dirname}/csvUploads/${fields.userID}+${mixin.toTitleCase(fields.csvName)}+${moment().format()}.csv`;
    files.file.mv(fullPath, function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      logger.info('validating CSV File');
      uploadReqPro = JSON.stringify({
        status: '2/3 Validating CSV Data',
        error: null,
        percent: null,
      });
      redisClient.set(uploadRequestId, uploadReqPro, 'EX', 1200);
      mixin.validateCSV(fullPath, fields, (valid, invalid) => {
        if (invalid.length > 0) {
          logger.error('Uploaded CSV is invalid (has either duplicated IDs or empty levels/facility),execution stopped');
          res.status(400).json({
            error: invalid,
          });
          res.end();
          return;
        }

        logger.info('CSV File Passed Validation');
        logger.info('Creating HAPI server now');
        hapi.addPartition({ name: database, description: 'reco data source', userID: fields.userID, orgId: fields.orgId }).then((partitionID) => {
          const levelData = mixin.createLevelMapping(fields);
          res.status(200).end(JSON.stringify({ partitionID, levelData: JSON.stringify(levelData) }));
          uploadReqPro = JSON.stringify({
            status: '3/3 Uploading of data started',
            error: null,
            percent: null,
          });
          redisClient.set(uploadRequestId, uploadReqPro, 'EX', 1200);
          logger.info(`Uploading data for ${database} now`);
          mcsd.CSVTomCSD(fullPath, fields, database, clientId, () => {
            logger.info(`Data upload for ${database} is done`);
            uploadReqPro = JSON.stringify({
              status: 'Done',
              error: null,
              percent: 100,
            });
            redisClient.set(uploadRequestId, uploadReqPro);
          });
        }).catch(() => {
          logger.error('Error occured while creating partition');
          return res.status(500).json({ error: 'An error has occured, upload cancelled' });
        });
      });
    });
  });
}

defaultSetups.initialize().then(async () => {
  await config.loadRemote();
  startUp();
}).catch(async () => {
  logger.warn('GOFR may have issues running because of above error(s)');
  await config.loadRemote();
  startUp();
});

app.whenReady = () => new Promise((resolve) => {
  const idx = setInterval(() => {
    if (configLoaded === true) {
      clearInterval(idx);
      resolve();
    }
  }, 100);
});

module.exports = app;