<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <v-layout row wrap>
          <v-spacer></v-spacer>
          <v-flex xs2>
            <v-card>
              <v-card-title primary-title>
                <v-toolbar color="#385F73" dark height="40"  style="font-size: 14px">
                  Active Partition
                </v-toolbar>
              </v-card-title>
              <v-card-text>
                <v-select
                  :items="$store.state.dataSources"
                  item-text="display"
                  item-value="name"
                  v-model="$store.state.config.userConfig.FRDatasource"
                  label="Facility Registry Datasource"
                  @change="partitionChanged()"
                ></v-select>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex xs4>
            <v-card>
              <v-card-title primary-title>
                <v-toolbar color="#385F73" dark height="40" style="font-size: 14px">
                  Active Partition Stats
                </v-toolbar>
              </v-card-title>
              <v-card-text>
                <v-layout row wrap>
                  <v-spacer></v-spacer>
                  <v-flex xs6>
                    <label v-if="loading.facilitiesCount">
                      <v-progress-linear
                        color="deep-purple accent-4"
                        indeterminate
                        rounded
                        height="6"
                      ></v-progress-linear>
                    </label>
                    <label v-else>
                      Total Facilities: <v-chip
                                        class="ma-2"
                                        color="red"
                                        text-color="white"
                                      >
                                        {{totalFacilities}}
                                      </v-chip><br>
                    </label>
                    <label v-if="loading.jurisdictionsCount">
                      <v-progress-linear
                        color="deep-purple accent-4"
                        indeterminate
                        rounded
                        height="6"
                      ></v-progress-linear>
                    </label>
                    <label v-else>
                      Total Jurisdictions: <v-chip
                                            class="ma-2"
                                            color="green"
                                            text-color="white"
                                          >
                                            {{totalJurisdictions}}
                                          </v-chip>
                    </label>
                    <br>
                    Created: <v-chip
                              class="ma-2"
                              color="primary"
                              text-color="white"
                            >
                              {{activePartition.createdTime}}
                            </v-chip>
                  </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex xs5>
                    <label v-if="!activePartition.sharedToAll">
                      Shared Users: <v-chip
                                    class="ma-2"
                                    color="green"
                                    text-color="white"
                                  >
                                    {{activePartition.sharedUsers}}
                                  </v-chip> <br>
                    </label>
                    Shared To All: <v-chip
                                    class="ma-2"
                                    color="primary"
                                    text-color="white"
                                  >
                                    {{activePartition.sharedToAll}}
                                  </v-chip> <br>
                    Limited by User Location: <v-chip
                                    class="ma-2"
                                    color="red"
                                    text-color="white"
                                  >
                                    {{activePartition.limitedByLocation}}
                                  </v-chip>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex xs2>
            <v-card>
              <v-card-title primary-title>
                <v-toolbar color="#952175" dark height="40" style="font-size: 14px">
                  Language
                </v-toolbar>
              </v-card-title>
              <v-card-text>
                <v-select
                  :items="locales"
                  v-model="locale"
                ></v-select>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex xs2>
            <v-card>
              <v-card-title primary-title>
                <v-toolbar color="#1F7087" dark height="40" style="font-size: 14px">
                  Active Reconciliation Pair
                </v-toolbar>
              </v-card-title>
              <v-card-text>
                <label v-if="Object.keys($store.state.activePair.source1).length > 0">
                  Source 1: <b>{{$store.state.activePair.source1.display}}</b> <br>
                  Source 2: <b>{{$store.state.activePair.source2.display}}</b> <br>
                  Status: <b>{{$store.state.recoStatus}}</b> <v-icon
                            small
                            v-if="$store.state.recoStatus === 'in-progress'"
                          >mdi-lock-open-variant-outline</v-icon>
                          <v-icon
                            small
                            v-else
                          >mdi-lock-outline</v-icon>
                </label>
              </v-card-text>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
        </v-layout>
      </v-flex>
      <br>
      <v-flex>
        <v-layout row wrap>
          <v-spacer></v-spacer>
          <v-flex xs9>
            <v-tabs
              background-color="deep-purple accent-4"
              centered
              dark
              icons-and-text
              fixed-tabs
            >
              <v-tabs-slider></v-tabs-slider>
              <v-tab key="map">
                Map Visualization
                <v-icon>mdi-map-marker</v-icon>
              </v-tab>

              <v-tab key="tables">
                Tabular Visualization
                <v-icon>mdi-table-search</v-icon>
              </v-tab>
              <v-tab-item key="map">
                <viewMap
                  :key="reload"
                />
              </v-tab-item>
              <v-tab-item key="tables">
                <v-layout row wrap>
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
              </v-tab-item>
            </v-tabs>
          </v-flex>
          <v-spacer></v-spacer>
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
      loading: {
        facilitiesCount: false,
        jurisdictionsCount: false
      },
      activePartition: {
        sharedUsers: 0,
        sharedToAll: false,
        limitedByLocation: false
      }
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    },
    FRDatasource() {
      this.countFacilities()
      this.countJurisdictions()
      this.getPartitionStatus()
    },
    datasources() {
      this.getPartitionStatus()
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
      this.loading.facilitiesCount = true
      let url = "/fhir/" + this.$store.state.config.userConfig.FRDatasource + "/Location?type=urn:ihe:iti:mcsd:2019:facility&_count=0&_total=accurate"
      axios.get(url).then((response) => {
        this.totalFacilities = response.data.total
        this.loading.facilitiesCount = false
      })
    },
    countJurisdictions() {
      let url = "/fhir/" + this.$store.state.config.userConfig.FRDatasource + "/Location?type=urn:ihe:iti:mcsd:2019:jurisdiction&_count=0&_total=accurate"
      this.loading.jurisdictionsCount = true
      axios.get(url).then((response) => {
        this.totalJurisdictions = response.data.total
        this.loading.jurisdictionsCount = false
      })
    },
    getPartitionStatus() {
      let dtsrc = this.$store.state.dataSources.find((dtsrc) => {
        return dtsrc.name === this.$store.state.config.userConfig.FRDatasource
      })
      if(!dtsrc) {
        return
      }
      this.activePartition.sharedUsers = dtsrc.sharedUsers.length
      this.activePartition.sharedToAll = dtsrc.shareToAll.activated
      this.activePartition.limitedByLocation = dtsrc.shareToAll.limitByUserLocation
      this.activePartition.createdTime = dtsrc.createdTime
    }
  },
  created() {
    this.countFacilities()
    this.countJurisdictions()
    this.getPartitionStatus()
  },
  components: {
    'fhirPageSearch': fhirPageSearch,
    'viewMap': viewMap
  }
}
</script>
