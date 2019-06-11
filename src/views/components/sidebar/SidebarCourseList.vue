<!--Sidebar: Course list module-->
<template>
  <div class="sidebar-course-list">
    <div
      v-if="onBreak"
      class="no-courses"
    >
      <i class="fas fa-umbrella-beach no-courses-icon" />
      <div class="panel-block has-text-grey no-hover">
        No courses over break!
      </div>
    </div>
    <div
      v-else
      class="sidebar-body"
    >
      <div
        v-for="c in courses"
        :key="c.crn"
        :title="c.originalTitle + ' - ' + c.summary + ' - ' + c.sectionId"
        class="panel-block course-panel-block"
        @click="$store.commit('OPEN_COURSE_MODAL', c)"
      >
        <CourseAssessmentDot :course="c" />
        {{ c.title }}
      </div>
    </div>
    <div
      v-if="!onBreak"
      class="panel-block has-background-light no-hover"
    >
      <router-link
        class="button edit-button is-fullwidth editCoursesButton"
        :to="{ name: 'setup-course-schedule' }"
        title="Edit your courses"
      >
        Edit Courses
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarCourseList'
};
</script>

<style lang="scss" scoped>
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

.no-courses {
  i {
    width: 100%;
    text-align: center;
    font-size: 4em;
    padding: 15px 0px 5px 0px;
    display: block;
    color: rgba(128, 128, 128, 0.5);

    border-left: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
  }

  div {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
