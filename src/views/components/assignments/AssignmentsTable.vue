<template>
  <table class="table assignments-table is-fullwidth">
    <thead>
      <tr>
        <th>Course</th>
        <th>Title</th>
        <th>Due Date</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="assignment in assignments"
        :key="assignment._id"
      >
        <td
          class="is-hidden-mobile"
          @click="$store.commit('OPEN_COURSE_MODAL', course(assignment))"
        >
          <span
            class="dot course-dot"
            :title="course(assignment).longname"
            :style="'background-color: ' + course(assignment).color"
          />
          <b class="course-title">{{ course(assignment).longname }}</b>
        </td>
        <td>
          <span
            class="dot course-dot is-hidden-tablet"
            :title="course(assignment).longname"
            :style="'background-color: ' + course(assignment).color"
            @click="$store.commit('OPEN_COURSE_MODAL', course(assignment))"
          />
          <router-link
            class="assignment-link"
            :title="assignment.description.substring(0, 500)"
            :to="{name: 'assignments-overview', params: { assignmentID: assignment._id }}"
          >
            {{ assignment.title }}
          </router-link>
        </td>
        <td>
          <span
            class="tooltip"
            :data-tooltip="fromNow(assignment.dueDate)"
          >{{ dateFormat(assignment.dueDate) }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentsTable',
  props: {
    assignments: {
      type: Array,
      required: true
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    dateFormat (date) {
      return moment(date).format('M/DD/YY h:mma');
    },
    fromNow (date) {
      return moment(date).fromNow();
    }
  }
};
</script>

<style lang="scss" scoped>
.course-title {
  cursor: pointer;
}
.course-dot {
  margin-right: 5px;
}
</style>
