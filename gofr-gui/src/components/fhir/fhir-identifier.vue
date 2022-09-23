<template>
  <gofr-complex-card
    :complexField="field"
    :slotProps="slotProps"
    :label="$t(`App.fhir-resources-texts.${label}`)"
    :errors="errors"
  >
    <template #default="slotProps">
      <slot :source="slotProps.source"></slot>
    </template>
  </gofr-complex-card>
</template>

<script>
import GofrComplexCard from "../gofr/gofr-complex-card.vue"
export default {
  name: "fhir-identifier",
  props: ["field", "slotProps","sliceName","min","max","base-min","base-max","label","path","edit","constraints"],
  data: function() {
    return {
      errors: []
    }
  },
  components: {
    GofrComplexCard
  }
}
</script>
