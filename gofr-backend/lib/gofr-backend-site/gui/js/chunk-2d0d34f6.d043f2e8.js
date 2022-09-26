(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d0d34f6"],{"5be8":function(t,e,i){"use strict";i.r(e);var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("v-container",{staticClass:"my-3"},[t._t("default",null,{source:t.source}),i("v-overlay",{attrs:{value:t.overlay}},[i("v-progress-circular",{attrs:{size:"50",color:"primary",indeterminate:""}})],1),i("v-navigation-drawer",{staticClass:"primary darken-1 white--text",staticStyle:{"z-index":"3"},attrs:{app:"",right:"",permanent:"",clipped:""}},[i("v-list",{staticClass:"white--text"},[i("v-list-item",[t.edit?i("v-btn",{staticClass:"secondary",attrs:{dark:""},on:{click:function(e){t.fhirId?t.$router.go(0):t.$router.go(-1)}}},[i("v-icon",{attrs:{light:""}},[t._v("mdi-pencil-off")]),i("span",[t._v(t._s(t.$t("App.hardcoded-texts.Cancel")))])],1):i("v-btn",{staticClass:"secondary",attrs:{dark:""},on:{click:function(e){return t.$emit("set-edit",!t.edit)}}},[i("v-icon",{attrs:{light:""}},[t._v("mdi-pencil")]),i("span",[t._v(t._s(t.$t("App.hardcoded-texts.Edit")))])],1),i("v-spacer"),t.edit?i("v-btn",{staticClass:"success darken-1",attrs:{dark:""},on:{click:function(e){return t.processFHIR()}}},[i("v-icon",{attrs:{light:""}},[t._v("mdi-content-save")]),i("span",[t._v(t._s(t.$t("App.hardcoded-texts.Save")))])],1):t._e()],1),i("v-divider",{attrs:{color:"white"}}),i("v-subheader",{staticClass:"white--text"},[i("h2",[t._v("Sections")])]),t._l(t.sectionMenu,(function(e){return i("v-list-item",{key:e.name,attrs:{href:"#section-"+e.name}},[t.edit&&e.secondary?t._e():i("v-list-item-content",{staticClass:"white--text"},[i("v-list-item-title",{staticClass:"text-uppercase"},[i("h4",[t._v(t._s(t.$t("App.fhir-resources-texts."+e.title)))])]),i("v-list-item-subtitle",{staticClass:"white--text"},[t._v(t._s(t.$t("App.fhir-resources-texts."+e.desc)))])],1)],1)}))],2)],1)],2)},r=[],s=i("b85c"),n=(i("fb6a"),i("7db0"),i("b64b"),i("caad"),i("ac1f"),i("5319"),i("159b"),i("2ca0"),i("bc3a")),o=i.n(n),c={name:"gofr-codesystem",props:["title","field","fhir-id","page","profile","section-menu","edit"],data:function(){return{fhir:{},source:{data:{},path:""},loading:!1,overlay:!1,isEdit:!1}},created:function(){var t=this;if(this.fhirId){this.loading=!0;var e=this.profile.substring(this.profile.lastIndexOf("/")+1);o.a.get("/fhir/DEFAULT/"+this.field+"/"+e).then((function(e){var i=e.data,a={};if(i.property){var r,n=Object(s["a"])(i.property);try{for(n.s();!(r=n.n()).done;){var o=r.value;a[o.code]="value"+o.type.charAt(0).toUpperCase()+o.type.slice(1)}}catch(f){n.e(f)}finally{n.f()}}var c=i.concept.find((function(e){return e.code===t.fhirId}));if(c&&c.property){var l,d=Object(s["a"])(c.property);try{for(d.s();!(l=d.n()).done;){var h=l.value;c[h.code]=h[a[h.code]]}}catch(f){d.e(f)}finally{d.f()}delete c.property}t.source={data:c,path:t.field},t.loading=!1})).catch((function(e){t.loading=!1,console.log(t.field,t.fhirId,e)}))}},computed:{hasFhirId:function(){return""==this.fhirId?(console.log("blank"),!1):this.fhirId?(console.log("fhirid else"),!0):(console.log("fhirid is falsy"),!1)}},methods:{processFHIR:function(){var t=this;this.overlay=!0,this.loading=!0,this.fhir={},d(this.field,this.fhir,this.$children);var e=this.profile.substring(this.profile.lastIndexOf("/")+1),i="/fhir/DEFAULT/"+this.field+"/"+e,a={method:"PATCH",headers:{"Content-Type":"application/fhir+json"},redirect:"manual"};i+="/"+this.fhir.code;for(var r=["code","display","definition","property"],s=0,n=Object.keys(this.fhir);s<n.length;s++){var c=n[s];r.includes(c)||delete this.fhir[c]}a.body=JSON.stringify(this.fhir),console.log("SAVE",i,this.fhir),o.a.get(i,a).then((function(){t.overlay=!1,t.loading=!1,t.fhirId?t.$router.go(0):t.$router.push({name:"ResourceView",params:{page:t.page,id:t.fhir.code}})})).catch((function(t){console.log("FAILED TO SAVE",i,t)}))}}},l=function(t){var e="value"+t.substring(4);return e.replace(/(-[a-z])/gi,(function(t){return t.toUpperCase().replace("-","")}))},d=function t(e,i,a){a.forEach((function(a){var r=e,s=i;if(a.field&&!a.fieldType){var n;if(a.sliceName?a.field.startsWith("value[x]")?(n=a.field.substring(9),r+="."+n):(n=a.field.replace(":"+a.sliceName,""),r+="."+n):(n=a.field,r+="."+n),"1"!==a.max||"1"!==a.baseMax?i.hasOwnProperty(n)||(s[n]=[]):s[n]={},a.hasOwnProperty("value"))if(a.path.startsWith("CodeSystem.property.")){s.property||(s.property=[]);var o={code:n},c=l(a.$vnode.componentOptions.tag);a.value&&(!a.value.hasOwnProperty("system")||(a.value.code||a.value.value))&&(o[c]=a.value,s.property.push(o))}else s[n]=a.value;s=s[n]}a.$children&&t(r,s,a.$children)}))},h=c,f=i("2877"),p=i("6544"),u=i.n(p),v=i("8336"),y=i("a523"),g=i("ce7e"),m=i("132d"),b=i("8860"),_=i("da13"),C=i("5d23"),w=i("f774"),x=i("a797"),I=i("490a"),V=i("2fa4"),$=i("e0c7"),k=Object(f["a"])(h,a,r,!1,null,null,null);e["default"]=k.exports;u()(k,{VBtn:v["a"],VContainer:y["a"],VDivider:g["a"],VIcon:m["a"],VList:b["a"],VListItem:_["a"],VListItemContent:C["a"],VListItemSubtitle:C["b"],VListItemTitle:C["c"],VNavigationDrawer:w["a"],VOverlay:x["a"],VProgressCircular:I["a"],VSpacer:V["a"],VSubheader:$["a"]})}}]);
//# sourceMappingURL=chunk-2d0d34f6.d043f2e8.js.map