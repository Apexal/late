<template>
  <section class="section dasboard">
    <h1 class="title">
      Your Dashboard
    </h1>
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
          center: 'listDay,agendaFiveDay'
        },
        config: {
          views: {
            agendaFiveDay: {
              type: 'agenda',
              duration: { days: 5 },
              buttonText: 'Week'
            }
          },
          validRange: {
            start: moment().startOf('week'),
            end: this.$store.getters.currentTerm.end
          },
          height: 700,
          dayCount: 5,
          allDayText: 'Due',
          minTime: this.$store.state.auth.user.earliestWorkTime + ':00',
          maxTime: this.$store.state.auth.user.latestWorkTime + ':00',
          timezone: 'local',
          defaultView: 'agendaFiveDay',
          eventOverlap: false,
          selectOverlap: false,
          selectHelper: false,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          noEventsMessage: 'You\'ve got nothing to do. You can relax!',
          eventRender: (event, el) => {
            if (event.eventType === 'course') {
              if (moment(event.start).isAfter(this.term.classesEnd)) {
                return false;
              }
            }
          },
          buttonText: {
            today: 'Today',
            day: 'Daily Agenda',
            month: 'Month Overview',
            agendaWeek: 'Weekly Agenda'
          },
          /* dayClick: (date, jsEvent, view) => {
            // this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', date);
            // this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
          },
          */
          eventClick: (calEvent, jsEvent, view) => {
            if (calEvent.eventType === 'course') {
              this.$store.commit(
                'SET_ADD_ASSIGNMENT_MODAL_DUE_DATE',
                calEvent.start
              );
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
          }
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
    }
  }
};
</script>

<style lang='scss'>
.work-block-event {
  border-width: 3px !important;
}
</style>
