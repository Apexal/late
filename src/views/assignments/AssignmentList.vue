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
        class="tag course-tag"
        :class="{'highlighted': highlighted ===c.listing_id}"
        @mouseover="highlighted=c.listing_id"
        @mouseleave="highlighted=''"
      >{{ c.longname }}</span>
      <hr>
      <div
        v-show="view == 'list'"
        class="upcoming-assignments columns is-multiline"
      >
        <div
          v-for="(assignments, date) in assignmentsGroupedByDueDate"
          :key="date"
          class="due-date column is-one-third-desktop is-half-tablet"
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
              :style="highlighted == course(a).listing_id ? 'color: white !important; background-color: ' + course(a).color : ''"
              class="panel-block"
            >
              <span class="is-full-width">
                <span
                  class="dot"
                  :title="course(a).longname"
                  :style="'background-color: ' + course(a).color"
                />
                <router-link
                  class="assignment-link "
                  :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
                >
                  <b
                    class="course-title is-hidden-tablet"
                  >{{ course(a).longname }}</b>

                  {{ a.title }}</router-link>
                <span
                  v-if="a.priority >= 7"
                  class="tag is-danger"
                  title="You marked this assignment as high priority!"
                >!</span>
                <small
                  :title="'in ' + hoursFromNow(a.dueDate) + ' hours'"
                  class="is-pulled-right"
                  :class="{ 'has-text-grey': highlighted !== course(a).listing_id }"
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
      highlighted: '',
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
      if (moment(dueDate).isSame(moment(), 'day')) return 'Today';
      if (moment(dueDate).isSame(moment().add(1, 'day'), 'day')) return 'Tomorrow';
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

span.tag.course-tag {
  cursor: pointer;
  margin-right: 5px;
  &.highlighted {
    font-weight: bold;
  }
}

.course-title {
  margin-right: 5px;
}

.assignment-link {
  color: inherit;
}

.dot {
  margin-right: 5px;
}
</style>
