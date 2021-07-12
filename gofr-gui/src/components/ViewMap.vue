<template>
  <v-app>
    <FhirMap
      :accessToken="accessToken"
      :fhirServerUrl="fhirServerUrl"
      :options="options"
    />
  </v-app>
</template>

<script>
import FhirMap from "@terraframe/fhir-gis-widget/src/components/FhirMap.vue";

export default {
  name: "App",
  data: () => ({
    accessToken: 'pk.eyJ1IjoiYWxseXNoYWJhbjUiLCJhIjoiY2twbzFpODRtMDFkMTJwbWFvNXUza3hodCJ9.mhcv_KlLLtvR0x73E90WAw',
    fhirServerUrl: "http://localhost:8081/hapi54/fhir/DEFAULT",
    options: {
      "center": [
        8.521441,
        -11.84389
      ],
      "zoom": 3,
      "root": "cf12e355-a553-5875-b271-2dfb97b22355",
      "includeRoot": true,
      "contextServices": [],
      "searchParameters": [
        {
          "key": "physicalType",
          "system": false,
          "label": "Physical Type",
          "placeholder": "Physical Type..",
          "options": []
        }
      ],
      "filters": []
    }
  }),

  components: {
    FhirMap,
  },
};
</script>

<style>
@import "~mapbox-gl/dist/mapbox-gl.css";
@import "~@terraframe/fhir-gis-widget/dist/fhir-gis-widget.css";

html {
  overflow: hidden;
}

.map-view-port {
  width: 100%;
  height: calc(100vh - 24px);
}
</style>