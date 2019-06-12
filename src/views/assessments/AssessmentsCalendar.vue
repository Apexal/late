<!--Assessments: Calendar Module-->
<template>
  <div class="assessment-calendar">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />
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
      loading: true,
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
              params: {
                [calEvent.assessment.assessmentType + 'ID']: calEvent.assessment
                  ._id
              }
            });
          },
          eventRender: (event, el) => {
            if (
              this.filter.includes(event.assessment.courseCRN) ||
              (event.assessment.assessmentType === 'assignment' &&
              (!this.showCompleted && event.assignment.completed))
            ) {
              return false;
            }

            if (event.assessment.assessmentType === 'assignment') {
              const icon = document.createElement('i');
              icon.className = 'fas fa-clipboard-check';
              el.find('.fc-content').prepend(icon);

              if (event.assessment.shared) {
                const sharedIcon = document.createElement('i');
                sharedIcon.className = 'fas fa-users is-pulled-right';
                el.find('.fc-content').append(sharedIcon);
              }
            } else if (event.assessment.assessmentType === 'exam') {
              const icon = document.createElement('i');
              icon.className = 'fas fa-exclamation-triangle';
              el.find('.fc-content').prepend(icon);
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
      this.loading = true;

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
        this.loading = false;
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
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
        this.loading = false;
        return this.$toast.error({
          message: e.response.data.message,
          type: 'is-danger'
        });
      }

      assessments.push(...request.data.exams);

      const events = assessments.map(this.$store.getters.mapAssessmentToEvent);

      this.events = events;
      callback(events);

      this.loading = false;
    },
    dayClick (date) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', { dueDate: date });
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', { date });

      this.$toast.open({
        message:
          'Add a new assignment or exam with the buttons below the calendar!',
        position: 'is-bottom-left'
      });
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style>
</style>
