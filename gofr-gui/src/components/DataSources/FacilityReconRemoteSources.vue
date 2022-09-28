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
            color="#569fd3"
            cards
            dark
            text
          >
            <v-card-title class="title font-weight-regular">
              </v-card-title>
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
            <v-select
              :items="$store.state.remoteDataSources"
              v-model="sourceType"
              required
              :label="$t(`App.hardcoded-texts.Source Type`)"
            ></v-select>
            <v-text-field
              v-model="name"
              filled
              required
              @blur="ensureNameUnique"
              @input="ensureNameUnique"
              :error-messages="nameErrors"
              color="deep-purple"
              :label="$t(`App.hardcoded-texts.Source Name`)"
            ></v-text-field>
            <v-text-field
              v-model="host"
              filled
              required
              color="deep-purple"
              :label="$t(`App.hardcoded-texts.Base URL`)"
            ></v-text-field>
            <v-text-field
              v-model="username"
              filled
              color="deep-purple"
              :label="$t(`App.hardcoded-texts.User Name`)"
            ></v-text-field>
            <v-text-field
              v-model="password"
              filled
              color="deep-purple"
              :label="$t(`App.hardcoded-texts.Source Name`)"
              style="min-height: 96px"
              type="password"
            ></v-text-field>
            <template>
              <v-tooltip top>
                <v-checkbox
                  v-if="$store.state.dhis.user.orgId"
                  :disabled="shareWithAll"
                  slot="activator"
                  color="primary"
                  :label="$t(`App.hardcoded-texts.Share with other users of the same org unit as yours`)"
                  v-model="shareToSameOrgid"
                ></v-checkbox>
                <span>
                  {{ $t(`App.hardcoded-texts.Share this dataset with all other users that are on the same org unit as you`) }}
                </span>
              </v-tooltip>
              <v-checkbox
                v-if='$store.state.config.generalConfig.allowShareToAllForNonAdmin || $store.state.auth.role === "Admin"'
                @change="sharingOptions"
                color="primary"
                :label="$t(`App.hardcoded-texts.Share with all other users`)"
                v-model="shareWithAll"
              >
              </v-checkbox>
              <v-tooltip top>
                <v-checkbox
                  v-if="shareWithAll && $store.state.dhis.user.orgId"
                  slot="activator"
                  color="primary"
                  :label="$t(`App.hardcoded-texts.Limit orgs sharing by user orgid`)"
                  v-model="limitShareByOrgId"
                >
                </v-checkbox>
                <span>
                  {{ $t(`App.hardcoded-texts.if activated, other users will see locations (including location children) that has the same location id as their location id`) }}
                </span>
              </v-tooltip>
            </template>
          </v-form>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="performExtraCheck"
              :disabled="$v.$invalid"
              class="white--text"
              color="#569fd3"
              depressed
            >
              {{ $t(`App.hardcoded-texts.Add`) }}
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
    host: { required },
    name: { required },
    sourceType: { required }
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
          this.addDataSource('remoteServer', '')
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
