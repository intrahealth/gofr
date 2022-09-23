<template>
  <v-container grid-list-xs>
    <v-dialog
      v-model="datasetLimit"
      scrollable
      persistent
      :overlay="false"
      max-width="770px"
      transition="dialog-transition"
    >
      <v-card>
        <v-toolbar
          color="error"
          dark
        >
          <v-toolbar-title>
            <v-icon>mdi-info</v-icon> {{ $t(`App.hardcoded-texts.Datasets limit Warning`) }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon
            dark
            @click.native="datasetLimit = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          {{ $t(`App.hardcoded-texts.You cant add more datasets as you have reached the datasets limit, contact system administrator for help`) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click.native="datasetLimit = false"
          >{{ $t(`App.hardcoded-texts.Ok`) }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  props: ['datasetLimitWarn'],
  computed: {
    datasetLimit: {
      get () {
        return this.datasetLimitWarn
      },
      set (newVal) {
        this.$emit('limitWarnStateChange', newVal)
      }
    }
  }
}
</script>
