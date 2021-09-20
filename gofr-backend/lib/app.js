
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const https = require('https');
const http = require('http');
const fs = require('fs');
const Cryptr = require('cryptr');
const fsFinder = require('fs-finder');
const cors = require('cors');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const crypto = require('crypto');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const async = require('async');
const config = require('./config');
const user = require('./modules/user');
const outcomes = require('../config/operationOutcomes');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const store = new RedisStore({
  client: redisClient,
});
let keycloak;
if (config.get('app:idp') === 'keycloak') {
  keycloak = require('./modules/keycloakConnect').initKeycloak(store);
}

require('./cronjobs');
const mixin = require('./mixin');
const AuthRouter = require('./routes/auth');
const UsersRouter = require('./routes/users');
const DataSourcesRouter = require('./routes/dataSources');
const MatchRouter = require('./routes/match');
const FRRouter = require('./routes/facilityRegistry');
const FRConfig = require('./routes/config');
const questionnaireRouter = require('./routes/questionnaire');
const facilitiesRequests = require('./routes/facilitiesRequests');
const fhirRouter = require('./routes/fhir');
const mcsd = require('./mcsd')();
const dhis = require('./dhis');
const fhir = require('./fhir');
const hapi = require('./hapi');
const scores = require('./scores')();
const defaultSetups = require('./defaultSetup.js');

const levelMaps = config.get('levelMaps');

const app = express();
const server = require('http').createServer(app);
const logger = require('./winston');

const cleanReqPath = function (req, res, next) {
  req.url = req.url.replace('//', '/');
  return next();
};

const isLoggedIn = (req, res, next) => {
  if (req.method == 'OPTIONS'
    || (req.query.hasOwnProperty('authDisabled') && req.query.authDisabled)
    || req.path.startsWith('/auth/login')
    || req.path === '/getSignupConf'
    || req.path === '/config/getGeneralConfig'
    || req.path === '/addUser/'
    || req.path.startsWith('/progress')
  ) {
    return next();
  }
  if (config.get('app:idp') === 'keycloak') {
    if (req.cookies && req.cookies.userObj) {
      req.user = user.restoreUser(JSON.parse(req.cookies.userObj));
    }
    return keycloak.protect()(req, res, next);
  }
  if (config.get('app:idp') === 'gofr') {
    if (!req.user) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.set('Access-Control-Allow-Credentials', true);
      return res.status(401).json(outcomes.NOTLOGGEDIN);
    }
    return next();
  }
};
app.get('/isSessionActive', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.set('Access-Control-Allow-Credentials', true);
  res.status(200).send(true);
});
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(cleanReqPath);
app.use(cookieParser());
app.use(session({
  store,
  secret: config.get('session:secret') || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
}));
if (keycloak) {
  app.use(keycloak.middleware());
} else {
  app.use(AuthRouter.passport.initialize());
  app.use(AuthRouter.passport.session());
}
app.use(express.static(`${__dirname}/../gui`));

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(isLoggedIn);
app.use('/auth', AuthRouter);
app.use('/users', UsersRouter);
app.use('/datasource', DataSourcesRouter);
app.use('/match', MatchRouter);
app.use('/FR/', FRRouter);
app.use('/config/', FRConfig);
app.use('/fhir', questionnaireRouter);
app.use('/fhir', fhirRouter);
app.use('/facilitiesRequests', facilitiesRequests);
// socket config - large documents can cause machine to max files open

https.globalAgent.maxSockets = 32;
http.globalAgent.maxSockets = 32;

const topOrgName = config.get('mCSD:fakeOrgName');

