<template>
  <div class="google-calendar-setup">
    <h2 class="is-size-4 integration-note">
      Connect to your Google Calendar <span class="has-text-grey">(optional)</span>
    </h2>
    <div>
      <a
        href="/auth/google"
        class="button is-primary"
      >Login with Google</a>
    </div>
    <div class="calendar-list">
      <div
        v-for="calendar in calendars"
        :key="calendar.id"
        class="box"
      >
        <h2 class="subtitle">
          {{ calendar.summary }}
        </h2>
        <p>{{ calendar.description }}</p>
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
      calendars: []
    };
  },
  computed: {
    user () {
      return this.$store.state.auth.user;
    }
  },
  async created () {
    this.getCalendars();
  },
  methods: {
    async getCalendars () {
      let request = await this.$http.get('/google/calendars');

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
</style>
