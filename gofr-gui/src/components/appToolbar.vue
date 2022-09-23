<template>
  <v-app-bar
    color="white"
    light
    app
    clipped-left
    clipped-right
    height="50"
  >
    
    <router-link to="/">
      <img src="../assets/GOFR_RGB_high-res.png" width="220" />
    </router-link>
    <template v-if="$store.state.auth.userID">
      <v-spacer></v-spacer>
      <label style="color: #569fd3">
        {{$store.state.auth.username}} <v-icon>mdi-account</v-icon>
      </label>
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
      <div>
        <language-switcher />
      </div>
      <template v-if="$store.state.auth.userID">
        <v-btn color="white" light to="/logout" small v-if="!$store.state.public_access">
          <v-icon>mdi-logout</v-icon>{{ $t(`App.hardcoded-texts.Logout`) }}
        </v-btn>
        <v-btn color="white" light to="/logout-public" small v-else>
          <v-icon>mdi-login</v-icon>{{ $t(`App.hardcoded-texts.Login`) }}
        </v-btn>
      </template>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
import LanguageSwitcher from "@/components/language-switcher";
export default {
  computed: {
    dhisLink () {
      if (this.$store.state.dhis.user.orgId) {
        return window.location.protocol + '//' + window.location.hostname
      } else {
        return false
      }
    }
  },
  components: {
    LanguageSwitcher,
  }
}
</script>