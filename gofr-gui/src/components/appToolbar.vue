<template>
  <v-app-bar
    color="white"
    light
    app
    clipped-left
    clipped-right
    height="50"
  >
    
    <img src="../assets/GOFR_RGB_high-res.png" width="220" />
    <template v-if="$store.state.auth.userID">
      <v-spacer></v-spacer>
      {{$store.state.auth.username}} <v-icon>mdi-account</v-icon>
    </template>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <template v-if="($keycloak && $keycloak.authenticated) || $store.state.auth.userID || $store.state.config.generalConfig.authDisabled">
        <v-btn
          flat
          :href="dhisLink"
          v-if='dhisLink'
        >
          <img src="../assets/dhis2.png" />
        </v-btn>
      </template>
      <v-radio-group
        v-model="locale"
        row
      >
        <v-radio
          label="EN"
          value="en"
          color="green"
        ></v-radio>
        <v-radio
          label="FR"
          value="fr"
          color="green"
        ></v-radio>
      </v-radio-group>
      <template v-if="$store.state.auth.userID">
        <v-btn color="white" light to="/logout" small v-if="!$store.state.public_access">
          <v-icon>mdi-logout</v-icon>Logout
        </v-btn>
        <v-btn color="white" light to="/logout-public" small v-else>
          <v-icon>mdi-login</v-icon>Login
        </v-btn>
      </template>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
  data () {
    return {
      locale: 'en',
      locales: [
        { text: 'English', value: 'en' },
        { text: 'French', value: 'fr' }
      ]
    }
  },
  computed: {
    dhisLink () {
      if (this.$store.state.dhis.user.orgId) {
        return window.location.protocol + '//' + window.location.hostname
      } else {
        return false
      }
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    }
  },
}
</script>