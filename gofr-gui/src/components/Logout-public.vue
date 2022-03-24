<template>
  <v-container grid-list-xs>

  </v-container>
</template>
<script>
import VueCookies from 'vue-cookies'
import axios from 'axios'
export default {
  mounted () {
    this.$store.state.auth.userID = ''
    if(this.$store.state.idp === 'keycloak') {
      VueCookies.set("public_access", false)
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
    VueCookies.remove('userObj')
  }
}
</script>

