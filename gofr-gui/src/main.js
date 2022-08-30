import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {store} from './store/store'
import i18n from './i18n'
import vuetify from './plugins/vuetify';
import vuelidate from 'vuelidate'
import { uuid } from 'vue-uuid'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'
import VueSession from 'vue-session'
import VueJwtDecode from 'vue-jwt-decode'
import * as Keycloak from 'keycloak-js';
let ProgressBar = require('progressbar.js');
import 'whatwg-fetch'
import fhirpath from "fhirpath"
import fhirutils from "./plugins/fhirutils"
import { tasksVerification } from '@/modules/tasksVerification'
import guiConfig from '../config/config.json'

const div = document.createElement("div");
div.setAttribute('id', 'progressBarContainer')
document.body.appendChild(div);


var bar = new ProgressBar.Line('#progressBarContainer', {
  strokeWidth: 2,
  easing: 'easeInOut',
  duration: 1000,
  color: 'black',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: {width: '100%', height: '100%'},
  from: {color: '#569fd3'},
  to: {color: '#d06f1a'},
  step: (state, bar) => {
    bar.path.setAttribute('stroke', state.color);
    bar.setText("Loading...");
  }
});

let progress = 0.0
let progressType = 'increment'
const loading = setInterval(() => {
  if(progress >= 1) {
    progressType = 'decrement'
  } else if (progress <= 0) {
    progressType = 'increment'
  }
  if(progressType === 'increment') {
    progress = (parseFloat(progress) + 0.1).toFixed(1)
  } else {
    progress = (parseFloat(progress) - 0.1).toFixed(1)
  }
  bar.animate(progress);
}, 1100);

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

function gofrAuthenticatePublicUser() {
  return new Promise((resolve) => {
    axios
    .post('/auth/login/', {username: 'public@gofr.org', password: 'public'})
    .then(authResp => {
      store.state.auth.username = 'public@gofr.org'
      store.state.auth.userObj = authResp.data.userObj
      store.state.auth.userID = authResp.data.userObj.resource.id
      if (authResp.data.userObj) {
        store.state.public_access = true
        store.state.clientId = uuid.v4()
        store.state.initializingApp = true
        store.state.denyAccess = false
        resolve()
      } else {
        store.state.public_access = false
        resolve()
      }
    }).catch(() => {
      store.state.public_access = false
      resolve()
    })
  })
}

function kcAuthenticatePublicUser(genConfig) {
  return new Promise((resolve) => {
    if (genConfig.public_access.enabled === false) {
      return resolve(false)
    }
    Vue.$keycloak.init({onLoad: 'check-sso', checkLoginIframe: false}).then( () => {
      //if already authenticated then skip
      if(Vue.$keycloak.token || VueCookies.get('loggedout-public') == 'true') {
        VueCookies.set('loggedout-public', false)
        return resolve(false)
      }
      const url = store.state.keycloak.baseURL + '/realms/' + store.state.keycloak.realm + '/protocol/openid-connect/token'
      let data = `client_id=${store.state.keycloak.UIClientId}&grant_type=password&username=public@gofr.org&password=public`
      axios.post(url, data).then((resp) => {
        let userinfo = VueJwtDecode.decode(resp.data.access_token)
        let token = resp.data.access_token
        let refreshToken = resp.data.refresh_token
        Vue.$keycloak.init({onLoad: 'login-required', checkLoginIframe: false, token, refreshToken}).then( () => {
          store.state.public_access = true
          setInterval(() =>{
            Vue.$keycloak.updateToken(70)
          }, 60000)
          axios.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bearer ${resp.data.access_token}`
            return config
          }, (error) => {
            return Promise.reject(error)
          })
          let user = {
            resourceType: 'Person',
            id: userinfo.sub,
            meta: {
              profile: ['http://gofr.org/fhir/StructureDefinition/gofr-person-user']
            },
            name: [{
              use: 'official',
              text: "Public User"
            }],
            active: true,
            telecom: [{
              system: 'email',
              value: 'public@gofr.org'
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
            store.state.auth.username = 'public@gofr.org'
            renderApp(genConfig)
            resolve(true)
          }).catch((err) => {
            console.error(err)
          })
        })
      }).catch((err) => {
        console.error(err);
      })
    })
  })
}

function renderApp(genConfig) {
  clearInterval(loading)
  document.getElementById("progressBarContainer").remove()
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
  axios.get('/config/getGeneralConfig?defaultGenerConfig=' + defaultGenerConfig).then(async (response) => {
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
      let authenticated = await kcAuthenticatePublicUser(genConfig)
      if(!authenticated) {
        if(!keycloak.token) {
          await keycloak.init({onLoad: initOptions.onLoad}).then( auth => {
            if (!auth) {
              window.location.reload();
            }
           }).catch(() => {
            alert("Keycloak access failed")
          });
        }
        axios.interceptors.request.use((config) => {
          config.headers['Authorization'] = `Bearer ${keycloak.token}`
          return config
        }, (error) => {
          return Promise.reject(error)
        })
        keycloak.loadUserInfo().then((userinfo) => {
          if(userinfo.preferred_username === 'public@gofr.org') {
            store.state.public_access = true
          } else {
            store.state.public_access = false
          }
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
            renderApp(genConfig)
          }).catch((err) => {
            console.error(err)
          })
        })
        setInterval(() =>{
          keycloak.updateToken(70)
        }, 60000)
      }
    } else {
      axios({
        method: 'GET',
        url: '/auth'
      }).then(async(authResp) => {
        if(authResp.data.userObj && authResp.data.userObj.resource) {
          let telecom = authResp.data.userObj.resource.telecom.find((telecom) => {
            return telecom.system === 'email'
          })
          if(telecom) {
            store.state.auth.username = telecom.value
          }
          if(store.state.auth.username === 'public@gofr.org') {
            store.state.public_access = true
          } else {
            store.state.public_access = false
          }
          store.state.auth.userObj = authResp.data.userObj
          store.state.auth.userID = authResp.data.userObj.resource.id
        } else if (genConfig.public_access.enabled === true) {
          await gofrAuthenticatePublicUser()
        }
        Vue.prototype.$keycloak = null
        renderApp(genConfig)
      }).catch(async() => {
        if (genConfig.public_access.enabled === true) {
          await gofrAuthenticatePublicUser()
        }
        Vue.prototype.$keycloak = null
        renderApp(genConfig)
      })
    }
  })
})
