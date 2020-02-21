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
      default: true,
      required: false
    }
  }
}
</script>

<script>
export default {

}
</script>
