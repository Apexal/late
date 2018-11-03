<template>
  <div id="personalInfoForm">
    <form>
      <div class="field">
        <label class="label">First Name</label>
        <div class="control">
          <input
            :value="user.name.first"
            class="input"
            type="text"
            placeholder="First Name">
        </div>
      </div>

      <div class="field">
        <label class="label">Last Name</label>
        <div class="control">
          <input
            :value="user.name.last"
            class="input"
            type="text"
            placeholder="Last Name">
        </div>
      </div>

    </form>
  </div>
</template>

<script>
export default {
  name: 'PersonalInfoForm',
  computed: {
    user () { return this.$store.state.auth.user; }
  }
};
</script>

<style lang="scss" scoped>
</style>
