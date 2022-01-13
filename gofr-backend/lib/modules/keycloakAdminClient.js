const fs = require('fs');
const https = require('https');
const jwtDecode = require('jwt-decode');
const KcAdminClient = require('@keycloak/keycloak-admin-client').default;

const config = require('../config');
const logger = require('../winston');
const mixin = require('../mixin');

const TASK_EXTENSION = `${config.get('profiles:baseURL')}/StructureDefinition/gofr-task`;
const ROLE_EXTENSION = `${config.get('profiles:baseURL')}/StructureDefinition/gofr-role`;
const ASSIGN_ROLE_EXTENSION = `${config.get('profiles:baseURL')}/StructureDefinition/gofr-assign-role`;

const kcAdminClient = new KcAdminClient({
  realmName: config.get('keycloak:realm'),
  baseUrl: config.get('keycloak:baseURL'),
  requestConfig: {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  },
});
const credentials = {
  username: config.get('keycloak:RESTClientUser'),
  password: config.get('keycloak:RESTClientPassword'),
  grantType: 'password',
  clientId: config.get('keycloak:UIClientId'),
};
kcAdminClient.auth(credentials).catch((err) => {
  logger.error('Failed to initialize keycloak');
  logger.error(err);
});
setInterval(() => {
  kcAdminClient.auth(credentials).catch((err) => {
    logger.error(err);
  });
}, 58000);

