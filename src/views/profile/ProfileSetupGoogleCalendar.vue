<template>
  <div class="google-calendar-setup">
    <h2 class="is-size-4 integration-note">
      Connect to your Google Calendar
      <span class="has-text-grey">(optional)</span>
    </h2>
    <div v-if="!verified">
      <a
        href="/auth/google"
        class="button is-primary"
      >Login with Google</a>
    </div>
    <div
      v-if="calendarID === ''"
      class="calendar-list columns is-multiline"
    >
      <div
        v-for="calendar in calendars"
        :key="calendar.id"
        class="column is-half"
      >
        <div
          class="box calendar"
          :style="{ 'background-color': calendar.backgroundColor }"
          @click="calendarID = calendar.id"
        >
          <h2 class="subtitle">
            {{ calendar.summary }}
          </h2>
        </div>
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
      calendarID: '',
      calendars: []
    };
  },
  computed: {
    verified () {
      return false;
    },
    user () {
      return this.$store.state.auth.user;
    }
  },
  async created () {
    this.getCalendars();
  },
  methods: {
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
