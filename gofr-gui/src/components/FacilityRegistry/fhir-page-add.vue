<template>
  <ihris-template :key="$route.path">
    Loading...
  </ihris-template>
</template>

<script>
// @ is an alias to /src

import Vue from 'vue'
import axios from 'axios'

export default {
  name: "fhir-page-add",
  props: ['page'],
  data: function() {
    return {
    }
  },
  created: function() {
    this.getTemplate()
  },
  methods: {
    getTemplate: function() {
      axios.get( "/config/page/"+this.page ).then(response => {
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
              "ihris-outcome": () => import(/* webpackChunkName: "fhir-outcome" */ "@/components/ihris/ihris-outcome" )
            },
            template: '<div><ihris-outcome :issues="issues"></ihris-outcome></div>'
          } )
        } else {
          Vue.component('ihris-template', {
            name: 'ihris-template',
            data: function() {
              return {
                isEdit: true,
                fhirId: undefined,
                sectionMenu: data.data.sectionMenu,
                subFields: data.data.subFields,
                columns: data.data.columns,
                actions: data.data.actions,
                links: data.data.links,
                constraints: data.data.constraints
              }
            },
            components: {
              "ihris-resource": () => import("@/components/ihris/ihris-resource" ),
              "ihris-codesystem": () => import("@/components/ihris/ihris-codesystem" ),
              "ihris-section": () => import("@/components/ihris/ihris-section" ),
              "ihris-secondary": () => import("@/components/ihris/ihris-secondary" ),
              "ihris-array": () => import("@/components/ihris/ihris-array" ),
              "fhir-extension": () => import("@/components/fhir/fhir-extension" ),
              "fhir-reference": () => import("@/components/fhir/fhir-reference" ),
              "fhir-backbone-element": () => import("@/components/fhir/fhir-backbone-element" ),
              "fhir-string": () => import("@/components/fhir/fhir-string" ),
              "fhir-attachment": () => import("@/components/fhir/fhir-attachment" ),
              "fhir-human-name": () => import("@/components/fhir/fhir-human-name" ),
              "fhir-code": () => import("@/components/fhir/fhir-code" ),
              "fhir-date": () => import("@/components/fhir/fhir-date" ),
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
              "fhir-decimal": () => import("@/components/fhir/fhir-decimal" ),
              "fhir-time": () => import("@/components/fhir/fhir-time" )
            },
            template: data.template
          } )
        }
        this.$forceUpdate()
      }).catch(err => {
        if (err.response && err.response.data.resourceType === "OperationOutcome" ) {
          Vue.component( 'ihris-template', {
            name: 'ihris-template',
            data: function() {
              return {
                issues: err.response.data.issue
              }
            },
            components: {
              "ihris-outcome": () => import( "@/components/ihris/ihris-outcome" )
            },
            template: '<div><ihris-outcome :issues="issues"></ihris-outcome></div>'
          } )
        } else {
          Vue.component('ihris-template', {template: '<div><h1>Error</h1><p>An error occurred trying to load this page</p>.</div>'})
        }
        console.log(err)
        this.$forceUpdate()
      })
    }
  },
  components: {
  },
  beforeCreate: function() {
    Vue.component('ihris-template', { template: '<div>Loading...</div>' } )
  }
}

</script>
