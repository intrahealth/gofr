import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '../router'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    version: "",
    baseRouterViewKey: 0,
    idp: '',
    keycloak: {},
    public_access: false,
    alert: {
      width: '800px',
      show: false,
      msg: '',
      type: 'success', // success or error
      dismisible: true,
      transition: 'scale-transition'
    },
    auth: {
      username: '',
      userID: '',
      userObj: {},
      role: ''
    },
    levelMapping: {
      source1: {},
      source2: {}
    },
    config: {
      userConfig: {
        reconciliation: {
          useCSVHeader: true
        },
        FRDatasource: ''
      },
      generalConfig: {
        public_access: {
          enabled: false,
          partition: ""
        },
        reconciliation: {
          parentConstraint: {
            enabled: true,
            idAutoMatch: true,
            nameAutoMatch: false
          },
          singlePair: false,
          singleDataSource: false,
          fixSource2To: null,
          fixSource2: false
        },
        smtp: {
          host: '',
          port: '',
          username: '',
          password: '',
          secured: ''
        },
        recoProgressNotification: {
          enabled: false
        },
        allowShareToAllForNonAdmin: false,
        selfRegistration: {
          enabled: false,
          requiresApproval: false
        },
        datasetsAdditionWays: ['CSV Upload', 'Remote Servers Sync'],
        datasetsAutosyncTime: '*/15 * * * *',
        authDisabled: false,
        authMethod: 'dhis2',
        externalAuth: {
          pullOrgUnits: true,
          shareOrgUnits: true,
          shareByOrgId: true,
          datasetName: null,
          adminRole: null
        }
      }
    },
    recoStatus: {
      'status': 'in-progress'
    },
    recalculateScores: false,
    dialogError: false,
    errorTitle: '',
    errorDescription: '',
    errorColor: 'primary',
    clientId: null,
    denyAccess: true,
    source2Hierarchy: '',
    source1Hierarchy: '',
    uploadRunning: false,
    dhis: {
      user: {
        orgId: '',
        orgName: ''
      },
      host: '',
      dev: {
        auth: {
          username: '',
          password: ''
        }
      }
    },
    dataSourcePairs: [],
    activePair: {
      source1: {},
      source2: {}
    },
    source1TotalAllRecords: 0,
    source2TotalAllRecords: 0,
    totalAllMapped: 0,
    totalAllFlagged: 0,
    totalAllNoMatch: 0,
    totalAllIgnore: 0,
    source1TotalAllNotMapped: 0,
    source2TotalRecords: 0,
    recoLevel: 2,
    totalSource1Levels: '',
    totalSource2Levels: '',
    matchedContent: [],
    noMatchContent: [],
    ignoreContent: [],
    flagged: [],
    source1Parents: [],
    source2UnMatched: [],
    source1UnMatched: [],
    scoreResults: [],
    levelArray: [],
    scoresProgressData: {
      scoreDialog: false,
      scoreProgressTitle: 'Waiting for progress status',
      stage: 'not final',
      scoreProgressPercent: null,
      progressType: '',
      scoreProgressTimer: false,
      progressReqTimer: '',
      requestCancelled: false,
      cancelTokenSource: ''
    },
    scoreSavingProgressData: {
      percent: null,
      savingMatches: false,
      savingProgressTimer: false,
      progressReqTimer: '',
      requestCancelled: false,
      cancelTokenSource: ''
    },
    uploadProgressData: {},
    dataSources: [],
    remoteDataSources: ['DHIS2', 'FHIR'],
    loadingServers: false,
    dynamicProgress: false,
    initializingApp: true,
    cols: { header: 4, content: 8 },
    searchAction: "",
    requestResourceUpdateData: {
      requestAction: '',
      requestType: '',
      requestUpdatingResource: ''
    },
    message: {
      type: "info",
      text: null,
      timeout: 5000,
      active: false
    }
  },
  mutations: {
    setMessage( state, data ) {
      if ( typeof data === "string" ) {
        state.message.type = "info"
        state.message.timeout = 5000
        state.message.text = data
        state.message.active = true
      } else {
        state.message.type = data.type || "info"
        state.message.timeout = data.timeout || 5000
        state.message.text = data.text
        state.message.active = true
      }
    },
    closeMessage( state ) {
      state.message.active = false
    }
  }
})

axios.interceptors.response.use((response) => {
  return response
}, function (error) {
  let status = error.response.status
  if (status === 403) {
    router.push({
      name: 'GofrOutcome',
      params: {
        issues: [{
          diagnostics: 'Access Denied'
        }]
      }
    })
    store.state.initializingApp = false
  } else if(status === 401) {
    router.push('logout')
    store.state.initializingApp = false
  }
  return Promise.reject(error)
})
