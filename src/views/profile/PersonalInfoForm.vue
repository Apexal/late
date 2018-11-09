<template>
  <div
    id="personal-info-form"
  >
    <form @submit.prevent="save">
      <div class="field">
        <label
          class="label"
          for="rcs-id"
        >RCS ID</label>
        <div class="control">
          <input
            id="rcs-id"
            :value="user.rcs_id"
            class="input"
            type="text"
            placeholder="RCS ID"
            disabled
          >
        </div>
      </div>

      <div class="columns is-multiline">
        <div class="column is-half">
          <div class="field">
            <label
              class="label"
              for="first-name"
            >First Name</label>
            <div class="control">
              <input
                id="first-name"
                v-model="first_name"
                class="input"
                type="text"
                placeholder="First Name"
                required
              >
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label
              class="label"
              for="last-name"
            >Last Name</label>
            <div class="control">
              <input
                id="last-name"
                v-model="last_name"
                class="input"
                type="text"
                placeholder="Last Name"
                required
              >
            </div>
          </div>
        </div>

        <div class="column is-half">
          <div class="field">
            <label
              class="label"
              for="rin"
            >RIN</label>
            <div class="control">
              <input
                id="rin"
                v-model="rin"
                class="input"
                type="text"
                placeholder="RIN"
                required
              >
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label
              for="grad-year"
              class="label"
            >Graduation Year</label>
            <div class="control">
              <input
                id="grad-year"
                v-model.number="grad_year"
                type="number"
                min="2000"
                max="3000"
                step="1"
                class="input"
                placeholder="2022"
                required
              >
            </div>
          </div>
        </div>
      </div>

      <button
        class="button is-primary"
        :class="loading ? 'is-loading': ''"
      >Save and Continue</button>
    </form>
  </div>
</template>

<script>
import API from '../../api';

export default {
  name: 'PersonalInfoForm',
  data() {
    return {
      loading: false,
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
      this.loading = true;

      const request = await API.post('/setup/personalinfo', {
        first_name: this.first_name,
        last_name: this.last_name,
        rin: this.rin,
        grad_year: this.grad_year
      });

      this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$store.commit('ADD_NOTIFICATION', { type: 'success', description: 'Saved personal info!'});
      this.$router.push('/profile/courseschedule');

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
