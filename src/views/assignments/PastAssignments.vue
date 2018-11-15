<template>
  <div class="past-assignments">
    <table class="table is-full-width">
      <thead>
        <tr>
          <th>Due</th>
          <th>Course</th>
          <th>Assignment</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="a in pastAssignments"
          :key="a._id"
        >
          <td :title="toFullDateTimeString(a.dueDate)">{{ toDateShorterString(a.dueDate) }}</td>
          <td>
            <span
              class="dot"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <b
              class="course-title"
            >{{ course(a).longname }}</b>
          </td>
          <td>{{ a.title }}</td>
          <td>{{ a.completed }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'PastAssignments',
  props: {
    highlighted: {
      type: Array,
      default: () => []
    },
    showCompleted: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    pastAssignments () { return this.$store.getters.pastAssignments; }
  },
  methods: {
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString (dueDate) { return moment(dueDate).format('MM/DD/YY'); },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style lang="scss" scoped>
.dot {
  margin-right: 5px;
}
</style>
