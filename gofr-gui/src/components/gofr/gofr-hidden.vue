<template>
  <div class="d-none">
      <v-text-field readonly v-model="hiddenValue" hide-details dense disabled>
      </v-text-field>
  </div>
</template>

<script>
export default {
  name: "gofr-hidden",
  props: ["label", "path", "hiddenType", "hiddenValue"],
  data: function() {
    return {
      qField: "value"+this.hiddenType,
      value: this.hiddenValue
    }
  }
}
</script>
