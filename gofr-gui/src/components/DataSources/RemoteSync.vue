<template>
  <v-container>
    <app-syncProgress
      :syncProgrIndeter='syncProgrIndeter'
      :syncStatus='syncStatus'
      :syncProgrPercent='syncProgrPercent'
      :syncPercent='syncPercent'
    >
    </app-syncProgress>
  </v-container>
</template>
<script>
import axios from 'axios'
import { eventBus } from '../../main'
import SyncProgress from './SyncProgress'
export default {
  props: ['id', 'syncType', 'serverName', 'host', 'username', 'password', 'userID', 'mode'],
  data () {
    return {
      syncProgrIndeter: false,
      syncStatus: 'Waiting for sync status',
      syncPercent: null,
      syncProgrPercent: false,
      syncProgressTimer: '',
      syncRunning: false
    }
  },
  methods: {
    sync () {
      let mode = this.mode
      if (!mode) {
        mode = 'full'
      }
      let formData = new FormData()
      const clientId = this.$store.state.clientId
      formData.append('id', this.id)
      formData.append('name', this.serverName)
      formData.append('host', this.host)
      formData.append('username', this.username)
      formData.append('password', this.password)
      formData.append('userID', this.userID)
      formData.append('clientId', clientId)
      formData.append('mode', mode)
      this.syncRunning = true
      this.syncProgrIndeter = true
      axios.post('/' + this.syncType + '/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.syncProgressTimer = setInterval(this.checkSyncProgress, 1000)
      }).catch((err) => {
        this.$store.state.dialogError = true
        this.$store.state.errorTitle = 'Error'
        this.$store.state.errorDescription = err.response.data.error + '. cross check host,user and password'
        clearInterval(this.syncProgressTimer)
        console.log(err.response.data.error)
      })
    },
    checkSyncProgress () {
      const clientId = this.$store.state.clientId
      let syncProgressType
      if (this.syncType === 'dhisSync') {
        syncProgressType = 'dhisSyncRequest'
      } else if (this.syncType === 'fhirSync') {
        syncProgressType = 'fhirSyncRequest'
      }
      axios.get('/progress/' + syncProgressType + '/' + clientId).then((syncProgress) => {
        if (syncProgress.data === null || syncProgress.data === undefined || syncProgress.data === false) {
          this.$store.state.uploadRunning = false
          this.syncProgrIndeter = false
          this.syncProgrPercent = false
          clearInterval(this.syncProgressTimer)
          return
        } else if (syncProgress.data.error !== null) {
          this.$store.state.uploadRunning = false
          this.syncProgrIndeter = false
          this.syncProgrPercent = false
          this.$store.state.dialogError = true
          this.$store.state.errorTitle = 'Error'
          this.$store.state.errorDescription = syncProgress.data.error
          clearInterval(this.syncProgressTimer)
          console.log(syncProgress.data.error)
          return
        } else if (syncProgress.data.status === null) {
          this.$store.state.uploadRunning = false
          this.syncProgrIndeter = false
          this.syncProgrPercent = false
          clearInterval(this.syncProgressTimer)
          return
        }
        this.syncStatus = syncProgress.data.status
        if (syncProgress.data.percent) {
          if (!this.syncProgrPercent) {
            this.syncProgrIndeter = false
            this.syncProgrPercent = true
          }
          this.syncPercent = syncProgress.data.percent
        }
        if (syncProgress.data.status === 'Done') {
          this.syncStatus = 'Waiting for sync status'
          clearInterval(this.syncProgressTimer)
          this.syncProgrPercent = false
          this.$store.state.uploadRunning = false
          eventBus.$emit('getDataSources')
        }
      }).catch((err) => {
        this.$store.state.dialogError = true
        this.$store.state.errorTitle = 'Error'
        console.log(err.response.data.error + '. cross check host,user and password')
        this.$store.state.errorDescription = err.response.data.error + '. cross check host,user and password'
        clearInterval(this.syncProgressTimer)
      })
    }
  },
  created () {
    eventBus.$on('runRemoteSync', this.sync)
  },
  beforeDestroy () {
    eventBus.$off('runRemoteSync', this.sync)
  },
  components: {
    'appSyncProgress': SyncProgress
  }
}
</script>
