import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {store} from './store/store'
import i18n from './i18n'
import vuetify from './plugins/vuetify';
import vuelidate from 'vuelidate'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'
import VueSession from 'vue-session'
import * as Keycloak from 'keycloak-js';
import 'whatwg-fetch'
import fhirpath from "fhirpath"
import fhirutils from "./plugins/fhirutils"
import { tasksVerification } from '@/modules/tasksVerification'
import guiConfig from '../config/config.json'

Object.defineProperty(Vue.prototype, '$fhirpath', {
  value: fhirpath
})
Object.defineProperty(Vue.prototype, '$fhirutils', {
  value: fhirutils
})

const tasksVerificationPlugin = {
  install(Vue) {
    Vue.$tasksVerification = tasksVerification
  }
}

tasksVerificationPlugin.install = Vue => {
  Vue.$tasksVerification = tasksVerification
  Object.defineProperties(Vue.prototype, {
    $tasksVerification: {
      get() {
        return tasksVerification
      }
    }
  })
}
Vue.use(tasksVerificationPlugin)
axios.defaults.withCredentials = true
Vue.use(VueCookies)
Vue.use(vuelidate)
Vue.use(VueAxios, axios)
Vue.use(VueSession)
Vue.config.productionTip = false

export const eventBus = new Vue()

if (guiConfig.BACKEND_HOST === '.') {
  guiConfig.BACKEND_HOST = window.location.hostname
  guiConfig.BACKEND_PROTOCOL = window.location.protocol.replace(':', '')
}
guiConfig.BACKEND_SERVER = guiConfig.BACKEND_PROTOCOL + '://' + guiConfig.BACKEND_HOST + ':' + guiConfig.BACKEND_PORT
// if running inside DHIS2 then get any config defined inside the datastore
function getDHIS2StoreConfig (callback) {
  let href = location.href.split('api')
  if (href.length >= 2) {
    let dhis2URL = location.href.split('api').shift()
    axios.get(dhis2URL + 'api/dataStore/GOFR/config').then((response) => {
      callback(response.data)
      // if BACKEND_URL is missing then set it
      if (!response.data.BACKEND_SERVER) {
        let url = process.env.VUE_APP_BACKEND_SERVER || guiConfig.BACKEND_SERVER
        let config = {
          BACKEND_SERVER: url
        }
        addDHIS2StoreConfig(config)
      }
    }).catch((err) => {
      console.log(JSON.stringify(err))
      let resp = false
      let url = process.env.VUE_APP_BACKEND_SERVER || guiConfig.BACKEND_SERVER
      let config = {
        BACKEND_SERVER: url
      }
      addDHIS2StoreConfig(config)
      return callback(resp)
    })
  } else {
    let resp = false
    return callback(resp)
  }
}

function addDHIS2StoreConfig (config) {
  let dhis2URL = location.href.split('api').shift()
  axios.post(dhis2URL + 'api/dataStore/GOFR/config', config)
}
/* eslint-disable no-new */
getDHIS2StoreConfig((storeConfig) => {
  if (storeConfig && storeConfig.BACKEND_SERVER) {
    axios.defaults.baseURL = process.env.VUE_APP_BACKEND_SERVER || storeConfig.BACKEND_SERVER
  } else if (process.env.VUE_APP_BACKEND_SERVER) {
    axios.defaults.baseURL = process.env.VUE_APP_BACKEND_SERVER
  } else {
    axios.defaults.baseURL = guiConfig.BACKEND_SERVER
  }
  // get general config of App and pass it to the App component as props
  let defaultGenerConfig = JSON.stringify(store.state.config.generalConfig)
  axios.get('/config/getGeneralConfig?defaultGenerConfig=' + defaultGenerConfig).then(response => {
    let genConfig = response.data.generalConfig
    store.state.idp = response.data.otherConfig.idp
    store.state.keycloak = response.data.otherConfig.keycloak
    store.state.version = response.data.version
    if (!genConfig) {
      genConfig = {}
    }

    if(!response.data.generalConfig.authDisabled && store.state.idp === 'keycloak') {
      let initOptions = {
        realm: response.data.otherConfig.keycloak.realm,
        clientId: response.data.otherConfig.keycloak.UIClientId,
        url: response.data.otherConfig.keycloak.baseURL,
        onLoad: 'login-required'
      }

      let keycloak = Keycloak(initOptions);
      const Plugin = {
        install(Vue) {
          Vue.$keycloak = keycloak
        }
      }

      Plugin.install = Vue => {
        Vue.$keycloak = keycloak
        Object.defineProperties(Vue.prototype, {
          $keycloak: {
            get() {
              return keycloak
            }
          }
        })
      }
      Vue.use(Plugin)
      keycloak.init({onLoad: initOptions.onLoad}).then( auth => {
        if (!auth) {
          window.location.reload();
        } else {
          axios.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bearer ${keycloak.token}`
            return config
          }, (error) => {
            return Promise.reject(error)
          })
          keycloak.loadUserInfo().then((userinfo) => {
            let user = {
              resourceType: 'Person',
              id: userinfo.sub,
              meta: {
                profile: ['http://gofr.org/fhir/StructureDefinition/gofr-person-user']
              },
              name: [{
                use: 'official',
                text: userinfo.name
              }],
              active: true
            }
            if(userinfo.email) {
              user.telecom = [{
                system: 'email',
                value: userinfo.email
              }]
            }
            axios({
              method: 'POST',
              url: '/auth',
              data: user
            }).then((response) => {
              VueCookies.set('userObj', JSON.stringify(response.data), 'infinity')
              store.state.auth.userObj = response.data
              store.state.auth.userID = userinfo.sub
              store.state.auth.username = userinfo.preferred_username
              new Vue({
                router,
                store,
                i18n,
                vuetify,
                data () {
                  return {
                    config: genConfig
                  }
                },
                render: function (createElement) {
                  return createElement(App, {
                    props: {
                      generalConfig: this.config
                    }
                  })
                }
              }).$mount('#app')
            }).catch((err) => {
              console.error(err)
            })
          })
          setInterval(() =>{
            keycloak.updateToken(70)
          }, 60000)
        }
      }).catch(() => {
        alert("Keycloak access failed")
      });
    } else {
      axios({
        method: 'GET',
        url: '/auth'
      }).then((authResp) => {
        if(authResp.data.userObj && authResp.data.userObj.resource) {
          let telecom = authResp.data.userObj.resource.telecom.find((telecom) => {
            return telecom.system === 'email'
          })
          if(telecom) {
            store.state.auth.username = telecom.value
          }
          store.state.auth.userObj = authResp.data.userObj
          store.state.auth.userID = authResp.data.userObj.resource.id
        }
        Vue.prototype.$keycloak = null
        new Vue({
          router,
          store,
          i18n,
          vuetify,
          data () {
            return {
              config: genConfig
            }
          },
          render: function (createElement) {
            return createElement(App, {
              props: {
                generalConfig: this.config
              }
            })
          }
        }).$mount('#app')
      })
    }
  })
})
