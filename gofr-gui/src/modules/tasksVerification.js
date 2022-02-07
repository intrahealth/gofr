import {store} from '../store/store'
export const tasksVerification = {
  hasPermissionByName_deprecated: (permission, resource, id) => {
    let userObj = store.state.auth.userObj
    if(!userObj || !userObj.permissions || Object.keys(userObj.permissions).length === 0) {
      return false
    }
    if(userObj.permissions['*'] && userObj.permissions['*']['*']) {
      return true
    }
    if(userObj.permissions[permission][resource] || (userObj.permissions['*'] && userObj.permissions['*'][resource])) {
      if(!id) {
        return true
      }
      if(userObj.permissions[permission][resource]['id'] || (userObj.permissions['*'] && userObj.permissions['*'][resource] && userObj.permissions['*'][resource]['id'])) {
        if(userObj.permissions[permission][resource]['id'][id]) {
          return userObj.permissions[permission][resource]['id'][id]
        } else if(userObj.permissions['*'] && userObj.permissions['*'][resource] && userObj.permissions['*'][resource]['id'] && userObj.permissions['*'][resource]['id'][id]) {
          return userObj.permissions['*'][resource]['id'][id]
        }
        return false
      }
      return false
    }
    return false
  },
  __hasPermissionByName: (permission, resource, partition) => {
    let userObj = store.state.auth.userObj
    try {
      if (partition) {
        const partitionIndex = userObj.permissions.partitions && userObj.permissions.partitions.findIndex(part => part.name === partition);
        if (partitionIndex === -1) {
          return false;
        }
        return userObj.permissions.partitions[partitionIndex][permission][resource];
      }
      return userObj.permissions[permission][resource];
    } catch (err) {
      return false;
    }
  },
  hasPermissionByName: (permission, resource, id, partition) => {
    const perms = ['*'];
    if (permission !== '*') { perms.push(permission); }
    const resources = ['*'];
    if (resource !== '*') { resources.push(resource); }
  
    let results = {};
    for (const perm of perms) {
      for (const res of resources) {
        const allowed = tasksVerification.__hasPermissionByName(perm, res, partition);
        if (allowed === true) {
          return true;
        } if (allowed !== false && allowed !== undefined) {
          // override with most precise
          results = allowed;
        }
      }
    }
    if (!typeof results == 'object' || Object.keys(results).length === 0) {
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
  }
}