const loadTasksToKeycloak = () => new Promise(async (resolve, reject) => {
  const installed = config.get('app:installed');
  if (installed) {
    return resolve();
  }
  const fshDir = config.get('builtFSHFIles');
  const clients = await kcAdminClient.clients.find();
  const client = clients.find(clt => clt.clientId === config.get('keycloak:UIClientId'));
  if (!client) {
    return reject('no UI Client ID');
  }
  mixin.getFilesFromDir(`${__dirname}/../${fshDir}`).then((files) => {
    const filesPromises = [];
    files.forEach((file) => {
      filesPromises.push(new Promise((fresolve, freject) => {
        fs.readFile(file, { encoding: 'utf8', flag: 'r' }, (err, data) => {
          if (err) {
            logger.error(err);
            return freject(err);
          }
          const fhir = JSON.parse(data);
          if (!fhir.meta || !fhir.meta.profile || !fhir.meta.profile.includes(TASK_EXTENSION)) {
            return fresolve();
          }
          const taskExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-task');
          const name = taskExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
          if (!name) {
            logger.warn(`Name missing for task ${fhir.id}`);
            return fresolve();
          }
          const body = {};
          if (name) {
            body.name = name.valueString;
          }
          const attributes = taskExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/task-attributes`);
          if (attributes && attributes.extension) {
            const roleAttrs = {};
            attributes.extension.forEach((attribute) => {
              const valueKey = Object.keys(attribute)[Object.keys(attribute).findIndex(key => key.startsWith('value'))];
              roleAttrs[attribute.url] = [attribute[valueKey]];
            });
            body.attributes = roleAttrs;
          }
          const composite = taskExt.extension.find(ext => ext.url === 'compositeTask');
          if (composite) {
            body.composite = true;
          }
          body.id = client.id;
          kcAdminClient.clients.createRole(body).then((resp) => {
            logger.info(`${201} - ${resp.roleName}`);
            return fresolve();
          }).catch((err) => {
            if (err.response && err.response.data) {
              if (err.response.status == 409) {
                logger.warn(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                return fresolve();
              }
              logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
            } else {
              logger.error(err);
            }
            return freject(err);
          });
        });
      }));
    });
    Promise.all(filesPromises).then(() => {
      // process composite tasks
      const filesPromises = [];
      files.forEach((file) => {
        filesPromises.push(new Promise((fresolve, freject) => {
          fs.readFile(file, { encoding: 'utf8', flag: 'r' }, (err, data) => {
            if (err) throw err;
            const fhir = JSON.parse(data);
            if (!fhir.meta || !fhir.meta.profile || !fhir.meta.profile.includes(TASK_EXTENSION)) {
              fresolve();
              return;
            }
            const taskExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-task');
            const name = taskExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
            if (!name) {
              fresolve();
              return;
            }
            const composites = taskExt.extension.filter(ext => ext.url === 'compositeTask');
            if (composites.length === 0) {
              fresolve();
              return;
            }
            kcAdminClient.clients.findRole({ id: client.id, roleName: name.valueString }).then((resp) => {
              const body = {
                roleId: resp.id,
                roles: [],
              };
              const compPromises = [];
              composites.forEach((composite) => {
                compPromises.push(new Promise((cresolve, creject) => {
                  let dir = file.split('/');
                  dir.pop();
                  dir = dir.join('/');
                  const compFile = `${composite.valueReference.reference.replace('/', '-')}.json`;
                  fs.readFile(`${dir}/${compFile}`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
                    if (err) {
                      logger.error(err);
                      return creject(err);
                    }
                    const fhir = JSON.parse(data);
                    const compTaskExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-task');
                    const compositeName = compTaskExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
                    kcAdminClient.clients.findRole({ id: client.id, roleName: compositeName.valueString }).then((resp) => {
                      body.roles.push({
                        id: resp.id,
                      });
                      cresolve();
                    }).catch((err) => {
                      if (err.response && err.response.data) {
                        logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                      } else {
                        logger.error(err);
                      }
                      creject(err);
                    });
                  });
                }));
              });
              Promise.all(compPromises).then(() => {
                kcAdminClient.roles.createComposite({ roleId: body.roleId }, body.roles).then(() => {
                  fresolve();
                }).catch((err) => {
                  if (err.response && err.response.data) {
                    logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                  } else {
                    logger.error(err);
                  }
                  freject(err);
                });
              });
            });
          });
        }));
      });
      Promise.all(filesPromises).then(() => {
        loadRolesToKeycloak().then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }).catch(err => reject(err));
});

const loadRolesToKeycloak = () => new Promise(async (resolve, reject) => {
  const fshDir = config.get('builtFSHFIles');
  const clients = await kcAdminClient.clients.find();
  const client = clients.find(clt => clt.clientId === config.get('keycloak:UIClientId'));
  if (!client) {
    return reject('No UI client ID');
  }
  mixin.getFilesFromDir(`${__dirname}/../${fshDir}`).then((files) => {
    const filesPromises = [];
    files.forEach((file) => {
      filesPromises.push(new Promise((fresolve, freject) => {
        fs.readFile(file, { encoding: 'utf8', flag: 'r' }, (err, data) => {
          if (err) {
            logger.error(err);
            return freject(err);
          }
          const fhir = JSON.parse(data);
          if (!fhir.meta || !fhir.meta.profile || !fhir.meta.profile.includes(ROLE_EXTENSION)) {
            return fresolve();
          }
          const roleExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-role');
          const name = roleExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
          if (!name) {
            logger.warn(`Name missing for role ${fhir.id}`);
            return fresolve();
          }
          const body = {
            id: client.id,
            name: name.valueString,
            clientRole: false,
          };
          kcAdminClient.roles.create(body).then(resp => fresolve()).catch((err) => {
            if (err.response && err.response.data) {
              if (err.response.status == 409) {
                logger.warn(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                return fresolve();
              }
              logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
            } else {
              logger.error(err);
            }
            return freject(err);
          });
        });
      }));
    });
    Promise.all(filesPromises).then(() => {
      // process nested roles
      const filesPromises = [];
      files.forEach((file) => {
        filesPromises.push(new Promise((fresolve, freject) => {
          fs.readFile(file, { encoding: 'utf8', flag: 'r' }, (err, data) => {
            if (err) throw err;
            const fhir = JSON.parse(data);
            if (!fhir.meta || !fhir.meta.profile || !fhir.meta.profile.includes(ROLE_EXTENSION)) {
              fresolve();
              return;
            }
            const roleExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-role');
            const name = roleExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
            if (!name) {
              fresolve();
              return;
            }
            const roles = roleExt.extension.filter(ext => ext.url === ASSIGN_ROLE_EXTENSION);
            const tasks = roleExt.extension.filter(ext => ext.url === 'task');

            const subroles = new Promise((sresolve, sreject) => {
              const composites = roles;
              if (composites.length === 0) {
                sresolve();
                return;
              }
              kcAdminClient.roles.findOneByName({ id: client.id, name: name.valueString }).then((resp) => {
                const body = {
                  roleId: resp.id,
                  roles: [],
                };
                const compPromises = [];
                composites.forEach((composite) => {
                  compPromises.push(new Promise((cresolve, creject) => {
                    let dir = file.split('/');
                    dir.pop();
                    dir = dir.join('/');
                    const compFile = `${composite.valueReference.reference.replace('/', '-')}.json`;
                    fs.readFile(`${dir}/${compFile}`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
                      if (err) {
                        logger.error(err);
                        return creject(err);
                      }
                      const fhir = JSON.parse(data);
                      const roleExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-role');
                      const compositeName = roleExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
                      kcAdminClient.roles.findOneByName({ id: client.id, name: compositeName.valueString }).then((resp) => {
                        body.roles.push({
                          id: resp.id,
                        });
                        cresolve();
                      }).catch((err) => {
                        if (err.response && err.response.data) {
                          logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                        } else {
                          logger.error(err);
                        }
                        creject(err);
                      });
                    });
                  }));
                });
                Promise.all(compPromises).then(() => {
                  kcAdminClient.roles.createComposite({ roleId: body.roleId }, body.roles).then(() => {
                    sresolve();
                  }).catch((err) => {
                    if (err.response && err.response.data) {
                      logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                    } else {
                      logger.error(err);
                    }
                    return sreject(err);
                  });
                });
              });
            });

            const roletasks = new Promise((sresolve, sreject) => {
              const composites = tasks;
              if (composites.length === 0) {
                sresolve();
                return;
              }
              kcAdminClient.roles.findOneByName({ id: client.id, name: name.valueString }).then((resp) => {
                const body = {
                  roleId: resp.id,
                  roles: [],
                };
                const compPromises = [];
                composites.forEach((composite) => {
                  compPromises.push(new Promise((cresolve, creject) => {
                    let dir = file.split('/');
                    dir.pop();
                    dir = dir.join('/');
                    const compFile = `${composite.valueReference.reference.replace('/', '-')}.json`;
                    fs.readFile(`${dir}/${compFile}`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
                      if (err) {
                        logger.error(err);
                        return creject(err);
                      }
                      const fhir = JSON.parse(data);
                      const taskExt = fhir.extension && fhir.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-task');
                      const compositeName = taskExt.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`);
                      kcAdminClient.clients.findRole({ id: client.id, roleName: compositeName.valueString }).then((resp) => {
                        body.roles.push({
                          id: resp.id,
                        });
                        cresolve();
                      }).catch((err) => {
                        if (err.response && err.response.data) {
                          logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                        } else {
                          logger.error(err);
                        }
                        creject(err);
                      });
                    });
                  }));
                });
                Promise.all(compPromises).then(() => {
                  kcAdminClient.roles.createComposite({ roleId: body.roleId }, body.roles).then(() => {
                    sresolve();
                  }).catch((err) => {
                    if (err.response && err.response.data) {
                      logger.error(`${err.response.status} - ${JSON.stringify(err.response.data)}`);
                    } else {
                      logger.error(err);
                    }
                    return sreject(err);
                  });
                });
              });
            });
            Promise.all([subroles, roletasks]).then(() => {
              fresolve();
            }).catch((err) => {
              freject(err);
            });
          });
        }));
      });
      Promise.all(filesPromises).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
});

