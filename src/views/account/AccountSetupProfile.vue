<!--Account Setup: User profile setup-->
<template>
  <div class="account-setup-profile">
    <h2 class="is-size-4 integration-note">
      Tell us about yourself!
    </h2>
    <form @submit.prevent="save">
      <div class="columns">
        <div class="column is-full">
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
                v-model.trim="first_name"
                class="input"
                type="text"
                placeholder="First Name"
                autocomplete="given-name"
                required
                @change="saved = false"
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
                v-model.trim="last_name"
                class="input"
                type="text"
                placeholder="Last Name"
                autocomplete="family-name"
                required
                @change="saved = false"
              >
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label
              for="grad-year"
              class="label"
            >Graduation Year <small class="has-text-grey">(optional)</small></label>
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
                @change="saved = false"
              >
            </div>
          </div>
        </div>

        <div class="column">
          <div class="field">
            <label
              for="major"
              class="label"
            >Major <small class="has-text-grey">(optional)</small></label>
            <div class="control">
              <input
                id="major"
                v-model.trim="major"
                class="input"
                type="text"
                placeholder="What are you majoring in?"
                required
                @change="saved = false"
              >
            </div>
          </div>
        </div>
      </div>
      <hr>

      <div class="buttons is-pulled-right">
        <b-button
          type="is-dark"
          @click="startImportFromSIS"
        >
          Import from SIS
        </b-button>
        <b-button
          type="is-primary"
          :loading="loading"
          :disabled="saved"
          @click="save"
        >
          Save and Continue
        </b-button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AccountSetupProfile',
  data () {
    return {
      saved: false,
      loading: false,
      first_name: '',
      last_name: '',
      rin: '',
      grad_year: '',
      major: ''
    };
  },
  watch: {
    user: 'updateFields'
  },
  created () {
    this.updateFields();
  },
  methods: {
    updateFields () {
      this.first_name = this.$store.state.auth.user.name
        ? this.$store.state.auth.user.name.first
        : '';
      this.last_name = this.$store.state.auth.user.name
        ? this.$store.state.auth.user.name.last
        : '';

      this.grad_year = this.$store.state.auth.user.grad_year || '';
      this.major = this.$store.state.auth.user.major || '';
    },
    promptRIN (onConfirm) {
      this.$dialog.prompt({
        message: 'What is your RPI RIN?',
        inputAttrs: {
          type: 'text',
          minlength: 1,
          maxlength: 20
        },
        onConfirm
      });
    },
    promptPIN (onConfirm) {
      this.$dialog.prompt({
        message: 'What is your RPI SIS password?',
        inputAttrs: {
          type: 'password',
          minlength: 1,
          placeholder: 'This is not saved anywhere ever.',
          maxlength: 300
        },
        onConfirm
      });
    },
    startImportFromSIS () {
      this.promptRIN(rin => {
        this.promptPIN(pin => {
          this.importFromSIS(rin, pin);
        });
      });
    },
    async importFromSIS (rin, pin) {
      this.loading = true;
      let request;
      try {
        request = await this.$http.post('/account/profile', {
          method: 'sis',
          rin,
          pin
        });
      } catch (e) {
        this.loading = false;
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      this.loading = false;
    },
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/profile', {
          method: 'manual',
          first_name: this.first_name,
          last_name: this.last_name,
          grad_year: this.grad_year,
          major: this.major
        });
      } catch (e) {
        this.loading = false;
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toast.open({ type: 'is-success', message: 'Saved personal info!' });

      this.$router.push({ name: 'setup-terms' });

      // this.saved = true;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
