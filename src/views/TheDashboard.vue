<template>
  <section class="section dasboard">
    <div class="tabs is-right">
      <ul>
        <h1
          class="title"
          style="flex: 1"
        >
          Your Dashboard
        </h1>
        <li>
          <a>Your Week</a>
        </li>
        <li class="is-active">
          <a>Calendar</a>
        </li>
      </ul>
    </div>
    <template v-if="onBreak">
      <h2 class="subtitle">
        On Break
      </h2>
    </template>
    <template v-else>
      <FullCalendar
        ref="calendar"
        :events="events"
        :editable="true"
        :selectable="true"
        :header="calendar.header"
        :config="calendar.config"
      />
    </template>
  </section>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import moment from 'moment';

export default {
  name: 'TheDashboard',
  components: { FullCalendar },
  data () {
    return {
      calendar: {
        header: {
          center: 'agendaFiveDay, agendaWeek'
        },
        config: {
          views: {
            agendaFiveDay: {
              type: 'agenda',
              duration: { days: 5 },
              buttonText: '5-Day Agenda'
            }
          },
          validRange: {
            start: this.$store.getters.currentTerm.start,
            end: this.$store.getters.currentTerm.end
          },
          height: 700,
          dayCount: 5,
          allDayText: 'Due',
          // minTime: this.$store.state.auth.user.earliestWorkTime + ':00',
          // maxTime: this.$store.state.auth.user.latestWorkTime + ':00',
          businessHours: {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: this.$store.state.auth.user.earliestWorkTime,
            end: this.$store.state.auth.user.latestWorkTime
          },
          timezone: 'local',
          defaultView: 'agendaFiveDay',
          eventOverlap: true,
          selectOverlap: true,
          selectHelper: true,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          snapDuration: '00:15',
          noEventsMessage: 'You\'ve got nothing to do. You can relax!',
          eventRender: (event, el) => {
            if (event.eventType === 'course') {
              if (event.period.type === 'TES') {
                return !!this.$store.state.work.upcomingExams.find(
                  ex =>
                    ex.courseCRN === event.course.crn &&
                    moment(ex.date).isSame(event.start, 'day')
                );
              }

              // No classes after classes end date
              if (moment(event.start).isAfter(this.term.classesEnd)) {
                return false;
              }
            }
          },
          buttonText: {
            today: 'Today',
            day: 'Daily Agenda',
            month: 'Month Overview',
            agendaFiveDay: '5-Day',
            agendaWeek: 'Full Week'
          },
          /* dayClick: (date, jsEvent, view) => {
            // this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', date);
            // this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
          },
          */
          eventClick: this.eventClick,
          eventDrop: this.eventDrop,
          eventResize: this.eventResize,
          select: this.select
        }
      }
    };
  },
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    },
    term () {
      return this.$store.getters.currentTerm;
    },
    events () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents;

      const incompleteUpcomingAssignments = this.$store.getters.getUpcomingAssigmentsAsEvents.filter(
        c => !c.assignment.completed
      );

      const unavailabilitySchedule = this.$store.getters.getUnavailabilityAsEvents.map(
        e =>
          Object.assign({}, e, {
            backgroundColor: 'black',
            rendering: 'background'
          })
      );

      const upcomingExams = this.$store.getters.getUpcomingExamsAsEvents;

      const workBlocks = this.$store.getters.getWorkBlocksAsEvents.map(e =>
        Object.assign({}, e)
      );

      return courseSchedule
        .concat(incompleteUpcomingAssignments)
        .concat(unavailabilitySchedule)
        .concat(upcomingExams)
        .concat(workBlocks);
    },
    assignments () {
      return this.$store.state.work.upcomingAssignments;
    },
    earliest () {
      let earliest = this.$store.state.auth.user.earliestWorkTime;
      const courses = this.$store.getters.getCourseScheduleAsEvents;
      const workBlocks = this.$store.getters.getWorkBlocksAsEvents.map(e =>
        Object.assign({}, e)
      );

      let i;
      for (i = 0; i < courses.length; i++) {
        if (courses[i].start.localeCompare(earliest) < 0) {
          earliest = courses[i].start;
        }
      }
      for (i = 0; i < workBlocks.length; i++) {
        if (workBlocks[i].start.localeCompare(earliest) < 0) {
          earliest = workBlocks[i].start;
        }
      }

      return earliest;
    }
  },
  watch: {
    earliest (newEarliest) {
      this.calendar.config.scrollTime = this.earliest;
      this.$refs.calendar.fireMethod(
        'option',
        'scrollTime',
        this.calendar.config.scrollTime
      );
    }
  },
  created () {
    this.calendar.config.scrollTime = this.earliest;
  },
  methods: {
    select (start, end, jsEvent, view) {
      this.$toasted.show(
        'You will be able to schedule work blocks by selecting soon.'
      );
      this.$refs.calendar.fireMethod('unselect');
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType === 'course') {
        this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', calEvent.start);
        this.$store.commit('OPEN_COURSE_MODAL', calEvent.course);
      } else if (calEvent.eventType === 'assignment') {
        this.$router.push({
          name: 'assignments-overview',
          params: { assignmentID: calEvent.assignment._id }
        });
      } else if (calEvent.eventType === 'exam') {
        this.$router.push({
          name: 'exams-overview',
          params: { examID: calEvent.exam._id }
        });
      } else if (calEvent.eventType === 'work-block') {
        if (calEvent.assessmentType === 'assignment') {
          this.$router.push({
            name: 'assignments-overview',
            params: { assignmentID: calEvent.assignment._id }
          });
        } else if (calEvent.assessmentType === 'exam') {
          this.$router.push({
            name: 'exams-overview',
            params: { examID: calEvent.exam._id }
          });
        }
      }
    },
    eventDrop (calEvent, delta, revertFunc, jsEvent, ui, view) {
      // Update work block on server
      if (calEvent.end.isBefore(moment())) {
        if (!confirm('Move this work block to your history?')) {
          return revertFunc();
        }
      }
      this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
    },
    eventResize (calEvent, delta, revertFunc) {
      if (moment(calEvent.end).isBefore(moment())) {
        if (!confirm('Edit this work block from your history?')) {
          return revertFunc();
        }
      }
      this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
    },
    async editWorkBlock (blockID, start, end) {
      const updatedAssessment = await this.$store.dispatch('EDIT_WORK_BLOCK', {
        blockID,
        start,
        end
      });

      this.$toasted.show('Rescheduled work block!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    }
  }
};
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}
.work-block-event {
  border-width: 3px !important;
}
</style>
