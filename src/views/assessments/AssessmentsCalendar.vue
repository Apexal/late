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
            this.$router.push({
              name: calEvent.assessment.assessmentType + '-overview',
              params: { [calEvent.assessment.assessmentType + 'ID']: calEvent.assessment._id }
            });
          },
          eventRender: event => {
            if (
              this.filter.includes(event.assessment.courseCRN) ||
              (event.assessment.assessmentType === 'assignment' &&
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
      const assessments = [];
      try {
        request = await this.$http.get('/assignments', {
          params: {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        return this.$toasted.error(e.response.data.message);
      }
      assessments.push(...request.data.assignments);

      try {
        request = await this.$http.get('/exams', {
          params: {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        return this.$toasted.error(e.response.data.message);
      }

      assessments.push(...request.data.exams);

      const events = assessments.map(this.$store.getters.mapAssessmentToEvent);

      this.events = events;
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
