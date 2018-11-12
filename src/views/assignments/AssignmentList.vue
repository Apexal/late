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
          <div class="panel">
            <p
              class="panel-heading"
              :title="daysAway(date) + ' days away'"
            >
              {{ toDateShortString(date) }}
            </p>
            <div
              v-for="a in assignments"
              :key="a._id"
              class="panel-block"
            >
              <span class="is-full-width">
                <b class="assignment-title">
                  <small class="course-title">{{ course(a).longname }}</small>
                  <router-link :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}">{{ a.title }}</router-link>
                  <span
                    v-if="a.priority >= 7"
                    class="tag is-danger"
                    title="You marked this assignment as high priority!"
                  >!</span>
                </b>
                <small
                  :title="'in ' + hoursFromNow(a.dueDate) + ' hours'"
                  class="is-pulled-right has-text-grey"
                >{{ toTimeString(a.dueDate) }}</small>

              </span>

            </div>

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
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShortString (dueDate) {
      return moment(dueDate).format('dddd [the] Do');
    },
    toTimeString (dueDate) {
      return moment(dueDate).format('h:mma');
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    hoursFromNow: date => moment(date).diff(moment(), 'hours'),
    daysAway: date => moment(date).diff(moment().startOf('day'), 'days')
  }
};
</script>

<style lang="scss" scoped>
.assignment-title {
  .course-title {
    margin-right: 5px;
  }
}
</style>
