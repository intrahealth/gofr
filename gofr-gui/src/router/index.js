import Vue from 'vue'
import Router from 'vue-router'
import VueCookies from 'vue-cookies'
import Login from '@/components/Login.vue'
import Logout from '@/components/Logout.vue'
import Signup from '@/components/Signup.vue'
import Configure from '@/components/Configure.vue'
import UsersList from '@/components/UsersList.vue'
import AddUser from '@/components/AddUser.vue'
import RolesManagement from '@/components/RolesManagement.vue'
import ChangePassword from '@/components/ChangePassword.vue'
import AddDataSources from '@/components/DataSources/AddDataSources'
import ViewDataSources from '@/components/DataSources/ViewDataSources'
import DataSourcesPair from '@/components/DataSourcesPair/FacilityReconDataSourcePair'
import FacilityReconView from '@/components/FacilityReconView'
import FacilityReconScores from '@/components/FacilityReconScores'
import FacilityRecoStatus from '@/components/FacilityRecoStatus'
import DHIS2Auth from '@/components/disabledAuth/DHIS2Auth'
import ResourceView from '@/components/FacilityRegistry/ResourceView'
import RequestBuildingAddition from '@/components/FacilityRegistry/RequestBuildingAddition'
import FacilitiesReport from '@/components/FacilityRegistry/FacilitiesReport'
import RequestUpdateBuildingDetails from '@/components/FacilityRegistry/RequestUpdateBuildingDetails'
import NewFacilitiesRequestsReport from '@/components/FacilityRegistry/NewFacilitiesRequestsReport'
import FacilitiesUpdateRequestsReport from '@/components/FacilityRegistry/FacilitiesUpdateRequestsReport'
import ServicesReport from '@/components/FacilityRegistry/ServicesReport'
import AddCodeSystem from '@/components/FacilityRegistry/AddCodeSystem'
import AddService from '@/components/FacilityRegistry/AddService'
import {store} from '../store/store.js'
import {tasksVerification} from '../modules/tasksVerification'

Vue.use(Router)

let router = new Router({
  routes: [{
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
    component: Configure
  }, {
    path: '/addUser',
    name: 'AddUser',
    component: AddUser
  }, {
    path: '/ViewDataSources',
    name: 'ViewDataSources',
    component: ViewDataSources
  }, {
    path: '/AddDataSources',
    name: 'AddDataSources',
    component: AddDataSources
  }, {
    path: '/dataSourcesPair',
    name: 'DataSourcesPair',
    component: DataSourcesPair
  }, {
    path: '/view',
    name: 'FacilityReconView',
    component: FacilityReconView
  }, {
    path: '/scores',
    name: 'FacilityReconScores',
    component: FacilityReconScores
  }, {
    path: '/recoStatus',
    name: 'FacilityRecoStatus',
    component: FacilityRecoStatus
  }, {
    path: '/',
    name: 'FacilityReconHome',
    component: FacilityReconScores
  }, {
    path: "/questionnaire/:questionnaire/:page",
    name: 'questionnaire',
    component: () => import("../components/FacilityRegistry/fhir-page-questionnaire.vue"),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
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
    }),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
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
    path: '/RequestBuildingAddition',
    name: 'RequestBuildingAddition',
    component: RequestBuildingAddition,
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/RequestUpdateBuildingDetails',
    name: 'RequestUpdateBuildingDetails',
    component: RequestUpdateBuildingDetails,
    props: (route) => ({
      action: route.query.action,
      requestCategory: route.query.requestCategory,
      requestType: route.query.requestType
    }),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/FacilitiesUpdateRequestsReport',
    name: 'FacilitiesUpdateRequestsReport',
    component: FacilitiesUpdateRequestsReport,
    props: (route) => ({
      action: route.query.action,
      requestCategory: route.query.requestCategory,
      requestType: route.query.requestType
    }),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canView(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/FacilitiesReport',
    name: 'FacilitiesReport',
    component: FacilitiesReport,
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canView(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/NewFacilitiesRequestsReport',
    name: 'NewFacilitiesRequestsReport',
    component: NewFacilitiesRequestsReport,
    props: (route) => ({
      action: route.query.action,
      requestCategory: route.query.requestCategory,
      requestType: route.query.requestType
    }),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canView(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/ServicesReport',
    name: 'ServicesReport',
    component: ServicesReport,
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canView(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/AddCodeSystem',
    name: 'AddCodeSystem',
    component: AddCodeSystem,
    props: (route) => ({
      codeSystemType: route.query.type,
      displayText: route.query.displayText
    }),
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }, {
    path: '/AddService',
    name: 'AddService',
    component: AddService,
    beforeEnter: (to, from, next) => {
      let hasTask = tasksVerification.canAdd(to.name)
      if (hasTask) {
        return next()
      }
      store.state.dialogError = true
      store.state.errorTitle = 'Info'
      store.state.errorColor = 'error'
      store.state.errorDescription = `You dont have permission to access this page`
      next({
        path: from.path
      })
    }
  }]
})

router.beforeEach((to, from, next) => {
  store.state.alert.show = false
  if (!store.state.auth.token &&
    (!VueCookies.get('token') || VueCookies.get('token') === 'null' || !VueCookies.get('userID') || VueCookies.get('userID') === 'null')
  ) {
    if (to.path !== '/Login' && to.path !== '/Signup' && !store.state.config.generalConfig.authDisabled) {
      next({
        path: '/Login'
      })
    } else {
      return next()
    }
  } else {
    next()
  }
})
export default router
