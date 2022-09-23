<template>
  <v-container class="my-3">
    <v-form
      ref="form"
      v-model="valid"
    >
      <slot :source="source"></slot>
      <v-overlay :value="overlay">
        <v-progress-circular
          size="50"
          color="primary"
          indeterminate
          ></v-progress-circular>
      </v-overlay>

      <v-navigation-drawer
        app
        right
        permanent
        clipped
        class="primary darken-1 white--text"
        style="z-index: 3;"
        width="350"
        >
        <v-list class="white--text">
          <v-list-item>
            <template v-if="!edit">
              <v-btn small dark class="secondary" @click="$emit('set-edit', !edit)">
                <v-icon left light>mdi-pencil</v-icon>
                <span>{{ $t(`App.hardcoded-texts.Edit`) }}</span>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                small
                @click="processRequest('approved')"
                color="success"
                v-if="$store.state.requestResourceUpdateData.requestAction && hasPermission"
                :disabled="currentRequestStatus === 'approved' || currentRequestStatus === ''"
              >
                <v-icon left>mdi-check-circle</v-icon> {{ $t(`App.hardcoded-texts.Approve`) }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                small
                @click="processRequest('rejected')"
                color="error"
                v-if="$store.state.requestResourceUpdateData.requestAction && hasPermission"
                :disabled="currentRequestStatus !== 'pending'"
              >
                <v-icon left>mdi-cancel</v-icon> {{ $t(`App.hardcoded-texts.Reject`) }}
              </v-btn>
            </template>
            <v-btn small v-else dark class="secondary" @click="$emit('set-edit', !edit)">
              <v-icon light>mdi-pencil-off</v-icon>
              <span>{{ $t(`App.hardcoded-texts.Cancel`) }}</span>
            </v-btn>
            <v-spacer></v-spacer>
            <template v-if="edit && $store.state.searchAction !== 'send-update-request'">
              <v-btn small v-if="valid" dark class="success darken-1" @click="processFHIR()" :disabled="!valid">
                <v-icon light>mdi-content-save</v-icon>
                <span>{{ $t(`App.hardcoded-texts.Save`) }}</span>
              </v-btn>
              <v-btn small v-else dark class="warning" @click="$refs.form.validate()">
                <v-icon light>mdi-content-save</v-icon>
                <span>{{ $t(`App.hardcoded-texts.Save`) }}</span>
              </v-btn>
            </template>
            <template v-else-if="edit && $store.state.searchAction === 'send-update-request'">
              <v-btn
                small
                @click="createUpdateRequest"
                color="success"
              >
                <v-icon left>mdi-check-circle</v-icon> {{ $t(`App.hardcoded-texts.Save`) }}
              </v-btn>
            </template>
          </v-list-item>
          <v-divider color="white"></v-divider>
          <template v-if="!edit && links && links.length">
            <v-list-item v-for="(link,idx) in links" :key="link.url">
              <v-btn :key="link.url" :text="!link.button" :to="getLinkUrl(link)" class="primary">
                <v-icon light v-if="link.icon">{{link.icon}}</v-icon>
                {{ linktext[idx]  }}
              </v-btn>
            </v-list-item>
          </template>
          <v-subheader v-if="sectionMenu" class="white--text"><h2>Sections</h2></v-subheader>
          <v-list-item v-for="section in sectionMenu" :href="'#section-'+section.name" :key="section.name">
            <v-list-item-content class="white--text" v-if="!edit || !section.secondary">
              <v-list-item-title class="text-uppercase">
                <h4>{{ $t(`App.fhir-resources-texts.${section.title}`) }}</h4>
              </v-list-item-title>
              <v-list-item-subtitle class="white--text">
                {{ $t(`App.fhir-resources-texts.${section.desc}`) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

      </v-navigation-drawer>
    </v-form>
  </v-container>

</template>

<script>
import axios from 'axios'
export default {
  name: "gofr-resource",
  props: ["title","field","fhirId","page","profile","section-menu","edit","links","constraints", "partition" ],
  data: function() {
    return {
      fhir: {},
      orig: {},
      valid: true,
      source: { data: {}, path: "" },
      loading: false,
      overlay: false,
      isEdit: false,
      linktext: [ ],
      advancedValid: true,
      currentRequestStatus: ''
    }
  },
  created: function() {
    if ( this.fhirId ) {
      this.loading = true
      let partition = this.$store.state.config.userConfig.FRDatasource
      if(this.partition) {
        partition = this.partition
      }
      axios.get( "/fhir/" + partition + "/" + this.field+"/"+this.fhirId ).then(response => {
        let data = response.data
        this.orig = data
        this.source = { data: data, path: this.field }
        this.setLinkText()
        this.loading = false
        if(data.extension) {
          for(let ext of data.extension) {
            if(ext.url === "http://gofr.org/fhir/StructureDefinition/request-status") {
              this.currentRequestStatus = ext.valueCoding.code
            }
          }
        }
      }).catch(err=> {
        console.log(this.field,this.fhirId,err)
      })
    } else if ( this.$route.query ) {
      let presets = {
        resourceType: this.field
      }
      let hasPresets = false
      for( let path of Object.keys( this.$route.query ) ) {
        if ( path.startsWith( this.field +"." ) ) {
          hasPresets = true
          let elements = path.substring( this.field.length+1 ).split('.')
          let last = elements.pop()
          let current = presets
          for( let element of elements ) {
            if ( element.includes('[') ) {
              try {
                let parts = element.split('[')
                let name = parts[0]
                let idx = parts[1].slice(0,-1)
                if ( !current.hasOwnProperty(name) ) {
                  current[name] = []
                }
                if ( idx ) {
                  let next = {}
                  current[name][parseInt(idx)] = next
                  current = next
                } else {
                  let next = {}
                  current[name].push( next )
                  current = next
                }
              } catch( err ) {
                console.log("Unable to process",path)
                continue
              }
            } else {
              if ( !current.hasOwnProperty(element) ) {
                current[element] = {}
                current = current[element]
              }
            }
          }
          if ( last.includes('[') ) {
            try {
              let parts = last.split('[')
              let name = parts[0]
              let idx = parts[1].slice(0,-1)
              if ( !current.hasOwnProperty(name) ) {
                current[name] = []
              }
              if ( idx ) {
                current[name][parseInt(idx)] = this.$route.query[path]
              } else {
                current[name].push( this.$route.query[path] )
              }

            } catch( err ) {
              console.log("Unable to process",path)
              continue
            }
          } else {
            current[last] = this.$route.query[path]
          }
        }
      }
      if ( hasPresets ) {
        this.source = { data: presets, path: this.field }
      }
    }
  },
  computed: {
    hasFhirId: function() {
      if ( this.fhirId == '' ) {
        return false
      } else if ( !this.fhirId ) {
        return false
      } else {
        return true
      }
    },
    hasPermission() {
      if(this.$store.state.requestResourceUpdateData.requestAction === 'process-update-request' && this.$tasksVerification.hasPermissionByName('special', 'custom', 'process-update-facility-request') ||
        this.$store.state.requestResourceUpdateData.requestAction === 'process-add-request' && this.$tasksVerification.hasPermissionByName('special', 'custom', 'process-add-facility-request')
      ) {
        return true
      }
      return false
    }
  },
  methods: {
    async createUpdateRequest() {
      this.$refs.form.validate()
      if ( !this.valid ) return
      this.fhir = {
        resourceType: this.field,
        meta: {
          profile: [ "http://gofr.org/fhir/StructureDefinition/gofr-facility-update-request" ]
        }
      }
      try {
        await this.processChildren( this.field, this.fhir, this.$children )
      } catch( err ) {
        this.advancedValid = false
        console.log(err)
      }
      if ( !this.advancedValid ) {
        this.overlay = false
        this.loading = false
        this.$store.commit('setMessage', { type: 'error', text: 'There were errors on the form.' })
        return
      }
      if(!this.fhir.extension) {
        this.fhir.extension = []
      }
      this.fhir.extension.push({
        url: "http://gofr.org/fhir/StructureDefinition/request-status",
        valueCoding: {
          system: "http://gofr.org/fhir/StructureDefinition/request-status-codesystem",
          code: "pending",
          display: "Pending"
        }
      }, {
        "url": "http://gofr.org/fhir/StructureDefinition/request-affected-resource",
        "valueReference": {
          "reference": "Location/" + this.fhirId
        }
      })
      let url = "/fhir/" + this.$store.state.config.userConfig.FRDatasource + "/" + this.field
      let opts = {
        method: "POST",
        url,
        headers: {
          "Content-Type": "application/json"
        },
        data: this.fhir
      }
      this.overlay = true
      this.loading = true
      axios( opts ).then(() => {
        this.overlay = false
        this.loading = false
        this.$store.state.searchAction = ""
        this.$store.commit('setMessage', { type: 'info', text: 'Request submitted successfully.' })
        this.$router.go(-1)
      } ).catch((err) => {
        this.overlay = false
        this.loading = false
        this.$store.commit('setMessage', { type: 'error', text: 'Request submition failed.' })
        console.error(err);
      })
    },
    processRequest(newStatus) {
      let url
      if(this.$store.state.requestResourceUpdateData.requestAction === 'process-add-request') {
        url = "/facilitiesRequests/add"
      } else if(this.$store.state.requestResourceUpdateData.requestAction === 'process-update-request') {
        url = "/facilitiesRequests/update"
      }
      let opts = {
        method: "POST",
        url,
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          resource: this.source.data,
          requestStatus: newStatus,
          requestUpdatingResource: this.$store.state.requestResourceUpdateData.requestUpdatingResource
        }
      }
      this.overlay = true
      this.loading = true
      axios( opts ).then(() => {
        this.overlay = false
        this.loading = false
        this.$store.state.requestResourceUpdateData = {
          requestAction: '',
          requestUpdatingResource: ''
        }
        this.$store.commit('setMessage', { type: 'info', text: 'Request ' + newStatus + ' successfully.' })
        this.$router.go(-1)
      } ).catch((err) => {
        this.overlay = false
        this.loading = false
        this.$store.commit('setMessage', { type: 'error', text: 'Failed to ' + newStatus + ' request.' })
        console.error(err);
      })
    },
    getLinkField: function(field) {
      let content = this.$fhirpath.evaluate( this.source.data, field )
      if ( content ) {
        return content[0]
      } else {
        return false
      }
    },
    getLinkUrl: function(link) {
      let field
      if ( link.field ) {
        field = this.getLinkField(link.field)
      }
      if ( field ) {
        if ( field.includes('/') ) {
          let ref = field.split('/')
          field = ref[1]
        }
        return link.url.replace("FIELD",field)
      } else {
        return link.url
      }
    },
    setLinkText: function() {
      for ( let idx in this.links ) {
        let link = this.links[idx]
        if ( link.text ) {
          this.linktext[idx] = link.text
        } else if ( link.field ) {
          let field = this.getLinkField(link.field)
          if ( field ) {
            this.$fhirutils.lookup(field).then( display => {
              this.$set( this.linktext, idx, display )
            } )
          }
        }
      }
    },
    processChildren: async function( parent, obj, children ) {
      for( let child of children ) {
        let fullField = parent

        let next = obj

        if ( child.field && !child.fieldType /* ignore arrays */ ) {
          let field
          if ( child.sliceName ) {
            if ( child.field.startsWith("value[x]") ) {
              field = child.field.substring(9)
              fullField += "." + field
            } else {
              field = child.field.replace(":"+child.sliceName, "")
              fullField += "." + field
            }
          } else {
            field = child.field
            fullField += "."+field
          }
          if ( child.max !== "1" || child.baseMax !== "1" ) {
            if ( !obj.hasOwnProperty(field) ) {
              next[field] = []
            }
          } else {
            next[field] = {}
          }
          if ( child.hasOwnProperty("value") ) {
            if ( Array.isArray( next[field] ) ) {
              next[field].push( child.value )
            } else {
              next[field] = child.value
            }
            next = next[field]
          } else {
            if ( Array.isArray( next[field] ) ) {
              let sub = {}
              if ( child.profile ) {
                sub.url = child.profile
              } else if ( field === "extension" && child.sliceName ) {
                sub.url = child.sliceName
              }
              next[field].push( sub )
              next = sub
            } else {
              next = next[field]
            }
          }
        }
        if ( child.$children ) {
          try {
            await this.processChildren( fullField, next, child.$children )
          } catch( err ) {
            this.advancedValid = false
            console.log(err)
          }
        }
        if ( child.constraints ) {
          child.errors = []
          try {
            this.advancedValid = this.advancedValid && await this.$fhirutils.checkConstraints( child.constraints,
              this.constraints, next, child.errors, this.fhirId )
          } catch( err ) {
            this.advancedValid = false
            child.errors.push("An unknown error occurred.")
            console.log(err)
          }
        }

      }

    },
    processFHIR: async function() {
      this.$refs.form.validate()
      if ( !this.valid ) return
      this.advancedValid = true
      this.overlay = true
      this.loading = true

      this.fhir = {
        resourceType: this.field,
        meta: {
          profile: [ this.profile ]
        }
      }
      try {
        await this.processChildren( this.field, this.fhir, this.$children )
      } catch( err ) {
        this.advancedValid = false
        console.log(err)
      }
      if ( !this.advancedValid ) {
        this.overlay = false
        this.loading = false
        this.$store.commit('setMessage', { type: 'error', text: 'There were errors on the form.' })
        return
      }
      let partition = this.$store.state.config.userConfig.FRDatasource
      if(this.partition) {
        partition = this.partition
      }
      let url = "/fhir/" + partition + "/" + this.field
      let opts = {
        method: "POST",
        url,
        headers: {
          "Content-Type": "application/json"
        }
      }
      if ( this.fhirId ) {
        this.fhir.id = this.fhirId
        url += "/" + this.fhirId
        opts.method = "PUT"
        opts.url = url
      }
      opts.data = this.fhir
      axios( opts ).then(response => {
        let data = response.data
        this.overlay = false
        this.loading = false
        if ( this.fhirId ) {
          this.$emit('set-edit', false)
        } else {
          this.$router.push({ name:"ResourceView", params: {page: this.page, id: data.id } })
        }
      } )
    }
  },
  beforeDestroy() {
    this.$store.state.searchAction = ""
    this.$store.state.requestResourceUpdateData = {
      requestAction: '',
      requestUpdatingResource: ''
    }
  }
}



</script>
