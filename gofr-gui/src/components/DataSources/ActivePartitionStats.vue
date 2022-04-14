<template>
  <v-card>
    <v-card-title primary-title>
      <v-toolbar color="#78496a" dark height="40" style="font-size: 14px">
        {{title}}
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
                              color="#5f6062"
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
                                  color="#5f6062"
                                  text-color="white"
                                >
                                  {{totalJurisdictions}}
                                </v-chip>
          </label>
          <br>
          Created: <v-chip
                    class="ma-2"
                    color="#5f6062"
                    text-color="white"
                  >
                    {{activePartition.createdTime}}
                  </v-chip>
        </v-flex>
        <v-divider color="#78496a" vertical></v-divider>
        <v-spacer></v-spacer>
        <v-flex xs5>
          <label v-if="!activePartition.sharedToAll">
            Shared Users: 
            <v-chip
              class="ma-2"
              color="#8a8d35"
              text-color="white"
            >
              {{activePartition.sharedUsers}}
            </v-chip> <br>
          </label>
          Shared To All: 
          <v-chip
            class="ma-2"
            color="#5f6062"
            text-color="white"
          >
            {{activePartition.sharedToAll}}
          </v-chip> <br>
          Limited by User Location: 
          <v-chip
            class="ma-2"
            color="#5f6062"
            text-color="white"
          >
            {{activePartition.limitedByLocation}}
          </v-chip>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'
export default {
  props: ["partition", "title"],
  data() {
    return {
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
    datasources() {
      this.getPartitionStatus()
    }
  },
  computed: {
    datasources() {
      return this.$store.state.dataSources
    }
  },
  methods: {
    countFacilities() {
      this.loading.facilitiesCount = true
      let url = "/fhir/" + this.partition + "/Location?type=urn:ihe:iti:mcsd:2019:facility&_count=0&_total=accurate"
      axios.get(url).then((response) => {
        this.totalFacilities = response.data.total
        this.loading.facilitiesCount = false
        this.getPartitionStatus()
      })
    },
    countJurisdictions() {
      let url = "/fhir/" + this.partition + "/Location?type=urn:ihe:iti:mcsd:2019:jurisdiction&_count=0&_total=accurate"
      this.loading.jurisdictionsCount = true
      axios.get(url).then((response) => {
        this.totalJurisdictions = response.data.total
        this.loading.jurisdictionsCount = false
      })
    },
    getPartitionStatus() {
      let dtsrc = this.$store.state.dataSources.find((dtsrc) => {
        return dtsrc.name === this.partition
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
    if(!this.partition) {
      return
    }
    this.countFacilities()
    this.countJurisdictions()
  },
}
</script>