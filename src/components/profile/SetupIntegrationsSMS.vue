<template>
  <div class="sms-setup">
    <div
      v-if="verified"
      class="sms-preferences"
    >
      <label
        for="phone-number"
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
            id="phone-number"
            class="input"
            type="tel"
            :value="phoneNumber"
            disabled
          >
        </div>
        <!--<div class="control">
          <button class="button is-warning" @click="resetPhoneNumber">Change</button>
        </div>-->
        <div class="control">
          <button
            class="button is-danger"
            @click="disable"
          >
            Disable
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="verify-sms"
    >
      <form
        v-if="!awaitingVerification"
        @submit.prevent="submitPhoneNumber"
      >
        <label
          for="new-phone-number"
          class="label"
        >
          Your Phone Number
        </label>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">
              +1
            </a>
          </p>
          <div class="control is-expanded">
            <input
              id="new-phone-number"
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
        <label
          for="verification-code"
          class="label"
        >
          Verification Code
        </label>
        <div class="field has-addons">
          <div class="control is-expanded">
            <input
              id="verification-code"
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
      awaitingVerification: false
    };
  },
  computed: {
    verified () {
      return this.$store.state.auth.user.integrations.sms.verified;
    },
    saved () {
      return false;
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
    async disable () {
      if (!confirm('Are you sure you want to disable SMS integration?')) return;

      this.loading = true;

      let request;
      try {
        request = await this.$http.delete('/integrations/sms');
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$toasted.success('Successfully disabled SMS integration!');

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
