import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home.vue'
import HomePublic from '@/components/HomePublic.vue'
import Login from '@/components/Login.vue'
import Logout from '@/components/Logout.vue'
import LogoutPublic from '@/components/Logout-public.vue'
import Signup from '@/components/Signup.vue'
import Configure from '@/components/Configure.vue'
import UsersList from '@/components/UsersList.vue'
import AddUser from '@/components/AddUser.vue'
import RolesManagement from '@/components/RolesManagement.vue'
import ChangePassword from '@/components/ChangePassword.vue'
import AddDataSources from '@/components/DataSources/AddDataSources'
import ViewDataSources from '@/components/DataSources/ViewDataSources'
import AdvanceDatasourceDetails from '@/components/DataSources/AdvanceDatasourceDetails'
import DataSourcesPair from '@/components/DataSourcesPair/FacilityReconDataSourcePair'
import FacilityReconView from '@/components/FacilityReconView'
import FacilityReconScores from '@/components/FacilityReconScores'
import FacilityRecoStatus from '@/components/FacilityRecoStatus'
import DHIS2Auth from '@/components/disabledAuth/DHIS2Auth'
import ResourceView from '@/components/FacilityRegistry/ResourceView'
import GofrOutcome from '@/components/gofr/gofr-outcome'
import {store} from '../store/store.js'

Vue.use(Router)

let router = new Router({
  routes: [{
    path: '/Home',
    name: 'Home',
    component: Home
  }, {
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '/HomePublic',
    name: 'HomePublic',
    component: HomePublic
  }, {
    path: '/UsersList',
    name: 'UsersList',
    component: UsersList
  }, {
    path: '/RolesManagement',
    name: 'RolesManagement',
    component: RolesManagement
  }, {
    path: '/ChangePassword',
    name: 'ChangePassword',
    component: ChangePassword
  }, {
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/logout',
    name: 'Logout',
    component: Logout
  }, {
    path: '/logout-public',
    name: 'LogoutPublic',
    component: LogoutPublic
  }, {
    path: '/Signup',
    name: 'Signup',
    component: Signup
  }, {
    path: '/dhis2Auth',
    name: 'DHIS2Auth',
    component: DHIS2Auth
  }, {
    path: '/Configure',
    name: 'Configure',
    component: Configure,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'view-config-page')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/addUser',
    name: 'AddUser',
    component: AddUser,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'add-users')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/ViewDataSources',
    name: 'ViewDataSources',
    component: ViewDataSources,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'view-data-source')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/AdvanceDatasourceDetails/:sourceid/:partitionid',
    name: 'AdvanceDatasourceDetails',
    component: AdvanceDatasourceDetails,
    props: (route) => ({
      sourceid: route.params.sourceid,
      partitionid: route.params.partitionid
    }),
    beforeEnter: (to, from, next) => {
      if(!to.params.sourceid || !to.params.partitionid || store.state.dataSources.length === 0) {
        return next({
          name: 'Home'
        })
      }
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'view-data-source')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/AddDataSources',
    name: 'AddDataSources',
    component: AddDataSources,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'add-data-source')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/dataSourcesPair',
    name: 'DataSourcesPair',
    component: DataSourcesPair,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'view-source-pair')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/view',
    name: 'FacilityReconView',
    component: FacilityReconView,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'data-source-reconciliation')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/scores',
    name: 'FacilityReconScores',
    component: FacilityReconScores,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'data-source-reconciliation')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: '/recoStatus',
    name: 'FacilityRecoStatus',
    component: FacilityRecoStatus,
    beforeEnter: (to, from, next) => {
      let hasTask = Vue.$tasksVerification.hasPermissionByName('special', 'custom', 'view-matching-status')
      if (hasTask) {
        return next()
      }
      next({
        name: 'GofrOutcome',
        params: {
          issues: [{
            diagnostics: 'Access Denied'
          }]
        }
      })
    }
  }, {
    path: "/questionnaire/:questionnaire/:page",
    name: 'questionnaire',
    component: () => import("../components/FacilityRegistry/fhir-page-questionnaire.vue")
  }, {
    path: "/custom/:path/:component",
    name: "custom_components",
    component: () => import( /* webpackChunkName: "custom" */ "../views/custom.vue")
  }, {
    path: "/apps",
    name: "apps",
    component: () => import( /* webpackChunkName: "apps" */ "../views/apps.vue")
  }, {
    path: "/install-app",
    name: "install-app",
    component: () => import( /* webpackChunkName: "install-app" */ "../components/gofr/install-app.vue")
  }, {
    path: "/uninstall-app",
    name: "uninstall-app",
    component: () => import( /* webpackChunkName: "uninstall-app" */ "../components/gofr/uninstall-app.vue")
  }, {
    path: "/ViewMap",
    name: "ViewMap",
    component: () => import("../components/ViewMap.vue")
  }, {
    path: "/Resource/View/:page/:id",
    name: "ResourceView",
    component: ResourceView,
    props: (route) => ({
      page: route.params.page,
      pageId: route.params.id
    })
  }, {
    path: "/Resource/Add/:page",
    name: "ResourceAdd",
    component: () => import("../components/FacilityRegistry/fhir-page-add.vue"),
    props: (route) => ({
      page: route.params.page
    })
  }, {
    path: "/Resource/Search/:page/:requestAction?",
    name: "ResourceSearch",
    component: () => import("../components/FacilityRegistry/fhir-page-search.vue"),
    props: (route) => ({
      page: route.params.page,
      requestAction: route.params.requestAction
    })
  }, {
    path: '/GofrOutcome',
    name: 'GofrOutcome',
    component: GofrOutcome,
    props: true
  }]
})

router.beforeEach((to, from, next) => {
  store.state.alert.show = false
  if(store.state.idp === 'keycloak') {
    if (!Vue.$keycloak.authenticated) {
      if (to.path !== '/Login' && to.path !== '/Signup' && !store.state.config.generalConfig.authDisabled) {
        Vue.$keycloak.logout()
      } else {
        return next()
      }
    } else {
      return next()
    }
  } else {
    if(to.path === '/Login' || to.path === '/dhis2Auth') {
      return next()
    } else if (!store.state.auth.userObj.resource || store.state.auth.userObj.resource.id === 'ihris-user-loggedout') {
      if (store.state.idp === 'dhis2') {
        store.state.initializingApp = true
        store.state.denyAccess = false
        return next({ name: 'DHIS2Auth' })
      } else if (to.path !== '/Login' && to.path !== '/Signup' && !store.state.config.generalConfig.authDisabled) {
        next({
          path: '/Login'
        })
      } else {
        return next()
      }
    } else {
      next()
    }
  }
})
export default router
