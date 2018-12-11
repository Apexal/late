<template>
  <div class="sms-setup">
    <div
      v-if="verified"
      class="sms-preferences"
    >
      <h2 class="subtitle">
        SMS Notifications
      </h2>

      <label
        for="phoneNumber"
        class="label"
      >
        Your Phone Number
      </label>
      <div class="field has-addons">
        <div class="control">
          <a class="button is-static">
            +1
          </a>
        </div>
        <div class="control">
          <input
            id="phoneNumber"
            class="input"
            type="tel"
            :value="phoneNumber"
            disabled
          >
        </div>
        <div class="control">
          <button
            class="button is-warning"
            @click="resetPhoneNumber"
          >
            Change
          </button>
        </div>
      </div>

      <hr>

      <form @submit.prevent="savePreferences">
        <div class="field">
          <input
            id="enabled"
            v-model="preferences.enabled"
            type="checkbox"
            class="switch"
          >
          <label for="enabled">
            <b>Enable SMS integration</b>
          </label>
        </div>

        <div class="field">
          <input
            id="preWorkText"
            v-model="preferences.preWorkText"
            type="checkbox"
            class="switch"
            :disabled="!preferences.enabled"
          >
          <label for="preWorkText">
            Receive text
            <b>before</b> study/work blocks
          </label>
        </div>

        <div class="field">
          <input
            id="postWorkText"
            v-model="preferences.postWorkText"
            type="checkbox"
            class="switch"
            :disabled="!preferences.enabled"
          >
          <label for="postWorkText">
            Receive text
            <b>after</b> study/work blocks
          </label>
        </div>

        <div class="field">
          <input
            id="reminders"
            v-model="preferences.reminders"
            type="checkbox"
            class="switch"
            :disabled="!preferences.enabled"
          >
          <label for="reminders">
            Receive reminders about upcoming assignments close to their due dates
          </label>
        </div>

        <hr>

        <div>
          <button
            style="margin-right: 5px;"
            :class="{ 'is-loading': loading }"
            class="button is-dark"
          >
            Save
          </button>
          <router-link
            style="padding:4px;"
            class="button is-primary"
            :class="{'is-loading': loading}"
            to="/dashboard"
            @click="finish"
          >
            Finish
          </router-link>
        </div>
      </form>
    </div>
    <div
      v-else
      class="box verify-sms"
    >
      <h2 class="subtitle">
        Text Message Notifications
      </h2>
      <p class="help">
        <b>LATE</b> can text you to remind you when to study/work, what exactly you should be working on, and will check up on you at the end of the study/work session to check your progress and auto-update your schedule!
      </p>
      <form
        v-if="!awaitingVerification"
        @submit.prevent="submitPhoneNumber"
      >
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              +1
            </a>
          </p>
          <div class="control is-expanded">
            <input
              v-model="phoneNumber"
              class="input"
              type="tel"
              minlength="10"
              maxlength="12"
              placeholder="xxx-xxx-xxxx"
              required
            >
          </div>
          <div class="control">
            <button
              :class="{ 'is-loading': loading }"
              class="button is-info"
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      <form
        v-if="awaitingVerification"
        @submit.prevent="verify"
      >
        <div class="field has-addons">
          <div class="control is-expanded">
            <input
              v-model="verificationCode"
              class="input"
              type="text"
              placeholder="verification code"
              required
            >
          </div>
          <div class="control">
            <button
              :class="{ 'is-loading': loading }"
              class="button is-danger"
            >
              Verify
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsSMS',
  data () {
    return {
      loading: false,
      phoneNumber:
        this.$store.state.auth.user.integrations.sms.phoneNumber || '',
      verificationCode: '',
      awaitingVerification: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.integrations.sms.preferences
      )
    };
  },
  computed: {
    verified () {
      return this.$store.state.auth.user.integrations.sms.verified;
    }
  },
  methods: {
    async submitPhoneNumber () {
      if (!this.phoneNumber) return;
      this.loading = true;

      // Verify phone number as a phone number

      // POST to server
      let request;
      try {
        request = await this.$http.post('/integrations/sms/submit', {
          phoneNumber: this.phoneNumber
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      this.$toasted.info(request.data.message);

      this.loading = false;
      this.awaitingVerification = true;
    },
    async verify () {
      if (!this.verificationCode) return;

      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/integrations/sms/verify', {
          verificationCode: this.verificationCode
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser);

      this.$toasted.success(
        `Successfully verified your phone number ${
          request.data.updatedUser.integrations.sms.phoneNumber
        }!`
      );

      this.loading = false;
    },
    async savePreferences () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post(
          '/integrations/sms/preferences',
          this.preferences
        );
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$toasted.success('Successfully updated your SMS preferences!');

      this.loading = false;
    },
    async resetPhoneNumber () {
      this.$toasted.error('Coming soon!', {
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
