<template>
  <div
    class="assignment-calendar"
  >
    <FullCalendar
      :events="filtered"
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
    filtered () {
      return this.events.filter(e => !this.filter.includes(this.course(e.assignment).crn));
    },
    events () {
      return this.$store.state.work.assignments
        .filter(a => this.showCompleted ? true : !a.completed)
        .map(a => ({
          title: a.title,
          start: a.dueDate,
          color: this.course(a).color,
          assignment: a
          // eslint-disable-next-line
        }));
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style>
</style>
