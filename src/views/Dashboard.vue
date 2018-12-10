<template>
  <section class="section dasboard">
    <h1 class="title">
      Your Dashboard
    </h1>
    <FullCalendar
      ref="calendar"
      :events="events"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :config="calendar.config"
    />
  </section>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'Dashboard',
  components: { FullCalendar },
  data () {
    return {
      calendar: {
        header: {
          center: 'listDay,agendaWeek'
        },
        config: {
          height: 700,
          allDayText: 'Incomplete\nAssign.',
          minTime: this.$store.state.auth.user.earliestWorkTime + ':00',
          maxTime: this.$store.state.auth.user.latestWorkTime + ':00',
          timezone: 'local',
          defaultView: 'agendaWeek',
          eventOverlap: false,
          selectOverlap: false,
          selectHelper: false,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          noEventsMessage: 'You\'ve got nothing to do. You can relax!',
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
              this.$store.commit(
                'SET_ADD_ASSIGNMENT_MODAL_COURSE_CRN',
                calEvent.course.crn
              );
              this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
            } else if (calEvent.eventType === 'assignment') {
              this.$router.push({
                name: 'assignments-overview',
                params: { assignmentID: calEvent.assignment._id }
              });
            }
          }
        }
      }
    };
  },
  computed: {
    events () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents;

      const incompleteUpcomingAssignments = this.$store.getters.getUpcomingAssigmentsAsEvents.filter(
        c => !c.assignment.completed
      );

      const unavailabilitySchedule = this.$store.getters.getUnavailabilityAsEvents.map(
        e =>
          Object.assign(e, {
            backgroundColor: 'black',
            rendering: 'background'
          })
      );

      return courseSchedule
        .concat(incompleteUpcomingAssignments)
        .concat(unavailabilitySchedule);
    },
    assignments () {
      return this.$store.state.work.upcomingAssignments;
    }
  }
};
</script>

<style lang='scss' scoped>
</style>
