<!--Courses: Course calendar-->
<template>
  <div class="course-schedule-calendar">
    <FullCalendar
      ref="calendar"
      :plugins="calendar.plugins"
      :events="courseEvents"
      :header="calendar.header"
      :editable="false"
      :selectable="false"
      :all-day-slot="false"
      :valid-range="calendar.validRange"
      :views="calendar.views"
      height="parent"
      default-view="timeGridWeek"
      min-time="08:00:00"
      max-time="20:00:00"
      @eventRender="eventRender"
      @eventClick="eventClick"
    />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

import fullcalendar from '@/mixins/fullcalendar'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

export default {
  name: 'CourseScheduleCalendar',
  components: { FullCalendar },
  mixins: [fullcalendar],
  data () {
    return {
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin],
        eventRender: this.eventRender,
        eventClick: this.eventClick,
        header: {
          right: 'today,prev,next'
        },
        views: {
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3-Day'
          }
        },
        validRange: {
          start: this.$store.getters.currentTerm.startDate,
          end: this.$store.getters.currentTerm.endDate
        }
      }
    }
  },
  computed: {
    courseEvents () {
      return this.$store.getters.getCourseScheduleAsEvents
    }
  },
  mounted () {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      // Only show three day view on mobile
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.changeView('timeGridThreeDay')
    }
  },
  methods: {
    eventClick ({ event }) {
      if (event.extendedProps.eventType === 'course') {
        this.$emit('goto-course', event.extendedProps.course._id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
