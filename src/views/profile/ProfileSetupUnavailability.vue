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
        What times outside of class are you not able to study/work for
        <b>{{ currentTerm.name }}</b>?
      </h2>
      <div class="box">
        <form
          id="time-preferences"
          @submit.prevent="save"
        >
          <div class="columns">
            <div class="column field">
              <label
                for="earliest"
                class="label"
              >Earliest Time Preference</label>
              <p class="help">
                <b>LATE</b> will not schedule any work for you before this time unless it absolutely does not fit anywhere else.
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
                <b>LATE</b> will not schedule any work for you after this time unless it absolutely does not fit anywhere else.
              </p>
              <div class="control">
                <input
                  id="latest"
                  v-model="latest"
                  type="time"
                  class="input is-small"
                  required
                >
              </div>
            </div>
          </div>
        </form>
      </div>
      <h2>Drag to set your study/work unavailability</h2>
      <p class="help">
        Click on blocks to remove them. You can also drag, drop, and resive them.
      </p>
      <FullCalendar
        ref="calendar"
        :events="allEvents"
        :editable="true"
        :selectable="true"
        :header="calendar.header"
        :config="calendar.config"
        @event-resize="eventResized"
      />
      <hr>
      <button
        form="time-preferences"
        class="button is-primary"
        :class="{'is-loading': loading}"
        :disabled="saved"
      >
        Save and Continue
      </button>
    </template>
  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import TimeInput from '@/components/TimeInput';

export default {
  name: 'ProfileSetupUnavailability',
  components: { FullCalendar, TimeInput },
  data () {
    return {
      loading: false,
      saved: false,
      earliest: this.$store.state.auth.user.earliestWorkTime,
      latest: this.$store.state.auth.user.latestWorkTime,
      calendar: {
        events: [],
        header: {
          left: '',
          center: '',
          right: ''
        },
        config: {
          timezone: 'local',
          height: 700,
          columnHeaderFormat: 'ddd',
          allDaySlot: false,
          snapDuration: '00:15',
          businessHours: {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: this.$store.state.auth.user.earliestWorkTime,
            end: this.$store.state.auth.user.latestWorkTime
          },
          navLinks: false,
          defaultView: 'agendaWeek',
          selectHelper: true,
          eventOverlap: false,
          selectOverlap: false,
          selectConstraint: 'businessHours',
          eventColor: 'black',
          timeFormat: 'h(:mm)t',
          eventClick: this.eventClick,

          select: (start, end) => {
            const eventData = {
              id: 'unavailable',
              eventType: 'unavailability',
              title: prompt('What is it?') || 'Busy',
              start: start.format('HH:mm'),
              editable: false,
              end: end.format('HH:mm'),
              dow: [start.day()]
            };
            this.calendar.events.push(eventData);
            this.$refs.calendar.fireMethod('unselect');
            this.saved = false;
          }
        }
      }
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    allEvents () {
      return this.$store.getters.getCourseScheduleAsEvents.concat(
        this.calendar.events
      );
    },
    fixedLatest () {
      const rawEnd = moment(this.latest, 'HH:mm', true);

      if (rawEnd.isBefore(moment(this.earliest, 'HH:mm', true))) {
        let hours = (24 + rawEnd.hours()).toString();
        let minutes = rawEnd.minutes().toString();

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }

      return this.latest;
    }
  },
  watch: {
    earliest (minTime) {
      this.saved = false;
      this.$refs.calendar.fireMethod('option', 'businessHours', {
        dow: [0, 1, 2, 3, 4, 5, 6],
        start: this.earliest,
        end: this.fixedLatest
      });
    },
    latest (maxTime) {
      this.saved = false;
      this.$refs.calendar.fireMethod('option', 'businessHours', {
        dow: [0, 1, 2, 3, 4, 5, 6],
        start: this.earliest,
        end: this.fixedLatest
      });
    }
  },
  created () {
    this.calendar.events = this.$store.getters.getUnavailabilityAsEvents.slice();
  },
  methods: {
    eventClick (calEvent, jsEvent, view) {
      if (!calEvent.eventType === 'unavailability') return;

      this.saved = false;
      this.calendar.events = this.calendar.events.filter(
        e =>
          !(
            e.dow[0] === calEvent.start.day() &&
            calEvent.start.format('HH:mm') === e.start
          )
      );
    },
    eventResized (calEvent) {
      this.saved = false;
      this.calendar.events.find(e =>
        moment(e.start).isSame(moment(calEvent.start))
      ).end =
        calEvent.end;
    },
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/setup/unavailability', {
          earliest: this.earliest,
          latest: this.fixedLatest,
          events: this.calendar.events
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.show(
        'Your study/work unvailability schedule has been saved.'
      );

      this.$router.push({ name: 'setup-integrations' });

      this.loading = false;
      this.saved = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}
</style>
