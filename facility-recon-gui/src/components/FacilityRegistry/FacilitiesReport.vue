<template>
  <v-container fluid>
    <v-dialog
      v-model="confirm"
      width="630px"
    >
      <v-toolbar
        color="error"
        dark
      >
        <v-toolbar-title>
          Confirmation
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          dark
          @click.native="confirm = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card>
        <v-card-text>
          {{confirmTitle}}
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            @click.native="confirm = false"
          >Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="changeRequestStatus"
          >Proceed</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      persistent
      v-model="editDialog"
      transition="scale-transition"
      max-width="800px"
    >
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          Editing {{name}}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon
          @click="editDialog = false"
          style="cursor: pointer"
        >mdi-close</v-icon>
      </v-toolbar>
      <v-card>
        <v-card-text>
          <v-layout
            column
            wrap
          >
            <v-flex xs1>
              <v-layout
                row
                wrap
              >
                <v-flex xs5>
                  <v-text-field
                    required
                    @blur="$v.name.$touch()"
                    @change="$v.name.$touch()"
                    :error-messages="nameErrors"
                    v-model="name"
                    filled
                    color="deep-purple"
                    label="Name"
                  />
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <v-text-field
                    v-model="alt_name"
                    filled
                    color="deep-purple"
                    label="Alternative Name"
                  />
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-layout
                row
                wrap
              >
                <v-flex xs5>
                  <v-text-field
                    required
                    v-model="code"
                    filled
                    color="deep-purple"
                    label="Code"
                  />
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <v-select
                    clearable
                    :items="types"
                    v-model="facilityType"
                    label="Facility Type"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-layout
                row
                wrap
              >
                <v-flex xs5>
                  <v-select
                    clearable
                    :items="status"
                    v-model="facilityStatus"
                    label="Status"
                  ></v-select>
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <v-select
                    clearable
                    :items="ownerships"
                    v-model="facilityOwnership"
                    label="Facility Ownership"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-layout
                row
                wrap
              >
                <v-flex xs5>
                  <v-text-field
                    v-model="lat"
                    filled
                    color="deep-purple"
                    label="Latitude"
                  />
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <v-text-field
                    required
                    v-model="long"
                    filled
                    color="deep-purple"
                    label="Longitude"
                  />
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex>
              <v-card>
                <v-card-title primary-title>
                  Contacts Informations
                </v-card-title>
                <v-card-text>
                  <v-layout
                    column
                    wrap
                  >
                    <v-flex>
                      <v-layout
                        row
                        wrap
                      >
                        <v-flex xs5>
                          <v-text-field
                            v-model="contact.email"
                            filled
                            color="deep-purple"
                            label="Email"
                          />
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs5>
                          <v-text-field
                            v-model="contact.phone"
                            filled
                            color="deep-purple"
                            label="Phone"
                          />
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex>
                      <v-layout
                        row
                        wrap
                      >
                        <v-flex xs5>
                          <v-text-field
                            v-model="contact.fax"
                            filled
                            color="deep-purple"
                            label="Fax"
                          />
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-flex xs5>
                          <v-text-field
                            v-model="contact.website"
                            filled
                            color="deep-purple"
                            label="Website"
                          />
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex>
              <v-textarea
                outline
                label="Facility Description"
                v-model="description"
              >
              </v-textarea>
            </v-flex>
            <v-flex color="white">
              Selected Parent: <b>{{facilityParent.text}}</b><br><br>
              Choose Different Parent
              <liquor-tree
                @node:selected="selectedEditJurisdiction"
                v-if="jurisdictionHierarchy.length > 0"
                :data="jurisdictionHierarchy"
                :filter="searchJurisdiction"
                ref="jurisdictionHierarchy"
              >
                <div
                  slot-scope="{ node }"
                  class="node-container"
                >
                  <div class="node-text">{{ node.text }}</div>
                </div>
              </liquor-tree>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-layout column>
            <v-flex>
              <v-toolbar>
                <v-layout
                  row
                  wrap
                >
                  <v-flex
                    xs6
                    text-sm-left
                  >
                    <v-btn
                      color="error"
                      @click.native="editDialog = false"
                    >
                      <v-icon left>mdi-cancel</v-icon> Cancel
                    </v-btn>
                  </v-flex>
                  <v-flex
                    xs6
                    text-sm-right
                  >
                    <v-btn
                      color="primary"
                      :disabled="$v.$invalid"
                      dark
                      @click="saveEdit()"
                    >
                      <v-icon left>mdi-content-save</v-icon>
                      <template v-if="requestCategory === 'updateRequest'">
                        Send Request
                      </template>
                      <template v-else>
                        Save
                      </template>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-toolbar>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title class="indigo white--text headline">
        <template v-if="requestCategory === 'updateRequest'">
          Choose Facility To Request Change Of Information
        </template>
        <template v-else>
          Facilities List
        </template>
      </v-card-title>

      <v-layout justify-space-between>
        <v-scroll-y-transition>
          <v-flex xs2>
            <v-text-field
              v-model="searchJurisdiction"
              append-icon="mdi-magnify"
              label="Search Jurisdiction"
              single-line
              hide-details
            ></v-text-field>
            <template v-if="loadingTree">
              <v-progress-linear :indeterminate="true"></v-progress-linear>
            </template>
            <liquor-tree
              @node:selected="selectedJurisdiction"
              v-if="jurisdictionHierarchy.length > 0"
              :data="jurisdictionHierarchy"
              :filter="searchJurisdiction"
              ref="jurisdictionHierarchy"
            />
          </v-flex>
        </v-scroll-y-transition>

        <v-divider vertical></v-divider>

        <v-flex
          d-flex
          text-center
        >
          <v-scroll-y-transition mode="out-in">
            <v-card
              v-if='activeJurisdiction.id'
              flat
            >
              <v-card-title primary-title>
                <v-layout
                  row
                  wrap
                >
                  <v-flex>
                    <b>
                      <center>Facilities Under {{activeJurisdiction.text}}</center>
                    </b>
                  </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex>
                    <v-text-field
                      v-model="searchBuildings"
                      append-icon="mdi-magnify"
                      label="Search Facility"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :loading="loadingBuildings"
                  :headers="buildingsHeaders"
                  :items="buildings"
                  :search="searchBuildings"
                  class="elevation-1"
                >
                  <template
                    v-slot:item="{ item }"
                  >
                    <tr>
                      <td>
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-if="canEditBuilding(item)"
                              class="mx-1"
                              fab
                              dark
                              x-small
                              color="primary"
                              v-on="on"
                              @click="edit(item)"
                            >
                              <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                          </template>
                          <span>Edit</span>
                        </v-tooltip>
                        <v-tooltip
                          top
                          v-if="action === 'request'"
                        >
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-if="canChangeRequestStatus(item, 'approve')"
                              class="mx-1"
                              fab
                              dark
                              x-small
                              color="success"
                              v-on="on"
                              @click="changeRequestStatus(item, 'approved', true)"
                            >
                              <v-icon>mdi-check-circle</v-icon>
                            </v-btn>
                          </template>
                          <span>Approve</span>
                        </v-tooltip>
                        <v-tooltip
                          top
                          v-if="action === 'request'"
                        >
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-if="canChangeRequestStatus(item, 'reject')"
                              class="mx-1"
                              fab
                              dark
                              x-small
                              color="error"
                              v-on="on"
                              @click="changeRequestStatus(item, 'rejected', true)"
                            >
                              <v-icon>mdi-cancel</v-icon>
                            </v-btn>
                          </template>
                          <span>Reject</span>
                        </v-tooltip>
                      </td>
                      <td>{{item.name}}</td>
                      <td>{{item.code}}</td>
                      <td>{{item.parent.name}}</td>
                      <td>{{item.type.text}}</td>
                      <td>{{item.ownership.text}}</td>
                      <td>{{item.status.text}}</td>
                      <td>{{item.lat}}</td>
                      <td>{{item.long}}</td>
                      <td v-if="action === 'request' && requestCategory === 'requestsList'">
                        {{item.requestStatus}}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
            <template v-else-if="!loadingBuildings">
              <b>Select a jurisdiction on the left to display its facilities</b>
            </template>
          </v-scroll-y-transition>
        </v-flex>
      </v-layout>
    </v-card>
  </v-container>