defaultSetups.initialize().then(() => {
  const defaultDB = config.get('mCSD:registryDB');
  mcsd.createFakeOrgID(defaultDB).then(() => {

  }).catch((error) => {
    logger.error(error);
  });
});
process.on('message', (message) => {
  if (message.content === 'clean') {
    mcsd.cleanCache(message.url, true);
  }
});

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
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
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
        mcsd.getLocations(req.params.source1, (source1Data) => {
          if (source1Data.hasOwnProperty('entry') && source1Data.entry.length > 0) {
            return callback(false, true);
          }
          return callback(false, false);
        });
      },
      source2Availability(callback) {
        mcsd.getLocations(req.params.source2, (source2Data) => {
          if (source2Data.hasOwnProperty('entry') && source2Data.entry.length > 0) {
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
  const form = new formidable.IncomingForm();
  res.status(200).end();
  form.parse(req, (err, fields, files) => {
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
});

app.post('/fhirSync', (req, res) => {
  res.status(200).end();
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
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
});

app.get('/hierarchy', (req, res) => {
  const {
    source,
    sourceOwner,
    start,
    count,
  } = req.query;
  let {
    sourceLimitOrgId,
    id,
  } = req.query;
  if (!sourceLimitOrgId) {
    sourceLimitOrgId = mixin.getTopOrgId(mixin.toTitleCase(source + sourceOwner), 'Location');
  }
  if (!id) {
    id = sourceLimitOrgId;
  }
  if (!source) {
    logger.error({
      error: 'Missing Source',
    });
    res.status(400).json({
      error: 'Missing Source',
    });
  } else {
    logger.info(`Fetching Locations For ${source}`);
    const db = mixin.toTitleCase(source + sourceOwner);
    const locationReceived = new Promise((resolve, reject) => {
      mcsd.getLocationChildren({
        database: db,
        parent: sourceLimitOrgId,
      }, (mcsdData) => {
        mcsd.getBuildingsFromData(mcsdData, (buildings) => {
          resolve({
            buildings,
            mcsdData,
          });
          logger.info(`Done Fetching ${source} Locations`);
        });
      });
    });

    locationReceived.then((data) => {
      logger.info(`Creating ${source} Grid`);
      mcsd.createGrid(id, sourceLimitOrgId, data.buildings, data.mcsdData, start, count, (grid, total) => {
        logger.info(`Done Creating ${source} Grid`);
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

app.get('/getTree/:source/:sourceOwner/:sourceLimitOrgId?', (req, res) => {
  logger.info('Received a request to get location tree');
  if (!req.params.source) {
    logger.error({
      error: 'Missing Data Source',
    });
    res.status(400).json({
      error: 'Missing Data Source',
    });
  } else {
    const {
      source,
      sourceOwner,
    } = req.params;
    let {
      sourceLimitOrgId,
    } = req.params;
    const db = mixin.toTitleCase(source + sourceOwner);
    const topOrgId = mixin.getTopOrgId(db, 'Location');
    if (!sourceLimitOrgId) {
      sourceLimitOrgId = topOrgId;
    }
    logger.info(`Fetching Locations For ${source}`);
    async.parallel({
      locationChildren(callback) {
        mcsd.getLocationChildren({
          database: db,
          parent: sourceLimitOrgId,
        }, (mcsdData) => {
          logger.info(`Done Fetching Locations For ${source}`);
          return callback(false, mcsdData);
        });
      },
      parentDetails(callback) {
        if (sourceLimitOrgId === topOrgId) {
          return callback(false, false);
        }
        mcsd.getLocationByID(db, sourceLimitOrgId, false, details => callback(false, details));
      },
    }, (error, response) => {
      logger.info(`Creating ${source} Tree`);
      mcsd.createTree(response.locationChildren, sourceLimitOrgId, false, (tree) => {
        if (sourceLimitOrgId !== topOrgId) {
          tree = {
            text: response.parentDetails.entry[0].resource.name,
            id: req.params.sourceLimitOrgId,
            children: tree,
          };
        }
        logger.info(`Done Creating Tree for ${source}`);
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
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
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
    if (Object.keys(files).length == 0) {
      logger.error('No file submitted for reconciliation');
      res.status(400).json({
        error: 'Please submit CSV file for facility reconciliation',
      });
      return res.end();
    }
    const fileName = Object.keys(files)[0];
    logger.info('validating CSV File');
    uploadReqPro = JSON.stringify({
      status: '2/3 Validating CSV Data',
      error: null,
      percent: null,
    });
    redisClient.set(uploadRequestId, uploadReqPro, 'EX', 1200);
    mixin.validateCSV(files[fileName].path, fields, (valid, invalid) => {
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
      hapi.addPartition({ name: database, description: 'reco data source', userID: fields.userID }).then((partitionID) => {
        const levelData = mixin.createLevelMapping(fields);
        res.status(200).end(JSON.stringify({ partitionID, levelData: JSON.stringify(levelData) }));
        uploadReqPro = JSON.stringify({
          status: '3/3 Uploading of data started',
          error: null,
          percent: null,
        });
        redisClient.set(uploadRequestId, uploadReqPro, 'EX', 1200);
        const oldPath = files[fileName].path;

        const newPath = `${__dirname}/csvUploads/${fields.userID}+${mixin.toTitleCase(fields.csvName)}+${moment().format()}.csv`;
        fs.readFile(oldPath, (err, data) => {
          if (err) {
            logger.error(err);
          }
          fs.writeFile(newPath, data, (err) => {
            if (err) {
              logger.error(err);
            }
          });
        });
        logger.info(`Uploading data for ${database} now`);
        mcsd.CSVTomCSD(files[fileName].path, fields, database, clientId, () => {
          logger.info(`Data upload for ${database} is done`);
          const uploadReqPro = JSON.stringify({
            status: 'Done',
            error: null,
            percent: 100,
          });
          redisClient.set(uploadRequestId, uploadReqPro);
        });
      }).catch((err) => {
        logger.error(err);
        const uploadReqPro = JSON.stringify({
          status: 'Error',
          error: 'An error has occured, upload cancelled',
          percent: null,
        });
        redisClient.set(uploadRequestId, uploadReqPro);
      });
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../gui/index.html`));
});
app.get('/static/js/:file', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../gui/static/js/${req.params.file}`));
});
app.get('/static/css/:file', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../gui/static/css/${req.params.file}`));
});
app.get('/static/img/:file', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../gui/static/img/${req.params.file}`));
});

server.listen(config.get('server:port'));
logger.info(`Server is running and listening on port ${config.get('server:port')}`);
