<!--Account Setup: Import google calendar-->
<template>
  <div class="google-calendar-setup">
    <h2 class="is-size-4 integration-note">
      Connect to your Google Calendar
      <span class="has-text-grey">(optional)</span>
    </h2>

    <div v-if="!setup || unauthorized">
      <p if="unauthorized">
        Your Google login has expired! Please login with Google again.
      </p>
      <a
        href="/auth/google"
        class="button is-primary"
      >Login with Google</a>
      <hr>
      <b-button
        type="is-secondary"
        class="is-pulled-right"
        @click="skip"
      >
        Skip Step
      </b-button>
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
              :style="{
                'background-color': getCalendarById(calendarIDs.workBlocks)
                  .backgroundColor
              }"
            >{{ getCalendarById(calendarIDs.workBlocks).summary }}</b>
            calendar in your Google Calendar that will sync with your work
            schedule in
            <b>LATE</b>.
            <br>It gets automatically updated when
            you:
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
          <div
            v-if="calendarIDs.courseSchedule === ''"
            class="has-text-centered"
          >
            <b-button
              type="is-danger"
              :loading="loading"
              :disabled="loading"
              @click="createCourseScheduleCalendar"
            >
              Create Calendar for Course Schedule
            </b-button>
          </div>
          <div
            v-else
            class="content"
          >
            <p>
              <b>LATE</b> has created the
              <b
                :title="getCalendarById(calendarIDs.courseSchedule).summary"
                class="tag has-text-white google-calendar-tag"
                :style="{
                  'background-color': getCalendarById(
                    calendarIDs.courseSchedule
                  ).backgroundColor
                }"
              >{{ getCalendarById(calendarIDs.courseSchedule).summary }}</b>
              calendar in your Google Calendar and placed all of your course
              periods into it.
            </p>
          </div>
        </div>
        <hr>
        <b-button
          type="is-primary"
          :disabled="saved"
          class="is-pulled-right"
          @click="save"
        >
          Save and Continue
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountSetupGoogleCalendar',
  data () {
    return {
      unauthorized: false,
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
    }
  },
  async mounted () {
    if (this.setup) this.getCalendars();
  },
  methods: {
    async createCourseScheduleCalendar () {
      this.$dialog.confirm({
        message: `This will create a new calendar specifically for your <b>${
          this.currentTerm.name
        }</b> course schedule.`,
        onConfirm: async () => {
          this.loading = true;
          let request;
          try {
            request = await this.$http.post('/google/calendars', {
              calendarType: 'courseSchedule',
              summary: `${this.currentTerm.name} Course Schedule`,
              description: 'This calender was created by LATE.'
            });
          } catch (e) {
            this.$toast.open({
              message: e.response.data.message,
              type: 'is-danger'
            });
            this.loading = false;
            return;
          }
          this.loading = false;
          const createdCalendar = request.data.createdCalendar;

          this.calendars.push(createdCalendar);
          this.calendarIDs.courseSchedule = createdCalendar.id;

          await this.$store.dispatch('SET_USER', request.data.updatedUser);

          this.$toast.open({
            message: `Added '${
              createdCalendar.summary
            }' to your Google Calendar!`,
            type: 'is-success'
          });

          this.loading = false;
        }
      });
    },
    async createWorkBlockCalendar () {
      this.$dialog.confirm({
        message:
          'This will create a new calendar specifically for work blocks.',
        onConfirm: async () => {
          this.loading = true;
          let request;
          try {
            request = await this.$http.post('/google/calendars', {
              calendarType: 'workBlocks',
              summary: 'LATE Study/Work',
              description: 'This calender was created by LATE.'
            });
          } catch (e) {
            this.$toast.open({
              message: e.response.data.message,
              type: 'is-danger'
            });
            this.loading = false;
            return;
          }
          const createdCalendar = request.data.createdCalendar;

          this.calendars.push(createdCalendar);
          this.calendarIDs.workBlocks = createdCalendar.id;

          await this.$store.dispatch('SET_USER', request.data.updatedUser);

          this.$toast.open({
            message: `Added '${
              createdCalendar.summary
            }' to your Google Calendar!`,
            type: 'is-success'
          });

          this.loading = false;
        }
      });
    },
    getCalendarById (id) {
      return this.calendars.find(c => c.id === id);
    },
    async getCalendars () {
      this.loading = true;
      this.unauthorized = false;
      let request;

      try {
        request = await this.$http.get('/google/calendars', {
          params: {
            minAccessRole: 'owner'
          }
        });
      } catch (e) {
        this.unauthorized = true;
        this.loading = false;
        return;
      }
      this.calendars = request.data.calendars;
      this.loading = false;
    },
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/google', {
          calendarIDs: this.calendarIDs
        });
      } catch (e) {
        this.loading = false;
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toast.open({
        type: 'is-success',
        message: 'Saved Google Calendar settings!'
      });

      this.$router.push({ name: 'setup-complete' });

      this.loading = false;
    },
    async skip () {
      this.$router.push({ name: 'setup-complete' });
    },
    async reset (calendarType) {
      this.$toast.open({ type: 'is-success', message: 'Coming soon...' });
    }
  }
};
</script>

<style lang="scss" scoped>
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
