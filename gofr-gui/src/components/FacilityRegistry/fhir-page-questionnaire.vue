<template>
  <gofr-template>
    Loading...
  </gofr-template>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
var questionnaire
var page

export default {
  name: 'fhir-page',
  data: function () {
    return {
    }
  },
  created: function () {
    this.getTemplate()
  },
  methods: {
    getTemplate: function () {
      axios.get('/config/questionnaire/' + questionnaire).then((response) => {
        let data = response.data
        if (data.resourceType === 'OperationOutcome') {
          Vue.component('gofr-template', {
            name: 'gofr-template',
            data: function () {
              return {
                issues: data.issue
              }
            },
            components: {
              'gofr-outcome': () => import('@/components/gofr/gofr-outcome')
            },
            template: '<div><gofr-outcome :issues="issues"></gofr-outcome></div>'
          })
        } else {
          Vue.component('gofr-template', {
            name: 'gofr-template',
            data: function () {
              return {
                viewPage: page,
                isEdit: true,
                sectionMenu: data.data.sectionMenu,
                hidden: data.data.hidden,
                constraints: data.data.constraints
              }
            },
            components: {
              'gofr-questionnaire': () => import('@/components/gofr/gofr-questionnaire'),
              'gofr-page-title': () => import('@/components/gofr/gofr-page-title'),
              'gofr-questionnaire-section': () => import('@/components/gofr/gofr-questionnaire-section'),
              'gofr-questionnaire-group': () => import('@/components/gofr/gofr-questionnaire-group'),
              'gofr-hidden': () => import('@/components/gofr/gofr-hidden'),
              'gofr-array': () => import('@/components/gofr/gofr-array'),
              'fhir-reference': () => import('@/components/fhir/fhir-reference'),
              'fhir-string': () => import('@/components/fhir/fhir-string'),
              'fhir-text': () => import('@/components/fhir/fhir-text'),
              'fhir-date': () => import('@/components/fhir/fhir-date'),
              'fhir-date-time': () => import('@/components/fhir/fhir-date-time'),
              'fhir-time': () => import('@/components/fhir/fhir-time'),
              'fhir-boolean': () => import('@/components/fhir/fhir-boolean'),
              'fhir-integer': () => import('@/components/fhir/fhir-integer'),
              'fhir-choice': () => import('@/components/fhir/fhir-choice'),
              'fhir-attachment': () => import('@/components/fhir/fhir-attachment')
            },
            template: data.template
          })
        }
        this.$forceUpdate()
      }).catch(err => {
        if (err.response && err.response.data.resourceType === "OperationOutcome" ) {
          Vue.component( 'gofr-template', {
            name: 'gofr-template',
            data: function() {
              return {
                issues: err.response.data.issue
              }
            },
            components: {
              "gofr-outcome": () => import( "@/components/gofr/gofr-outcome" )
            },
            template: '<div><gofr-outcome :issues="issues"></gofr-outcome></div>'
          } )
        } else {
          Vue.component('gofr-template', {template: '<div><h1>Error</h1><p>An error occurred trying to load this page</p>.</div>'})
        }
        console.log(err)
        this.$forceUpdate()
      })
    }
  },
  beforeCreate: function () {
    questionnaire = this.$route.params.questionnaire
    page = this.$route.params.page
    Vue.component('gofr-template', { template: '<div>Loading...</div>' })
  }
}
</script>
