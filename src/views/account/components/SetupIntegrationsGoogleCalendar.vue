<template>
  <div class="google-calendar-setup has-text-centered">
    <template v-if="verified">
      yeet
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
      return !!this.$store.state.auth.user.integrations.google.calendarID;
    }
  }
};
</script>

<style lang="scss" scoped>
img {
  height: 100%;
  margin-right: 5px;
}
</style>
