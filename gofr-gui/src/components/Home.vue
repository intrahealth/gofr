<template>
  <v-container fluid>
    <v-layout column>
      <v-flex>
        <v-card>
          <v-card-text>
            <v-layout row wrap>
              <v-spacer></v-spacer>
              <v-flex xs3>
                <v-card height="209">
                  <v-card-title primary-title>
                    <v-toolbar color="#78496a" dark height="40"  style="font-size: 14px">
                      {{ $t(`App.hardcoded-texts.Active Partition`) }}
                    </v-toolbar>
                  </v-card-title>
                  <v-card-text>
                    <v-select
                      :items="$store.state.dataSources"
                      item-text="display"
                      item-value="name"
                      v-model="$store.state.config.userConfig.FRDatasource"
                      :label="$t(`App.hardcoded-texts.Facility Registry Datasource`)"
                      @change="partitionChanged()"
                    ></v-select>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs6>
                <ActivePartitionStats 
                  :partition="$store.state.config.userConfig.FRDatasource" 
                  :title="$t(`App.hardcoded-texts.Active Partition Stats`)"
                  :key="reload"
                />
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs3>
                <v-card height="209">
                  <v-card-title primary-title>
                    <v-toolbar color="#78496a" dark height="40" style="font-size: 14px">
                      {{ $t(`App.hardcoded-texts.Active Reconciliation Pair`) }}
                    </v-toolbar>
                  </v-card-title>
                  <v-card-text>
                    <label v-if="Object.keys($store.state.activePair.source1).length > 0">
                      {{ $t(`App.hardcoded-texts.Name`) }}: <b>{{$store.state.activePair.display}}</b> <br>
                      {{ $t(`App.hardcoded-texts.Source 1`) }}: <b>{{$store.state.activePair.source1.display}}</b> <br>
                      {{ $t(`App.hardcoded-texts.Source 2`) }}: <b>{{$store.state.activePair.source2.display}}</b> <br>
                      {{ $t(`App.hardcoded-texts.Status`) }}: <b>{{$store.state.recoStatus}}</b> <v-icon
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
          </v-card-text>
        </v-card>
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
          <!-- <v-flex xs12>
            <v-tabs
              background-color="deep-purple accent-4"
              centered
              dark
              icons-and-text
              fixed-tabs
              height="57px"
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
                
              </v-tab-item>
              <v-tab-item key="tables">
                
              </v-tab-item>
            </v-tabs>
          </v-flex>
          <v-spacer></v-spacer> -->
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { generalMixin } from '@/mixins/generalMixin'
import fhirPageSearch from '@/components/FacilityRegistry/fhir-page-search.vue'
import viewMap from '@/components/ViewMap'
import ActivePartitionStats from './DataSources/ActivePartitionStats.vue'
export default {
  mixins: [generalMixin],
  data () {
    return {
      locale: 'en',
      locales: [
        { text: 'English', value: 'en' },
        { text: 'French', value: 'fr' }
      ],
      reload: 0
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    },
    FRDatasource() {
      this.reload++
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
    }
  },
  components: {
    'fhirPageSearch': fhirPageSearch,
    'viewMap': viewMap,
    'ActivePartitionStats': ActivePartitionStats
  }
}
</script>
