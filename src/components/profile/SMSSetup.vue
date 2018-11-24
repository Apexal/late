<template>
  <div class="sms-setup box">
    <h2 class="subtitle">Text Message Notifications</h2>
    <p class="help"><b>LATE</b> can text you to remind you when to study/work, what exactly you should be working on, and will check up on you at the end of the study/work session to check your progress and auto-update your schedule!</p>
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
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
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
            placeholder="5-digit code"
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
</template>

<script>
export default {
  name: 'SMSSetup',
  data () {
    return {
      loading: false,
      phoneNumber: this.$store.state.auth.user.integrations.sms.phoneNumber || '',
      verificationCode: '',
      awaitingVerification: false
    };
  },
  methods: {
    async submitPhoneNumber () {
      if (!this.phoneNumber) return;
      this.loading = true;

      // Verify phone number as a phone number

      // POST to server
      let request;
      try {
        request = await this.$http.post('/integrations/sms/submit', { phoneNumber: this.phoneNumber });
      } catch (e) {
        this.loading = false;
        return this.$store.dispatch('ADD_NOTIFICATION', {
          type: 'danger',
          description: e.response.data.message
        });
      }

      this.$store.dispatch('ADD_NOTIFICATION', { type: 'info', description: request.data.message });

      this.loading = false;
      this.awaitingVerification = true;
    },
    async verify () {
      // POST to server
      this.$store.dispatch('ADD_NOTIFICATION', { type: 'success', description: `Your phone number '${this.phoneNumber}' has been verified!` });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
