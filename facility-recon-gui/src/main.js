import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {store} from './store/store'
import i18n from './i18n'
import vuetify from './plugins/vuetify';
import vuelidate from 'vuelidate'
import axios from 'axios'
import guiConfig from '../config/config.json'
Vue.use(vuelidate)

Vue.config.productionTip = false

export const eventBus = new Vue()

// if running inside DHIS2 then get any config defined inside the datastore
function getDHIS2StoreConfig (callback) {
  let href = location.href.split('api')
  if (href.length >= 2) {
    let dhis2URL = location.href.split('api').shift()
    axios.get(dhis2URL + 'api/dataStore/GOFR/config').then((response) => {
      callback(response.data)
      // if BACKEND_URL is missing then set it
      if (!response.data.BACKEND_SERVER) {
        let url = process.env.BACKEND_SERVER || guiConfig.BACKEND_HOST
        let config = {
          BACKEND_SERVER: url
        }
        addDHIS2StoreConfig(config)
      }
    }).catch((err) => {
      console.log(JSON.stringify(err))
      let resp = false
      let url = process.env.BACKEND_SERVER || guiConfig.BACKEND_SERVER
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
    axios.defaults.baseURL = process.env.BACKEND_SERVER || storeConfig.BACKEND_SERVER
  } else if (process.env.BACKEND_SERVER) {
    axios.defaults.baseURL = process.env.BACKEND_SERVER
  } else {
    if (guiConfig.BACKEND_HOST === '.') {
      guiConfig.BACKEND_HOST = window.location.hostname
      guiConfig.BACKEND_PROTOCOL = window.location.protocol.replace(':', '')
    }
    axios.defaults.baseURL = guiConfig.BACKEND_PROTOCOL + '://' + guiConfig.BACKEND_HOST + ':' + guiConfig.BACKEND_PORT
  }
  // get general config of App and pass it to the App component as props
  let defaultGenerConfig = JSON.stringify(store.state.config.generalConfig)
  axios.get('/getGeneralConfig?defaultGenerConfig=' + defaultGenerConfig).then(genConfig => {
    if (!genConfig) {
      genConfig.data = {}
    }
    new Vue({
      router,
      store,
      i18n,
      vuetify,
      data () {
        return {
          config: genConfig.data
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
})
