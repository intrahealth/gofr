import axios from 'axios'
import {
  eventBus
} from '@/main'
export const generalMixin = {
  data () {
    return {
      roles: [],
      tasks: []
    }
  },
  computed: {
    canAddDataset () {
      if (
        !this.$store.state.config.generalConfig.reconciliation.singleDataSource
      ) {
        return true
      } else {
        let totalDtSrcs = 0
        for (let source of this.$store.state.dataSources) {
          if (
            source.id ===
            this.$store.state.config.generalConfig.reconciliation.fixSource2To
          ) {
            continue
          }
          let userID = this.$store.state.auth.userID
          let orgId = this.$store.state.dhis.user.orgId
          let sharedToMe = source.sharedUsers.find(user => {
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
          totalDtSrcs++
        }
        if (totalDtSrcs >= 2) {
          this.datasetLimitWarn = true
          return false
        } else {
          return true
        }
      }
    }
  },
  methods: {
    flattenExtension(extension) {
      const results = {};
      for (const ext of extension) {
        let value = '';
        for (const key of Object.keys(ext)) {
          if (key !== 'url') {
            value = ext[key];
          }
        }
        if (results[ext.url]) {
          if (Array.isArray(results[ext.url])) {
            results[ext.url].push(value);
          } else {
            results[ext.url] = [results[ext.url], value];
          }
        } else if (Array.isArray(value)) {
          results[ext.url] = [value];
        } else {
          results[ext.url] = value;
        }
      }
      return results;
    },
    getCodeSystem (codeSystemType, callback) {
      axios
        .get('/FR/getCodeSystem', {
          params: {
            codeSystemType
          }
        })
        .then(response => {
          return callback(null, response.data)
        })
        .catch(err => {
          console.log(err)
          return callback(err, null)
        })
    },
    getTree (includeBuilding, recursive = true, callback) {
      axios.get('/FR/getTree', {
        params: {
          includeBuilding,
          recursive
        }
      }).then((hierarchy) => {
        if (hierarchy.data) {
          let err = false
          return callback(err, hierarchy.data)
        }
      }).catch((err) => {
        return callback(err, [])
      })
    },
    clearProgress (type) {
      axios.get(
        '/clearProgress/' +
        type +
        '/' +
        this.$store.state.clientId
      )
    },
    getGeneralConfig (callback) {
      let defaultGenerConfig = JSON.stringify(
        this.$store.state.config.generalConfig
      )
      axios.get('/config/getGeneralConfig?defaultGenerConfig=' + defaultGenerConfig).then(config => {
        if (config) {
          this.$store.state.config.generalConfig = config.data.generalConfig
        }
        return callback()
      })
      .catch(() => {
        return callback()
      })
    },
    toTitleCase (str) {
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.replace(word[0], word[0].toUpperCase()))
        .join('')
        .toLowerCase()
    },

    translateDataHeader (source, level) {
      let useCSVHeader = this.$store.state.config.userConfig.reconciliation.useCSVHeader
      let levelMapping = this.$store.state.levelMapping
      /**
       * if the use of CSV Headers is not enabled or csv header enabled but level mapping were not available
       * and instead the app manually mapped i.e level1 to level1, level2 to level2 .... facility to level5
       */
      if (!useCSVHeader || (useCSVHeader && levelMapping[source]['level' + level] === 'level' + level)) {
        return 'Level ' + level
      }
      if (Object.keys(this.$store.state.levelMapping[source]).length > 0) {
        // get level adjustment for shared sources with limited org units
        let levelMapping = this.$store.state.levelMapping[source]
        let countLevelMapping = 1
        for (let level in levelMapping) {
          if (level.indexOf('level') === 0) {
            countLevelMapping++
          }
        }
        let totalLevels
        if (source === 'source1') {
          totalLevels = this.$store.state.totalSource1Levels
        }
        if (source === 'source2') {
          totalLevels = this.$store.state.totalSource2Levels
        }
        totalLevels--
        let levelAdjustment = countLevelMapping - totalLevels
        level = level + levelAdjustment
        // end of getting level adjustments

        let levelValue = this.$store.state.levelMapping[source]['level' + level]
        if (
          levelValue &&
          levelValue !== 'null' &&
          levelValue !== 'undefined' &&
          levelValue !== 'false'
        ) {
          return levelValue
        } else {
          return this.$store.state.levelMapping[source]['facility']
        }
      } else {
        return 'Level ' + level
      }
    },
    getActiveDataSourcePair () {
      let shared
      let activeDataSourcePair = {}
      this.$store.state.dataSourcePairs.forEach(pair => {
        if ( pair.user.id === this.$store.state.auth.userID && pair.status === 'active' ) {
          activeDataSourcePair = pair
        }
        if (Object.keys(activeDataSourcePair).length > 0) {
          shared = undefined
          return
        }
        if (
          pair.user.id !== this.$store.state.auth.userID &&
          pair.activeUsers.find((actvUsr) => actvUsr.id === this.$store.state.auth.userID)
        ) {
          shared = pair
        }
      })
      if (shared) {
        activeDataSourcePair = shared
      }
      return activeDataSourcePair
    },
    getDatasourceOwner () {
      let sourceOwner = {
        source1Owner: '',
        source2Owner: ''
      }
      if (this.$store.state.activePair.source1.hasOwnProperty('userID')) {
        sourceOwner.source1Owner = this.$store.state.activePair.source1.userID
      }
      if (this.$store.state.activePair.source2.hasOwnProperty('userID')) {
        sourceOwner.source2Owner = this.$store.state.activePair.source2.userID
      }
      return sourceOwner
    },
    getLimitOrgIdOnActivePair () {
      let sourceLimitOrgId = {
        source1LimitOrgId: [],
        source2LimitOrgId: []
      }
      let dtSrc1 = this.$store.state.dataSources.find(dtSrc => {
        return dtSrc.id === this.$store.state.activePair.source1.id
      })
      let dtSrc2 = this.$store.state.dataSources.find(dtSrc => {
        return dtSrc.id === this.$store.state.activePair.source2.id
      })
      if (dtSrc1 && dtSrc1.hasOwnProperty('userID') && dtSrc1.userID !== this.$store.state.auth.userID) {
        let share = dtSrc1.sharedUsers.find(sharedUser => {
          return sharedUser.id === this.$store.state.auth.userID
        })
        if (share && share.limits.length > 0) {
          sourceLimitOrgId.source1LimitOrgId = share.limits
        } else {
          if (dtSrc1.shareToAll.activated && dtSrc1.shareToAll.limitByUserLocation) {
            if(this.$store.state.dhis.user.orgId) {
              sourceLimitOrgId.source1LimitOrgId = [this.$store.state.dhis.user.orgId]
            }
          }
        }
      }

      if (dtSrc2 && dtSrc2.hasOwnProperty('userID') && dtSrc2.userID !== this.$store.state.auth.userID) {
        let share = dtSrc2.sharedUsers.find(sharedUser => {
          return sharedUser.id === this.$store.state.auth.userID
        })
        if (share && share.limits.length > 0) {
          sourceLimitOrgId.source2LimitOrgId = share.limits
        } else {
          if (dtSrc2.shareToAll.activated && dtSrc2.shareToAll.limitByUserLocation) {
            if(this.$store.state.dhis.user.orgId) {
              sourceLimitOrgId.source2LimitOrgId = [this.$store.state.dhis.user.orgId]
            }
          }
        }
      }
      return sourceLimitOrgId
    },
    getLimitOrgIdOnDataSource (dataSource) {
      let limitOrgId = []
      if (dataSource && dataSource.hasOwnProperty('userID') && dataSource.userID !== this.$store.state.auth.userID) {
        let share = dataSource.sharedUsers.find(sharedUser => {
          return sharedUser.id === this.$store.state.auth.userID
        })
        if (share && share.limits.length > 0) {
          limitOrgId = share.limits
        } else {
          if (dataSource.shareToAll.activated && dataSource.shareToAll.limitByUserLocation) {
            if(this.$store.state.dhis.user.orgId) {
              limitOrgId = [this.$store.state.dhis.user.orgId]
            }
          }
        }
      }
      return limitOrgId
    },
    getRoles () {
      axios
        .get('/users/getRoles')
        .then(roles => {
          for (let role of roles.data) {
            this.roles.push({
              text: role.name,
              value: role.id,
              tasks: role.tasks
            })
          }
        })
        .catch(err => {
          console.log(err.response)
        })
    },
    getTasks () {
      axios
        .get('/getTasks')
        .then(tasks => {
          this.tasks = tasks.data
        })
        .catch(err => {
          console.log(err.response)
        })
    },
    saveConfiguration (configLevel, configName) {
      let userID = this.$store.state.auth.userID
      let formData = new FormData()
      formData.append('config', JSON.stringify(this.$store.state.config))
      formData.append('userID', userID)
      let endPoint
      if (configLevel === 'generalConfig') {
        endPoint = `/config/updateGeneralConfig`
      } else {
        endPoint = `/config/updateUserConfig/${this.$store.state.auth.userID}`
      }
      axios
        .post(endPoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(() => {
          if (configName === 'useCSVHeader') {
            eventBus.$emit('changeCSVHeaderNames')
          }
          if (configName === 'authDisabled') {
            this.$router.push({
              name: 'Logout'
            })
          }
        })
    },
    setDHIS2Credentials () {
      this.$store.state.auth.userID = ''
      if (process.env.NODE_ENV === 'production') {
        let href = location.href.split('api')
        if (href.length < 2) {
          return false
        }
        this.$store.state.dhis.host = location.href.split('api').shift()
        return true
      } else if (process.env.NODE_ENV === 'development') {
        this.$store.state.dhis.host = 'https://test.geoalign.datim.org/'
        this.$store.state.dhis.dev.auth.username = 'vlad_replica'
        this.$store.state.dhis.dev.auth.password = 'Test_Namibia123'
        return true
      }
    }
  }
}
