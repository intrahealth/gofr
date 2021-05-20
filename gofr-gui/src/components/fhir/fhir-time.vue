<template>
  <ihris-element :edit="edit" :loading="false">
    <template #form>
     <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="displayValue"
            :label="label"
            prepend-inner-icon="mdi-calendar"
            readonly
            v-on="on"
            outlined
            hide-details="auto"
            :rules="rules"
            :error-messages="errors"
            dense
          >
            <template #label>{{label}} <span v-if="required" class="red--text font-weight-bold">*</span></template>
          </v-text-field>
        </template>
        <v-time-picker
          ref="picker"
          color="secondary"
          format="24hr"
          :landscape="$vuetify.breakpoint.smAndUp"
          v-model="displayValue"
          :disabled="disabled"
          @change="save"
        ></v-time-picker>

      </v-menu>
    </template>
    <template #header>
      {{label}}
    </template>
    <template #value>
      {{displayValue}}
    </template>
  </ihris-element>
</template>

<script>
import IhrisElement from "../ihris/ihris-element.vue"

export default {
  name: "fhir-date-time",
  props: ["field","min","max","base-min","base-max", "label", "slotProps", "path", "edit","sliceName",
    "minValueDateTime", "maxValueDateTime", "minValueQuantity", "maxValueQuantity", "displayType","readOnlyIfSet", "calendar",
    "constraints"],
  components: {
    IhrisElement
  },
  data: function() {
    return {
      value: null,
      etValue: null,
      menu: false,
      source: { path: "", data: {} },
      qField: "valueDateTime",
      pickerType: "date",
      disabled: false,
      errors: [],
      lockWatch: false,
      displayValue: ''
    }
  },
  created: function() {
    //console.log("CREATE DATETIME",this.field,this.slotProps)
    this.setupData()
  },
  computed: {
    index: function() {
      if ( this.slotProps && this.slotProps.input ) return this.slotProps.input.index
      else return undefined
    },
    required: function() {
      return (this.index || 0) < this.min
    },
    rules: function() {
      if ( this.required ) {
        return [ v => !!v || this.label+" is required" ]
      } else {
        return []
      }
    }
  },
  watch: {
    slotProps: {
      handler() {
        //console.log("WATCH DATETIME",this.field,this.path,this.slotProps)
        if ( !this.lockWatch ) {
          this.setupData()
        }
      },
      deep: true
    }
  },
  methods: {
    setupData() {
      if ( this.slotProps && this.slotProps.source ) {
        this.source = { path: this.slotProps.source.path+"."+this.field, data: {} }
        if ( this.slotProps.source.fromArray ) {
          this.source.data = this.slotProps.source.data
          this.value = this.source.data
          this.lockWatch = true
          //console.log("SET value to ", this.source.data, this.slotProps.input)
        } else {
          let expression = this.$fhirutils.pathFieldExpression( this.field )
          this.source.data = this.$fhirpath.evaluate( this.slotProps.source.data, expression )
          //console.log("STR FHIRPATH", this.slotProps.source.data, this.field)
          if ( this.source.data.length == 1 ) {
            this.value = this.source.data[0]
            this.lockWatch = true
          }
        }
        this.disabled = this.readOnlyIfSet && (!!this.value)
        //console.log(this.source)
      }
    },
    save (date) {
      this.errors = []
      this.$refs.menu.save(date)
    }
  }
}
</script>
