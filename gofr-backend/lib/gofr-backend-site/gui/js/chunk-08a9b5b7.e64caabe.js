(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-08a9b5b7"],{8142:function(t,e,s){"use strict";s.r(e);var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("gofr-complex-card",{attrs:{complexField:t.field,slotProps:t.slotProps,label:t.$t("App.fhir-resources-texts."+t.label),errors:t.errors},scopedSlots:t._u([{key:"default",fn:function(e){return[t._t("default",null,{source:e.source})]}}],null,!0)})},o=[],a=s("d2b9"),l={name:"fhir-backbone-element",props:["field","slotProps","sliceName","min","max","base-min","base-max","label","path","edit","constraints"],data:function(){return{errors:[]}},components:{GofrComplexCard:a["a"]}},i=l,n=s("2877"),u=Object(n["a"])(i,r,o,!1,null,null,null);e["default"]=u.exports},d2b9:function(t,e,s){"use strict";var r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("v-card",[s("v-card-subtitle",{staticClass:"primary--text text-uppercase font-weight-bold"},[t._v(" "+t._s(t.$t("App.fhir-resources-texts."+t.display))+" ")]),t._l(t.errors,(function(e,r){return s("v-card-text",{key:r,staticClass:"error white--text font-weight-bold"},[t._v(" "+t._s(e)+" ")])})),s("v-card-text",[t._t("default",null,{source:t.source})],2)],2)},o=[],a={name:"gofr-complex-card",props:["complexField","slotProps","label","errors"],data:function(){return{source:{path:"",data:{}}}},created:function(){this.setupData()},watch:{slotProps:{handler:function(){this.setupData()},deep:!0}},methods:{setupData:function(){if(this.slotProps&&this.slotProps.source)if(this.source={path:this.slotProps.source.path+"."+this.complexField,data:{}},this.slotProps.source.fromArray)this.source.data=this.slotProps.source.data;else{var t=this.$fhirutils.pathFieldExpression(this.complexField);this.source.data=this.$fhirpath.evaluate(this.slotProps.source.data,t)}}},computed:{display:function(){return this.slotProps&&this.slotProps.input?this.slotProps.input.label:this.label}}},l=a,i=s("2877"),n=s("6544"),u=s.n(n),c=s("b0af"),p=s("99d9"),d=Object(i["a"])(l,r,o,!1,null,null,null);e["a"]=d.exports;u()(d,{VCard:c["a"],VCardSubtitle:p["b"],VCardText:p["c"]})}}]);
//# sourceMappingURL=chunk-08a9b5b7.e64caabe.js.map