</template>
<script>
import axios from 'axios'
import LiquorTree from 'liquor-tree'
import { required } from 'vuelidate/lib/validators'
import { generalMixin } from '../../mixins/generalMixin'
import {
  tasksVerification
} from '@/modules/tasksVerification'
export default {
  mixins: [generalMixin],
  validations: {
    name: { required }
  },
  props: ['action', 'requestType', 'requestCategory'],
  data () {
    return {
      facilityId: '',
      editDialog: false,
      loadingTree: false,
      loadingBuildings: false,
      buildingsHeaders: [
        { sortable: false },
        { text: 'Name', value: 'name' },
        { text: 'Code', value: 'code' },
        { text: 'Parent', value: 'parent' },
        { text: 'Facility Type', value: 'type' },
        { text: 'Facility Ownership', value: 'ownership' },
        { text: 'Status', value: 'status' },
        { text: 'Latitude', value: 'latitude' },
        { text: 'Longitude', value: 'longitude' }
      ],
      searchJurisdiction: '',
      searchBuildings: '',
      activeJurisdiction: {},
      jurisdictionHierarchy: [],
      buildings: [],
      name: '',
      alt_name: '',
      code: '',
      description: '',
      facilityType: '',
      types: [{
        text: 'Clinic',
        value: 'CLNC'
      }, {
        text: 'Dispensary',
        value: 'DSPN'
      }, {
        text: 'Health Center',
        value: 'HCNT'
      }, {
        text: 'Health Post',
        value: 'HPST'
      }, {
        text: 'Hospital',
        value: 'HOSP'
      }],
      ownerships: [{
        text: 'Concesion',
        value: 'CNCS'
      }, {
        text: 'Public',
        value: 'PBLC'
      }, {
        text: 'Private',
        value: 'PRVT'
      }, {
        text: 'Private Faith Based',
        value: 'PFBO'
      }, {
        text: 'Private Not Profit',
        value: 'PNPR'
      }],
      facilityOwnership: '',
      status: [{
        text: 'Functional',
        value: 'active'
      }, {
        text: 'Not Functional',
        value: 'inactive'
      }, {
        text: 'Suspended',
        value: 'suspended'
      }],
      facilityStatus: '',
      facilityParent: {},
      lat: '',
      long: '',
      contact: {
        email: '',
        phone: '',
        fax: '',
        website: ''
      },
      requestStatus: '',
      confirm: false,
      confirmTitle: '',
      tasksVerification: tasksVerification
    }
  },
  methods: {
    changeRequestStatus (item, status, isConfirm) {
      if (isConfirm) {
        this.requestStatus = status
        let statusDisplay
        if (status === 'approved') {
          statusDisplay = 'approved'
        } else if (status === 'rejected') {
          statusDisplay = 'rejected'
        }
        this.confirm = true
        this.confirmTitle = 'Are you sure that you want to mark facility ' + item.name + ' as ' + statusDisplay
        this.facilityId = item.id
      } else {
        this.$store.state.progressTitle = 'Saving new status'
        this.confirm = false
        this.$store.state.dynamicProgress = true
        let formData = new FormData()
        formData.append('id', this.facilityId)
        formData.append('status', this.requestStatus)
        formData.append('requestType', this.requestType)
        axios.post('/FR/changeBuildingRequestStatus', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(() => {
          this.$store.state.dynamicProgress = false
          this.$store.state.errorTitle = 'Info'
          this.$store.state.errorDescription = 'Request status changed successfully'
          this.$store.state.dialogError = true
          this.getBuildings()
        }).catch((err) => {
          this.$store.state.errorTitle = 'Error'
          this.$store.state.errorDescription = 'This request was not successfully processed'
          this.$store.state.dialogError = true
          console.log(err)
        })
      }
    },
    canChangeRequestStatus (item, actionName) {
      if (this.action !== 'request' || (this.action === 'request' && this.requestCategory !== 'requestsList')) {
        return false
      }
      if (actionName === 'approve') {
        if (item.requestStatus === 'Approved') {
          return false
        }
      } else if (actionName === 'reject') {
        if (item.requestStatus === 'Approved' || item.requestStatus === 'Rejected') {
          return false
        }
      }
      if ((this.requestType === 'update' && this.tasksVerification.canApprove('FacilitiesUpdateRequestsReport')) ||
        (this.requestType === 'add' && this.tasksVerification.canApprove('NewFacilitiesRequestsReport')) ||
        (this.requestType === 'update' && this.tasksVerification.canReject('FacilitiesUpdateRequestsReport')) ||
        (this.requestType === 'add' && this.tasksVerification.canReject('NewFacilitiesRequestsReport'))) {
        return true
      } else {
        return false
      }
    },
    canEditBuilding (item) {
      if (item.requestStatus === 'Approved' && this.requestCategory === 'requestsList') {
        return false
      }
      if (this.tasksVerification.canEdit('FacilitiesReport') || this.tasksVerification.canAdd('RequestUpdateBuildingDetails')) {
        return true
      }
      return false
    },
    getBuildings () {
      this.facilities = []
      this.buildings = []
      this.loadingBuildings = true
      axios.get('/FR/getBuildings', {
        params: {
          jurisdiction: this.activeJurisdiction.id,
          action: this.action,
          requestType: this.requestType,
          requestCategory: this.requestCategory
        }
      }).then((response) => {
        this.loadingBuildings = false
        this.buildings = response.data
      }).catch((err) => {
        this.loadingBuildings = false
        console.log(err)
      })
    },
    selectedJurisdiction (node) {
      this.activeJurisdiction = node
      this.getBuildings()
    },
    selectedEditJurisdiction (node) {
      this.facilityParent = node
    },
    edit (item) {
      this.facilityId = item.id
      this.facilityType = item.type.code
      this.facilityStatus = item.status.code
      this.facilityParent.id = item.parent.id
      this.facilityParent.text = item.parent.name
      this.facilityOwnership = item.ownership.code
      this.name = item.name
      this.alt_name = item.alt_name
      this.code = item.code
      this.lat = item.lat
      this.long = item.long
      this.contact.phone = item.phone
      this.contact.email = item.email
      this.contact.website = item.website
      this.contact.fax = item.fax
      this.description = item.description
      this.editDialog = true
    },
    saveEdit () {
      let formData = new FormData()
      formData.append('id', this.facilityId)
      formData.append('name', this.name)
      formData.append('alt_name', this.alt_name)
      formData.append('code', this.code)
      formData.append('action', this.action)
      formData.append('requestType', this.requestType)
      formData.append('username', this.$store.state.auth.username)
      if (this.facilityType) {
        formData.append('type', this.facilityType)
      }
      if (this.facilityStatus) {
        formData.append('status', this.facilityStatus)
      }
      if (this.facilityOwnership) {
        formData.append('ownership', this.facilityOwnership)
      }
      if (this.lat) {
        formData.append('lat', this.lat)
      }
      if (this.long) {
        formData.append('long', this.long)
      }
      formData.append('contact', JSON.stringify(this.contact))
      if (this.description) {
        formData.append('description', this.description)
      }
      formData.append('parent', this.facilityParent.id)
      this.$store.state.progressTitle = 'Saving Changes'
      this.editDialog = false
      this.$store.state.dynamicProgress = true
      axios.post('/FR/addBuilding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.$store.state.dynamicProgress = false
        this.$store.state.errorTitle = 'Changes Saved'
        this.$store.state.errorDescription = 'Changes saved successfully'
        this.$store.state.dialogError = true
        this.getBuildings()
      }).catch((err) => {
        this.$store.state.errorTitle = 'Failed To Save Changes'
        this.$store.state.errorDescription = 'Failed To Save Changes'
        this.$store.state.dialogError = true
        console.log(err)
      })
    }
  },
  created () {
    this.loadingTree = true
    this.getTree(false, false, (err, tree) => {
      if (!err) {
        this.loadingTree = false
        this.jurisdictionHierarchy = tree
      } else {
        this.loadingTree = false
      }
    })
    if (this.action === 'request' && this.requestCategory === 'requestsList') {
      this.buildingsHeaders.push({ text: 'Request Status', value: 'requestStatus' })
    }
  },
  computed: {
    nameErrors () {
      const errors = []
      if (!this.$v.name.$dirty) return errors
      !this.$v.name.required && errors.push('Name is required')
      return errors
    }
  },
  components: {
    'liquor-tree': LiquorTree
  }
}
</script>