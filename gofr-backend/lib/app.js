
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const cluster = require('cluster');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const https = require('https');
const http = require('http');
const os = require('os');
const fs = require('fs');
const request = require('request');
const Cryptr = require('cryptr');
const fsFinder = require('fs-finder');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const redis = require('redis');
const morgan = require('morgan')

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
});
const moment = require('moment');
const json2csv = require('json2csv').parse;
const async = require('async');
const mongoose = require('mongoose');
const models = require('./models');
const schemas = require('./schemas');
const mail = require('./mail')();
const mixin = require('./mixin')();
const mongo = require('./mongo')();
const config = require('./config');
const AuthRouter = require('./routes/auth');
const DataSourcesRouter = require('./routes/dataSources');
const FRRouter = require('./routes/facilityRegistry');
const FRConfig = require('./routes/config');
const questionnaireRouter = require('./routes/questionnaire');
const facilitiesRequests = require('./routes/facilitiesRequests');
const fhirRouter = require('./routes/fhir');
const mcsd = require('./mcsd')();
const dhis = require('./dhis')();
const fhir = require('./fhir')();
const hapi = require('./hapi');
const scores = require('./scores')();
const defaultSetups = require('./defaultSetup.js');

const mongoUser = config.get('DB_USER');
const mongoPasswd = config.get('DB_PASSWORD');
const mongoHost = config.get('DB_HOST');
const mongoPort = config.get('DB_PORT');

const cryptr = new Cryptr(config.get('auth:secret'));

const app = express();
const server = require('http').createServer(app);
const logger = require('./winston');

const cleanReqPath = function (req, res, next) {
  req.url = req.url.replace('//', '/');
  return next();
};

const jwtValidator = function (req, res, next) {
  logger.error(req.path);
  if (req.method == 'OPTIONS'
    || (req.query.hasOwnProperty('authDisabled') && req.query.authDisabled)
    || req.path == '/auth/login/'
    || req.path == '/getSignupConf'
    || req.path == '/config/getGeneralConfig'
    || req.path == '/addUser/'
    || req.path.startsWith('/progress')
  ) {
    logger.error('here');
    return next();
  }
  if (!req.headers.authorization || req.headers.authorization.split(' ').length !== 2) {
    logger.error('Token is missing');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('WWW-Authenticate', 'Bearer realm="Token is required"');
    res.set('charset', 'utf - 8');
    res.status(401).json({
      error: 'Token is missing',
    });
  } else {
    const tokenArray = req.headers.authorization.split(' ');
    const token = req.headers.authorization = tokenArray[1];
    jwt.verify(token, config.get('auth:secret'), (err, decoded) => {
      if (err) {
        logger.warn('Token expired');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('WWW-Authenticate', 'Bearer realm="Token expired"');
        res.set('charset', 'utf - 8');
        res.status(401).json({
          error: 'Token expired',
        });
      } else {
        // logger.info("token is valid")
        if (req.path == '/isTokenActive/') {
          res.set('Access-Control-Allow-Origin', '*');
          res.status(200).send(true);
        } else {
          return next();
        }
      }
    });
  }
};

app.use(morgan('dev'))
app.use(cleanReqPath);
app.use(express.static(`${__dirname}/../gui`));
app.use(jwtValidator);
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use('/auth', AuthRouter);
app.use('/datasource', DataSourcesRouter);
app.use('/FR/', FRRouter);
app.use('/config/', FRConfig);
app.use('/fhir', questionnaireRouter);
app.use('/fhir', fhirRouter);
app.use('/facilitiesRequests', facilitiesRequests);
// socket config - large documents can cause machine to max files open

https.globalAgent.maxSockets = 32;
http.globalAgent.maxSockets = 32;

const topOrgName = config.get('mCSD:fakeOrgName');

