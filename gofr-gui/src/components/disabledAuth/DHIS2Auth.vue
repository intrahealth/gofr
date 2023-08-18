<template>
  <v-container grid-list-xs>

  </v-container>
</template>

<script>
import axios from 'axios'
import jwt_decode from "jwt-decode";
import { uuid } from 'vue-uuid'
import { eventBus } from '@/main'
import { generalMixin } from '@/mixins/generalMixin'
export default {
  mixins: [generalMixin],
  methods: {
    async addDHIS2User(isAdmin, dhis2User) {
      return new Promise((resolve, reject) => {
        let auth = this.$store.state.dhis.dev.auth
        let headers = {}
        if (auth.username === '') {
          auth = ''
        } else {
          const token = Buffer.from(`${auth.username}:${auth.password}`, 'utf8').toString('base64')
          headers['Authorization'] = 'Basic ' + token
        }
        dhis2User.data.isAdmin = isAdmin
        axios
        .post('/users/addDhis2User', dhis2User.data)
        .then(async() => {
          await this.authenticateDHIS2User(dhis2User.data)
          return resolve()
        }).catch(() => {
          reject()
        })
      })
    },
    authenticateDHIS2User(user) {
      return new Promise((resolve, reject) => {
        axios
        .post('/auth/token/', {username: user.username, password: user.username, dhis2OrgId: this.$store.state.dhis.user.orgId})
        .then(authResp => {
          let userObj = jwt_decode(authResp.data.access_token)
          userObj = userObj.user
          axios.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bearer ${authResp.data.access_token}`
            return config
          }, (error) => {
            return Promise.reject(error)
          })
          this.$store.state.auth.username = user.username
          this.$store.state.auth.userObj = userObj
          this.$store.state.auth.userID = userObj.resource.id
          if (userObj) {
            this.$store.state.clientId = uuid.v4()
            this.$store.state.initializingApp = true
            this.$store.state.denyAccess = false
            this.$store.state.public_access = false
          }
          return resolve()
        }).catch((err) => {
          console.log(err);
          return reject()
        })
      })
    },
    getDHIS2UserData (callback) {
      let auth = this.$store.state.dhis.dev.auth
      let headers = {}
      if (auth.username === '') {
        auth = ''
      } else {
        const token = Buffer.from(`${auth.username}:${auth.password}`, 'utf8').toString('base64')
        headers['Authorization'] = 'Basic ' + token
      }
      axios.get(this.$store.state.dhis.host + 'api/me', { headers }).then((userData) => {
        let orgUnitsIDs = JSON.parse(JSON.stringify(userData.data.organisationUnits))
        if (orgUnitsIDs.length > 0) {
          this.$store.state.dhis.user.orgId = orgUnitsIDs.shift().id
          axios.get(this.$store.state.dhis.host + 'api/organisationUnits/' + this.$store.state.dhis.user.orgId, { headers }).then((orgUnits) => {
            this.$store.state.dhis.user.orgName = orgUnits.data.displayName
            return callback(userData)
          })
        }
      }).catch((err) => {
        this.$store.state.dialogError = true
        this.$store.state.errorTitle = 'Error'
        if (err.response && err.response.data && err.response.data.httpStatusCode === 401) {
          this.$store.state.errorDescription = 'Unauthorized, ensure that your DHIS2 login is active'
          this.$router.push({ name: 'Logout' })
        } else {
          this.$store.state.errorDescription = 'Unauthorized, please reload the app'
        }
      })
    }
  },
  created () {
    this.setDHIS2Credentials()
    this.getDHIS2UserData(async(dhis2User) => {
      let isAdmin = dhis2User.data.userCredentials.userRoles.find((role) => {
        return role.id === this.$store.state.config.generalConfig.externalAuth.adminRole
      })
      await this.addDHIS2User(isAdmin, dhis2User)
      eventBus.$emit('getUserConfig')
      // axios.get('/getUser/' + dhis2User.data.userCredentials.username).then((user) => {
      //   if (user.data.userID) {
      //     this.$store.state.auth.username = dhis2User.data.userCredentials.username
      //     this.$store.state.auth.userID = user.data.userID
      //     this.$store.state.auth.role = roleText
      //     this.$store.state.initializingApp = true
      //     this.$store.state.denyAccess = false
      //     eventBus.$emit('getUserConfig')
      //   } else {
      //     let formData = new FormData()
      //     formData.append('firstName', dhis2User.data.firstName)
      //     formData.append('otherName', '')
      //     formData.append('password', dhis2User.data.surname)
      //     formData.append('userName', dhis2User.data.userCredentials.username)
      //     formData.append('surname', dhis2User.data.surname)
      //     formData.append('role', roleID)
      //     axios.post('/addUser', formData, {
      //       headers: {
      //         'Content-Type': 'multipart/form-data'
      //       }
      //     }).then(() => {
      //       axios.get('/getUser/' + dhis2User.data.userCredentials.username).then((user) => {
      //         if (user.data.userID) {
      //           this.$store.state.auth.username = dhis2User.data.userCredentials.username
      //           this.$store.state.auth.userID = user.data.userID
      //           this.$store.state.auth.role = user.data.role
      //           this.$store.state.initializingApp = true
      //           this.$store.state.denyAccess = false
      //           eventBus.$emit('getUserConfig')
      //         }
      //       })
      //     })
      //   }
      // })
    })
  }
}
</script>
