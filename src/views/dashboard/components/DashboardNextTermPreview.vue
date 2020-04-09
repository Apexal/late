<template>
  <div class="next-term-preview">
    <div class="columns">
      <div
        v-if="nextTerm"
        class="column is-9"
      >
        <div class="box">
          <FullCalendar
            ref="calendar"
            :plugins="calendar.plugins"
            default-view="timeGridWeek"
            :height="695"
            :header="calendar.header"
            :valid-range="validRange"
            :events="courseEvents"
            :weekends="false"
            :custom-buttons="customButtons"
            :all-day-slot="false"
            :views="calendar.views"
            min-time="08:00:00"
            max-time="20:00:00"
            :event-render="eventRender"
          />
        </div>
      </div>
      <div class="column has-text-centered is-size-4">
        <div class="tile is-vertical">
          <div
            v-if="true"
            class="tile is-child notification"
          >
            <b-button @click="importNextTermCourseSchedule">
              Enter Courses
            </b-button>
          </div>
          <div class="tile is-child notification is-primary">
            <b>{{ nextTermCourses.length }}</b> courses
          </div>
          <div class="tile is-child notification is-dark">
            ~
            <b>{{ nextTermCourseHourCount.hours }}hrs</b>&nbsp;
            <b>{{ nextTermCourseHourCount.minutes }}min</b>
            of class each week
          </div>
          <div class="tile is-child notification is-warning">
            <b>{{ earliestClassTime }}</b> earliest start of class
          </div>
          <div class="tile is-child notification is-danger">
            <b>{{ latestClassTime }}</b> latest end of class
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

import FullCalendar from '@fullcalendar/vue'

import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

import accountMixin from '@/mixins/account'

export default {
  name: 'DashboardNextTermPreview',
  components: { FullCalendar },
  mixins: [accountMixin],
  data () {
    return {
      nextTermCourses: [],
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin],
        header: {
          right: 'import prev,next'
        },
        views: {
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3-Day'
          }
        }
      }
    }
  },
  computed: {
    customButtons () {
      return {
        import: {
          text: 'Add to Google Calendar',
          click: this.importToGoogleCalendar
        }
      }
    },
    nextTerm () {
      return this.$store.getters.nextTerm
    },
    courseEvents () {
      return this.nextTermCourses.map(this.$store.getters.mapCourseToEvents).flat()
    },
    validRange () {
      return {
        start: this.nextTerm.start,
        end: this.nextTerm.end
      }
    },
    nextTermPeriods () {
      return this.nextTermCourses.map(course => course.periods)
        .flat()
    },
    nextTermCourseHourCount () {
      // Tally up durations of all periods
      const total = this.nextTermPeriods
        .reduce((acc, period) => acc + moment(period.endTime, 'HH:mm').diff(moment(period.startTime, 'HH:mm'), 'minutes'), 0)

      return {
        hours: parseInt(total / 60),
        minutes: total % 60
      }
    },
    earliestClassTime () {
      let earliest = '2300'

      for (const period of this.nextTermPeriods) {
        if (period.startTime < earliest) { earliest = period.startTime }
      }

      return moment(earliest, 'HH:mm', true).format('h:mm a')
    },
    latestClassTime () {
      let latest = '0800'

      for (const period of this.nextTermPeriods) {
        if (period.endTime > latest) { latest = period.endTime }
      }

      return moment(latest, 'HH:mm', true).format('h:mm a')
    }
  },
  async mounted () {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      // Only show three day view on mobile
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.changeView('timeGridThreeDay')
    }

    // Get courses for next term
    let request
    try {
      request = await this.$http.get(`/courses/term/${this.nextTerm.code}`)
    } catch (e) {
      return
    }

    this.nextTermCourses = request.data.courses.filter(c => c.originalTitle !== 'Other')
  },
  methods: {
    eventRender ({ event, el, view }) {
      const { period } = event.extendedProps

      el.title = `${event.title} | ${period.location}`

      const locationEl = document.createElement('i')
      locationEl.className = 'event-location'
      locationEl.innerText = period.location

      el.querySelector('.fc-content').append(locationEl)
    },
    async importNextTermCourseSchedule () {
      this.promptCredentials(async (rin, pin) => {
        let request
        try {
          request = await this.$http.post('/account/courseschedule?termCode=' + this.nextTerm.code, {
            rin,
            pin
          })
        } catch (e) {
          this.loading = false
          return this.showError(e.response.data.message)
        }

        this.$store.commit('SET_USER', request.data.updatedUser)

        this.nextTermCourses = request.data.courses.filter(c => c.originalTitle !== 'Other')
      })
    },
    importToGoogleCalendar () {
      this.$router.push({ name: 'setup-integrations', hash: '#google-calendar' })
      this.$buefy.toast.open({
        type: 'is-info',
        message: 'Connect your Google Account here and your course schedule will be added!',
        position: 'is-bottom-right',
        duration: 5000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
