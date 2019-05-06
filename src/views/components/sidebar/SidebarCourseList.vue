<template>
  <div class="sidebar-course-list">
    <div
      v-if="onBreak"
      class="panel-block has-text-grey"
    >
      On Break
    </div>
    <div
      v-else
      class="sidebar-body"
    >
      <div
        v-for="c in courses"
        :key="c.crn"
        :title="c.original_longname + ' - ' + c.summary + ' - ' + c.section_id"
        class="panel-block course-panel-block"
        @click="$store.commit('OPEN_COURSE_MODAL', c)"
      >
        <CourseAssessmentDot :course="c" />

        {{ c.longname }}
      </div>
    </div>
    <div
      v-if="!onBreak"
      class="panel-block has-background-light"
    >
      <router-link
        class="button edit-button is-fullwidth editCoursesButton"
        to="/profile/courseschedule"
        title="Edit your courses"
      >
        Edit Courses
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarCourseList',
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    }
  }
};
</script>

<style lang="scss" scoped>
.course-panel-block {
  padding: 10px;
  cursor: pointer;
  font-weight: 500;
}

.editCoursesButton:hover {
    background-color:#f5efef;
}
.editCoursesButton:focus {
  border-color: black;
  box-shadow: none!important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}
</style>
