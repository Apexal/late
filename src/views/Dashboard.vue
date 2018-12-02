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
        events: this.$store.getters.getCourseScheduleAsEvents,
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
