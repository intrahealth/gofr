<template>
  <v-app>
    <appToolbar></appToolbar>
    <appSideMenu v-if="$store.state.auth.userID" :nav="nav"></appSideMenu>
    <v-main>
      <v-dialog
        v-model="$store.state.dynamicProgress"
        persistent
        width="300"
      >
        <v-card
          color="primary"
          dark
        >
          <v-card-text>
            {{$store.state.progressTitle}}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog
        persistent
        v-model="$store.state.dialogError"
        max-width="500px"
      >
        <v-card>
          <v-toolbar
            :color="$store.state.errorColor"
            dark
          >
            <v-toolbar-title>
              {{$store.state.errorTitle}}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              icon
              dark
              @click.native="$store.state.dialogError = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            {{$store.state.errorDescription}}
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              @click.native="closeDialogError"
            >Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="$store.state.initializingApp"
        persistent
        width="300"
      >
        <v-card
          color="primary"
          dark
        >
          <v-card-text>
            {{ $t('App.initApp') }}
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-snackbar
        app
        class="mt-12"
        v-model="$store.state.message.active"
        :color="$store.state.message.type"
        :timeout="$store.state.message.timeout"
        top
        multi-line
        >
        {{ $store.state.message.text }}
          <v-btn icon dark @click="$store.commit('closeMessage')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
      </v-snackbar>
      <v-divider></v-divider>
      <br>
      <center>
        <v-alert
          :style="{width: $store.state.alert.width}"
          v-model="$store.state.alert.show"
          :type="$store.state.alert.type"
          :dismissible="$store.state.alert.dismisible"
          :transition="$store.state.alert.transition"
        >
          {{$store.state.alert.msg}}
        </v-alert>
      </center>
      <v-layout
        row
        wrap
      >
        <v-flex xs4>

        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs1>

        </v-flex>
      </v-layout>
      <router-view :key='$route.path'></router-view>
    </v-main>
    <v-footer
      dark
      color="primary"
      :fixed="fixed"
      app
      height="20"
    >
      <v-spacer></v-spacer>
      <label style="font-size: 10px">
        GOFR Version {{$store.state.version}}
      </label>
    </v-footer>
  </v-app>
</template>
<script>
import axios from 'axios'
import AppToolbar from '@/components/appToolbar'
import SideMenu from '@/components/side-menu'
import { scoresMixin } from './mixins/scoresMixin'
import { generalMixin } from './mixins/generalMixin'
import { dataSourcePairMixin } from './components/DataSourcesPair/dataSourcePairMixin'
import { eventBus } from './main'
import { uuid } from 'vue-uuid'
import {
  tasksVerification
} from './modules/tasksVerification'

