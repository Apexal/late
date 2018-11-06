<template>
  <aside
    id="sidebar"
    class="menu">
    <AddAssignmentModal />
    <Schedule />
    <div class="panel user-courses">
      <p class="panel-heading">Your Courses</p>
      <div
        v-for="course in courses"
        :key="course.listing_id"
        class="panel-block course-block">
        <span
          :title="'Section ' + course.section_id"
          class="period-id has-text-grey-light">{{ course.section_id }} </span>
        <span>{{ course.longname }}</span>
      </div>
    </div>
  </aside>
</template>

<script>
import Schedule from '@/components/Schedule';
import AddAssignmentModal from '@/components/assignments/AddAssignmentModal';

export default {
  name: 'Sidebar',
  components: { AddAssignmentModal, Schedule },
  computed: {
    courses() {
      return this.$store.state.auth.user.current_schedule;
    }
  }
};
</script>

<style lang='scss' scoped>
#sidebar {
  padding: 15px;

  .user-courses {
    .course-block {
      .period-id {
        margin-right: 5px;
      }
    }
  }
}
</style>
