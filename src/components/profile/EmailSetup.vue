<template>
  <div class="email-setup">
    <h2 class="subtitle">Email Notifications</h2>

    <form @submit.prevent="save">
      <div class="field">
        <input
          id="enabled"
          v-model="preferences.enabled"
          type="checkbox"
          class="switch"
        >
        <label for="enabled">
          <b>Enable email reports</b>
        </label>
      </div>
      <div class="field">
        <input
          id="daily-reports"
          v-model="preferences.dailyReports"
          type="checkbox"
          class="switch"
          :disabled="!preferences.enabled"
        >
        <label for="daily-reports">
          Receive
          <b>daily</b> morning reports about upcoming assignments and your work schedule
        </label>
      </div>
      <div class="field">
        <input
          id="weekly-reports"
          v-model="preferences.weeklyReports"
          type="checkbox"
          class="switch"
          :disabled="!preferences.enabled"
        >
        <label for="weekly-reports">
          Receive
          <b>weekly</b> reports on overall progress for the previous week
        </label>
      </div>

      <hr>

      <button
        :class="{ 'is-loading': loading }"
        class="button is-dark"
      >Save</button>
    </form>
  </div>
</template>

<script>
import 'bulma-switch';

export default {
  name: 'EmailSetup',
  data () {
    return {
      loading: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.integrations.email.preferences
      )
    };
  },
  methods: {
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post(
          '/integrations/email/preferences',
          this.preferences
        );
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$toasted.success('Successfully updated your email preferences!');

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
