<template>
  <div class="google-calendar-setup">
    <h2 class="is-size-4 integration-note">
      Connect to Google Calendar <span class="has-text-grey">optional</span>
    </h2>
  </div>
</template>

<script>
export default {
  name: 'ProfileSetupGoogleCalendar',
  data () {
    return {
      loading: false

    };
  },
  computed: {
    user () {
      return this.$store.state.auth.user;
    }
  },
  created () {

  },
  methods: {
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
