<template>
  <v-container grid-list-xs>
    <v-card height="2">
      <v-card-title primary-title>
        Active Partition
      </v-card-title>
      <v-card-text>
        <v-radio-group
          v-model="ex7"
          column
        >
          <v-radio
            label="red"
            color="red"
            value="red"
          ></v-radio>
          <v-radio
            label="red darken-3"
            color="red darken-3"
            value="red darken-3"
          ></v-radio>
          <v-radio
            label="indigo"
            color="indigo"
            value="indigo"
          ></v-radio>
          <v-radio
            label="indigo darken-3"
            color="indigo darken-3"
            value="indigo darken-3"
          ></v-radio>
          <v-radio
            label="orange"
            color="orange"
            value="orange"
          ></v-radio>
          <v-radio
            label="orange darken-3"
            color="orange darken-3"
            value="orange darken-3"
          ></v-radio>
        </v-radio-group>
        <v-select
          :items="$store.state.dataSources"
          item-text="display"
          item-value="name"
          v-model="$store.state.config.userConfig.FRDatasource"
          label="Facility Registry Datasource"
          height="10"
          full-width="true"
        ></v-select>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { generalMixin } from '@/mixins/generalMixin'
export default {
  mixins: [generalMixin]
}
</script>
