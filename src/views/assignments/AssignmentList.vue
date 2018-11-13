<template>
  <div class="assignment-list">
    <section class="section">
      <button
        class="button is-warning is-pulled-right"
        @click="view = (view == 'calendar' ? 'list' : 'calendar')"
      >Toggle Calendar</button>
      <h1 class="title">All Assignments</h1>
      <span
        v-for="c in courses"
        :key="c.listing_id"
        :style="`background-color: ${c.color}; color: white;`"
        class="tag"
      >{{ c.longname }}</span>
      <hr>
      <div
        v-show="view == 'list'"
        class="upcoming-assignments columns is-multiline"
      >
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
                <b
                  class="course-title"
                  :style="`color: ${course(a).color};`"
                >{{ course(a).longname }}</b>
                &nbsp;
                <router-link :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}">{{ a.title }}</router-link>
                <span
                  v-if="a.priority >= 7"
                  class="tag is-danger"
                  title="You marked this assignment as high priority!"
                >!</span>
                <small
                  :title="'in ' + hoursFromNow(a.dueDate) + ' hours'"
                  class="is-pulled-right has-text-grey"
                >{{ toTimeString(a.dueDate) }}</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-show="view == 'calendar'"
        class="calendar"
      >
        <FullCalendar
          :events="events"
          :editable="false"
          :header="calendar.header"
          :config="calendar.config"
        />
      </div>
    </section>

  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'AssignmentList',
  components: { FullCalendar },
  data () {
    return {
      view: 'list',
      calendar: {
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        config: {
          defaultView: 'month',
          timeFormat: 'h(:mm)t',
          eventClick: (calEvent, jsEvent, view) => {
            this.$router.push(`/assignments/${calEvent.assignment._id}`);
          },
          timezone: 'local'
        }
      }
    };
  },
  computed: {
    assignmentsGroupedByDueDate () {
      return this.$store.getters.assignmentsGroupedByDueDate;
    },
    courses () { return this.$store.state.auth.user.current_schedule; },
    events () {
      return this.$store.state.work.assignments.map(a => ({
        title: a.title,
        start: a.dueDate,
        color: this.course(a).color,
        assignment: a
      }));
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
