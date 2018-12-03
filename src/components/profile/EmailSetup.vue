<template>
  <div class="email-setup">
    <h2 class="subtitle">Email Notifications</h2>

    <form @submit.prevent="save">
      <div class="field">
        <input
          id="enabled"
          v-model="enabled"
          type="checkbox"
          class="switch"
        >
        <label for="enabled">
          <b>Enable weekly email reports</b>
        </label>
      </div>

      <hr>

      <button class="button is-dark">Save</button>
    </form>
  </div>
</template>

<script>
import 'bulma-switch';

export default {
  name: 'EmailSetup',
  data () {
    return {
      enabled: this.$store.state.auth.user.integrations.email
        .sendWeeklyProgressReports // wew
    };
  },
  methods: {
    async save () {
      this.$toasted.error('Not yet implemented!', {
        icon: 'frown',
        duration: 1000,
        fullWidth: false
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
