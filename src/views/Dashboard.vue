<template>
  <section class="section dasboard">
    <h1 class="title">Your Dashboard</h1>
    <FullCalendar
      ref="calendar"
      :events="calendar.events"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :config="calendar.config"
    />
  </section>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'Dashboard',
  components: { FullCalendar },
  data () {
    return {
      calendar: {
        events: this.$store.getters.getCourseScheduleAsEvents.concat(
          this.$store.getters.getUpcomingAssigmentsAsEvents
        ),
        header: {
          center: 'listDay,agendaWeek,month'
        },
        config: {
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
          dayClick: (date, jsEvent, view) => {
            this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', date);
            this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
          },
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
                name: 'assignment-overview',
                params: { assignmentID: calEvent.assignment._id }
              });
            }
          }
        }
      }
    };
  },
  computed: {
    assignments () {
      return this.$store.state.work.upcomingAssignments;
    }
  }
};
</script>

<style lang='scss' scoped>
</style>
