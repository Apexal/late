<!--Account Setup: Unavailability Scheduling-->
<template>
  <div class="setup-unavailability">
    <template v-if="onBreak">
      <h2
        class="subtitle has-text-centered"
      >
        You will be able to set your new course schedule once break ends.
      </h2>
    </template>
    <template v-else>
      <h2 class="is-size-4 integration-note">
        When can't you study or work throughout the week?
      </h2>
      <div class="box">
        <form
          id="time-preferences"
          @submit.prevent="saveTimePreferences"
        >
          <div class="columns">
            <div class="column field">
              <label
                for="earliest"
                class="label"
              >Earliest Time Preference</label>
              <p class="help">
                <b>LATE</b> will not schedule any work for you before this time
                unless it absolutely does not fit anywhere else.
              </p>
              <div class="control">
                <input
                  id="earliest"
                  v-model="earliest"
                  type="time"
                  class="input is-small"
                  required
                >
              </div>
            </div>
            <div class="column field">
              <label
                for="latest"
                class="label"
              >Latest Time Preference</label>
              <p class="help">
                <b>LATE</b> will not schedule any work for you after this time
                unless it absolutely does not fit anywhere else.
              </p>
              <div class="control">
                <input
                  id="latest"
                  :value="originalLatest"
                  type="time"
                  class="input is-small"
                  required
                  @input="setLatest"
                >
              </div>
            </div>
          </div>
        </form>
      </div>
      <h1 class="is-size-4">
        Set unavailabilities
        <span class="has-text-grey">(optional)</span>
      </h1>
      <p class="help">
        Drag, drop, and resize to create blocks of time that LATE will avoid
        scheduling work/studying within. Click on blocks to remove them.
      </p>
      <FullCalendar
        ref="calendar"
        :plugins="calendar.plugins"
        :events="allEvents"
        :editable="true"
        :selectable="true"
        :event-overlap="false"
        :select-overlap="false"
        :header="false"
        :nav-links="false"
        :column-header-format="calendar.columnHeaderFormat"
        default-view="timeGridWeek"
        :select-mirror="true"
        select-constraint="businessHours"
        event-constraint="businessHours"
        :business-hours="businessHours"
        event-color="black"
        :height="700"
        time-zone="local"
        :all-day-slot="false"
        snap-duration="00:15"
        time-format="h(:mm)t"
        :now-indicator="true"
        :event-render="eventRender"
        :default-date="courses.length > 0 ? courses[0].startDate : new Date()"
        @eventResize="eventChanged"
        @eventDrop="eventChanged"
        @eventClick="eventClick"
        @select="select"
      />
      <hr>
      <b-button
        form="time-preferences"
        type="is-primary"
        :leading="loading"
        class="is-pulled-right"
        @click="saveTimePreferencesAndContinue"
      >
        {{ saved ? '' : 'Save and ' }}Continue
      </b-button>
      <b-button
        type="is-danger"
        :leading="loading"
        class="is-pulled-right margin-right"
        @click="clearAllUnavailabilities"
      >
        Clear All
      </b-button>
    </template>
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

import accountMixin from '@/mixins/account'

