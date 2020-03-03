<!--Modals: Calendar module-->
<template>
  <div>
    <FullCalendar
      ref="calendar"
      :plugins="calendar.plugins"
      :editable="false"
      :selectable="false"
      :events="selectedCourseScheduleEvents"
      :header="calendar.header"
      :height="500"
      :valid-range="calendar.validRange"
      default-view="dayGridMonth"
      time-format="h(:mm)t"
      time-zone="local"
      :day-render="dayRender"
      @dateClick="dateClick"
      @eventClick="eventClick"
    />
  </div>
</template>

<script>
import moment from 'moment'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

export default {
  name: 'ModalCalendar',
  components: {
    FullCalendar
  },
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    date: {
      type: Object, // moment
      required: false,
      default: moment().add(1, 'week')
    },
    courseCRN: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      calendar: {
        plugins: [dayGridPlugin, interactionPlugin],
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        validRange: {
          start: this.$store.getters.currentTerm.startDate,
          end: this.$store.getters.currentTerm.endDate
        },
        timeFormat: 'h(:mm)t',
        timezone: 'local'
      }
    }
  },
  computed: {
    selectedCourseScheduleEvents () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents
        .filter(
          ev =>
            (this.assessmentType === 'assignment'
              ? ev.period.type !== 'TES'
              : ev.period.type === 'TES') && ev.course.crn === this.courseCRN
        )
        .map(ev =>
          Object.assign({}, ev, { title: this.periodType(ev.period) })
        )

      // If course does not have TEST blocks, just show all periods
      if (courseSchedule.length === 0) {
        courseSchedule = this.$store.getters.getCourseScheduleAsEvents
          .filter(ev => ev.course.crn === this.courseCRN)
          .map(ev =>
            Object.assign({}, ev, { title: this.periodType(ev.period) })
          )
      }

      return courseSchedule
    }
  },
  methods: {
    eventClick ({ event }) {
      this.$emit('update-time', moment(event.start).format('HH:mm'))
      this.updateDate(moment(event.start).startOf('day'))
    },
    dayRender ({ date, el }) {
      if (moment(date).isSame(this.date, 'day')) {
        el.style.backgroundColor = this.getCourseFromCRN(this.courseCRN).color
      }
    },
    dateClick ({ date }) {
      this.updateDate(moment(date))
    },
    updateDate (date) {
      if (
        moment(date)
          .endOf('day')
          .isBefore(moment().startOf('day'))
      ) {
        this.$buefy.dialog.confirm({
          message: `Add this ${this.assessmentType} to the past?`,
          onConfirm: () => this.$emit('update-date', date)
        })
      } else {
        this.$emit('update-date', date)
      }
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type)
    }
  }
}
</script>

<style lang="scss" scoped>
.selected-date {
  background-color: black;
}
</style>
