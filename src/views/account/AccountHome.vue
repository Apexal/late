<!--Start setup page-->

<template>
  <div class="account-home">
    <SISManModal
      :open="showingModal"
      :reimporting="$route.query.importFromSIS"
      @sis-import="startImportFromSIS"
      @manual="$router.push({name: 'setup-profile'})"
      @close-modal="showingModal = false"
    />
    <h1 class="is-size-5 integration-note">
      For
      <b>LATE</b> to function, it must know basic info about yourself, your
      course schedule, your work/study schedule, and (optionally) accounts you
      want to integrate
      <b>LATE</b> with.
    </h1>
    <br>
    <div class="has-text-centered">
      <router-link
        class="button is-medium"
        :to="{name: 'setup-profile'}"
      >
        Manual Setup
      </router-link>
      <b-button
        size="is-medium"
        type="is-primary"
        @click="startImportFromSIS"
      >
        Import from SIS
      </b-button>
    </div>
  </div>
</template>

<script>
import SISManModal from '@/views/sisman/components/SISManModal'

import accountMixin from '@/mixins/account'

export default {
  name: 'AccountHome',
  components: { SISManModal },
  mixins: [accountMixin],
  data () {
    return {
      showingModal: false,
      loading: false
    }
  },
  watch: {
    user (newUser) {
      this.showingModal = !newUser.setup.profile
    }
  },
  mounted () {
    if (this.$route.query.importFromSIS) { this.showingModal = true } else { this.showingModal = !this.user.setup.profile }
  },
  methods: {
    startImportFromSIS () {
      this.promptRIN(rin => {
        this.promptPIN(pin => {
          this.importFromSIS(rin, pin)
        })
      })
    },
    async importFromSIS (rin, pin) {
      this.loading = true

      let request
      try {
        request = await this.$http.post('/account/sisimport', {
          rin,
          pin
        })
      } catch (e) {
        this.loading = false
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser)
      await this.$store.commit('SET_COURSES', request.data.courses)

      this.$snackbar.open({
        indefinite: true,
        message: 'Successfully grabbed your <b>name, major, graduation year, and courses</b> from SIS! Please review the pages to make sure its accurate.',
        type: 'is-danger',
        position: 'is-bottom',
        actionText: 'Next',
        onAction: () => {
          this.$router.push({ name: 'setup-unavailability' })
        }
      })

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  padding: 1.5em 0 1em 0;
  max-width: 1000px;
  margin: 0 auto;
}

.button {
  margin-right: 20px;
}
</style>
