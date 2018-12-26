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
        <div
          class="tag section-tag is-pulled-right"
          :style="{ 'background-color': course.color }"
        >
          Section {{ course.section_id }}
        </div>
        <h2 class="subtitle">
          {{ course.longname }}
          <router-link
            title="Edit course info and links."
            :to="{ name: 'setup-course-schedule' }"
            class="icon margin-left"
          >
            <i class="fas fa-pencil-alt" />
          </router-link>
        </h2>
        <hr>
        <ul
          v-if="course.links"
          class="course-links"
        >
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
        <span
          v-else
          class="has-text-centered has-text-grey"
        >
          No links added.
        </span>
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
.section-tag {
  color: white;
}

.course-links {
  overflow: auto;
}
</style>
