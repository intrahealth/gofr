import {store} from '../store/store'
export const tasksVerification = {
  hasPermissionByName: (permission, resource, id) => {
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
  }
}