if (cluster.isMaster) {
  require('./cronjobs');
  require('./connection');
  const workers = {};
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    defaultSetups.initialize().then(() => {
      const defaultDB = config.get('mCSD:registryDB');
      mcsd.createFakeOrgID(defaultDB).then(() => {

      }).catch((error) => {
        logger.error(error);
      });
    });
    // check if FR DB Exists
    // const defaultDB = config.get('mCSD:registryDB');
    // let url = URI(config.get('mCSD:url')).segment(defaultDB).segment('Location').toString();
    // const options = {
    //   url,
    // };
    // url = false;
    // request.get(options, (err, res, body) => {
    //   if (!res) {
    //     logger.error('It appears that FHIR server is not running, quiting GOFR now ...');
    //     process.exit();
    //   }
    //   if (res.statusCode === 404) {
    //     hapi.addTenancy({
    //       id: 100,
    //       name: defaultDB,
    //       description: 'Core Database',
    //     }).then(() => {
    //       // check if FR has fake org id
    //       mcsd.createFakeOrgID(defaultDB).then(() => {
    //         defaultSetups.initialize();
    //       }).catch((error) => {
    //         logger.error(error);
    //       });
    //     }).catch((error) => {
    //       logger.error(error);
    //     });
    //   } else {
    //     // check if FR has fake org id
    //     mcsd.createFakeOrgID(defaultDB).catch((error) => {
    //       logger.error(error);
    //     });
    //   }
    // });
  });

  const numWorkers = require('os').cpus().length;
  console.log(`Master cluster setting up ${numWorkers} workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();
    workers[worker.process.pid] = worker;
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    delete (workers[worker.process.pid]);
    console.log('Starting a new worker');
    const newworker = cluster.fork();
    workers[newworker.process.pid] = newworker;
  });
  cluster.on('message', (worker, message) => {
    // logger.info(`Master received message from ${worker.process.pid}`);
    if (message.content === 'clean') {
      for (const i in workers) {
        if (workers[i].process.pid !== worker.process.pid) {
          workers[i].send(message);
        }
        // } else {
        //   logger.info(`Not sending clean message to self: ${i}`);
        // }
      }
    }
  });
} else {
  process.on('message', (message) => {
    if (message.content === 'clean') {
      // logger.info(`${process.pid} received clean message from master.`);
      mcsd.cleanCache(message.url, true);
    }
  });
  const levelMaps = {
    ds0ADyc9UCU: { // Cote D'Ivoire
      4: 5,
    },
  };

  app.get('/doubleMapping/:db', (req, res) => {
    logger.info('Received a request to check Source1 Locations that are double mapped');
    const source1DB = mixin.toTitleCase(req.params.db);
    const mappingDB = config.get('mapping:dbPrefix') + req.params.db;
    async.parallel({
      source1Data(callback) {
        mcsd.getLocations(source1DB, data => callback(false, data));
      },
      mappingData(callback) {
        mcsd.getLocations(mappingDB, data => callback(false, data));
      },
    }, (err, results) => {
      const dupplicated = [];
      const url = `http://localhost:3447/${source1DB}/fhir/Location/`;
      async.each(results.source1Data.entry, (source1Entry, nxtSource1) => {
        source1id = source1Entry.resource.id;
        const checkDup = [];
        async.each(results.mappingData.entry, (mappingEntry, nxtMap) => {
          const isMapped = mappingEntry.resource.identifier.find(ident => ident.system === 'https://digitalhealth.intrahealth.org/source1' && ident.value === url + source1id);
          if (isMapped) {
            checkDup.push({
              source1Name: source1Entry.resource.name,
              source1ID: source1Entry.resource.id,
              source2Name: mappingEntry.resource.name,
              source2ID: mappingEntry.resource.id,
            });
          }
          return nxtMap();
        }, () => {
          if (checkDup.length > 1) {
            dupplicated.push(checkDup);
          }
          return nxtSource1();
        });
      }, () => {
        logger.info(`Found ${dupplicated.length} Source1 Locations with Double Matching`);
        res.send(dupplicated);
      });
    });
  });

  app.post('/addUser', (req, res) => {
    logger.info('Received a signup request');
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      models.MetaDataModel.find({
        'forms.name': 'signup',
      }, (err, data) => {
        if (data) {
          let signupFields = {};
          if (data.length > 0) {
            signupFields = Object.assign({}, data[0].forms[0].fields);
          }
          signupFields = Object.assign(signupFields, schemas.usersFields);

          models.RolesModel.find({
            name: 'Data Manager',
          }, (err, data) => {
            if (data) {
              const schemaData = {};
              for (const field in signupFields) {
                if (field === 'password') {
                  fields[field] = bcrypt.hashSync(fields.password, 8);
                }
                schemaData[field] = fields[field];
              }
              if (schemaData.status !== 'Pending' && (!schemaData.hasOwnProperty('role') || !schemaData.role)) {
                schemaData.role = data[0]._id;
              }
              if (!schemaData.status) {
                schemaData.status = 'Active';
              }
              const Users = new models.UsersModel(schemaData);
              Users.save((err, data) => {
                if (err) {
                  logger.error(err);
                  res.status(500).json({
                    error: 'Internal error occured',
                  });
                } else {
                  // alert admin about this account
                  if (fields.status === 'Pending') {
                    models.RolesModel.find({
                      name: 'Admin',
                    }, (err, data) => {
                      if (data && Array.isArray(data)) {
                        const adminRoleId = data[0]._id;
                        mongo.getUsersFromRoles([adminRoleId], (err, data) => {
                          if (!err && data && Array.isArray(data)) {
                            const emails = [];
                            for (const dt of data) {
                              emails.push(dt.email);
                            }
                            const subject = 'New account creation request';
                            const emailText = `There is a new request to create an account on facility registry with username ${fields.userName}, please go and approve`;
                            mail.send(subject, emailText, emails, () => {

                            });
                          }
                        });
                      }
                    });
                  }
                  logger.info('User created successfully');
                  res.status(200).json({
                    id: data._id,
                  });
                }
              });
            } else {
              if (err) {
                logger.error(err);
              }
              res.status(500).json({
                error: 'Internal error occured',
              });
            }
          });
        } else {
          if (err) {
            logger.error(err);
          }
          res.status(500).json({
            error: 'Internal error occured',
          });
        }
      });
    });
  });

  app.post('/updateRole', (req, res) => {
    logger.info('Received a request to change account status');
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
      let role;
      try {
        role = JSON.parse(fields.role);
      } catch (error) {
        return res.status(500).send('Invalid JSON of roles submitted');
      }
      logger.info('Received a request to update role');
      models.RolesModel.findByIdAndUpdate(role.value, {
        $set: {
          tasks: [],
        },
      }, (err, data) => {
        if (err) {
          logger.error(err);
          logger.error('An error occured while removing tasks from role');
          return res.status(500).send();
        }
        models.RolesModel.findByIdAndUpdate(role.value, {
          $push: {
            tasks: {
              $each: role.tasks,
            },
          },
        }, (err, data) => {
          if (err) {
            logger.error(err);
            res.status(500).send(err);
          } else {
            logger.info('Role updated successfully');
            res.status(200).send();
          }
        });
      });
    });
  });

  app.post('/saveSMTP', (req, res) => {
    logger.info('Received a request to save SMTP Config');
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
      models.SMTPModel.findOne({}, (err, data) => {
        if (data) {
          let password;
          if (fields.password !== data.password) {
            password = cryptr.encrypt(fields.password); // bcrypt.hashSync(fields.password, 8);
          } else {
            password = data.password;
          }
          models.SMTPModel.findByIdAndUpdate(data.id, {
            host: fields.host,
            port: fields.port,
            username: fields.username,
            password,
            secured: fields.secured,
          }, (err, data) => {
            if (err) {
              logger.error(err);
              logger.error('An error has occured while saving SMTP config');
              return res.status(500).send();
            }
            res.status(200).send();
          });
        } else {
          const smtp = new models.SMTPModel({
            host: fields.host,
            port: fields.port,
            username: fields.username,
            password: cryptr.encrypt(fields.password),
            secured: fields.secured,
          });
          smtp.save((err, data) => {
            if (err) {
              logger.error(err);
              logger.error('An error has occured while saving SMTP config');
              return res.status(500).send();
            }
            res.status(200).send();
          });
        }
      });
    });
  });

  app.get('/getSMTP', (req, res) => {
    logger.info('Received a request to get SMTP Config');
    mongo.getSMTP((err, data) => {
      if (err) {
        logger.error('An error occured while getting SMTP config');
        return res.status(500).send();
      }
      res.status(200).json(data);
    });
  });

  app.post('/processUserAccoutRequest', (req, res) => {
    logger.info('Received a request to change account status');
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
      const {
        role,
        status,
        id,
      } = fields;
      const updates = {};
      if (role) {
        updates.role = role;
      }
      updates.status = status;
      models.UsersModel.findByIdAndUpdate(id, updates, (err, data) => {
        if (err) {
          logger.error('An error has occured while changing account status');
          logger.error(err);
          res.status(500).send();
          return;
        }
        const subject = 'Account status on facility registry';
        let statusText = 'Rejected';
        if (fields.status === 'Active') {
          statusText = 'Approved';
        }
        const emailText = `Your account has been ${statusText}, you may now access the facility registry. Your username is ${data.userName}`;
        const emails = [data.email];
        mail.send(subject, emailText, emails, () => {

        });
        logger.info('Account status has been changed');
        res.status(200).send();
      });
    });
  });

  app.get('/getUser/:userName', (req, res) => {
    logger.info(`Getting user ${req.params.userName}`);
    models.UsersModel.find({
      userName: req.params.userName,
    }).lean().exec((err, data) => {
      if (data.length > 0) {
        const userID = data[0]._id.toString();
        // get role name
        models.RolesModel.find({
          _id: data[0].role,
        }).lean().exec((err, roles) => {
          let role = null;
          if (roles.length === 1) {
            role = roles[0].name;
          }
          res.status(200).json({
            role,
            userID,
          });
        });
      } else {
        logger.info(`User ${req.params.userName} not found`);
        res.status(200).json({
          role: null,
          userID: null,
        });
      }
    });
  });

  app.post('/changeAccountStatus', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received a request to ${fields.status} account for userID ${fields.id}`);
      mongo.changeAccountStatus(fields.status, fields.id, (error, resp) => {
        if (error) {
          logger.error(error);
          return res.status(400).send();
        }
        res.status(200).send();
      });
    });
  });

  app.post('/resetPassword', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received a request to reset password for userID ${fields.id}`);
      mongo.resetPassword(fields.id, bcrypt.hashSync(fields.surname, 8), (error, resp) => {
        if (error) {
          logger.error(error);
          return res.status(400).send();
        }
        res.status(200).send();
      });
    });
  });

  app.post('/changePassword', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received a request to change password for userID ${fields.id}`);
      mongo.resetPassword(fields.id, bcrypt.hashSync(fields.password, 8), (error, resp) => {
        if (error) {
          logger.error(error);
          return res.status(400).send();
        }
        res.status(200).send();
      });
    });
  });

  app.get('/getRoles/:id?', (req, res) => {
    logger.info('Received a request to get roles');
    let idFilter;
    if (req.params.id) {
      idFilter = {
        _id: req.params.id,
      };
    } else {
      idFilter = {};
    }
    models.RolesModel.find(idFilter).lean().exec((err, roles) => {
      logger.info(`sending back a list of ${roles.length} roles`);
      res.status(200).json(roles);
    });
  });

  app.get('/getTasks/:id?', (req, res) => {
    logger.info('Received a request to get tasks');
    let idFilter;
    if (req.params.id) {
      idFilter = {
        _id: req.params.id,
      };
    } else {
      idFilter = {};
    }
    models.TasksModel.find(idFilter).lean().exec((err, tasks) => {
      logger.info(`sending back a list of ${tasks.length} tasks`);
      res.status(200).json(tasks);
    });
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

  app.delete('/deleteLocation', (req, res) => {
    const {
      sourceId,
      sourceName,
      id,
      userID,
      sourceOwner,
    } = req.query;
    mcsd.deleteLocation(id, sourceId, sourceName, sourceOwner, userID, (resp, err) => {
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
      mongo.getServer(fields.sourceOwner, fields.name, (err, server) => {
        if (err) {
          logger.error(err);
          return res.status(500).send();
        }
        const mode = fields.mode;
        let full = true;
        if (mode === 'update') {
          full = false;
        }
        server.password = mongo.decrypt(server.password);
        dhis.sync(
          server.host,
          server.username,
          server.password,
          fields.name,
          fields.sourceOwner,
          fields.clientId,
          topOrgName,
          false,
          full,
          false,
          false,
        );
      });
    });
  });

  app.post('/fhirSync', (req, res) => {
    res.status(200).end();
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received a request to sync FHIR server ${fields.host}`);
      mongo.getServer(fields.sourceOwner, fields.name, (err, server) => {
        if (err) {
          logger.error(err);
          return res.status(500).send();
        }
        server.password = mongo.decrypt(server.password);
        fhir.sync(
          server.host,
          server.username,
          server.password,
          fields.mode,
          fields.name,
          fields.sourceOwner,
          fields.clientId,
          topOrgName,
        );
      });
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

  app.get('/reconcile', (req, res) => {
    const {
      totalSource1Levels,
      totalSource2Levels,
      recoLevel,
      clientId,
      userID,
      source1,
      source2,
      source1Owner,
      source2Owner,
      id,
    } = req.query;
    let {
      source1LimitOrgId,
      source2LimitOrgId,
      getPotential,
    } = req.query;
    if (source1LimitOrgId.length === 0) {
      source1LimitOrgId = [mixin.getTopOrgId(mixin.toTitleCase(source1 + source1Owner), 'Location')];
    }
    if (source2LimitOrgId.length === 0) {
      source2LimitOrgId = [mixin.getTopOrgId(mixin.toTitleCase(source2 + source2Owner), 'Location')];
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
    if (!source1 || !source2 || !recoLevel || !userID) {
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
          const dbSource2 = mixin.toTitleCase(source2 + source2Owner);
          mcsd.getLocationChildren({
            database: dbSource2,
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
          const dbSource1 = mixin.toTitleCase(source1 + source1Owner);
          mcsd.getLocationChildren({
            database: dbSource1,
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
          const mappingDB = mixin.toTitleCase(source1 + userID + source2);
          mcsd.getLocations(mappingDB, mcsdMapped => callback(false, mcsdMapped));
        },
      }, (error, results) => {
        const source1DB = mixin.toTitleCase(source1 + source1Owner);
        const source2DB = mixin.toTitleCase(source2 + source2Owner);
        const mappingDB = mixin.toTitleCase(source1 + userID + source2);
        if (recoLevel == totalSource1Levels) {
          scores.getBuildingsScores(
            results.source1Loations,
            results.source2Locations,
            results.mappingData,
            mcsdSource2All,
            mcsdSource1All,
            source1DB,
            source2DB,
            mappingDB,
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
            source1DB,
            source2DB,
            mappingDB,
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
  app.get('/matchedLocations', (req, res) => {
    logger.info(`Received a request to return matched Locations in ${req.query.type} format for ${req.query.source1}${req.query.source2}`);
    const {
      userID,
      source1Owner,
      source2Owner,
      type,
    } = req.query;
    let {
      source1LimitOrgId,
      source2LimitOrgId,
    } = req.query;
    const source1DB = mixin.toTitleCase(req.query.source1 + source1Owner);
    const source2DB = mixin.toTitleCase(req.query.source2 + source2Owner);
    const mappingDB = mixin.toTitleCase(req.query.source1 + userID + req.query.source2);
    const topOrgId1 = mixin.getTopOrgId(source1DB, 'Location');
    const topOrgId2 = mixin.getTopOrgId(source2DB, 'Location');
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

    mcsd.getLocations(mappingDB, (mapped) => {
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
              mcsd.getLocations(source1DB, mcsd => callback(null, mcsd));
            },
            source2mCSD(callback) {
              mcsd.getLocations(source2DB, mcsd => callback(null, mcsd));
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

  app.get('/unmatchedLocations', (req, res) => {
    const {
      userID,
      source1Owner,
      source2Owner,
      type,
    } = req.query;
    let {
      source1LimitOrgId,
      source2LimitOrgId,
    } = req.query;
    const source1DB = mixin.toTitleCase(req.query.source1 + source1Owner);
    const source2DB = mixin.toTitleCase(req.query.source2 + source2Owner);
    const levelMapping1 = JSON.parse(req.query.levelMapping1);
    const levelMapping2 = JSON.parse(req.query.levelMapping2);
    const topOrgId1 = mixin.getTopOrgId(source1DB, 'Location');
    const topOrgId2 = mixin.getTopOrgId(source2DB, 'Location');
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
            database: source1DB,
            parent: source1LimitOrgId[0],
          }, mcsdRes => callback(null, mcsdRes));
        },
        source2mCSD(callback) {
          mcsd.getLocationChildren({
            database: source2DB,
            parent: source2LimitOrgId[0],
          }, mcsdRes => callback(null, mcsdRes));
        },
      }, (error, response) => {
        const mappingDB = mixin.toTitleCase(req.query.source1 + userID + req.query.source2);
        async.parallel({
          source1Unmatched(callback) {
            scores.getUnmatched(response.source1mCSD, response.source1mCSD, mappingDB, true, 'source1', null, (unmatched, mcsdUnmatched) => callback(null, {
              unmatched,
              mcsdUnmatched,
            }));
          },
          source2Unmatched(callback) {
            scores.getUnmatched(response.source2mCSD, response.source2mCSD, mappingDB, true, 'source2', null, (unmatched, mcsdUnmatched) => callback(null, {
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
      const mappingDB = mixin.toTitleCase(req.query.source1 + userID + req.query.source2);

      async.parallel({
        source1mCSD(callback) {
          mcsd.getLocationChildren({
            database: source1DB,
            parent: source1LimitOrgId[0],
          }, mcsdRes => callback(null, mcsdRes));
        },
        source2mCSD(callback) {
          mcsd.getLocationChildren({
            database: source2DB,
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
                scores.getUnmatched(response.source1mCSD, mcsdLevel, mappingDB, true, 'source1', parentsFields, (unmatched) => {
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
                scores.getUnmatched(response.source2mCSD, mcsdLevel, mappingDB, true, 'source2', parentsFields, (unmatched) => {
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

  app.post('/match/:type', (req, res) => {
    logger.info('Received data for matching');
    const {
      type,
    } = req.params;
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (!fields.source1DB || !fields.source2DB) {
        logger.error({
          error: 'Missing Source1 or Source2',
        });
        res.status(400).json({
          error: 'Missing Source1 or Source2',
        });
        return;
      }
      const {
        source1Id,
        source2Id,
        recoLevel,
        totalLevels,
        userID,
        source1Owner,
        source2Owner,
        flagComment,
      } = fields;
      const source1DB = mixin.toTitleCase(fields.source1DB + source1Owner);
      const source2DB = mixin.toTitleCase(fields.source2DB + source2Owner);
      const mappingDB = mixin.toTitleCase(fields.source1DB + userID + fields.source2DB);
      if (!source1Id || !source2Id) {
        logger.error({
          error: 'Missing either Source1 ID or Source2 ID or both',
        });
        res.status(400).json({
          error: 'Missing either Source1 ID or Source2 ID or both',
        });
        return;
      }
      let uri;
      if (mongoUser && mongoPasswd) {
        uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
      } else {
        uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
      }
      const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
      });
      connection.on('error', () => {
        logger.error(`An error occured while connecting to DB ${mappingDB}`);
      });
      connection.once('open', () => {
        connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
          connection.close();
          if (data && data.recoStatus === 'in-progress') {
            mcsd.saveMatch(source1Id, source2Id, source1DB, source2DB, mappingDB, recoLevel, totalLevels, type, false, flagComment, (err, matchComments) => {
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
          } else {
            res.status(400).send({
              error: 'Reconciliation closed',
            });
          }
        });
      });
    });
  });

  app.post('/acceptFlag/:source1/:source2/:userID', (req, res) => {
    logger.info('Received data for marking flag as a match');
    if (!req.params.source1 || !req.params.source2) {
      logger.error({
        error: 'Missing Source1 or Source2',
      });
      res.status(400).json({
        error: 'Missing Source1 or Source2',
      });
      return;
    }
    const {
      userID,
    } = req.params;
    const mappingDB = mixin.toTitleCase(req.params.source1 + userID + req.params.source2);
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
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

      let uri;
      if (mongoUser && mongoPasswd) {
        uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
      } else {
        uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
      }
      const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
      });
      connection.on('error', () => {
        logger.error(`An error occured while connecting to DB ${mappingDB}`);
      });

      connection.once('open', () => {
        connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
          connection.close();
          if (data.recoStatus === 'in-progress') {
            mcsd.acceptFlag(source1Id, mappingDB, (err) => {
              logger.info('Done marking flag as a match');
              if (err) {
                res.status(400).send({
                  error: err,
                });
              } else res.status(200).send();
            });
          } else {
            res.status(400).send({
              error: 'Reconciliation closed',
            });
          }
        });
      });
    });
  });

  app.post('/noMatch/:type/:source1/:source2/:source1Owner/:source2Owner/:userID', (req, res) => {
    logger.info('Received data for matching');
    if (!req.params.source1 || !req.params.source2) {
      logger.error({
        error: 'Missing Source1 or Source2',
      });
      res.set('Access-Control-Allow-Origin', '*');
      res.status(400).json({
        error: 'Missing Source1 or Source2',
      });
      return;
    }
    const {
      userID,
      source1Owner,
      source2Owner,
      type,
    } = req.params;
    const source1DB = mixin.toTitleCase(req.params.source1 + source1Owner);
    const source2DB = mixin.toTitleCase(req.params.source2 + source2Owner);
    const mappingDB = mixin.toTitleCase(req.params.source1 + userID + req.params.source2);
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      const {
        source1Id,
        recoLevel,
        totalLevels,
      } = fields;
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

      let uri;
      if (mongoUser && mongoPasswd) {
        uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
      } else {
        uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
      }
      const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
      });
      connection.on('error', () => {
        logger.error(`An error occured while connecting to DB ${mappingDB}`);
      });
      connection.once('open', () => {
        connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
          connection.close();
          if (!data || data.recoStatus === 'in-progress') {
            mcsd.saveNoMatch(source1Id, source1DB, source2DB, mappingDB, recoLevel, totalLevels, type, (err) => {
              logger.info('Done matching');
              if (err) {
                res.status(400).send({
                  error: 'Un expected error has occured',
                });
              } else res.status(200).send();
            });
          } else {
            res.status(400).send({
              error: 'Reconciliation closed',
            });
          }
        });
      });
    });
  });

  app.post('/breakMatch/:source1/:source2/:source1Owner/:source2Owner/:userID', (req, res) => {
    if (!req.params.source1) {
      logger.error({
        error: 'Missing Source1',
      });
      res.status(400).json({
        error: 'Missing Source1',
      });
      return;
    }
    const userID = req.params.userID;
    const source1Owner = req.params.source1Owner;
    const source1DB = mixin.toTitleCase(req.params.source1 + source1Owner);
    const mappingDB = mixin.toTitleCase(req.params.source1 + userID + req.params.source2);
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received break match request for ${fields.source1Id}`);
      const source1Id = fields.source1Id;

      let uri;
      if (mongoUser && mongoPasswd) {
        uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
      } else {
        uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
      }
      const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
      });
      connection.on('error', () => {
        logger.error(`An error occured while connecting to DB ${mappingDB}`);
      });
      connection.once('open', () => {
        connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
          connection.close();
          if (data.recoStatus === 'in-progress') {
            mcsd.breakMatch(source1Id, mappingDB, source1DB, (err, results) => {
              if (err) {
                logger.error(err);
                return res.status(500).json({
                  error: err,
                });
              }
              logger.info(`break match done for ${fields.source1Id}`);
              res.status(200).send(err);
            });
          } else {
            res.status(400).send({
              error: 'Reconciliation closed',
            });
          }
        });
      });
    });
  });

  app.post('/breakNoMatch/:type/:source1/:source2/:userID', (req, res) => {
    if (!req.params.source1 || !req.params.source2) {
      logger.error({
        error: 'Missing Source1',
      });
      res.status(500).json({
        error: 'Missing Source1',
      });
      return;
    }
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      logger.info(`Received break no match request for ${fields.source1Id}`);
      const source1Id = fields.source1Id;
      if (!source1Id) {
        logger.error({
          error: 'Missing Source1 ID',
        });
        return res.status(500).json({
          error: 'Missing Source1 ID',
        });
      }
      const {
        userID,
        type,
      } = req.params;
      const mappingDB = mixin.toTitleCase(req.params.source1 + userID + req.params.source2);

      let uri;
      if (mongoUser && mongoPasswd) {
        uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
      } else {
        uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
      }
      const connection = mongoose.createConnection(uri, {
        useNewUrlParser: true,
      });
      connection.on('error', () => {
        logger.error(`An error occured while connecting to DB ${mappingDB}`);
      });
      connection.once('open', () => {
        connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
          connection.close();
          if (data.recoStatus === 'in-progress') {
            mcsd.breakNoMatch(source1Id, mappingDB, (err) => {
              logger.info(`break no match done for ${fields.source1Id}`);
              res.status(200).send(err);
            });
          } else {
            res.status(400).send({
              error: 'Reconciliation closed',
            });
          }
        });
      });
    });
  });

  app.get('/markRecoUnDone/:source1/:source2/:userID', (req, res) => {
    logger.info(`received a request to mark reconciliation for ${req.params.userID} as undone`);
    const {
      source1,
      source2,
      userID,
    } = req.params;
    const mappingDB = mixin.toTitleCase(source1 + userID + source2);

    let uri;
    if (mongoUser && mongoPasswd) {
      uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
    } else {
      uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
    }
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
    });
    connection.on('error', () => {
      logger.error(`An error occured while connecting to DB ${mappingDB}`);
    });
    connection.once('open', () => {
      connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
        if (!data) {
          const MetaDataModel = connection.model('MetaData', schemas.MetaData);
          const MetaData = new MetaDataModel({
            recoStatus: 'in-progress',
          });
          MetaData.save((err, data) => {
            connection.close();
            if (err) {
              logger.error(err);
              logger.error('Failed to save reco status');
              res.status(500).json({
                error: 'Unexpected error occured,please retry',
              });
            } else {
              logger.info('Reco status saved successfully');
              res.status(200).json({
                status: 'in-progress',
              });
            }
          });
        } else {
          connection.model('MetaData', schemas.MetaData).findByIdAndUpdate(data.id, {
            recoStatus: 'in-progress',
          }, (err, data) => {
            connection.close();
            if (err) {
              logger.error(err);
              logger.error('Failed to save reco status');
              res.status(500).json({
                error: 'Unexpected error occured,please retry',
              });
            } else {
              logger.info('Reco status saved successfully');
              res.status(200).json({
                status: 'in-progress',
              });
            }
          });
        }
      });
    });
  });

  app.get('/markRecoDone/:source1/:source2/:userID', (req, res) => {
    logger.info(`received a request to mark reconciliation for ${req.params.source1}${req.params.source2} as done`);
    const {
      source1,
      source2,
      userID,
    } = req.params;
    const mappingDB = mixin.toTitleCase(source1 + userID + source2);

    let uri;
    if (mongoUser && mongoPasswd) {
      uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
    } else {
      uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
    }
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
    });
    connection.on('error', () => {
      logger.error(`An error occured while connecting to DB ${mappingDB}`);
    });
    connection.once('open', () => {
      connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
        if (!data) {
          const MetaDataModel = connection.model('MetaData', schemas.MetaData);
          const MetaData = new MetaDataModel({
            recoStatus: 'Done',
          });
          MetaData.save((err, data) => {
            connection.close();
            if (err) {
              logger.error(err);
              logger.error('Failed to save reco status');
              res.status(500).json({
                error: 'Unexpected error occured,please retry',
              });
            } else {
              logger.info('Reco status saved successfully');
              sendNotification((err, not) => {
                res.status(200).json({
                  status: 'Done',
                });
              });
            }
          });
        } else {
          connection.model('MetaData', schemas.MetaData).findByIdAndUpdate(data.id, {
            recoStatus: 'Done',
          }, (err, data) => {
            connection.close();
            if (err) {
              logger.error(err);
              logger.error('Failed to save reco status');
              res.status(500).json({
                error: 'Unexpected error occured,please retry',
              });
            } else {
              logger.info('Reco status saved successfully');
              sendNotification((err, not) => {
                res.status(200).json({
                  status: 'Done',
                });
              });
            }
          });
        }
      });
    });

    function sendNotification(callback) {
      logger.info('received a request to send notification to endpoint regarding completion of reconciliation');
      models.MetaDataModel.findOne({}, {
        'config.generalConfig': 1,
      }, (err, data) => {
        if (err) {
          logger.error(err);
          return callback(true, false);
        }
        if (!data) {
          return callback(false, false);
        }
        let configData = {};
        try {
          configData = JSON.parse(JSON.stringify(data));
        } catch (error) {
          logger.error(error);
          return callback(true, false);
        }

        if (configData.hasOwnProperty('config')
          && configData.config.hasOwnProperty('generalConfig')
          && configData.config.generalConfig.hasOwnProperty('recoProgressNotification')
          && configData.config.generalConfig.recoProgressNotification.enabled
          && configData.config.generalConfig.recoProgressNotification.url
        ) {
          const {
            url,
            username,
            password,
          } = configData.config.generalConfig.recoProgressNotification;
          const auth = `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`;
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

  app.get('/recoStatus/:source1/:source2/:userID', (req, res) => {
    const {
      source1,
      source2,
      userID,
    } = req.params;
    const mappingDB = mixin.toTitleCase(source1 + userID + source2);
    let uri;
    if (mongoUser && mongoPasswd) {
      uri = `mongodb://${mongoUser}:${mongoPasswd}@${mongoHost}:${mongoPort}/${mappingDB}`;
    } else {
      uri = `mongodb://${mongoHost}:${mongoPort}/${mappingDB}`;
    }
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
    });
    connection.on('error', () => {
      logger.error(`An error occured while connecting to DB ${mappingDB}`);
    });
    connection.once('open', () => {
      connection.model('MetaData', schemas.MetaData).findOne({}, (err, data) => {
        connection.close();
        if (data && data.recoStatus) {
          res.status(200).json({
            status: data.recoStatus,
          });
        } else {
          res.status(200).json({
            status: false,
          });
        }
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

  app.post('/updateDatasetAutosync', (req, res) => {
    logger.info('Received a request to edit a data source auto sync');
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      fields.enabled = JSON.parse(fields.enabled);
      mongo.updateDatasetAutosync(fields.id, fields.enabled, (err, resp) => {
        if (err) {
          res.status(500).json({
            error: 'Unexpected error occured,please retry',
          });
          logger.error(err);
        } else {
          logger.info('Data source edited sucessfully');
          res.status(200).send();
        }
      });
    });
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

  // merging signup custom fields into Users model
  models.MetaDataModel.find({
    'forms.name': 'signup',
  }, (err, data) => {
    let Users;
    if (data && data.length > 0) {
      let signupFields = Object.assign({}, data[0].forms[0].fields);
      signupFields = Object.assign(signupFields, schemas.usersFields);
      Users = new mongoose.Schema(signupFields);
    } else {
      Users = new mongoose.Schema(schemas.usersFields);
    }
    delete mongoose.connection.models.Users;
    models.UsersModel = mongoose.model('Users', Users);
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
}
