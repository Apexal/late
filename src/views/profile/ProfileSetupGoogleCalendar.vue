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
          <b>Chosen Calendar:</b>
          <span>{{ getCalendarById(calendarIDs.workBlocks).summary }}</span>
          <button
            class="button is-warning"
            @click="calendarIDs.workBlocks = ''"
          >
            Change
          </button>
        </div>
        <div v-else>
          <h2 class="subtitle">
            Choose a Calendar
          </h2>
          <div class="calendar-list columns is-multiline">
            <div
              v-for="calendar in calendars"
              :key="calendar.id"
              class="column is-one-third"
            >
              <div
                class="box calendar"
                :style="{ 'background-color': calendar.backgroundColor }"
                @click="calendarIDs.workBlocks = calendar.id"
              >
                <h2 class="subtitle">
                  <div
                    v-if="calendar.id === calendar.summary"
                    class="tag is-white"
                  >
                    Primary
                  </div>
                  {{ calendar.summary }}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr>
      <button
        class="button is-primary"
        :disabled="saved"
        @click="save"
      >
        Save
      </button>
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
      calendarIDs: Object.assign(
        {},
        this.$store.state.auth.user.integrations.google.calendarIDs
      ),
      calendars: []
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
  async created () {
    this.getCalendars();
  },
  methods: {
    getCalendarById (id) {
      return this.calendars.find(c => c.id === id);
    },
    async getCalendars () {
      let request = await this.$http.get('/google/calendars', {
        params: {
          minAccessRole: 'owner'
        }
      });

      this.calendars = request.data.calendars;
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
</style>
