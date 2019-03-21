<template>
  <div class="assignment-calendar">
    <FullCalendar
      ref="calendar"
      :editable="false"
      :selectable="false"
      :header="calendar.header"
      :config="calendar.config"
    />
  </div>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'AssignmentsCalendar',
  components: { FullCalendar },
  props: {
    showCompleted: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      calendar: {
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        config: {
          validRange: {
            start: this.$store.getters.currentTerm.start,
            end: this.$store.getters.currentTerm.end
          },
          height: 800,
          events: this.events,
          defaultView: 'month',
          timeFormat: 'h(:mm)t',
          eventClick: (calEvent, jsEvent, view) => {
            this.$router.push(`/assignments/${calEvent.assignment._id}`);
          },
          eventRender: (event, el) => {
            if (
              this.filter.includes(event.assignment.courseCRN) ||
              (!this.showCompleted && event.assignment.completed)
            ) {
              return false;
            }
          },
          timezone: 'local',
          dayClick: this.dayClick
        }
      }
    };
  },
  watch: {
    filter () {
      this.$refs.calendar.fireMethod('rerenderEvents');
    },
    showCompleted () {
      this.$refs.calendar.fireMethod('refetchEvents');
    }
  },
  methods: {
    async events (start, end, tz, callback) {
      let request;

      try {
        request = await this.$http.get('/assignments', {
          params: {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        this.events = [];
        return this.$toasted.error(e.response.data.message);
      }

      const assignments = request.data.assignments;
      const events = assignments
        .filter(a => (this.showCompleted ? true : !a.completed))
        .map(a => ({
          title: a.title,
          start: a.dueDate,
          color: this.course(a).color,
          assignment: a
        }));

      callback(events);
    },
    dayClick (date) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', { dueDate: date });
      this.$store.commit(
        'TOGGLE_ADD_ASSIGNMENT_MODAL'
      );
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style>
</style>
