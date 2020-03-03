<template>
  <div
    id="scheduler"
    class="block"
  >
    <b-checkbox
      v-model="autoAssign"
    >
      Auto assign
    </b-checkbox>
  </div>
</template>

<script>
export default {
  name: 'ModalScheduler',
  props: {
    autoAssign: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    autoAssign: function (newVal, oldVal) {
      console.log('changed' + newVal)
      this.$emit(
        'update-auto-schedule',
        newVal
      )
    }
  }
}
</script>

<style scoped>

</style>
