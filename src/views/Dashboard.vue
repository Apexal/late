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
          center: 'agendaDay,agendaWeek'
        },
        config: {
          minTime: this.$store.state.auth.user.earliestWorkTime + ':00',
          maxTime: this.$store.state.auth.user.latestWorkTime + ':00',
          timezone: 'local',
          defaultView: 'agendaWeek',
          eventOverlap: false,
          selectOverlap: false,
          nowIndicator: true,
          buttonText: {
            today: 'Today',
            day: 'Today',
            week: 'This Week'
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
