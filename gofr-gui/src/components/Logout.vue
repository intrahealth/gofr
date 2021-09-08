<template>
  <v-container grid-list-xs>

  </v-container>
</template>
<script>
import VueCookies from 'vue-cookies'
export default {
  mounted () {
    VueCookies.remove('userID')
    VueCookies.remove('role')
    VueCookies.remove('username')
    VueCookies.remove('userObj')
    VueCookies.remove('tasks')
    if(this.$store.state.idp === 'keycloak') {
      this.$keycloak.logout()
    } else {
      this.$router.push('login')
    }
  }
}
</script>

