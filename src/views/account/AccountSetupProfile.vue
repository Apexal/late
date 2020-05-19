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
                v-model.trim="firstName"
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
                v-model.trim="lastName"
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
                v-model.number="graduationYear"
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
          type="is-primary"
          :loading="loading"
          @click="saveAndContinue"
        >
          {{ saved ? '' : 'Save and ' }}Continue
        </b-button>
      </div>
    </form>
  </div>
</template>

<script>
import accountMixin from '@/mixins/account'

export default {
  name: 'AccountSetupProfile',
  mixins: [accountMixin],
  data () {
    return {
      saved: true,
      loading: false,
      firstName: '',
      lastName: '',
      graduationYear: '',
      major: ''
    }
  },
  watch: {
    user: 'updateFields'
  },
  created () {
    this.updateFields()
  },
  methods: {
    updateFields () {
      this.firstName = this.$store.state.auth.user.name
        ? this.$store.state.auth.user.name.first
        : ''
      this.lastName = this.$store.state.auth.user.name
        ? this.$store.state.auth.user.name.last
        : ''

      this.graduationYear = this.$store.state.auth.user.graduationYear || ''
      this.major = this.$store.state.auth.user.major || ''
    },
    async saveAndContinue () {
      if (this.saved) {
        this.$router.push({ name: 'setup-terms' })
        return
      }

      this.loading = true

      let request
      try {
        request = await this.$http.post('/account/profile', {
          first_name: this.firstName,
          last_name: this.lastName,
          graduationYear: this.graduationYear,
          major: this.major
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser)

      // Notify user of success
      this.$buefy.toast.open({ type: 'is-success', message: 'Saved personal info!' })

      this.$router.push({ name: 'setup-terms' })

      this.saved = true
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
