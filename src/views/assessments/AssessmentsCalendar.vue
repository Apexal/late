<template>
  <div class="assessment-calendar">
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
  name: 'AssessmentsCalendar',
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
            this.$router.push(`/${calEvent.type}s/${calEvent.assignment._id}`);
          },
          eventRender: event => {
            if (
              this.filter.includes(event.assessment.courseCRN) ||
              (event.type === 'assignment' &&
              (!this.showCompleted && event.assignment.completed))
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
      this.$refs.calendar.fireMethod('rerenderEvents');
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
      const assignmentEvents = assignments.map(a => ({
        type: 'assignment',
        title: a.title,
        start: a.dueDate,
        color: this.course(a).color,
        assessment: a,
        assignment: a
      }));
      try {
        request = await this.$http.get('/exams', {
          params: {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        this.events = [];
        return this.$toasted.error(e.response.data.message);
      }

      const exams = request.data.exams;
      const examEvents = exams.map(e => ({
        type: 'exam',
        title: e.title,
        start: e.date,
        color: this.course(e).color,
        assessment: e,
        assignment: e
      }));
      const events = examEvents.concat(assignmentEvents);

      callback(events);
    },
    dayClick (date) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', { dueDate: date });
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', { date });

      this.$toasted.info(
        'Date set. Add a new assignment or exam with the buttons below the calendar!'
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
