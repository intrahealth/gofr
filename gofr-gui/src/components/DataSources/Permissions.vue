<template>
  <v-container grid-list-xs>
    <v-card height="252" width="550">
      <v-toolbar
        color="secondary"
        dark
        height="30"
      >
        <v-toolbar-title>
          Permissions
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon>mdi-shield-lock-outline</v-icon>
      </v-toolbar>
      <v-card-actions>
        <v-row>
          <v-col cols="5">
            <v-card height="90">
              <v-toolbar
                color="secondary"
                dark
                height="20"
              >
                <v-toolbar-title style="font-size:12px">
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
                        <span style="font-size: 12px">View</span>
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
                      <span style="font-size: 12px">Add/Update</span>
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
                color="secondary"
                dark
                height="20"
              >
                <v-toolbar-title style="font-size:12px">
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
                        <span style="font-size: 12px">View</span>
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
                      <span style="font-size: 12px">Add/Update</span>
                    </template>
                  </v-checkbox>
                </v-layout>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="5">
            <v-card>
              <v-toolbar
                color="secondary"
                dark
                height="20"
              >
                <v-toolbar-title style="font-size:12px">
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
                        <span style="font-size: 12px">View</span>
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
                      <span style="font-size: 12px">Add/Update</span>
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
                color="secondary"
                dark
                height="20"
              >
                <v-toolbar-title style="font-size:12px">
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
                        <span style="font-size: 12px">View</span>
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
                      <span style="font-size: 12px">Add/Update</span>
                    </template>
                  </v-checkbox>
                </v-layout>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      permissions: []
    }
  },
  watch: {
    permissions() {
      this.$emit('grantedPermissions', this.permissions);
    }
  }
}
</script>
