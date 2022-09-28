<template>
  <gofr-template :key="$route.path">
    Loading...
  </gofr-template>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'

export default {
  name: "fhir-page-search",
  props: ['page', 'requestAction'],
  data: function() {
    return {
    }
  },
  created: function() {
    this.getTemplate()
  },
  methods: {
    getTemplate: function() {
      axios.get( "/config/page/"+this.page+"/search" ).then(response => {
        let data = response.data
        if ( data.resourceType === "OperationOutcome" ) {
          Vue.component( 'gofr-template', {
            name: 'gofr-template',
            data: function() {
              return {
                issues: data.issue
              }
            },
            components: {
              "gofr-outcome": () => import("@/components/gofr/gofr-outcome" )
            },
            template: '<div><gofr-outcome :issues="issues"></gofr-outcome></div>'
          } )
        } else {
          Vue.component( 'gofr-template', {
            name: 'gofr-template',
            data: function() {
              return {
                fields: data.data.fields,
                addLink: data.data.addLink,
                terms: {},
                requestAction: this.$route.params.requestAction,
                searchAction: this.$route.query.searchAction
              }
            },
            components: {
              "gofr-search": () => import("@/components/gofr/gofr-search" ),
              "gofr-search-code": () => import("@/components/gofr/gofr-search-code" ),
              "gofr-search-string-term": () => import("@/components/gofr/gofr-search-string-term" ),
              "gofr-search-reference-term": () => import("@/components/gofr/gofr-search-reference-term" )
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
        Vue.component( 'gofr-template', {template: '<div><h1>Error</h1><p>An error occurred trying to load this page</p>.</div>'})
        this.$forceUpdate()
      })
    }
  },
  beforeCreate: function() {
    Vue.component('gofr-template', { template: '<div>Loading...</div>' } )
  }
}

</script>
