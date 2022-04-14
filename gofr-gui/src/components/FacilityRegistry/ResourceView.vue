<template>
  <gofr-template :key="$route.path">
    Loading...
  </gofr-template>
</template>

<script>
// @ is an alias to /src

import Vue from 'vue'
import axios from 'axios'
let pageId
export default {
  name: "fhir-page-view",
  props: ['page', 'pageId'],
  data: function() {
    return {
    }
  },
  created: function() {
    this.getTemplate()
    pageId = this.pageId
  },
  methods: {
    getTemplate: function() {
      axios.get( "/config/page/"+this.page ).then(response => {
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
              "gofr-outcome": () => import( "@/components/gofr/gofr-outcome" )
            },
            template: '<div><gofr-outcome :issues="issues"></gofr-outcome></div>'
          } )
        } else {
          Vue.component('gofr-template', {
            name: 'gofr-template',
            data: function() {
              return {
                fhirId: pageId,
                isEdit: false,
                sectionMenu: data.data.sectionMenu,
                subFields: data.data.subFields,
                columns: data.data.columns,
                actions: data.data.actions,
                links: data.data.links,
                constraints: data.data.constraints
              }
            },
            components: {
              "gofr-page-title": () => import("@/components/gofr/gofr-page-title"),
              "gofr-resource": () => import("@/components/gofr/gofr-resource" ),
              "gofr-codesystem": () => import("@/components/gofr/gofr-codesystem" ),
              "gofr-section": () => import("@/components/gofr/gofr-section" ),
              "gofr-secondary": () => import("@/components/gofr/gofr-secondary" ),
              "gofr-array": () => import("@/components/gofr/gofr-array" ),
              "fhir-extension": () => import("@/components/fhir/fhir-extension" ),
              "fhir-reference": () => import("@/components/fhir/fhir-reference" ),
              "fhir-backbone-element": () => import("@/components/fhir/fhir-backbone-element" ),
              "fhir-string": () => import("@/components/fhir/fhir-string" ),
              "fhir-attachment": () => import("@/components/fhir/fhir-attachment" ),
              "fhir-human-name": () => import("@/components/fhir/fhir-human-name" ),
              "fhir-code": () => import("@/components/fhir/fhir-code" ),
              "fhir-date": () => import("@/components/fhir/fhir-date" ),
              'fhir-time': () => import('@/components/fhir/fhir-time'),
              "fhir-date-time": () => import("@/components/fhir/fhir-date-time" ),
              "fhir-period": () => import("@/components/fhir/fhir-period" ),
              "fhir-identifier": () => import("@/components/fhir/fhir-identifier" ),
              "fhir-contact-point": () => import("@/components/fhir/fhir-contact-point" ),
              "fhir-address": () => import("@/components/fhir/fhir-address" ),
              "fhir-codeable-concept": () => import("@/components/fhir/fhir-codeable-concept" ),
              "fhir-uri": () => import("@/components/fhir/fhir-uri" ),
              "fhir-boolean": () => import("@/components/fhir/fhir-boolean" ),
              "fhir-positive-int": () => import("@/components/fhir/fhir-positive-int" ),
              "fhir-unsigned-int": () => import("@/components/fhir/fhir-unsigned-int" ),
              "fhir-integer": () => import("@/components/fhir/fhir-integer" ),
              "fhir-coding": () => import("@/components/fhir/fhir-coding" ),
              "fhir-money": () => import("@/components/fhir/fhir-money" ),
              "fhir-decimal": () => import("@/components/fhir/fhir-decimal" )
            },
            template: data.template,
            methods: {
              setEdit: function(val) {
                this.isEdit = val
              }
            }
          } )
        }
        this.$forceUpdate()
      }).catch(err => {
        console.log(err)
        Vue.component('gofr-template', {template: '<div><h1>Error</h1><p>An error occurred trying to load this page</p>.</div>'})
        this.$forceUpdate()
      })
    }
  },
  components: {
  },
  beforeCreate: function() {
    Vue.component('gofr-template', { template: '<div>Loading...</div>' } )
  }
}

</script>
