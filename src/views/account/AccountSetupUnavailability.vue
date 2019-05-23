<template>
  <div class="setup-unavailability">
    <template v-if="onBreak">
      <h2 class="subtitle has-text-centered">
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
        :events="allEvents"
        :editable="true"
        :selectable="true"
        :header="calendar.header"
        :config="calendar.config"
        @event-resize="eventResized"
      />
      <hr>
      <b-button
        form="time-preferences"
        type="is-primary"
        :leading="loading"
        :disabled="saved"
      >
        Save and Continue
      </b-button>
    </template>
  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import TimeInput from '@/views/components/TimeInput';

export default {
  name: 'AccountSetupUnavailability',
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
          select: this.select
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
        this.$store.getters.getUnavailabilityAsEvents
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
      if (calEvent.eventType !== 'unavailability') return;

      this.$dialog.confirm({
        message: `Remove ${calEvent.title}?`,
        onConfirm: () => this.removeUnavailability(calEvent)
      });
    },
    eventResized (calEvent) {
      // TODO: can do
    },
    select (start, end) {
      this.$dialog.prompt({
        message: `What are you doing ${start.format('h:mma')} to ${start.format(
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
            start: start.format('HH:mm'),
            end: end.format('HH:mm'),
            dow: [start.day()],
            isOneTime: false
          };

          this.addUnavailability(unavailability);
          this.$refs.calendar.fireMethod('unselect');
          this.saved = false;
        }
      });
    },
    async addUnavailability (unavailability) {
      let request;
      try {
        request = await this.$store.dispatch(
          'ADD_UNAVAILABILITY',
          unavailability
        );
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        return;
      }

      this.$store.commit('SET_USER', request.data.updatedUser);

      this.$toasted.success(
        `Added "${
          request.data.createdUnavailability.title
        }" to your unavailability.`
      );
    },
    async removeUnavailability (unavailability) {
      let request;
      try {
        request = await this.$store.dispatch(
          'REMOVE_UNAVAILABILITY',
          unavailability
        );
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        return;
      }

      this.$toasted.success(
        `Removed "${
          request.data.deletedUnavailability.title
        }" from your unavailability.`
      );
    },
    async saveTimePreferences () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/timepreference', {
          earliest: this.earliest,
          latest: this.fixedLatest
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.show('Your study/work time limits have been saved.');

      this.$router.push({ name: 'setup-integrations' });

      this.loading = false;
      this.saved = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
