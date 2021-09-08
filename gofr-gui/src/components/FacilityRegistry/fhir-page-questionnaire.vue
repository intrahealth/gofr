<template>
  <ihris-template>
    Loading...
  </ihris-template>
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
          Vue.component('ihris-template', {
            name: 'ihris-template',
            data: function () {
              return {
                issues: data.issue
              }
            },
            components: {
              'ihris-outcome': () => import('@/components/ihris/ihris-outcome')
            },
            template: '<div><ihris-outcome :issues="issues"></ihris-outcome></div>'
          })
        } else {
          Vue.component('ihris-template', {
            name: 'ihris-template',
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
              'ihris-questionnaire': () => import('@/components/ihris/ihris-questionnaire'),
              'ihris-questionnaire-section': () => import('@/components/ihris/ihris-questionnaire-section'),
              'ihris-questionnaire-group': () => import('@/components/ihris/ihris-questionnaire-group'),
              'ihris-hidden': () => import('@/components/ihris/ihris-hidden'),
              'ihris-array': () => import('@/components/ihris/ihris-array'),
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
  beforeCreate: function () {
    questionnaire = this.$route.params.questionnaire
    page = this.$route.params.page
    Vue.component('ihris-template', { template: '<div>Loading...</div>' })
  }
}
</script>
