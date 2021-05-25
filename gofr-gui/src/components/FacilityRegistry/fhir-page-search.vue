<template>
  <ihris-template :key="$route.path">
    Loading...
  </ihris-template>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
let requestType
let searchAction

export default {
  name: "fhir-page-search",
  props: ['page', 'requestType'],
  data: function() {
    return {
    }
  },
  created: function() {
    requestType = this.requestType
    if(this.$route.query.searchAction) {
      searchAction = this.$route.query.searchAction
    }
    this.getTemplate()
  },
  methods: {
    getTemplate: function() {
      axios.get( "/config/page/"+this.page+"/search" ).then(response => {
        let data = response.data
        if ( data.resourceType === "OperationOutcome" ) {
          Vue.component( 'ihris-template', {
            name: 'ihris-template',
            data: function() {
              return {
                issues: data.issue
              }
            },
            components: {
              "ihris-outcome": () => import("@/components/ihris/ihris-outcome" )
            },
            template: '<div><ihris-outcome :issues="issues"></ihris-outcome></div>'
          } )
        } else {
          Vue.component( 'ihris-template', {
            name: 'ihris-template',
            data: function() {
              return {
                fields: data.data.fields,
                addLink: data.data.addLink,
                terms: {},
                requestType: requestType,
                searchAction: searchAction
              }
            },
            components: {
              "ihris-search": () => import("@/components/ihris/ihris-search" ),
              "ihris-search-code": () => import("@/components/ihris/ihris-search-code" ),
              "ihris-search-term": () => import("@/components/ihris/ihris-search-term" )
            },
            template: data.template,
            methods: {
              searchData: function(expression, value) {
                this.$set(this.terms, expression, value)
              }
            }
          })
        }
        this.$forceUpdate()
      }).catch(err => {
        console.log(err)
        Vue.component( 'ihris-template', {template: '<div><h1>Error</h1><p>An error occurred trying to load this page</p>.</div>'})
        this.$forceUpdate()
      })
    }
  },
  beforeDestroy() {
    searchAction = ""
    requestType = ""
  },
  beforeCreate: function() {
    Vue.component('ihris-template', { template: '<div>Loading...</div>' } )
  }
}

</script>
