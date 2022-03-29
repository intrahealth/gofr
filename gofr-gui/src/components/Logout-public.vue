<template>
  <v-container grid-list-xs>

  </v-container>
</template>
<script>
import axios from 'axios'
import VueCookies from 'vue-cookies'
export default {
  mounted () {
    this.$store.state.auth.userID = ''
    this.$store.state.public_access = false
    if(this.$store.state.idp === 'keycloak') {
      VueCookies.set('loggedout-public', true)
      let redirect = window.location.href.split('#')[0]
      this.$keycloak.logout({ redirectUri : redirect })
    } else {
      axios({
        method: 'GET',
        url: '/auth/logout'
      }).catch((err) => {
        console.error(err);
      })
      this.$router.push('login')
    }
    this.$store.state.auth.username = ''
    this.$store.state.auth.userObj = {}
  }
}
</script>

