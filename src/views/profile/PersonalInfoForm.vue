<template>
  <div
    id="personal-info-form">
    <form @submit.prevent="save">
      <div class="field">
        <label
          class="label"
          for="first-name">First Name</label>
        <div class="control">
          <input
            id="first-name"
            v-model="first_name"
            class="input"
            type="text"
            placeholder="First Name">
        </div>
      </div>

      <div class="field">
        <label
          class="label"
          for="last-name">Last Name</label>
        <div class="control">
          <input
            id="last-name"
            v-model="last_name"
            class="input"
            type="text"
            placeholder="Last Name">
        </div>
      </div>

      <div class="field">
        <label
          class="label"
          for="rin">RIN</label>
        <div class="control">
          <input
            id="rin"
            v-model="rin"
            class="input"
            type="text"
            placeholder="RIN">
        </div>
      </div>

      <button class="button is-primary">Save</button>
    </form>
  </div>
</template>

<script>
import API from '../../api';

export default {
  name: 'PersonalInfoForm',
  data() {
    return {
      first_name: this.$store.state.auth.user.name.first,
      last_name: this.$store.state.auth.user.name.last,
      rin: this.$store.state.auth.user.rin,
      grad_year: this.$store.state.auth.user.grad_year
    };
  },

  computed: {
    isAuthenticated() {
      return this.$store.state.auth.isAuthenticated;
    },
    user() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    async save() {
      const request = await API.post('/setup/personalinfo', {
        first_name: this.first_name,
        last_name: this.last_name,
        rin: this.rin,
        grad_year: this.grad_year
      });

      this.$store.dispatch('SET_USER', request.data.updatedUser);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
