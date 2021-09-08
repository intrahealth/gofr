import VueCookies from 'vue-cookies'
export const tasksVerification = {
  hasPermissionByName: (permission, resource, id) => {
    let userObj
    try {
      userObj = VueCookies.get('userObj')
    } catch (error) {
      console.log(error);
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
