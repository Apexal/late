<template>
  <b-modal
    has-modal-card
    class="custom-course-modal"
    :active="open"
    @close="$emit('close-modal')"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Custom Course
        </p>
      </header>
      <section class="modal-card-body">
        <p>yeet</p>
      </section>
      <footer class="modal-card-foot">
        <b-button
          type="is-success"
        >
          Add
        </b-button>
        <b-button @click="$emit('close-modal')">
          Close
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'CustomCourseModal',
  props: {
    open: { type: Boolean, required: true }
  },
  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
