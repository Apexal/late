<template>
  <table class="table is-fullwidth">
    <caption>
      <b>Far Future Assignments
        <a @click="$emit('hide')">Hide</a>
      </b>
    </caption>
    <thead>
      <tr>
        <th>Due Date</th>
        <th>Course</th>
        <th>Title</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="assignment in assignments"
        :key="assignment._id"
      >
        <td>{{ assignment.dueDate }}</td>
        <td>{{ assignment.courseCRN }}</td>
        <td>{{ assignment.title }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'UpcomingAssignmentsFarFutureTable',
  props: {
    assignments: {
      type: Array,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
