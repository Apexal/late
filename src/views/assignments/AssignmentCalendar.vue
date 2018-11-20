<template>
  <div
    class="assignment-calendar"
  >
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
  name: 'AssignmentCalendar',
  components: { FullCalendar },
  props: {
    highlighted: {
      type: Array,
      default: () => []
    },
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
        events: [],
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        config: {
          events: this.events,
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
    filtered () {
      return this.events
        .filter(e => !this.filter.includes(this.course(e.assignment).crn))
        .filter(e => this.showCompleted ? true : !e.assignment.completed);
    }
  },
  watch: {
    filter () {
      this.$refs.calendar.fireMethod('refetchEvents');
    },
    showCompleted () {
      this.$refs.calendar.fireMethod('refetchEvents');
    }
  },
  methods: {
    async events (start, end, tz, callback) {
      const request = await this.$http.get(`/assignments/list?start=${start.format('YYYY-MM-DD')}&end=${end.format('YYYY-MM-DD')}`);

      const assignments = request.data.assignments;
      const events = assignments
        .filter(a => this.showCompleted ? true : !a.completed)
        .map(a => ({
          title: a.title,
          start: a.dueDate,
          color: this.course(a).color,
          assignment: a
          // eslint-disable-next-line
        }));

      this.events = events;
      callback(this.filtered);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style>
</style>
