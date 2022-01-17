<template>
  <center>
    <v-alert
      border="left"
      colored-border
      color="deep-purple accent-4"
      elevation="2"
      max-width="700"
    >
      {{title}}
    </v-alert>
  </center>
</template>

<script>
export default {
  name: "gofr-page-title",
  props: ["title"]
}
</script>
