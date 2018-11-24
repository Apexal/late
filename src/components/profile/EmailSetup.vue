<template>
  <div class="email-setup box">
    <h2 class="subtitle">Email Notifications</h2>

    <form @submit.prevent="save">
      <div class="field">
        <input
          id="enabled"
          v-model="enabled"
          type="checkbox"
          class="switch"
        >
        <label for="enabled">Enable weekly email reports</label>
      </div>

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
      enabled: this.$store.state.auth.user.integrations.email.sendWeeklyProgressReports // wew
    };
  },
  methods: {
    async save () {

    }
  }
};
</script>

<style lang="scss" scoped>
</style>
