<template>
  <div class="google-calendar-setup">
    <h2 class="is-size-4 integration-note">
      Connect to your Google Calendar
      <span class="has-text-grey">(optional)</span>
    </h2>

    <div v-if="!setup">
      <a
        href="/auth/google"
        class="button is-primary"
      >Login with Google</a>
    </div>
    <div v-else>
      <div v-if="loading">
        <p class="has-text-grey has-text-centered">
          Grabbing your Google Calendar data...
        </p>
      </div>
      <div v-else>
        <div class="tabs">
          <ul>
            <li
              :class="{ 'is-active': tab === 'courseSchedule' }"
              @click="tab = 'courseSchedule'"
            >
              <a>Course Schedule</a>
            </li>
            <li
              :class="{ 'is-active': tab === 'workBlocks' }"
              @click="tab = 'workBlocks'"
            >
              <a>Work Blocks</a>
            </li>
          </ul>
        </div>
        <div
          v-if="tab === 'workBlocks'"
          class="work-block-calendar"
        >
          <div v-if="calendarIDs.workBlocks !== ''">
            <b>LATE</b> has created the
            <b
              :title="getCalendarById(calendarIDs.workBlocks).summary"
              class="tag has-text-white google-calendar-tag"
              :style="{ 'background-color': getCalendarById(calendarIDs.workBlocks).backgroundColor }"
            >{{ getCalendarById(calendarIDs.workBlocks).summary }}</b> calendar in your Google Calendar that will sync with your work schedule in
            <b>LATE</b>.
            <br>It gets automatically updated when you:
            <ul class="points">
              <li>create a work block on LATE</li>
              <li>resize/move a work block on LATE</li>
              <li>delete a work block on LATE</li>
            </ul>
            <br>
            <b-button
              title="Remove calendar and reset"
              type="is-danger"
              @click="reset('workBlocks')"
            >
              Reset
            </b-button>
          </div>
          <div v-else>
            <b-button
              type="is-danger"
              :loading="loading"
              :disabled="loading"
              @click="createWorkBlockCalendar"
            >
              Create Calendar for Work Blocks
            </b-button>
          </div>
        </div>
        <div v-else-if="tab === 'courseSchedule'">
          <p class="has-text-grey has-text-centered">
            Coming soon...
          </p>
        </div>
        <hr>
        <b-button
          type="is-primary"
          :disabled="saved"
          @click="save"
        >
          Save
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileSetupGoogleCalendar',
  data () {
    return {
      loading: false,
      tab: 'workBlocks',
      calendars: [],
      calendarIDs: Object.assign(
        {},
        this.$store.state.auth.user.integrations.google.calendarIDs
      )
    };
  },
  computed: {
    saved () {
      return (
        JSON.stringify(
          this.$store.state.auth.user.integrations.google.calendarIDs
        ) === JSON.stringify(this.calendarIDs)
      );
    },
    setup () {
      return this.$store.getters.userSetup.google;
    },
    user () {
      return this.$store.state.auth.user;
    }
  },
  async mounted () {
    if (this.setup) this.getCalendars();
  },
  methods: {
    async createWorkBlockCalendar () {
      if (
        !confirm(
          'This will create a new calendar specifically for work blocks.'
        )
      ) {
        return;
      }
      this.loading = true;
      let request;
      try {
        request = await this.$http.post('/google/calendars', {
          calendarType: 'workBlocks',
          summary: 'LATE Study/Work',
          description: 'This calender was created by LATE.'
        });
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.loading = false;
        return;
      }
      const createdCalendar = request.data.createdCalendar;

      this.calendars.push(createdCalendar);
      this.calendarIDs.workBlocks = createdCalendar.id;

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      this.$toasted.success(
        `Added '${createdCalendar.summary}' to your Google Calendar!`
      );

      this.loading = false;
    },
    getCalendarById (id) {
      return this.calendars.find(c => c.id === id);
    },
    async getCalendars () {
      this.loading = true;
      let request = await this.$http.get('/google/calendars', {
        params: {
          minAccessRole: 'owner'
        }
      });
      this.calendars = request.data.calendars;
      this.loading = false;
    },
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/setup/google', {
          calendarIDs: this.calendarIDs
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.show('Saved Google Calendar settings!');

      this.loading = false;
    },
    async reset (calendarType) {
      this.$toasted.show('Coming soon...');
    }
  }
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}

.box.calendar {
  cursor: pointer;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.9;
  }
}

ul.points {
  list-style-type: initial;
  padding-left: 20px;
}
</style>
