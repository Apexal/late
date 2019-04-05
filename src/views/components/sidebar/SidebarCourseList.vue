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
        <span
          class="course-dot dot"
          :style="{ 'background-color': c.color }"
        />
        {{ c.longname }}
      </div>
    </div>
    <div
      v-if="!onBreak"
      class="panel-block has-background-light"
    >
      <router-link
        class="button edit-button is-fullwidth"
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

  .course-dot {
    margin-right: 5px;
  }
}
</style>
