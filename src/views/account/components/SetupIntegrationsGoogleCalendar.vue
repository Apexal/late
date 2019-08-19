<template>
  <div class="google-calendar-setup has-text-centered">
    <template v-if="verified">
      <p>
        You've connected your Google account to <b>LATE</b>. A calendar titled <code>Coursework (LATE)</code> has been added to your Google Calendar.
        This will hold your course schedule for each term, as well as any study/work blocks you schedule.
      </p>

      <a
        href="https://calendar.google.com/calendar/r"
        target="_blank"
      >Open Google Calendar</a>
    </template>
    <a
      v-else
      href="/auth/google"
      class="button is-large"
    >
      <img
        src="@/assets/img/google-logo.png"
        alt="Google Logo"
      >
      Login with Google</a>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsGoogleCalendar',
  computed: {
    verified () {
      return !!this.$store.state.auth.user.integrations.google.calendarID
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  height: 100%;
  margin-right: 5px;
}
</style>
