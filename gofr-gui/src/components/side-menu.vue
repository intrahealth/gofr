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
    },
    nav () {
      let nav = {
        active: 'home',
        menu: {
          home: {
            text: this.$t('App.menu.home.msg'),
            order: 1,
            icon: 'mdi-home',
            url: '/home',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'view-home-page'
            }
          },
          datasources: {
            order: 2,
            text: this.$t('App.menu.dataSourcesParent.msg'),
            icon: 'mdi-sync',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'manage-data-source'
            },
            menu: {
              adddatasource: {
                text: this.$t('App.menu.addDataSources.msg'),
                icon: 'mdi-cloud-upload',
                url: '/AddDataSources',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'add-data-source'
                }
              },
              viewdatasource: {
                text: this.$t('App.menu.viewDataSources.msg'),
                icon: 'mdi-format-list-bulleted-square',
                url: '/ViewDataSources',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-data-source'
                }
              }
            }
          },
          facilityregistry: {
            order: 3,
            text: this.$t('App.menu.facilityRegistry.msg'),
            icon: 'mdi-map-marker',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'access-facility-registry-mod'
            },
            menu: {
              searchfr: {
                text: this.$t('App.menu.search.msg'),
                icon: 'mdi-magnify',
                access: {
                  permission: 'special',
                  resource: 'navigation',
                  id: 'search-records'
                },
                menu: {
                  searchfacility: {
                    text: this.$t('App.menu.searchFacility.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/facility',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-search-facility-page'
                    }
                  },
                  searchjurisdiction: {
                    text: this.$t('App.menu.searchJurisdiction.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/jurisdiction',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-search-jurisdiction-page'
                    }
                  },
                  searchorganization: {
                    text: this.$t('App.menu.searchOrganization.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/mcsd-organization',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-search-organization-page'
                    }
                  },
                  searchservice: {
                    text: this.$t('App.menu.searchService.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/service',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-search-service-page'
                    }
                  },
                  searchfacilityaddreq: {
                    text: this.$t('App.menu.searchFacilityAddRequest.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/facility-add-request/process-add-request',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-add-facility-requests'
                    }
                  },
                  searchfacilityupdatereq: {
                    text: this.$t('App.menu.searchFacilityUpdateRequest.msg'),
                    icon: 'mdi-magnify',
                    url: '/Resource/Search/facility-update-request/process-update-request',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-update-facility-requests'
                    }
                  }
                }
              },
              viewaddjurisdiction: {
                text: this.$t('App.menu.addJurisdiction.msg'),
                icon: 'mdi-home-city',
                url: '/questionnaire/gofr-jurisdiction-questionnaire/jurisdiction',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-add-jurisdiction-page'
                }
              },
              viewaddfacility: {
                text: this.$t('App.menu.addFacility.msg'),
                icon: 'mdi-hospital-building',
                url: '/questionnaire/gofr-facility-questionnaire/facility',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-add-facility-page'
                }
              },
              viewaddorganization: {
                text: this.$t('App.menu.addOrganization.msg'),
                icon: 'mdi-home-city',
                url: '/questionnaire/gofr-organization-questionnaire/mcsd-organization',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-add-organization-page'
                }
              },
              viewaddservice: {
                text: this.$t('App.menu.addService.msg'),
                icon: 'mdi-room-service',
                url: '/Resource/Add/service',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-add-healthcare-service-page'
                }
              },
              requests: {
                text: this.$t('App.menu.facilityRequests.msg'),
                icon: 'mdi-call-made',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'make-facilityregistry-requests'
                },
                menu: {
                  reqnewfacility: {
                    text: this.$t('App.menu.requestNewFacility.msg'),
                    icon: 'mdi-call-made',
                    url: '/questionnaire/gofr-facility-add-request-questionnaire/facility-add-request',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-request-add-facility-page'
                    }
                  },
                  requpdatefacility: {
                    text: this.$t('App.menu.requestUpdateFacility.msg'),
                    icon: 'mdi-call-made',
                    url: '/Resource/Search/facility?searchAction=send-update-request',
                    access: {
                      permission: 'special',
                      resource: 'custom',
                      id: 'view-request-update-facility-page'
                    }
                  }
                }
              }
            }
          },
          facilityrecon: {
            order: 4,
            text: this.$t('App.menu.facilityRecon.msg'),
            icon: 'mdi-spellcheck',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'access-facility-reconciliation-mod'
            },
            menu: {
              createpair: {
                text: this.$t('App.menu.createPair.msg'),
                icon: 'mdi-numeric-2-box-multiple-outline',
                url: '/dataSourcesPair',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-source-pair'
                }
              },
              reconcile: {
                text: this.$t('App.menu.reconcile.msg'),
                icon: 'mdi-book-search',
                url: '/scores',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'data-source-reconciliation'
                }
              },
              recostatus: {
                text: this.$t('App.menu.recoStatus.msg'),
                icon: 'mdi-view-dashboard',
                url: '/recoStatus',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'view-matching-status'
                }
              },
              recoview: {
                text: this.$t('App.menu.view.msg'),
                icon: 'mdi-format-list-bulleted-square',
                url: '/view',
                access: {
                  permission: 'special',
                  resource: 'custom',
                  id: 'data-source-reconciliation'
                }
              }
            }
          },
          viewmap: {
            text: this.$t('App.menu.viewMap.msg'),
            order: 5,
            icon: 'mdi-google-maps',
            url: '/ViewMap',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'view-home-page'
            }
          },
          configure: {
            text: this.$t('App.menu.configure.msg'),
            order: 7,
            icon: 'mdi-cog',
            url: '/configure',
            access: {
              permission: 'special',
              resource: 'custom',
              id: 'view-config-page'
            }
          }
        }
      }

      if(this.$store.state.auth.username === 'public@gofr.org') {
        nav.menu.home.url = '/HomePublic'
      }
      if(this.$store.state.idp === 'keycloak') {
        nav.menu.account = {
          text: this.$t('App.menu.account.msg'),
          order: 6,
          icon: 'mdi-account-outline',
          url: this.keycloak_account,
          external: true,
          access: {
            permission: 'special',
            resource: 'custom',
            id: 'manage-account'
          },
        }
      } else {
        nav.menu.account = {
          text: this.$t('App.menu.account.msg'),
          order: 6,
          icon: 'mdi-account-outline',
          access: {
            permission: 'special',
            resource: 'custom',
            id: 'manage-account'
          },
          menu: {
            adduser: {
              text: this.$t('App.menu.addUser.msg'),
              icon: 'mdi-account-outline',
              url: '/addUser',
              access: {
                permission: 'special',
                resource: 'custom',
                id: 'add-user'
              }
            },
            viewuser: {
              text: this.$t('App.menu.usersList.msg'),
              icon: 'mdi-account-outline',
              url: '/usersList',
              access: {
                permission: 'special',
                resource: 'custom',
                id: 'view-user'
              }
            },
            rolesmanagement: {
              text: this.$t('App.menu.rolesManagement.msg'),
              icon: 'mdi-account-outline',
              url: '/rolesManagement',
              access: {
                permission: 'special',
                resource: 'custom',
                id: 'add-user'
              }
            }
          }
        }
      }
      return nav
    }
  }
}
</script>
