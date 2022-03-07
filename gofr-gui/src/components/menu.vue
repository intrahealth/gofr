<template>
  <ul id="menu">
    <li 
      class="parent" 
      v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-home-page')"
    >
      <a
        @click="navigate('/home')"
        v-if='!$store.state.denyAccess'
      >
        <v-icon>mdi-home</v-icon> {{ $t('App.menu.home.msg') }}
      </a>
    </li>
    <li
      class="parent"
      v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'manage-data-source')"
    >
      <a
        href="#"
      >
        <v-icon>mdi-sync</v-icon>{{ $t('App.menu.dataSourcesParent.msg')}}
      </a>
      <ul class="child">
        <v-list class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'add-data-source')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }" class="menuText">
              <a
                @click="navigate('/AddDataSources')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-cloud-upload
                  </v-icon>
                  {{ $t('App.menu.addDataSources.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addDataSources.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-data-source')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/ViewDataSources')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-format-list-bulleted-square
                  </v-icon>
                  {{ $t('App.menu.viewDataSources.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.viewDataSources.tooltip')}}</span>
          </v-tooltip>
        </v-list>
      </ul>
    </li>
    <li
      class="parent"
      v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'access-facility-registry-mod')"
    >
      <a href="#">
        <v-icon>mdi-map-marker</v-icon>{{ $t('App.menu.facilityRegistry.msg')}}
      </a>
      <ul
        class="child"
        v-if="$tasksVerification.hasPermissionByName('special', 'navigation', 'search-records')"
      >
        <li class="parent">
          <a href="#">
            <v-icon
              left
              color="black"
            >mdi-magnify</v-icon>
            {{ $t('App.menu.search.msg')}}
            <v-icon
              color="black"
              small
              class="menuArrow"
            >mdi-play</v-icon>
          </a>
          <ul class="child">
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-search-facility-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/facility')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchFacility.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-search-jurisdiction-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/jurisdiction')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchJurisdiction.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchJurisdiction.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-search-organization-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/mcsd-organization')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchOrganization.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchOrganization.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-search-service-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/service')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchService.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchService.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-add-facility-requests')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/facility-add-request/process-add-request')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchFacilityAddRequest.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchFacilityAddRequest.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-update-facility-requests')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/facility-update-request/process-update-request')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-magnify
                      </v-icon>
                      {{ $t('App.menu.searchFacilityUpdateRequest.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.searchFacilityUpdateRequest.tooltip')}}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
        <v-list
          class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-add-jurisdiction-page')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/questionnaire/gofr-jurisdiction-questionnaire/jurisdiction')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-home-city
                  </v-icon>
                  {{ $t('App.menu.addJurisdiction.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addJurisdiction.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-add-facility-page')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/questionnaire/gofr-facility-questionnaire/facility')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-hospital-building
                  </v-icon>
                  {{ $t('App.menu.addFacility.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addFacility.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-add-organization-page')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/questionnaire/gofr-organization-questionnaire/mcsd-organization')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-home-city
                  </v-icon>
                  {{ $t('App.menu.addOrganization.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addOrganization.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-add-healthcare-service-page')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/Resource/Add/service')"
                v-on="on"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-room-service
                  </v-icon>
                  {{ $t('App.menu.addService.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addService.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <li
          class="parent"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'make-facilityregistry-requests')"
        >
          <a href="#">
            <v-icon
              left
              color="black"
            >mdi-call-made</v-icon>
            {{ $t('App.menu.facilityRequests.msg')}}
            <v-icon
              color="black"
              small
              class="menuArrow"
            >mdi-play</v-icon>
          </a>
          <ul class="child">
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-request-add-facility-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/questionnaire/gofr-facility-add-request-questionnaire/facility-add-request')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-call-made
                      </v-icon>
                      {{ $t('App.menu.requestNewFacility.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.requestNewFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-request-update-facility-page')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <a
                    @click="navigate('/Resource/Search/facility?searchAction=send-update-request')"
                    v-on="on"
                  >
                    <label class="menuText">
                      <v-icon
                        left
                        color="black"
                      >
                        mdi-call-made
                      </v-icon>
                      {{ $t('App.menu.requestUpdateFacility.msg')}}
                    </label>
                  </a>
                </template>
                <span>{{ $t('App.menu.requestUpdateFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
      </ul>
    </li>
    <li
      class="parent"
      v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'access-facility-reconciliation-mod')"
    ><a href="#">
        <v-icon>mdi-spellcheck</v-icon> {{$t('App.menu.facilityRecon.msg')}}
      </a>
      <ul class="child">
        <v-list
          :class="{ disabledMenu: $store.state.dataSources.length <= 1 || $store.state.dataSourcePairs.length <= 0,lastMenu: true }"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-source-pair')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/dataSourcesPair')"
                v-on="on"
                :disabled="$store.state.dataSources.length <= 1 && $store.state.dataSourcePairs.length === 0"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-numeric-2-box-multiple-outline
                  </v-icon>
                  {{ $t('App.menu.createPair.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.createPair.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length === 0,lastMenu: true }"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'data-source-reconciliation')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/scores')"
                v-on="on"
                :disabled='Object.keys($store.state.activePair.source1).length === 0'
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-book-search
                  </v-icon>
                  {{ $t('App.menu.reconcile.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.reconcile.tooltip') }}</span>
          </v-tooltip>
        </v-list>
        <v-list
          :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length===0,lastMenu: true }"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-matching-status')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/recoStatus')"
                v-on="on"
                :disabled='Object.keys($store.state.activePair.source1).length === 0'
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-view-dashboard
                  </v-icon>
                  {{ $t('App.menu.recoStatus.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.recoStatus.tooltip') }}</span>
          </v-tooltip>
        </v-list>
        <v-list
          :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length===0,lastMenu: true }"
          v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'data-source-reconciliation')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/view')"
                v-on="on"
                :disabled="Object.keys($store.state.activePair.source1).length===0"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-format-list-bulleted-square
                  </v-icon>
                  {{ $t('App.menu.view.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.view.tooltip') }}</span>
          </v-tooltip>
        </v-list>
      </ul>
    </li>
    <li
      class="parent"
    >
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <a
            @click="navigate('/ViewMap')"
            v-on="on"
          >
            <v-icon>mdi-google-maps</v-icon> {{ $t('App.menu.viewMap.msg') }}
          </a>
        </template>
        <span>{{ $t('App.menu.viewMap.tooltip')}}</span>
      </v-tooltip>
    </li>
    <li class="parent" v-if="$store.state.idp === 'keycloak'">
      <a :href="keycloak_account" target="_blank">
        <v-icon>mdi-account-outline</v-icon>{{ $t('App.menu.account.msg') }}
      </a>
    </li>
    <li class="parent" v-else-if="$tasksVerification.hasPermissionByName('special', 'custom', 'manage-account')">
      <a href="#">
        <v-icon>mdi-account-outline</v-icon>{{ $t('App.menu.account.msg')}}
      </a>
      <ul class="child">
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/addUser')"
                v-on="on"
                v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'add-user')"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-account-outline
                  </v-icon>
                  {{ $t('App.menu.addUser.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.addUser.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/usersList')"
                v-on="on"
                v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-user')"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-account-outline
                  </v-icon>
                  {{ $t('App.menu.usersList.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.usersList.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <a
                @click="navigate('/rolesManagement')"
                v-on="on"
                v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'add-user')"
              >
                <label class="menuText">
                  <v-icon
                    left
                    color="black"
                  >
                    mdi-account-outline
                  </v-icon>
                  {{ $t('App.menu.rolesManagement.msg')}}
                </label>
              </a>
            </template>
            <span>{{ $t('App.menu.rolesManagement.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <a
            @click="navigate('/changePassword')"
            v-on="on"
            v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'add-user')"
          >
            <label class="menuText">
              <v-icon
                left
                color="black"
              >
                mdi-account-outline
              </v-icon>
              {{ $t('App.menu.changePassword.msg')}}
            </label>
          </a>
        </v-list>
      </ul>
    </li>
    <li class="parent" v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-config-page')">
      <a
        @click="navigate('/configure')"
        v-if='!$store.state.denyAccess'
      >
        <v-icon>mdi-cog</v-icon> {{ $t('App.menu.configure.msg') }}
      </a>
    </li>
    <li class="parent">
      <a
        @click="navigate('/logout')"
        v-if='!$store.state.denyAccess && !$store.state.config.generalConfig.authDisabled && $store.state.auth.userObj'
      >
        <v-icon>mdi-logout</v-icon> {{ $t('App.menu.logout.msg') }}
      </a>
    </li>
  </ul>
</template>
<script>
export default {
  computed: {
    keycloak_account() {
      return this.$store.state.keycloak.baseURL + '/realms/' + this.$store.state.keycloak.realm + '/account'
    }
  },
  methods: {
    navigate(route) {
      this.$router.push({path: route})
    }
  }
}
</script>
<style scoped>
.parent {
  display: block;
  position: relative;
  float: left;
  line-height: 50px;
  border-right: #ccc 1px solid;
  font-size: 15px;
}

.newClass {
  margin: 8px;
  color: #ffffff;
  font-size: 12px;
}

.parent a {
  margin: 10px;
  color: #ffffff;
  text-decoration: none;
}

.parent:hover > ul {
  display: block;
  position: absolute;
}

.child {
  display: none;
  cursor: pointer;
}

.child li {
  background-color: white;
  line-height: 50px;
  border-bottom: #ccc 1px solid;
  border-right: #ccc 1px solid;
  width: 100%;
}

.child li a {
  color: #000000;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0px;
  min-width: 15em;
}

ul ul ul {
  left: 100%;
  top: 0;
  margin-left: 1px;
}

li:hover {
  background-color: #95b4ca;
}

.lastMenu:hover {
  background-color: #f0f0f0 !important;
}

.parent li:hover {
  background-color: #f0f0f0;
}

.expand {
  font-size: 12px;
  float: right;
  margin-right: 5px;
}

.lastMenu {
  background-color: white !important;
  border-right: #ccc 1px solid;
  border-bottom: #ccc 1px solid;
  width: 320px;
}

.menuText {
  color: black;
  cursor: pointer;
}

.menuArrow {
  float: right;
  margin-top: 25px;
}

.disabledMenu {
  cursor: auto;
}

.disabledMenu:hover {
  background-color: white !important;
}

a:active {
  color: red !important;
}
</style>