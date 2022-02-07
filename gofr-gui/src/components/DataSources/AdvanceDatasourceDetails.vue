<template>
  <v-container grid-list-xs>
    <v-alert
      dense
      type="info"
    >
      <v-row>
        <v-col cols="7">
          Detailed View Of {{dataSource.display}} Data Source
        </v-col>
        <v-spacer></v-spacer>
        <v-col>
          <v-btn
            color="primary"
            @click.native="$router.push('/ViewDataSources')"
            small
          >
            <v-icon left>mdi-format-list-bulleted-square</v-icon>
            Back to Datasources
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-row>
      <v-col cols="12">
        <ActivePartitionStats :partition="partitionid" title="Datasource Statistics"></ActivePartitionStats>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="5">
        <v-card width='730px'>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>
              Shared Users
            </v-toolbar-title>
          </v-toolbar>
          <v-card-title>
            Select user to view permisions
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="advDetailsHeader"
              :items="sourceAdvanceDetails"
              class="elevation-1"
            >
              <template v-slot:item="{ item }">
                <tr @click="showPermissions(item)">
                  <v-radio-group
                    v-model='user'
                    style="height: 5px;margin-left:40px"
                  >
                    <td>
                      <v-radio
                        :value="item"
                        color="blue"
                      ></v-radio>
                    </td>
                  </v-radio-group>
                  <td>{{ item.name }}</td>
                  <td>
                    {{item.permissions.length}}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="5">
        <v-card height="348">
          <v-toolbar
            color="red darken-4"
            dark
          >
            <v-toolbar-title>
              Permissions for user {{user.name}}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-icon large>mdi-shield-lock-outline</v-icon>
          </v-toolbar>
          <v-card-actions>
            <v-row>
              <v-col cols="5">
                <v-card height="100">
                  <v-toolbar
                    color="red darken-4"
                    dark
                    height="30"
                  >
                    <v-toolbar-title style="font-size:16px">
                      Facilities
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-icon small>mdi-hospital-marker</v-icon>
                  </v-toolbar>
                  <v-card-actions>
                    <v-layout column>
                      <v-flex>
                        <v-checkbox
                          v-model="permissions"
                          color="red darken-3"
                          value="read_facility"
                          height="0"
                          hide-details
                        >
                          <template v-slot:label>
                            <span style="font-size: 15px">View</span>
                          </template>
                        </v-checkbox>
                      </v-flex>
                      <v-checkbox
                        v-model="permissions"
                        color="red darken-3"
                        value="write_facility"
                        height="14"
                        hide-details
                      >
                        <template v-slot:label>
                          <span style="font-size: 15px">Add/Update</span>
                        </template>
                      </v-checkbox>
                    </v-layout>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="5">
                <v-card>
                  <v-toolbar
                    color="red darken-4"
                    dark
                    height="30"
                  >
                    <v-toolbar-title style="font-size:16px">
                      Jurisdictions
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-icon small>mdi-home-group</v-icon>
                  </v-toolbar>
                  <v-card-actions>
                    <v-layout column>
                      <v-flex>
                        <v-checkbox
                          v-model="permissions"
                          color="red darken-3"
                          value="read_jurisdiction"
                          height="0"
                          hide-details
                        >
                          <template v-slot:label>
                            <span style="font-size: 15px">View</span>
                          </template>
                        </v-checkbox>
                      </v-flex>
                      <v-checkbox
                        v-model="permissions"
                        color="red darken-3"
                        value="write_jurisdiction"
                        height="14"
                        hide-details
                      >
                        <template v-slot:label>
                          <span style="font-size: 15px">Add/Update</span>
                        </template>
                      </v-checkbox>
                    </v-layout>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="5">
                <v-card>
                  <v-toolbar
                    color="red darken-4"
                    dark
                    height="30"
                  >
                    <v-toolbar-title style="font-size:16px">
                      Organizations
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-icon small>mdi-hospital-marker</v-icon>
                  </v-toolbar>
                  <v-card-actions>
                    <v-layout column>
                      <v-flex>
                        <v-checkbox
                          v-model="permissions"
                          color="red darken-3"
                          value="read_organization"
                          height="0"
                          hide-details
                        >
                          <template v-slot:label>
                            <span style="font-size: 15px">View</span>
                          </template>
                        </v-checkbox>
                      </v-flex>
                      <v-checkbox
                        v-model="permissions"
                        color="red darken-3"
                        value="write_organization"
                        height="14"
                        hide-details
                      >
                        <template v-slot:label>
                          <span style="font-size: 15px">View</span>
                        </template>
                      </v-checkbox>
                    </v-layout>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="5">
                <v-card>
                  <v-toolbar
                    color="red darken-4"
                    dark
                    height="30"
                  >
                    <v-toolbar-title style="font-size:16px">
                      Healthcare Services
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-icon small>mdi-room-service</v-icon>
                  </v-toolbar>
                  <v-card-actions>
                    <v-layout column>
                      <v-flex>
                        <v-checkbox
                          v-model="permissions"
                          color="red darken-3"
                          value="read_service"
                          height="0"
                          hide-details
                        >
                          <template v-slot:label>
                            <span style="font-size: 15px">View</span>
                          </template>
                        </v-checkbox>
                      </v-flex>
                      <v-checkbox
                        v-model="permissions"
                        color="red darken-3"
                        value="write_service"
                        height="14"
                        hide-details
                      >
                        <template v-slot:label>
                          <span style="font-size: 15px">Add/Update</span>
                        </template>
                      </v-checkbox>
                    </v-layout>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-actions>
          <v-divider></v-divider>
          <v-divider></v-divider>
          <v-row>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-col>
              <v-btn dark small color="red darken-3" @click="changePermissions"><v-icon left>mdi-cog-refresh-outline</v-icon> Update Permissions</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import ActivePartitionStats from './ActivePartitionStats.vue'
