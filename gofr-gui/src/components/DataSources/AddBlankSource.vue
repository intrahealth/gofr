<template>
  <v-container>
    <v-layout
      row
      wrap
    >
      <v-spacer></v-spacer>
      <v-flex xs6>
        <v-card
          class="mx-auto"
          style="max-width: 500px;"
        >
          <v-toolbar
            color="deep-purple accent-4"
            cards
            dark
            text
          >
            <v-card-title class="title font-weight-regular">Add Blank Source</v-card-title>
            <v-spacer></v-spacer>
            <v-btn
              icon
              dark
              @click.native="close()"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-form
            ref="form"
            class="pa-3 pt-4"
          >
            <v-layout column wrap>
              <v-flex>
                <v-text-field
                  v-model="name"
                  filled
                  required
                  @blur="ensureNameUnique"
                  @input="ensureNameUnique"
                  :error-messages="nameErrors"
                  color="deep-purple"
                  label="Source Name"
                ></v-text-field>
              </v-flex>
              <v-flex>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-checkbox
                      v-if="$store.state.dhis.user.orgId"
                      :disabled="shareWithAll"
                      v-on="on"
                      color="primary"
                      label="Share with other users of the same org unit as yours"
                      v-model="shareToSameOrgid"
                    ></v-checkbox>
                  </template>
                  <span>
                    Share this dataset with all other users that are on the same org unit as you
                  </span>
                </v-tooltip>
              </v-flex>
              <v-flex>
                <v-checkbox
                  v-if='$store.state.config.generalConfig.allowShareToAllForNonAdmin || $store.state.auth.role === "Admin"'
                  @change="sharingOptions"
                  color="primary"
                  label="Share with all other users"
                  v-model="shareWithAll"
                >
                </v-checkbox>
              </v-flex>
              <v-flex>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-checkbox
                      v-if="shareWithAll && $store.state.dhis.user.orgId"
                      v-on="on"
                      color="primary"
                      label="Limit orgs sharing by user orgid"
                      v-model="limitShareByOrgId"
                    >
                    </v-checkbox>
                  </template>
                  <span>
                    if activated, other users will see locations (including location children) that has the same location id as their location id
                  </span>
                </v-tooltip>
              </v-flex>
            </v-layout>
          </v-form>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="performExtraCheck"
              :disabled="$v.$invalid"
              class="white--text"
              color="deep-purple accent-4"
              depressed
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
  </v-container>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
import { dataSourcesMixin } from './dataSourcesMixin'
import { generalMixin } from '../../mixins/generalMixin'
import { eventBus } from '../../main'
export default {
  mixins: [dataSourcesMixin, generalMixin],
  validations: {
    name: { required },
  },
  data () {
    return {
      datasetLimitWarn: false,
      nameErrors: []
    }
  },
  methods: {
    close () {
      eventBus.$emit('dataSourceSaved')
    },
    performExtraCheck () {
      // reload general config and see if still allowed to upload more data sources
      this.$store.state.dynamicProgress = true
      this.$store.state.progressTitle = 'Performing extra validations'
      this.getGeneralConfig(() => {
        this.datasetLimitWarn = false
        this.$store.state.dynamicProgress = false
        if (this.canAddDataset) {
          this.addDataSource('blank', '')
        } else {
          this.datasetLimitWarn = true
        }
      })
    },
    ensureNameUnique () {
      this.nameErrors = []
      if (this.name === '') {
        return this.nameErrors.push('Name is required')
      }
      if (this.name.length > 35) {
        return this.nameErrors.push('Name must not exceed 35 characters')
      }
      for (let invalidChar of this.invalidCharacters) {
        if (this.name.indexOf(invalidChar) !== -1) {
          return this.nameErrors.push('Name is invalid')
        }
      }
      for (let dtSrc of this.$store.state.dataSources) {
        if (dtSrc.display === this.name) {
          this.nameErrors.push('This Name Exists')
          return false
        }
      }
    }
  }
}
</script>
