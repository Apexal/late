<template>
  <div class="exam-calendar">
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
  name: 'ExamsCalendar',
  components: { FullCalendar },
  props: {
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
            this.$router.push(`/exams/${calEvent.exam._id}`);
          },
          eventRender: (event, el) => {
            if (this.filter.includes(event.exam.courseCRN)) {
              return false;
            }
          },
          timezone: 'local'
        }
      }
    };
  },
  watch: {
    filter () {
      this.$refs.calendar.fireMethod('rerenderEvents');
    }
  },
  methods: {
    async events (start, end, tz, callback) {
      let request;

      try {
        request = await this.$http.get(
          '/exams', { params: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') } }
        );
      } catch (e) {
        this.events = [];
        return this.$toasted.error(e.response.data.message);
      }

      const exams = request.data.exams;
      const events = exams
        .map(e => ({
          title: e.title,
          start: e.date,
          color: this.course(e).color,
          exam: e
        }));


      callback(events);
    },
    course (e) {
      return this.$store.getters.getCourseFromCRN(e.courseCRN);
    }
  }
};
</script>

<style>
</style>
