<template>
  <div class="email-setup">
    <label
      for="email"
      class="label"
    >
      Your School Email
    </label>
    <div class="field">
      <div class="control">
        <input
          id="email"
          class="input"
          type="email"
          :value="email"
          disabled
        >
      </div>
    </div>
  </div>
</template>

<script>
import 'bulma-switch';

export default {
  name: 'SetupIntegrationsEmail',
  data () {
    return {
      loading: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.integrations.email.preferences
      )
    };
  },
  computed: {
    email () {
      return this.$store.state.auth.user.rcs_id + '@rpi.edu';
    },
    saved () {
      return (
        JSON.stringify(this.preferences) ===
        JSON.stringify(
          this.$store.state.auth.user.integrations.email.preferences
        )
      );
    }
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
