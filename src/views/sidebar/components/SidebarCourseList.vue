<!--Sidebar: Course list module-->
<template>
  <div class="sidebar-course-list">
    <div
      v-if="onBreak"
      class="panel-block has-text-grey no-items"
    >
      <i class="fas fa-umbrella-beach no-items-icon" />
      No courses over break!
    </div>
    <div
      v-else
      class="sidebar-body"
    >
      <div
        v-for="c in selectedCourses"
        :key="c.crn"
        :title="c.originalTitle + ' - ' + c.summary + ' - ' + c.sectionId"
        class="panel-block course-panel-block"
        @click="$store.commit('OPEN_COURSE_MODAL', c)"
      >
        <CourseAssessmentDot :course="c" />
        {{ c.title }}
      </div>
      <p
        v-if="courses.length !== ongoingCourses.length"
        class="panel-divider has-background-grey-lighter"
        @click="showingAll = !showingAll"
      >
        Show {{ showingAll ? 'current' : 'all' }}
      </p>
    </div>
    <div
      v-if="!onBreak"
      class="panel-block has-background-light no-hover"
    >
      <router-link
        class="button edit-button is-fullwidth editCoursesButton"
        :to="{name: 'setup-course-schedule'}"
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
  data () {
    return {
      showingAll: false
    }
  },
  computed: {
    selectedCourses () {
      return this.showingAll ? this.courses : this.ongoingCourses
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-divider {
  text-align: center;
  cursor: pointer;
}

.course-panel-block {
  padding: 10px;
  cursor: pointer;
  font-weight: 500;
}

.editCoursesButton:hover {
  background-color: #f5efef;
}
.editCoursesButton:focus {
  border-color: black;
  box-shadow: none !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}
</style>
