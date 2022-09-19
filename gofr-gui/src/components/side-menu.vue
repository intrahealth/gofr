<template>
<v-navigation-drawer
    v-model="drawer"
    :mini-variant.sync="mini"
    app
    clipped
    permanent
    class="primary darken-1 white--text font-weight-bold"
    style="z-index: 3;"
    width="358"
  >
  <!-- <v-navigation-drawer
    expand-on-hover
    app
    clipped
    permanent
    class="primary darken-1 white--text font-weight-bold"
    style="z-index: 3;"
    width="358"
  > -->
    <v-list-item class="px-2 white--text">
      <v-list-item-avatar style="cursor: pointer"  @click.stop="mini = !mini">
        <v-icon class="white--text">mdi-menu</v-icon>
        <v-icon class="white--text" v-if="mini">mdi-menu-right-outline</v-icon>
        <v-icon class="white--text" v-else>mdi-menu-left-outline</v-icon>
      </v-list-item-avatar>

      <v-list-item-title class="white--text">Navigator</v-list-item-title>
    </v-list-item>

    <v-divider color="white"></v-divider>
    <v-list
      nav
      dark
      dense>

      <template v-for="item in menu">

        <template v-if="item.menu">

          <v-list-group
            :key="item.id"
            :prepend-icon="item.icon"
            color="white--text"
            :value="item.active"
            v-model="item.active"
            :class="(item.active ? 'primary darken-2' : '')"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-title class="subtitle-1 font-weight-bold text-uppercase">{{item.text}}</v-list-item-title>
            </template>
            <template v-for="sub in item.menu">
              <template v-if="sub.menu">
                <v-list-group
                  :key="sub.id"
                  :append-icon="sub.icon"
                  color="white--text"
                  :value="sub.active"
                  v-model="sub.active"
                  :class="(sub.active ? 'primary darken-2' : '')"
                  sub-group
                  no-action
                >
                  <template v-slot:activator>
                    <v-list-item-title class="subtitle-1 font-weight-bold text-uppercase">{{sub.text}}</v-list-item-title>
                  </template>
                  <template v-for="sub_sub in sub.menu">
                    <v-list-item
                      v-if="sub_sub.external != true"
                      :key="sub_sub.id"
                      :to="sub_sub.url"
                      active-class="primary darken-2"
                      dense
                    >
                      <v-icon v-if="sub_sub.icon" left>{{sub_sub.icon}}</v-icon>
                      <v-list-item-title>{{sub_sub.text}}</v-list-item-title>
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item>
                    <v-list-item
                      v-else
                      :key="sub_sub.id"
                      :href="sub_sub.url"
                      target="_blank"
                      active-class="primary darken-2"
                      dense
                    >
                      <v-icon v-if="sub_sub.icon" left>{{sub_sub.icon}}</v-icon>
                      <v-list-item-title>{{sub_sub.text}}</v-list-item-title>
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-list-item>
                  </template>

                </v-list-group>
              </template>
              <template v-else>
                <v-list-item
                  :key="sub.id"
                  :to="sub.url"
                  active-class="primary darken-2"
                  dense
                  v-if="sub.external != true"
                >
                  <v-icon v-if="sub.icon" left>{{sub.icon}}</v-icon>
                  <v-list-item-title>{{sub.text}}</v-list-item-title>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item>
                <v-list-item
                  v-else
                  :key="sub.id"
                  :href="sub.url"
                  target="_blank"
                  active-class="primary darken-2"
                  dense
                >
                  <v-icon v-if="sub.icon" left>{{sub.icon}}</v-icon>
                  <v-list-item-title>{{sub.text}}</v-list-item-title>
                  <v-icon>mdi-chevron-right</v-icon>
                </v-list-item>
              </template>
            </template>

          </v-list-group>
        </template>
        <template v-else>
          <v-list-item :to="item.url" :key="item.id" v-if="item.external != true">
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="subtitle-1 font-weight-bold text-uppercase">{{item.text}}</v-list-item-title>
          </v-list-item>
          <v-list-item :href="item.url" target="_blank" :key="item.id" v-else>
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="subtitle-1 font-weight-bold text-uppercase">{{item.text}}</v-list-item-title>
          </v-list-item>
        </template>
      </template>

    </v-list>
  </v-navigation-drawer>
