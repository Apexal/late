<template>
  <div class="assignment-list">
    <section class="section">
      <h1 class="title">All Assignments</h1>
      <div class="upcoming-assignments columns is-multiline">
        <div
          v-for="(assignments, date) in assignmentsGroupedByDueDate"
          :key="date"
          class="due-date column is-one-third is-half-tablet"
        >
          <h3 class="subtitle is-4">{{ toDateShortString(date) }}</h3>
          <div
            v-for="a in assignments"
            :key="a._id"
            class="box"
          >
            <details>
              <summary>

                <b class="assignment-title">
                  <small class="course-title">{{ course(a).longname }}</small>
                  <router-link :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}">{{ a.title }}</router-link>
                  <span
                    v-if="a.priority >= 7"
                    class="tag is-danger"
                    title="You marked this assignment as high priority!"
                  >!</span>
                </b>
                <span
                  :title="toFullDateTimeString(a.dueDate)"
                  class="is-pulled-right"
                >due {{ toTimeString(a.dueDate) }}</span>
              </summary>

              <div class="content">
                <blockquote>
                  <p>{{ a.description }}</p>
                </blockquote>
              </div>
            </details>
          </div>
          <hr>
        </div>
      </div>

      <hr>

      <div class="past-assignments" />
    </section>

  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentList',
  data () {
    return {};
  },
  computed: {
    assignmentsGroupedByDueDate () {
      return this.$store.getters.assignmentsGroupedByDueDate;
    }
  },
  methods: {
    toFullDateTimeString (dueDate) {
      return moment(dueDate).format('dddd, MMMM Do YYYY, h:mm a');
    },
    toDateShortString (dueDate) {
      return moment(dueDate).format('dddd [the] Do');
    },
    toTimeString (dueDate) {
      return moment(dueDate).format('hh:mm a');
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style lang="scss" scoped>
.assignment-title {
  .course-title {
    margin-right: 10px;
  }
}
</style>
