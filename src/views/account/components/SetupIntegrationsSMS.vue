<!--Account: SMS integration module-->
<template>
  <div class="sms-setup">
    <div
      v-if="verified"
      class="sms-preferences"
    >
      <label
        for="phone-number"
        class="label"
      >Your Phone Number</label>
      <div class="field has-addons">
        <div class="control">
          <a class="button is-static">+1</a>
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
          <b-button
            type="is-danger"
            @click="disable"
          >
            Disable
          </b-button>
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
        >Your Phone Number</label>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static">+1</a>
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
            <b-button
              :loading="loading"
              type="is-info"
              @click="submitPhoneNumber"
            >
              Submit
            </b-button>
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
        >Verification Code</label>
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
            <b-button
              :loading="loading"
              type="is-danger"
              @click="verify"
            >
              Verify
            </b-button>
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
    }
  },
  computed: {
    verified () {
      return this.$store.state.auth.user.integrations.sms.verified
    },
    saved () {
      return false
    }
  },
  methods: {
    async submitPhoneNumber () {
      if (!this.phoneNumber) return
      this.loading = true

      // Verify phone number as a phone number

      // POST to server
      let request
      try {
        request = await this.$http.post('/integrations/sms/submit', {
          phoneNumber: this.phoneNumber
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$buefy.toast.open({ type: 'is-success', message: request.data.message })

      this.loading = false
      this.awaitingVerification = true
    },
    async verify () {
      if (!this.verificationCode) return

      this.loading = true

      let request
      try {
        request = await this.$http.post('/integrations/sms/verify', {
          verificationCode: this.verificationCode
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser)

      this.$buefy.toast.open({
        type: 'is-success',
        message: `Successfully verified your phone number ${
          request.data.updatedUser.integrations.sms.phoneNumber
        }!`
      })

      this.loading = false
    },
    async disable () {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to disable SMS integration?',
        onConfirm: async () => {
          this.loading = true

          let request
          try {
            request = await this.$http.delete('/integrations/sms')
          } catch (e) {
            this.loading = false
            return this.showError(e.response.data.message)
          }

          await this.$store.dispatch('SET_USER', request.data.updatedUser)
          this.$buefy.toast.open({
            type: 'is-success',
            message: 'Successfully disabled SMS integration!'
          })
          this.loading = false
        }
      })
    },
    async resetPhoneNumber () {
      this.showError('Coming soon!')
    }
  }
}
</script>

<style lang="scss" scoped>
.control:nth-child(2) input {
  border: 1px solid #dbdbdb;
  color: #7a7a7a;
}
</style>
