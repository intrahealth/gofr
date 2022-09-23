<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <v-layout row wrap>
          <v-flex xs2>
            <v-chip color="primary" dark outlined>
              {{ $t(`App.hardcoded-texts.Facilities`) }}: {{totalFacilities}}
            </v-chip>
          </v-flex>
          <v-flex xs2>
            <v-chip color="primary" dark outlined>
              {{ $t(`App.hardcoded-texts.Jurisdictions`) }}: {{totalJurisdictions}}
            </v-chip>
          </v-flex>
          <v-flex xs2>
            <v-chip color="primary" dark outlined>
              {{ $t(`App.hardcoded-texts.Services`) }}: {{totalServices}}
            </v-chip>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex xs3>
            <v-btn
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-request-add-facility-page')"
              color="#5f6062"
              dark
              rounded 
              small
              to="/questionnaire/gofr-facility-add-request-questionnaire/facility-add-request"
            >
              {{ $t('App.hardcoded-texts.Request Addition of New Facility') }}
            </v-btn>
          </v-flex>
          <v-flex xs3>
            <v-btn
              v-if="$tasksVerification.hasPermissionByName('special', 'custom', 'view-request-update-facility-page')"
              color="#5f6062"
              dark
              rounded 
              small
              to="/Resource/Search/facility?searchAction=send-update-request"
            >
              {{ $t('App.hardcoded-texts.Request Update of Facility Details') }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
      <br>
      <v-flex>
        <v-layout row wrap>
          <v-spacer></v-spacer>
          <v-flex xs6>
            <viewMap
              :key="reload"
            />
          </v-flex>
          <v-flex xs6>
            <v-layout column wrap>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <fhirPageSearch
                    page="facility"
                    :key="reload"
                  />
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs5>
                  <fhirPageSearch
                    page="jurisdiction"
                    :key="reload"
                  />
                </v-flex>
                <v-spacer></v-spacer>
              </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { generalMixin } from '@/mixins/generalMixin'
import fhirPageSearch from '@/components/FacilityRegistry/fhir-page-search.vue'
import viewMap from '@/components/ViewMap'
import axios from 'axios'
export default {
  mixins: [generalMixin],
  data () {
    return {
      locale: 'en',
      locales: [
        { text: 'English', value: 'en' },
        { text: 'French', value: 'fr' }
      ],
      reload: 0,
      totalFacilities: 0,
      totalJurisdictions: 0,
      totalServices: 0,
      loading: {
        facilitiesCount: false,
        jurisdictionsCount: false,
        servicesCount: false
      }
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    },
    FRDatasource() {
      this.reload++
    },
    reload() {
      this.countFacilities()
      this.countJurisdictions()
      this.countServices()
    }
  },
  computed: {
    FRDatasource() {
      return this.$store.state.config.userConfig.FRDatasource
    },
    datasources() {
      return this.$store.state.dataSources
    }
  },
  methods: {
    partitionChanged() {
      this.saveConfiguration('userConfig', 'activePartition')
      this.reload++
    },
    countFacilities() {
      if(!this.FRDatasource) {
        return
      }
      this.loading.facilitiesCount = true
      let url = "/fhir/" + this.FRDatasource + "/Location?type=urn:ihe:iti:mcsd:2019:facility&_count=0&_total=accurate"
      axios.get(url).then((response) => {
        this.totalFacilities = response.data.total
        this.loading.facilitiesCount = false
      })
    },
    countJurisdictions() {
      if(!this.FRDatasource) {
        return
      }
      let url = "/fhir/" + this.FRDatasource + "/Location?type=urn:ihe:iti:mcsd:2019:jurisdiction&_count=0&_total=accurate"
      this.loading.jurisdictionsCount = true
      axios.get(url).then((response) => {
        this.totalJurisdictions = response.data.total
        this.loading.jurisdictionsCount = false
      })
    },
    countServices() {
      if(!this.FRDatasource) {
        return
      }
      let url = "/fhir/" + this.FRDatasource + "/HealthcareService?_count=0&_total=accurate"
      this.loading.servicesCount = true
      axios.get(url).then((response) => {
        this.totalServices = response.data.total
        this.loading.servicesCount = false
      })
    }
  },
  components: {
    'fhirPageSearch': fhirPageSearch,
    'viewMap': viewMap
  },
  created() {
    this.countFacilities()
    this.countJurisdictions()
    this.countServices()
  }
}
</script>