export default {
  name: 'AccountSetupUnavailability',
  components: { FullCalendar },
  mixins: [accountMixin, fullcalendar],
  data () {
    return {
      loading: false,
      saved: true,
      earliest: this.$store.state.auth.user.earliestWorkTime,
      latest: this.$store.state.auth.user.latestWorkTime,
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        columnHeaderFormat: {
          weekday: 'short'
        }
      }
    }
  },
  computed: {
    businessHours () {
      return {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: this.earliest,
        endTime: this.fixedLatest
      }
    },
    unavailabilityEvents () {
      return this.$store.getters.current_unavailability.map(unavailability => Object.assign({}, unavailability, {
        id: unavailability._id,
        editable: true,
        eventType: 'unavailability',
        color: 'black'
      }))
    },
    allEvents () {
      return this.$store.getters.getCourseScheduleAsEvents.concat(
        this.unavailabilityEvents
      )
    },
    originalLatest () {
      const parts = this.latest.split(':')
      const hours = parseInt(parts[0])
      if (hours >= 24) {
        const fixedHours = String(hours - 24).padStart(2, '0')
        const minutes = parts[1]
        return `${fixedHours}:${minutes}`
      }

      return this.latest
    },
    fixedLatest () {
      const rawEnd = moment(this.latest, 'HH:mm', true)
      if (rawEnd.isBefore(moment(this.earliest, 'HH:mm', true))) {
        const hours = (24 + rawEnd.hours()).toString()
        const minutes = rawEnd.minutes().toString()
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
      }
      return this.latest
    }
  },
  watch: {
    earliest (minTime) {
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.setOption('businessHours', {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: this.earliest,
        endTime: this.fixedLatest
      })
      this.saved = false
    },
    latest (maxTime) {
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.setOption('businessHours', {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: this.earliest,
        endTime: this.fixedLatest
      })
      this.saved = false
    }
  },
  methods: {
    setLatest (event) {
      this.latest = event.target.value
    },
    eventRender ({ event, el }) {
      el.title = 'Click to remove'
    },
    eventClick ({ event, jsEvent, view }) {
      if (event.extendedProps.eventType !== 'unavailability') return

      this.$buefy.dialog.confirm({
        message: `Remove ${event.title}?`,
        onConfirm: () => this.removeUnavailability(event)
      })
    },
    async eventChanged ({ event, revert }) {
      try {
        await this.updateUnavailability(event)
      } catch (e) {
        console.error(e)
        revert()
      }
    },
    select ({ start, end }) {
      start = moment(start)
      end = moment(end)

      this.$buefy.dialog.prompt({
        message: `What are you doing ${start.format('h:mma')} to ${end.format(
          'h:mma'
        )} on ${start.format('dddd')}?`,
        confirmText: 'Add Block',
        inputAttrs: {
          placeholder: 'e.g. Dinner',
          maxlength: 50
        },
        onConfirm: title => {
          const unavailability = {
            title: title || 'Busy',
            startTime: start.format('HH:mm'),
            endTime:
              end.format('HH:mm') === '00:00' ? '24:00' : end.format('HH:mm'),
            daysOfWeek: [start.day()],
            isOneTime: false
          }

          this.addUnavailability(unavailability)
          this.saved = false
        }
      })
    },
    async addUnavailability (unavailability) {
      let request
      try {
        request = await this.$store.dispatch(
          'ADD_UNAVAILABILITY',
          unavailability
        )
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$store.commit('SET_USER', request.data.updatedUser)

      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.unselect()
    },
    async updateUnavailability (unavailability) {
      try {
        await this.$store.dispatch(
          'UPDATE_UNAVAILABILITY',
          {
            unavailabilityID: unavailability.id,
            updates: {
              startTime: moment(unavailability.start).format('HH:mm'),
              endTime: moment(unavailability.end).format('HH:mm'),
              title: unavailability.title,
              daysOfWeek: [unavailability.start.getDay()]
            }
          }
        )
      } catch (e) {
        this.showError(e.response.data.message)
        throw e
      }
    },
    async removeUnavailability (unavailabilityEvent) {
      try {
        await this.$store.dispatch(
          'REMOVE_UNAVAILABILITY',
          unavailabilityEvent
        )
      } catch (e) {
        this.showError(e.response.data.message)
      }
    },
    async saveTimePreferencesAndContinue () {
      this.loading = true
      let request
      try {
        request = await this.$http.post('/account/timepreference', {
          earliest: this.earliest,
          latest: this.fixedLatest
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser)
      // Notify user of success
      this.$buefy.toast.open({
        type: 'is-success',
        message: 'Your study/work time limits have been saved.'
      })
      this.$router.push({ name: 'setup-integrations' })
      this.loading = false
      this.saved = true
    },
    clearAllUnavailabilities () {
      this.$buefy.dialog.confirm({
        message: 'Clear all unavailable times?',
        onConfirm: async () => {
          let request
          try {
            request = await this.$http.delete('/unavailabilities')
            this.$store.commit('SET_UNAVAILABILITIES', [])
            this.$buefy.toast.open({
              type: 'is-success',
              message: 'Cleared all unavailable times!'
            })
          } catch (e) {
            this.loading = false
            return this.showError(e.response.data.message)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.margin-right {
  margin-right: 1.5em;
}
</style>