export default {
  props: ["sourceid", "partitionid"],
  data() {
    return {
      permissions: [],
      user: {},
      dataSource: {},
      sourceAdvanceDetails: [],
      advDetailsHeader: [
        {
          text: "Select",
          align: "center"
        },
        {
          text: 'User',
          align: 'left',
          value: 'name'
        },
        {
          text: "Total Permission",
          value: "permissions"
        }
      ]
    }
  },
  filters: {
    mergePermissions(permissions) {
      let merged = ''
      for(let permission of permissions) {
        if(!merged) {
          merged = permission.text
        } else {
          merged += ', ' + permission.text
        }
      }
      return merged
    }
  },
  methods: {
    showPermissions(user) {
      this.permissions = []
      if(!user.permissions || user.permissions.length === 0) {
        return
      }
      for(let permission of user.permissions) {
        this.permissions.push(permission.id)
      }
    },
    changePermissions() {
      let formData = new FormData()
      formData.append('partition', this.dataSource.partitionID)
      formData.append('user', this.user.id)
      formData.append('permissions', JSON.stringify(this.permissions))
      this.$store.state.dynamicProgress = true
      this.$store.state.progressTitle = "Updating permissions"
      axios.post('/datasource/updatePermissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.$store.state.dynamicProgress = false
        this.$store.state.dialogError = true
        this.$store.state.errorColor = 'primary'
        this.$store.state.errorTitle = 'Information'
        this.$store.state.errorDescription = "Permissions update successfully. Reload app to see changes"
      }).catch((err) => {
        console.log(err)
        this.$store.state.dynamicProgress = false
        this.$store.state.dialogError = true
        this.$store.state.errorColor = 'error'
        this.$store.state.errorTitle = 'Information'
        this.$store.state.errorDescription = "An error has occured"
      })
    }
  },
  components: {
    'ActivePartitionStats': ActivePartitionStats
  },
  created() {
    this.$store.state.dynamicProgress = true
    this.dataSource = this.$store.state.dataSources.find((dtsrc) => {
      return dtsrc.id === this.sourceid
    })
    this.$store.state.progressTitle = 'Getting Datasource Details'
    axios.get(`/datasource/getSourceDetails/${this.dataSource.partitionID}`).then((response) => {
      this.sourceAdvanceDetails = response.data
      if(this.sourceAdvanceDetails.length > 0) {
        this.user = this.sourceAdvanceDetails[0]
        this.showPermissions(this.user)
      }
      this.$store.state.dynamicProgress = false
    }).catch((err) => {
      console.log(err);
      this.$store.state.dynamicProgress = false
    })
  }
}
</script>