export default {
  mixins: [dataSourcePairMixin, scoresMixin, generalMixin],
  props: ['generalConfig'],
  data () {
    return {
      fixed: false,
      activeDataSourcePair: {},
      tasksVerification: tasksVerification,
      nav: {
        active: null,
        menu: {}
      }
    }
  },
  methods: {
    closeDialogError () {
      this.$store.state.errorColor = 'primary'
      this.$store.state.dialogError = false
    },
    renderInitialPage () {
      if(!this.$store.state.config.userConfig.FRDatasource) {
        if(this.$store.state.auth.username === "public@gofr.org") {
          this.$store.state.config.userConfig.FRDatasource = this.$store.state.config.generalConfig.public_access.partition
        } else if(this.$store.state.dataSources.length > 0) {
          this.$store.state.config.userConfig.FRDatasource = this.$store.state.dataSources[0].name
        }
      }
      // this.$store.state.initializingApp = false
      // this.$router.push({ name: 'ViewMap' })
      // return
      let source1DB = this.$store.state.activePair.source1.name
      let source2DB = this.$store.state.activePair.source2.name
      if (
        (!source1DB || !source2DB) &&
        (this.$store.state.dataSources.length > 1 ||
          this.$store.state.dataSourcePairs.length > 0)
      ) {
        if(this.$store.state.auth.username === "public@gofr.org") {
          this.$router.push({ name: 'HomePublic' })
        } else {
          this.$router.push({ name: 'Home' })
        }
        return
      }
      if (!source1DB || !source2DB) {
        if(this.$store.state.auth.username === "public@gofr.org") {
          this.$router.push({ name: 'HomePublic' })
        } else {
          this.$router.push({ name: 'Home' })
        }
        return
      }
      axios.get( '/uploadAvailable/' + source1DB + '/' + source2DB ).then(results => {
        this.$store.state.initializingApp = false
        if (results.data.dataUploaded) {
          this.$store.state.recalculateScores = true
          if(this.$store.state.auth.username === "public@gofr.org") {
            this.$router.push({ name: 'HomePublic' })
          } else {
            this.$router.push({ name: 'Home' })
          }
        } else {
          if(this.$store.state.auth.username === "public@gofr.org") {
            this.$router.push({ name: 'HomePublic' })
          } else {
            this.$router.push({ name: 'Home' })
          }
        }
      })
      .catch(err => {
        console.log(err)
        if(this.$store.state.auth.username === "public@gofr.org") {
          this.$router.push({ name: 'HomePublic' })
        } else {
          this.$router.push({ name: 'Home' })
        }
      })
    },
    getTotalLevels () {
      let source1DB = this.$store.state.activePair.source1.name
      let source2DB = this.$store.state.activePair.source2.name
      let source1Id = this.$store.state.activePair.source1.id
      let source2Id = this.$store.state.activePair.source2.id
      if (!source1DB || !source2DB) {
        this.$store.state.totalSource1Levels = 5
        this.$store.state.totalSource2Levels = 5
        this.$store.state.initializingApp = false
        this.renderInitialPage()
        this.$store.state.recoLevel = 2
        this.getRecoStatus()
        return
      }
      let sourcesLimitOrgId = JSON.stringify(this.getLimitOrgIdOnActivePair())
      axios
        .get(`/datasource/countLevels?source1Id=${source1Id}&source1DB=${source1DB}&source2Id=${source2Id}&source2DB=${source2DB}&sourcesLimitOrgId=${sourcesLimitOrgId}`)
        .then(levels => {
          this.$store.state.levelMapping.source1 = levels.data.levelMapping.levelMapping1
          this.$store.state.levelMapping.source2 = levels.data.levelMapping.levelMapping2
          this.$store.state.totalSource1Levels = levels.data.totalSource1Levels
          this.$store.state.totalSource2Levels = levels.data.totalSource2Levels
          this.$store.state.recoLevel = 2
          this.renderInitialPage()
          this.getRecoStatus()
        }).catch((err) => {
          console.log(err)
          this.$store.state.recoLevel = 2
          this.renderInitialPage()
          this.getRecoStatus()
        })
    },
    getRecoStatus () {
      if (
        Object.keys(this.$store.state.activePair.source1).length === 0 ||
        Object.keys(this.$store.state.activePair.source2).length === 0
      ) {
        return
      }
      let source1 = this.toTitleCase(this.$store.state.activePair.source1.name)
      let source2 = this.toTitleCase(this.$store.state.activePair.source2.name)
      let userID = this.$store.state.activePair.userID
      axios.get('/match/recoStatus/' + this.$store.state.activePair.id).then(status => {
        if (status.data.status) {
          this.$store.state.recoStatus = status.data.status
        } else {
          axios.get('/match/markRecoUnDone/' + source1 + '/' + source2 + '/' + userID).then(status => {
            if (status.data.status) {
              this.$store.state.recoStatus = status.data.status
            }
          }).catch(err => {
            console.log(err.response.data.error)
          })
        }
      }).catch(err => {
        console.log(err.response.data.error)
      })
    },
    getDataSources () {
      this.$store.state.loadingServers = true
      this.$store.state.dataSources = []
      let userID = this.$store.state.auth.userID
      let orgId = this.$store.state.dhis.user.orgId
      axios
        .get('/datasource/getSource/' + userID + '/' + orgId)
        .then(response => {
          this.$store.state.loadingServers = false
          this.$store.state.dataSources = response.data.sources
          this.getDataSourcePair()
        })
        .catch(err => {
          this.$store.state.loadingServers = false
          console.log(err)
          this.getDataSourcePair()
        })
    },
    getUserConfig () {
      let userID = this.$store.state.auth.userID
      axios
        .get('/config/getUserConfig/' + userID)
        .then(config => {
          if (config.data.config) {
            this.$store.state.config.userConfig = { 
              ...this.$store.state.config.userConfig, 
              ...config.data.config
            }
          }
          if(config.data.site && config.data.site.nav) {
            if (config.data.site.nav.hasOwnProperty("active")) this.nav.active = config.data.site.nav.active
            if (config.data.site.nav.hasOwnProperty("menu")) this.nav.menu = config.data.site.nav.menu
            if (config.data.site.nav.hasOwnProperty("home")) this.nav.home = config.data.site.nav.home
          }
          if(this.$store.state.auth.username === 'public@gofr.org') {
            config.data.site.nav.menu.home.url = '/HomePublic'
          }
          if(this.$store.state.idp === 'keycloak') {
            config.data.site.nav.menu.account = {
              text: this.$t('App.menu.account.msg'),
              tooltip: this.$t('App.menu.account.tooltip'),
              order: 6,
              icon: 'mdi-account-outline',
              url: this.$store.state.keycloak.baseURL + '/realms/' + this.$store.state.keycloak.realm + '/account',
              external: true,
              access: {
                permission: 'special',
                resource: 'custom',
                id: 'manage-account'
              },
            }
          }
          this.getDataSources()
        })
        .catch((err) => {
          console.log(err);
          this.getDataSources()
        })
    },
    getDataSourcePair () {
      this.$store.state.activePair.source1 = {}
      this.$store.state.activePair.source2 = {}
      let userID = this.$store.state.auth.userID
      if (!this.$store.state.initializingApp) {
        this.$store.state.initializingApp = true
      }
      axios
        .get('/datasource/getSourcePair/' + userID + '/' + this.$store.state.dhis.user.orgId)
        .then(response => {
          this.$store.state.dataSourcePairs = response.data
          let activeSource = this.getActiveDataSourcePair()
          if (Object.keys(activeSource).length > 0) {
            this.$store.state.activePair.source1.id = activeSource.source1.id
            this.$store.state.activePair.source1.name = activeSource.source1.name
            this.$store.state.activePair.source1.display = activeSource.source1.display
            this.$store.state.activePair.source1.userID = activeSource.source1.user.id
            this.$store.state.activePair.source2.id = activeSource.source2.id
            this.$store.state.activePair.source2.name = activeSource.source2.name
            this.$store.state.activePair.source2.display = activeSource.source2.display
            this.$store.state.activePair.source2.userID = activeSource.source2.user.id
            this.$store.state.activePair.id = activeSource.id
            this.$store.state.activePair.name = activeSource.name
            this.$store.state.activePair.display = activeSource.display
            this.$store.state.activePair.shared = activeSource.sharedUsers
            this.$store.state.activePair.activeUsers = activeSource.activeUsers
            this.$store.state.activePair.userID = activeSource.user.id
          }
          this.autoActivateDatasourcePair((created) => {
            if (!created) {
              this.autoCreateDatasourcePair()
            }
          })
          this.getTotalLevels()
        })
        .catch(err => {
          console.log(JSON.stringify(err))
          this.$store.state.dialogError = true
          this.$store.state.errorTitle = 'Error'
          this.$store.state.errorDescription = 'An error occured while getting data source pairs, reload the app to retry'
          this.getTotalLevels()
        })
    },
    autoCreateDatasourcePair () {
      if (this.$store.state.config.generalConfig.reconciliation.singleDataSource) {
        if (Object.keys(this.$store.state.activePair.source1).length > 0) {
          return false
        }
        let fixedSource2To = this.$store.state.config.generalConfig.reconciliation.fixSource2To
        let source1 = {}
        let source2 = {}
        let userID = this.$store.state.auth.userID
        let orgId = this.$store.state.dhis.user.orgId
        let datasources = []
        for (let source of this.$store.state.dataSources) {
          let sharedToMe = source.shared.users.find((user) => {
            return user.id === userID
          })
          let itsMine = source.owner.id === userID
          let sharedToAll = source.shareToAll.activated === true
          let sameOrgId = false
          if (source.owner.orgId && source.owner.orgId === orgId) {
            sameOrgId = true
          }
          if (!itsMine && !sharedToMe && !sharedToAll && !sameOrgId) {
            continue
          }
          if (source.id === fixedSource2To) {
            source2 = source
          } else {
            source1 = source
          }
          datasources.push(source)
        }
        if (datasources.length > 2 || Object.keys(source1).length === 0 || Object.keys(source2).length === 0) {
          return false
        }
        this.createDatasourcePair(source1, source2)
      }
    },
    autoActivateDatasourcePair (callback) {
      if (Object.keys(this.$store.state.activePair.source1).length > 0) {
        let val = false
        return callback(val)
      }
      if (this.$store.state.dataSourcePairs.length > 1 || this.$store.state.dataSourcePairs.length === 0) {
        let val = false
        return callback(val)
      }
      if (this.$store.state.dhis.user.orgId && this.$store.state.config.generalConfig.reconciliation.singlePair) {
        this.$store.state.dataSourcePairs.status = 'active'
        this.activeDataSourcePair = this.$store.state.dataSourcePairs[0]
        let val = true
        callback(val)
        this.activatePair()
      } else {
        let val = false
        callback(val)
      }
    }
  },
  components: {
    'appToolbar': AppToolbar,
    'appSideMenu': SideMenu
  },
  created () {
    // this.$router.push({ name: 'AddDataSources' })
    // this.$router.push({ name: 'Home' })
    this.$store.state.config.generalConfig = this.generalConfig
    if(this.$store.state.idp === 'keycloak') {
      this.$store.state.clientId = uuid.v4()
      this.$store.state.initializingApp = true
      this.$store.state.denyAccess = false
      this.getUserConfig()
    } else {
      if (this.$store.state.auth.userObj.resource) {
        if (!this.$store.state.config.generalConfig.authDisabled) {
          axios.get('/isSessionActive/').then(() => {
            // will come here only if the session is active
            this.$store.state.clientId = uuid.v4()
            this.$store.state.initializingApp = true
            this.$store.state.denyAccess = false
            this.getUserConfig()
          })
        } else {
          this.$router.push('login')
        }
      }
    }

    eventBus.$on('refreshApp', () => {
      this.getDataSources()
    })
    eventBus.$on('recalculateScores', () => {
      this.$store.state.recalculateScores = true
      this.$router.push({ name: 'FacilityReconScores' })
    })
    eventBus.$on('getDataSources', () => {
      this.getDataSources()
    })
    eventBus.$on('getUserConfig', () => {
      this.getUserConfig()
    })
    eventBus.$on('getGeneralConfig', () => {
      this.getGeneralConfig()
    })
    eventBus.$on('getDataSourcePair', () => {
      this.getDataSourcePair()
    })
    eventBus.$on('refresh-login', () => {
      let method = 'GET'
      if(this.$store.state.idp === 'keycloak') {
        method = 'POST'
      }
      axios({
        method,
        url: '/auth'
      }).then((authResp) => {
        if(this.$store.state.idp === 'keycloak' && authResp.data.resource) {
          this.$store.state.auth.userObj = authResp.data
          this.$cookies.set('userObj', JSON.stringify(authResp.data), 'infinity')
        } else if(authResp.data.userObj && authResp.data.userObj.resource){
          this.$store.state.auth.userObj = authResp.data.userObj
        }
      })
    })
  },
  mounted: function() {
    let elHtml = document.getElementsByTagName('html')[0]
    elHtml.style.overflowY = 'auto'
  },
  destroyed: function() {
    let elHtml = document.getElementsByTagName('html')[0]
    elHtml.style.overflowY = null
  },
  name: 'App'
}
</script>