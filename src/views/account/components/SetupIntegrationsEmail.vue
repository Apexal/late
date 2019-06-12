<!--Account: Email integration module -->
<template>
  <div class="email-setup">
    <label
      for="email"
      class="label"
    >Your School Email</label>
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
export default {
  name: 'SetupIntegrationsEmail',
  computed: {
    email () {
      return this.$store.state.auth.user.rcs_id + '@rpi.edu';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