</template>

<script>

export default {
  name: "the-navigation",
  props: ["nav"],
  mounted: function() {
    this.updateMenu()
  },
  watch: {
    nav: {
      handler() {
        this.updateMenu()
      },
      deep: true
    }
  },
  data: function() {
    return {
      drawer: true,
      mini: true,
      menu: []
    }
  },
  methods: {
    updateMenu: function() {
      this.menu = []
      for( let menu_id of Object.keys(this.nav.menu) ) {
        if(this.nav.menu[menu_id].access) {
          let permission = this.nav.menu[menu_id].access['permission']
          let resource = this.nav.menu[menu_id].access['resource']
          let id = this.nav.menu[menu_id].access['id']
          if(!this.$tasksVerification.hasPermissionByName(permission, resource, id)) {
            continue
          }
        }
        let entry = {
          id: menu_id,
          text: this.nav.menu[menu_id].text,
          tooltip: this.nav.menu[menu_id].tooltip,
          icon: this.nav.menu[menu_id].icon,
          order: this.nav.menu[menu_id].order
        }
        if ( this.nav.active === menu_id ) {
          entry.active = true
        } else {
          entry.active = false
        }
        if ( this.nav.menu[menu_id].menu ) {
          entry.menu = []
          for( let sub_id of Object.keys( this.nav.menu[menu_id].menu ) ) {
            if(this.nav.menu[menu_id].menu[sub_id].access) {
              let permission = this.nav.menu[menu_id].menu[sub_id].access['permission']
              let resource = this.nav.menu[menu_id].menu[sub_id].access['resource']
              let id = this.nav.menu[menu_id].menu[sub_id].access['id']
              if(!this.$tasksVerification.hasPermissionByName(permission, resource, id)) {
                continue
              }
            }
            let sub = {
              id: sub_id,
              text: this.nav.menu[menu_id].menu[sub_id].text,
              tooltip: this.nav.menu[menu_id].menu[sub_id].tooltip,
              icon: this.nav.menu[menu_id].menu[sub_id].icon,
              order: this.nav.menu[menu_id].menu[sub_id].order
            }
            if ( this.nav.menu[menu_id].menu[sub_id].menu ) {
              if ( this.nav.active === sub_id ) {
                sub.active = true
              } else {
                sub.active = false
              }
              sub.menu = []
              for( let sub_sub_id of Object.keys( this.nav.menu[menu_id].menu[sub_id].menu ) ) {
                if(this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].access) {
                  let permission = this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].access['permission']
                  let resource = this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].access['resource']
                  let id = this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].access['id']
                  if(!this.$tasksVerification.hasPermissionByName(permission, resource, id)) {
                    continue
                  }
                }
                let sub_sub = {
                  id: sub_sub_id,
                  text: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].text,
                  tooltip: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].tooltip,
                  icon: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].icon,
                  url: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].url,
                  order: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].order,
                  external: this.nav.menu[menu_id].menu[sub_id].menu[sub_sub_id].external
                }
                sub.menu.push( sub_sub )
                sub.menu.sort( (a,b) => a.order === b.order ? 0 : ( a.order < b.order ? -1 : 1 ) )
              }
            } else if ( this.nav.menu[menu_id].menu[sub_id].url ) {
              sub.url = this.nav.menu[menu_id].menu[sub_id].url
              sub.external = this.nav.menu[menu_id].menu[sub_id].external
            }
            entry.menu.push( sub )
            entry.menu.sort( (a,b) => a.order === b.order ? 0 : ( a.order < b.order ? -1 : 1 ) )
          }
        } else if ( this.nav.menu[menu_id].url ) {
          entry.url = this.nav.menu[menu_id].url
          entry.external = this.nav.menu[menu_id].external
        }
        this.menu.push( entry )
      }
      this.menu.sort( (a,b) => a.order === b.order ? 0 : ( a.order < b.order ? -1 : 1 ) )
    }
  },
  computed: {
    keycloak_account() {
      return this.$store.state.keycloak.baseURL + '/realms/' + this.$store.state.keycloak.realm + '/account'
    }
  }
}
</script>
