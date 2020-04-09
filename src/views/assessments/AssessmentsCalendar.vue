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
      default-view="dayGridMonth"
      :header="calendar.header"
      :plugins="calendar.plugins"
      :events="events"
      :week-numbers="true"
      :week-numbers-within-days="true"
      :valid-range="calendar.validRange"
      :button-text="calendar.buttonText"
      time-format="h(:mm)t"
      time-zone="local"
      :editable="false"
      :selectable="false"
      :height="800"
      :event-render="eventRender"
      @dateClick="dateClick"
      @eventClick="eventClick"
    />
  </div>
</template>

<script>
import moment from 'moment'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import fullcalendar from '@/mixins/fullcalendar'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

export default {
  name: 'AssessmentsCalendar',
  components: { FullCalendar },
  mixins: [fullcalendar],
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
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        header: {
          right: 'today,prev,next'
        },
        buttonText: {
          today: 'Today'
        },
        validRange: {
          start: this.$store.getters.currentTerm.startDate,
          end: this.$store.getters.currentTerm.endDate
        }
      }
    }
  },
  watch: {
    filter () {
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.rerenderEvents()
    },
    showCompleted () {
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.rerenderEvents()
    }
  },
  methods: {
    async events ({ start, end }, successCallback, failureCallback) {
      this.loading = true

      let request
      const assessments = []
      try {
        request = await this.$http.get('/assignments', {
          params: {
            start: moment(start).format('YYYY-MM-DD'),
            end: moment(end).format('YYYY-MM-DD')
          }
        })
      } catch (e) {
        this.loading = false
        failureCallback(e)
        return this.showError(e.response.data.message)
      }
      assessments.push(...request.data.assignments)

      try {
        request = await this.$http.get('/exams', {
          params: {
            start: moment(start).format('YYYY-MM-DD'),
            end: moment(end).format('YYYY-MM-DD')
          }
        })
      } catch (e) {
        this.loading = false
        failureCallback(e)
        return this.showError(e.response.data.message)
      }

      assessments.push(...request.data.exams)

      const events = assessments.map(this.$store.getters.mapAssessmentToEvent)

      successCallback(events)

      this.loading = false
    },
    eventClick ({ event }) {
      this.$router.push({
        name: event.extendedProps.assessment.assessmentType + '-overview',
        params: {
          [event.extendedProps.assessment.assessmentType + 'ID']: event.extendedProps.assessment
            ._id
        }
      })
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN)
    }
  }
}
</script>

<style>
</style>
