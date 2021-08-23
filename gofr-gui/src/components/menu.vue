<template>
  <ul id="menu">
    <li class="parent"><a href="#">
        <v-icon>mdi-spellcheck</v-icon> {{$t('App.menu.facilityRecon.msg')}}
      </a>
      <ul class="child">
        <li class="parent">
          <a
            href="#"
            style="margin-left: 15px"
          >
            <v-icon
              color="black"
              left
            >mdi-sync</v-icon>{{ $t('App.menu.dataSourcesParent.msg')}} <v-icon
              color="black"
              small
              class="menuArrow"
            >mdi-play</v-icon>
          </a>
          <ul class="child">
            <v-list class="lastMenu">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/AddDataSources"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-cloud-upload</v-icon>
                      {{ $t('App.menu.addDataSources.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.addDataSources.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list class="lastMenu">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/ViewDataSources"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.viewDataSources.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.viewDataSources.tooltip')}}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
        <v-list :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length===0,lastMenu: true }">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                v-on="on"
                to="/view"
                color="white"
                :disabled="Object.keys($store.state.activePair.source1).length===0"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.view.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.view.tooltip') }}</span>
          </v-tooltip>
        </v-list>
        <li class="parent">
          <a
            href="#"
            style="margin-left: 15px"
          >
            <v-icon
              left
              color="black"
            >mdi-compare-horizontal</v-icon>{{ $t('App.menu.reconcile.msg')}} <v-icon
              color="black"
              small
              class="menuArrow"
            >mdi-play</v-icon>
          </a>
          <ul class="child">
            <v-list :class="{ disabledMenu: $store.state.dataSources.length <= 1 || $store.state.dataSourcePairs.length <= 0,lastMenu: true }">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/dataSourcesPair"
                    v-on="on"
                    :disabled="$store.state.dataSources.length <= 1 && $store.state.dataSourcePairs.length === 0"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-numeric-2-box-multiple-outline</v-icon>{{ $t('App.menu.createPair.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.createPair.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length === 0,lastMenu: true }">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/scores"
                    v-on="on"
                    :disabled='Object.keys($store.state.activePair.source1).length === 0'
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-book-search</v-icon>{{ $t('App.menu.reconcile.msg') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.reconcile.tooltip') }}</span>
              </v-tooltip>
            </v-list>
            <v-list :class="{ disabledMenu: Object.keys($store.state.activePair.source1).length===0,lastMenu: true }">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/recoStatus"
                    v-on="on"
                    :disabled='Object.keys($store.state.activePair.source1).length === 0'
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-view-dashboard</v-icon> {{ $t('App.menu.recoStatus.msg') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.recoStatus.tooltip') }}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
      </ul>
    </li>
    <li class="parent">
      <a href="#">
        <v-icon>mdi-map-marker</v-icon>{{ $t('App.menu.facilityRegistry.msg')}}
      </a>
      <ul class="child">
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
              v-if="tasksVerification.canAdd('AddFacility')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/facility"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchFacility.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canAdd('AddFacility')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/jurisdiction"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchJurisdiction.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchJurisdiction.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canAdd('AddFacility')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/mcsd-organization"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchOrganization.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchOrganization.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canAdd('AddService')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/service"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchService.msg') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchService.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canAdd('AddService')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/facility-add-request/process-add-request"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchFacilityAddRequest.msg') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchFacilityAddRequest.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canAdd('AddService')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/Resource/Search/facility-update-request/process-update-request"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-magnify</v-icon>{{ $t('App.menu.searchFacilityUpdateRequest.msg') }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.searchFacilityUpdateRequest.tooltip')}}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
        <v-list
          class="lastMenu"
          v-if="tasksVerification.canAdd('AddJurisdiction')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/Resource/Add/jurisdiction"
                v-on="on"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-home-city</v-icon>{{ $t('App.menu.addJurisdiction.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.addJurisdiction.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="tasksVerification.canAdd('AddFacility')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/questionnaire/gofr-facility-questionnaire/facility"
                v-on="on"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-hospital-building</v-icon>{{ $t('App.menu.addFacility.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.addFacility.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="tasksVerification.canAdd('AddJurisdiction')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/questionnaire/gofr-organization-questionnaire/mcsd-organization"
                v-on="on"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-home-city</v-icon>{{ $t('App.menu.addOrganization.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.addOrganization.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="tasksVerification.canAdd('AddService')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/Resource/Add/service"
                v-on="on"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-room-service</v-icon>{{ $t('App.menu.addService.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.addService.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list
          class="lastMenu"
          v-if="tasksVerification.canAdd('AddService')"
        >
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/ViewMap"
                v-on="on"
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-google-maps</v-icon>{{ $t('App.menu.viewMap.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.viewMap.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <li class="parent">
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
            <v-list class="lastMenu">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-if="tasksVerification.canAdd('RequestBuildingAddition')"
                    to="/questionnaire/gofr-facility-add-request-questionnaire/facility-add-request"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-call-made</v-icon>{{ $t('App.menu.requestNewFacility.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.requestNewFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list class="lastMenu">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    v-if="tasksVerification.canAdd('RequestUpdateBuildingDetails')"
                    to="/Resource/Search/facility?searchAction=send-update-request"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-call-made</v-icon>{{ $t('App.menu.requestUpdateFacility.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.requestUpdateFacility.tooltip')}}</span>
              </v-tooltip>
            </v-list>
          </ul>
        </li>
        <li class="parent">
          <a href="#">
            <v-icon
              left
              color="black"
            >mdi-format-list-bulleted-square</v-icon>
            {{ $t('App.menu.facilityRegReports.msg')}}
            <v-icon
              color="black"
              small
              class="menuArrow"
            >mdi-play</v-icon>
          </a>
          <ul class="child">
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canView('FacilitiesReport')"
            >
              <v-list-item to="/FacilitiesReport">
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.facilitiesReport.msg')}}
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canView('NewFacilitiesRequestsReport')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/NewFacilitiesRequestsReport"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.newFacilitiesRequestsReport.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.newFacilitiesRequestsReport.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canView('FacilitiesUpdateRequestsReport')"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item
                    to="/FacilitiesUpdateRequestsReport"
                    v-on="on"
                  >
                    <v-list-item-title class="menuText">
                      <v-icon
                        left
                        color="black"
                      >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.facilitiesUpdateRequestsReport.msg')}}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ $t('App.menu.facilitiesUpdateRequestsReport.tooltip')}}</span>
              </v-tooltip>
            </v-list>
            <v-list
              class="lastMenu"
              v-if="tasksVerification.canView('ServicesReport')"
            >
              <v-list-item to="/ServicesReport">
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-format-list-bulleted-square</v-icon>{{ $t('App.menu.servicesReport.msg')}}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </ul>
        </li>
      </ul>
    </li>
    <li class="parent">
      <a href="#">
        <v-icon>mdi-account-outline</v-icon>{{ $t('App.menu.account.msg')}}
      </a>
      <ul class="child">
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/addUser"
                v-on="on"
                v-if='$store.state.auth.role === "Admin"'
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-account-outline</v-icon>{{ $t('App.menu.addUser.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.addUser.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/usersList"
                v-on="on"
                v-if='$store.state.auth.role === "Admin"'
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-account-outline</v-icon>{{ $t('App.menu.usersList.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.usersList.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-list-item
                to="/rolesManagement"
                v-on="on"
                v-if='$store.state.auth.role === "Admin"'
              >
                <v-list-item-title class="menuText">
                  <v-icon
                    left
                    color="black"
                  >mdi-account-outline</v-icon>{{ $t('App.menu.rolesManagement.msg')}}
                </v-list-item-title>
              </v-list-item>
            </template>
            <span>{{ $t('App.menu.rolesManagement.tooltip')}}</span>
          </v-tooltip>
        </v-list>
        <v-list class="lastMenu">
          <v-list-item to="/changePassword">
            <v-list-item-title class="menuText">
              <v-icon
                left
                color="black"
              >mdi-account-outline</v-icon>{{ $t('App.menu.changePassword.msg')}}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </ul>
    </li>
    <li class="parent">
      <v-list-item
        to="/configure"
        v-if='!$store.state.denyAccess'
        class="newClass"
      >
        <v-list-item-title>
          <v-icon>mdi-cog</v-icon> {{ $t('App.menu.configure.msg') }}
        </v-list-item-title>
      </v-list-item>
    </li>
    <li class="parent">
      <v-list-item
        to="/logout"
        v-if='!$store.state.denyAccess && !$store.state.config.generalConfig.authDisabled'
        class="newClass"
      >
        <v-list-item-title>
          <v-icon>mdi-logout</v-icon> {{ $t('App.menu.logout.msg') }}
        </v-list-item-title>
      </v-list-item>
    </li>
  </ul>
</template>
<script>
import {
  tasksVerification
} from '@/modules/tasksVerification'
export default {
  data () {
    return {
      tasksVerification: tasksVerification
    }
  }
}
</script>
<style scoped>
.parent {
  display: block;
  position: relative;
  float: left;
  line-height: 63px;
  border-right: #ccc 1px solid;
  font-size: 16px;
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
  line-height: 63px;
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
}

.menuText {
  color: black;
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