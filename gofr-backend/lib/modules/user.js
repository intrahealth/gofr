const crypto = require('crypto');
const deepmerge = require('deepmerge');
const config = require('../config');
const fhirAxios = require('./fhirAxios');
const fhirFilter = require('./fhirFilter');
const { Resource2FHIRPATH } = require('./resource2fhirpath');
const logger = require('../winston');
const dataSources = require('./dataSources');

const ROLE_EXTENSION = 'http://gofr.org/fhir/StructureDefinition/gofr-assign-role';
const TASK_EXTENSION = 'http://gofr.org/fhir/StructureDefinition/gofr-task';

const isObject = obj => (!!obj) && (obj.constructor === Object);

const user = {
  __testUser: () => new User({}),
  restoreUser: (obj) => {
    const userObj = new User(obj.resource);
    userObj.restorePermissions(obj.permissions);
    return userObj;
  },
  lookup: query => new Promise((resolve, reject) => {
    fhirAxios.search('Person', query, 'DEFAULT').then(async (response) => {
      if (response.total === 0) {
        resolve(false);
      } else if (response.total > 1) {
        logger.error(`Too many users found for ${JSON.stringify(query)}`);
        resolve(false);
      } else {
        const userObj = new User(response.entry[0].resource);
        await userObj.updatePermissions();
        resolve(userObj);
      }
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  }),
  lookupByEmail: email => user.lookup({ telecom: `email|${email}` }),
  lookupByProvider: (provider, id) => user.lookup({ identifier: `${provider}|${id}` }),
  find: id => new Promise((resolve, reject) => {
    fhirAxios.read('Person', id, 'DEFAULT').then(async (response) => {
      const userObj = new User(response);
      await userObj.updatePermissions();
      resolve(userObj);
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  }),
  createUserInstance: (userResource, roleResource) => new Promise(async (resolve, reject) => {
    const userObj = new User(userResource);
    userObj.updatePermissions([roleResource]).then(() => {
      resolve(userObj);
    }).catch((err) => {
      logger.error(err);
      reject(err);
    });
  }),
  hashPassword: (password, salt) => {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
  },
  tasksLoaded: false,
  tasksLoading: false,
  valueSet: {},
  loadTaskList: refresh => new Promise((resolve, reject) => {
    if (user.tasksLoading) {
      const interval = setInterval(() => {
        if (user.tasksLoaded && !user.tasksLoading) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    } else if (user.tasksLoaded && !refresh) {
      resolve();
    } else {
      user.tasksLoading = true;
      user.tasksLoaded = false;
      Promise.all([
        fhirAxios.expand('gofr-task-permission', null, true, true, 'DEFAULT'),
        fhirAxios.expand('gofr-task-resource', null, true, true, 'DEFAULT'),
      ]).then((results) => {
        user.valueSet['gofr-task-permission'] = results[0].map(exp => exp.code);
        user.valueSet['gofr-task-resource'] = results[1].map(exp => exp.code);

        user.tasksLoading = false;
        user.tasksLoaded = true;
        resolve();
      }).catch((err) => {
        reject(err);
      });
    }
  }),
  addRole: ({ permissions = {}, roleRef, roleResource }) => new Promise((resolve, reject) => {
    const findRoleResource = new Promise((res, rej) => {
      if (roleResource) {
        return res();
      }
      const role = roleRef.split('/');
      if (role.length !== 2) {
        logger.error(`Invalid role passed to addRole: ${roleRef}`);
        rej();
      } else {
        fhirAxios.read(role[0], role[1], '', 'DEFAULT').then((response) => {
          roleResource = response;
          return res();
        }).catch((err) => {
          logger.error(err);
          rej();
        });
      }
    });
    findRoleResource.then(async () => {
      await resolveTasks(roleResource);
      await user.loadTaskList();
      const roleDetails = roleResource.extension && roleResource.extension.find(rl => rl.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-role');
      const tasks = roleDetails.extension.filter(ext => ext.url === TASK_EXTENSION);
      for (const task of tasks) {
        let permission;
        let resource;
        let id;
        let constraint;
        let field;
        try {
          permission = task.extension.find(ext => ext.url === 'permission').valueCode;
        } catch (err) {
          console.error("No permission given for task.  Don't know what to do.");
          continue;
        }
        try {
          resource = task.extension.find(ext => ext.url === 'resource').valueCode;
        } catch (err) {
          console.error("No resource given for task.  Don't know what to do.");
          continue;
        }
        try {
          id = task.extension.find(ext => ext.url === 'instance').valueId;
        } catch (err) {
          // id takes precedence and only one can be set
          try {
            constraint = task.extension.find(ext => ext.url === 'constraint').valueString;
          } catch (err) {
          }
        }
        try {
          field = task.extension.find(ext => ext.url === 'field').valueString;
        } catch (err) {
        }
        user.addPermission(permissions, permission, resource, id, constraint, field);
      }

      const roles = roleDetails.extension.filter(ext => ext.url === ROLE_EXTENSION);
      for (const role of roles) {
        await user.addRole({ permissions, roleRef: role.valueReference.reference });
      }
      resolve();
    }).catch(err => reject(err));

    function resolveTasks(role) {
      return new Promise((resolve, reject) => {
        if (Array.isArray(role.extension)) {
          const promises = [];
          const detIndex = role.extension.findIndex(rl => rl.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-role');
          role.extension[detIndex].extension.forEach((extension, index) => {
            promises.push(new Promise((resolve, reject) => {
              if (extension.url !== 'task' || !extension.valueReference) {
                return resolve();
              }
              const id = extension.valueReference.reference.split('/')[1];
              fhirAxios.read('Basic', id, '', 'DEFAULT').then((task) => {
                const taskDetails = task.extension && task.extension.find(tsk => tsk.url === 'http://gofr.org/fhir/StructureDefinition/gofr-ext-task');
                if (!taskDetails) {
                  return resolve();
                }
                const taskExt = taskDetails.extension.find(ext => ext.url === `${config.get('profiles:baseURL')}/StructureDefinition/task-attributes`);
                if (taskExt) {
                  role.extension[detIndex].extension[index] = {};
                  role.extension[detIndex].extension[index].url = TASK_EXTENSION;
                  role.extension[detIndex].extension[index].extension = taskExt.extension;
                }
                resolve();
              }).catch((err) => {
                logger.error(err);
                return reject();
              });
            }));
          });
          Promise.all(promises).then(() => {
            resolve();
          }).catch(() => {
            reject();
          });
        }
      });
    }
  }),
  addPermission: (permissions, permission, resource, id, constraint, field) => {
    // only below resources can be assigned global permissions i.e can be defined without being associated to any partition and user will have access to these resources on all partitions
    const globalResources = ['CodeSystem', 'ValueSet', 'DocumentReference', 'StructureDefinition', 'custom', 'navigation'];
    if (!user.tasksLoaded) {
      logger.error("Can't load permissions directly unless the task lists have been loaded for validation.  call user.loadTaskList() first.");
      return false;
    }
    if (!user.valueSet['gofr-task-permission'].includes(permission)) {
      logger.error(`Invalid permission given ${permission}`, user.valueSet['gofr-task-permission']);
      return false;
    }
    if (permission !== 'special' && !user.valueSet['gofr-task-resource'].includes(resource)) {
      logger.error(`Invalid resource given ${resource}`, user.valueSet['gofr-task-resource']);
      return false;
    }
    // Can't have an id when it's all resources
    if (resource === '*' && (id || field)) {
      logger.warn(`Can't add global resource permissions on a specific id or by including a field: ${id} - ${field}`);
      return false;
    }

    if ((permission === '*' || permission === 'delete') && (id || field)) {
      logger.warn(`Can't add delete permission on a specific id or by including a field: ${id} - ${field}`);
      return false;
    }
    let privilege;
    if (globalResources.includes(resource) || (resource === '*' && permission === '*')) {
      privilege = permissions;
      if (resource === '*' && permission === '*') {
        privilege.special = {
          '*': true,
        };
        return true;
      }
    } else {
      const defaultPartPerm = permissions.partitions.findIndex(part => part.name === 'DEFAULT');
      if (defaultPartPerm !== -1) {
        privilege = permissions.partitions[defaultPartPerm];
      } else {
        permissions.partitions.push({
          name: 'DEFAULT',
        });
        privilege = permissions.partitions[0];
      }
    }
    if (!privilege.hasOwnProperty(permission)) {
      privilege[permission] = {};
    }
    if (!field && !id && !constraint) {
      privilege[permission][resource] = true;
    } else if (privilege[permission][resource] !== true) {
      if (!privilege[permission].hasOwnProperty(resource)) {
        privilege[permission][resource] = {};
      }
      if (id) {
        if (!privilege[permission][resource].hasOwnProperty('id')) {
          privilege[permission][resource].id = {};
        }
        if (field) {
          if (!privilege[permission][resource].id.hasOwnProperty(id)) {
            privilege[permission][resource].id[id] = { };
          }
          if (isObject(privilege[permission][resource].id[id])) {
            privilege[permission][resource].id[id][field] = true;
          }
        } else {
          privilege[permission][resource].id[id] = true;
        }
      } else if (constraint) {
        if (!privilege[permission][resource].hasOwnProperty('constraint')) {
          privilege[permission][resource].constraint = {};
        }
        if (field) {
          if (!privilege[permission][resource].constraint.hasOwnProperty(constraint)) {
            privilege[permission][resource].constraint[constraint] = {};
          }
          if (isObject(privilege[permission][resource].constraint[constraint])) {
            privilege[permission][resource].constraint[constraint][field] = true;
          }
        } else {
          privilege[permission][resource].constraint[constraint] = true;
        }
      } else {
        if (!privilege[permission][resource].hasOwnProperty('*')) {
          privilege[permission][resource]['*'] = {};
        }
        privilege[permission][resource]['*'][field] = true;
      }
    }
    return true;
  },
};

class User {
  constructor(resource) {
    this.resource = resource;
    this.permissions = {};
    this.permissions.partitions = [];
  }
}


User.prototype.restorePermissions = function (permissions) {
  this.permissions = permissions;
};

User.prototype.updatePermissions = async function (roleResources) {
  if (this.resource.hasOwnProperty('extension')) {
    const roles = this.resource.extension.filter(ext => ext.url === ROLE_EXTENSION);
    for (const role of roles) {
      try {
        const roleResource = roleResources && roleResources.find(resource => resource.id === role.valueReference.reference.split('/')[1]);
        await user.addRole({
          permissions: this.permissions,
          roleRef: role.valueReference.reference,
          roleResource,
        });
      } catch (err) {
        logger.error('Unable to load permissions', role, err);
      }
    }
    let is_public_user;
    if (this.resource && this.resource.telecom) {
      is_public_user = this.resource.telecom.find(tel => tel.value === 'public@gofr.org');
    }
    if (is_public_user) {
      const filterResource = await fhirAxios.read('Location', 'facility-public-filter', '', 'DEFAULT');
      let extraConstraints = [];
      if (filterResource) {
        const convert2fhirpath = new Resource2FHIRPATH({
          resource: filterResource,
          returnBoolean: true,
        });
        extraConstraints = convert2fhirpath.convert();
      }
      await fhirAxios.read('Parameters', 'gofr-general-config', '', 'DEFAULT').then((response) => {
        const resData = response.parameter.find(param => param.name === 'config');
        if (resData.valueString) {
          const config = JSON.parse(resData.valueString);
          if (config.public_access && config.public_access.enabled && config.public_access.partition) {
            const partAcc = {
              name: config.public_access.partition,
              read: {
                metadata: true,
                Location: true,
                Organization: true,
                HealthcareService: true,
              },
              write: {
                Location: {
                  constraint: {
                    "meta.profile contains 'http://gofr.org/fhir/StructureDefinition/gofr-facility-update-request' or meta.profile contains 'http://gofr.org/fhir/StructureDefinition/gofr-facility-add-request'": true,
                  },
                },
                QuestionnaireResponse: {
                  constraint: {
                    "questionnaire='http://gofr.org/fhir/Questionnaire/gofr-facility-add-request-questionnaire'": true,
                  },
                },
              },
            };
            if (extraConstraints.length > 0) {
              for (const constr of extraConstraints) {
                if (!isObject(partAcc.read.Location)) {
                  partAcc.read.Location = {
                    constraint: {},
                  };
                }
                if (!partAcc.read.Location.constraint) {
                  partAcc.read.Location.constraint = {};
                }
                partAcc.read.Location.constraint[`${constr}=${false}`] = true;
              }
            }
            this.permissions.partitions.push(partAcc);
            this.permissions.read = {
              StructureDefinition: true,
              DocumentReference: {
                constraint: {
                  "category.exists(coding.exists(code = 'open'))": true,
                },
              },
              ValueSet: true,
              CodeSystem: true,
            };
          }
        }
      });
    }
    await dataSources.getSources({ isAdmin: false, userID: this.resource.id }).then((sources) => {
      sources.forEach((source) => {
        const shareDetails = source.sharedUsers && source.sharedUsers.find(share => share.id === this.resource.id);
        const partIndex = this.permissions.partitions.findIndex(part => part.name === source.name);
        let partPerm = {};
        if (source.userID === this.resource.id) {
          partPerm = {
            name: source.name,
            '*': {
              '*': true,
            },
          };
        } else if (shareDetails && shareDetails.permissions) {
          partPerm = {
            name: source.name,
            ...shareDetails.permissions,
          };
        }
        if (partIndex === -1) {
          this.permissions.partitions.push(partPerm);
        } else {
          deepmerge(this.permissions.partitions[partIndex], partPerm);
        }
      });
    }).catch(() => {
      logger.error('An error occured while populating partition based permissions');
    });
  }
};

User.prototype.addPermission = function (permission, resource, id, constraint, field) {
  return user.addPermission(this.permissions, permission, resource, id, constraint, field);
};

/**
 * Gets a specific permission from the permissions object without any additional checking
 */
User.prototype.__hasPermissionByName = function (permission, resource, partition) {
  try {
    if (partition) {
      const partitionIndex = this.permissions.partitions && this.permissions.partitions.findIndex(part => part.name === partition);
      if (partitionIndex === -1) {
        return false;
      }
      return this.permissions.partitions[partitionIndex][permission][resource];
    }
    return this.permissions[permission][resource];
  } catch (err) {
    return false;
  }
};

/**
 * Gets a permission from the permissions object by checking for overriding values.
 * @return boolean | [ field list ] | Object
 * {
 * "*": [ field list ],
 * "id": { "ID": true | [field list ] }
 * "constraint": { "CONSTRAINT" : true | [field list] }
 * }
 */
User.prototype.hasPermissionByName = function (permission, resource, id, partition) {
  const perms = ['*'];
  if (permission !== '*') { perms.push(permission); }
  const resources = ['*'];
  if (resource !== '*') { resources.push(resource); }

  let results = {};
  for (const perm of perms) {
    for (const res of resources) {
      const allowed = this.__hasPermissionByName(perm, res, partition);
      if (allowed === true) {
        return true;
      } if (allowed !== false && allowed !== undefined) {
        // override with most precise
        results = allowed;
      }
    }
  }
  if (!isObject(results) || Object.keys(results).length === 0) {
    return false;
  }
  if (id) {
    if (results.hasOwnProperty('id')) {
      if (results.id.hasOwnProperty(id)) {
        return results.id[id];
      }
      return false;
    }
    if (results.hasOwnProperty('*')) {
      return results['*'];
    }
  }
  return results;
};

/**
 * Get the list of filters for a resource
 * @return array
 */
User.prototype.getFilter = function (resource) {
  if (this.permissions && this.permissions.hasOwnProperty('filter')
    && this.permissions.filter && this.permissions.filter.hasOwnProperty(resource)
    && this.permissions.filter[resource].hasOwnProperty('constraint')) {
    return Object.keys(this.permissions.filter[resource].constraint);
  }
  return undefined;
};

/**
 * Gets a permission from the permission object by checking for overriding values
 * on a FHIR resource object.
 * @return boolean | [ field list ]
 */
User.prototype.hasPermissionByObject = function (permission, resource, partition) {
  // First get the base permissions by name then see what constraints
  // apply. Don't get by ID as we need to determine if that was how it matched.
  const permissions = this.hasPermissionByName(permission, resource.resourceType, '', partition);
  if (permissions === true) {
    return true;
  }
  if (!permissions) {
    return false;
  }
  let allowed = {};
  if (permissions.hasOwnProperty('*') && isObject(permissions['*'])) {
    allowed = permissions['*'];
  }
  if (permissions.hasOwnProperty('id') && permissions.id.hasOwnProperty(resource.id)) {
    if (permissions.id[resource.id] === true) {
      return true;
    } if (isObject(permissions.id[resource.id])) {
      allowed = { ...allowed, ...permissions.id[resource.id] };
    }
  }
  if (permissions.hasOwnProperty('constraint') && isObject(permissions.constraint)) {
    const constraints = Object.keys(permissions.constraint);
    for (const constraint of constraints) {
      if (fhirFilter.meetsConstraint(resource, constraint)) {
        if (permissions.constraint[constraint] === true) {
          return true;
        } if (isObject(permissions.constraint[constraint])) {
          allowed = { ...allowed, ...permissions.constraint[constraint] };
        }
      } else {
      }
    }
  }
  const fieldList = Object.keys(allowed);
  return fieldList.length === 0 ? false : fieldList;
};

/**
 * Reset the permissions list
 */
User.prototype.resetPermissions = function () {
  this.permissions = {};
};

User.prototype.checkPassword = function (password) {
  const details = this.resource.extension.find(ext => ext.url === 'http://gofr.org/fhir/StructureDefinition/gofr-password');
  if (!details) {
    logger.error(`Password details don't exist in user ${this.resource.id}`);
    return false;
  }
  const hash = details.extension.find(ext => ext.url === 'hash');
  const salt = details.extension.find(ext => ext.url === 'salt');
  if (!hash || !hash.valueString || !salt || !salt.valueString) {
    logger.error(`Hash or salt doesn't exist in user ${this.resource.id}`);
    return false;
  }
  const compare = user.hashPassword(password, salt.valueString);
  if (compare.hash === hash.valueString) {
    return true;
  }
  return false;
};

User.prototype.update = function () {
  return fhirAxios.update(this.resource, 'DEFAULT');
};


module.exports = user;
