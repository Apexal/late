<template>
  <div
    class="modal course-modal"
    :class="{'is-active': open}"
  >
    <div
      class="modal-background"
      @click="$store.commit('CLOSE_COURSE_MODAL')"
    />
    <div class="modal-content">
      <div class="box">
        <h2 class="subtitle">
          {{ course.longname }}
        </h2>
        <ul>
          <li
            v-for="l in course.links"
            :key="l"
          >
            <a
              :href="l"
              target="_blank"
            >
              {{ l }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    course: { type: Object, required: true }
  }
};
</script>

<style lang="scss" scoped>
</style>
