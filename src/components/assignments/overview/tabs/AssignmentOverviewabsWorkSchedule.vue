<template>
  <div class="assignment-work-schedule">
    <FullCalendar
      ref="calendar"
      :events="totalEvents"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :config="calendar.config"
    />
  </div>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'AssignmentOverviewabsWorkSchedule',
  components: { FullCalendar },
  props: {
    assignment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      events: [],
      calendar: {
        header: {
          center: 'agendaWeek'
        },
        config: {
          validRange: {
            start: this.assignment.createdAt,
            end: this.assignment.dueDate
          },
          height: 500,
          allDay: false,
          minTime: this.$store.state.auth.user.earliestWorkTime,
          maxTime: this.$store.state.auth.user.latestWorkTime,
          timezone: 'local',
          defaultView: 'agendaWeek',
          eventOverlap: false,
          selectOverlap: false,
          selectHelper: false,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          noEventsMessage: 'No work periods set yet.',
          buttonText: {
            agendaWeek: 'Weekly Agenda'
          },
          /* dayClick: (date, jsEvent, view) => {
              // this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', date);
              // this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
            },
            */
          eventClick: (calEvent, jsEvent, view) => {

          },
          select: (start, end) => {
            const assignmentTitle = this.assignment.title;
            if (!confirm(`You want to work on ${assignmentTitle} at this time?`)) { return; }
            const eventData = {
              title: assignmentTitle,
              start: start,
              end: end,
              isWorkBlock: true
            };
            this.events.push(eventData);
            this.$refs.calendar.fireMethod('unselect');
            this.saved = false;
          }
        }
      }
    };
  },
  computed: {
    totalEvents () {
      const unavailabilitySchedule = this.$store.getters.getUnavailabilityAsEvents.map(
        e =>
          Object.assign(e, {
            backgroundColor: 'black',
            rendering: 'background'
          })
      );
      return this.events.concat(unavailabilitySchedule);
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
