<template>
  <gofr-element :edit="edit" :loading="loading">
    <template #form>
      <v-select
        :loading="loading"
        :label="display"
        v-model="valueCode"
        :items="items"
        outlined
        hide-details="auto"
        :error-messages="errors"
        item-text="display"
        item-value="code"
        :disabled="disabled"
        :rules="rules"
        dense
        @change="errors = []"
      >
        <template #label>{{display}} <span v-if="required" class="red--text font-weight-bold">*</span></template>
      </v-select>
    </template>
    <template #header>
      {{display}}
    </template>
    <template #value>
      {{valueDisplay || value.display || ""}}
    </template>
  </gofr-element>
</template>

<script>
import GofrElement from "../gofr/gofr-element.vue"

/*
const itemSort = (a,b) => {
  return (a.display === b.display ? (a.code === b.code ? 0 : (a.code < b.code ? -1: 1)) : (a.display < b.display ? -1 : 1) )
}
*/
export default {
  name: "fhir-coding",
  props: ["field","label","sliceName","targetprofile","min","max","base-min","base-max","slotProps","path","binding","edit","readOnlyIfSet",
    "constraints"],
  components: {
    GofrElement
  },
  data: function() {
    return {
      value: { system: "", code: "", display: "" },
      valueCode: "",
      valueDisplay: "",
      loading: true,
      errors: [],
      //error: false,
      items: [],
      source: { path: "", data: {}, binding: this.binding },
      disabled: false,
      lockWatch: false
    }
  },
  created: function() {
    this.setupData()
  },
  watch: {
    slotProps: {
      handler() {
        //console.log("WATCH CODING",this.path,this.slotProps)
        if ( !this.lockWatch ) {
          this.setupData()
        }
      },
      deep: true
    },
    valueCode: function( code ) {
      if ( this.items ) {
        let findValue = this.items.find( item => item.code === code )
        if ( findValue ) {
          this.value = findValue
        }
      }
      if ( this.value.system && this.value.code ) {
        this.$fhirutils.codeLookup( this.value.system, this.value.code, this.binding || this.source.binding ).then( display => {
          this.valueDisplay = display
        } )
      }
    }
  },
  methods: {
    setupData: function() {
      if ( this.slotProps && this.slotProps.source ) {
        this.source = { path: this.slotProps.source.path+"."+this.field, data: {},
          binding: this.binding || this.slotProps.source.binding }
        if ( this.slotProps.source.fromArray ) {
          this.source.data = this.slotProps.source.data
          // Need to see if this works and figure out what it needs to be
          if ( this.source.data ) {
            this.value = this.source.data
            this.valueCode = this.value.code
            this.lockWatch = true
            //console.log("set",this.value,this.valueCode)
          }
        } else {
          let expression = this.$fhirutils.pathFieldExpression( this.field )
          this.source.data = this.$fhirpath.evaluate( this.slotProps.source.data, expression )
          //console.log("FPATH info",this.path,this.slotProps)
          //console.log("FPATH setting value to",this.field,this.source.data[0],expression,this.slotProps.source.data)
          if ( this.source.data[0] ) {
            this.value = this.source.data[0]
            this.valueCode = this.value.code
            this.lockWatch = true
          }
        }
        this.disabled = this.readOnlyIfSet && (!!this.valueCode)
      }
      let binding = this.binding || this.slotProps.source.binding
      this.$fhirutils.expand( binding ).then( items => {
        this.items = items
        this.loading = false
      } ).catch( err => {
        console.log(err)
        //this.error = true
        this.errors = err.message
        this.loading = false
      } )
    }
  },
  computed: {
    index: function() {
      if ( this.slotProps && this.slotProps.input ) return this.slotProps.input.index
      else return undefined
    },
    display: function() {
      if ( this.slotProps && this.slotProps.input) return this.slotProps.input.label
      else return this.label
    },
    required: function() {
      return (this.index || 0) < this.min
    },
    rules: function() {
      if ( this.required ) {
        return [ v => !!v || this.display+" is required" ]
      } else {
        return []
      }
    }
  }
}
</script>