const populateRoleTasks = ({ token, user }) => new Promise(async (resolve, reject) => {
  const userDetails = jwtDecode(token);
  if (!userDetails.sub) {
    return reject();
  }
  let roleBasicName;
  kcAdminClient.clients.find().then((clients) => {
    const client = clients.find(clt => clt.clientId === config.get('keycloak:UIClientId'));
    if (!client) {
      return reject();
    }
    const promises = [];
    const tasks = [];
    if (userDetails.realm_access && userDetails.realm_access.roles) {
      userDetails.realm_access.roles.forEach((role) => {
        roleBasicName = role;
        promises.push(new Promise((res, rej) => {
          kcAdminClient.roles.findOneByName({ id: client.id, name: role }).then((roleDet) => {
            if (roleDet.attributes && Object.keys(roleDet.attributes).length > 0) {
              const task = {
                name: role,
              };
              for (const det in roleDet.attributes) {
                if (Array.isArray(roleDet.attributes[det]) && roleDet.attributes[det].length > 0) {
                  task[det] = roleDet.attributes[det][0];
                }
              }
              tasks.push(task);
            }
            return res();
          }).catch((err) => {
            logger.error(err);
            return rej();
          });
        }));
      });
    }
    if (userDetails.resource_access && userDetails.resource_access[client.clientId]) {
      userDetails.resource_access[client.clientId].roles.forEach((role) => {
        if (!roleBasicName) {
          roleBasicName = role;
        }
        promises.push(new Promise((res, rej) => {
          kcAdminClient.clients.findRole({ id: client.id, roleName: role }).then((roleDet) => {
            if (roleDet.attributes && Object.keys(roleDet.attributes).length > 0) {
              const task = {
                name: role,
              };
              for (const det in roleDet.attributes) {
                if (Array.isArray(roleDet.attributes[det]) && roleDet.attributes[det].length > 0) {
                  task[det] = roleDet.attributes[det][0];
                }
              }
              tasks.push(task);
            }
            return res();
          }).catch((err) => {
            logger.error(err);
            return rej();
          });
        }));
      });
    }
    Promise.all(promises).then(() => {
      if (tasks.length === 0) {
        return resolve({ user, role: {}, tasks });
      }
      const extension = [{
        url: `${config.get('profiles:baseURL')}/StructureDefinition/gofr-basic-name`,
        valueString: roleBasicName,
      }];
      tasks.forEach((task) => {
        const tasksExt = {
          url: TASK_EXTENSION,
          extension: [],
        };
        for (const taskInd in task) {
          if (taskInd === 'permission') {
            tasksExt.extension.push({
              url: 'permission',
              valueCode: task.permission,
            });
          } else if (taskInd === 'resource') {
            tasksExt.extension.push({
              url: 'resource',
              valueCode: task.resource,
            });
          } else if (taskInd === 'instance') {
            tasksExt.extension.push({
              url: 'instance',
              valueId: task.instance,
            });
          } else if (taskInd === 'field') {
            tasksExt.extension.push({
              url: 'field',
              valueString: task.field,
            });
          } else if (taskInd === 'constraint') {
            tasksExt.extension.push({
              url: 'constraint',
              valueString: task.constraint,
            });
          }
        }
        extension.push(tasksExt);
      });
      const role = {
        resourceType: 'Basic',
        id: `gofr-role-${roleBasicName.split(' ').join('')}`,
        meta: {
          profile: ROLE_EXTENSION,
        },
        extension,
      };
      if (!user.extension) {
        user.extension = [];
      }
      const roleExt = user.extension.findIndex(ext => ext.url === ASSIGN_ROLE_EXTENSION);
      if (roleExt !== -1) {
        user.extension.splice(roleExt, 1);
      }
      user.extension.push({
        url: ASSIGN_ROLE_EXTENSION,
        valueReference: {
          reference: `Basic/${role.id}`,
        },
      });
      resolve({ user, role, tasks });
    }).catch(() => reject());
  }).catch((err) => {
    logger.error(err);
    return reject();
  });
});

module.exports = {
  populateRoleTasks,
  loadTasksToKeycloak,
};
