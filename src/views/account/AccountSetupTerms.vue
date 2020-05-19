<!--Account Setup: Term selection-->
<template>
  <div class="account-setup-terms">
    <h2 class="is-size-4 integration-note">
      What term(s) are you currently enrolled in?
    </h2>

    <div class="terms columns is-multiline">
      <div
        v-for="term in terms"
        :key="term.code"
        class="column is-one-third"
        @click="toggleTerm(term.code)"
      >
        <div
          class="box term is-unselectable"
          :class="{'has-background-primary': selected.includes(term.code)}"
        >
          <b>{{ term.name }}</b>
          <span
            v-if="selected.includes(term.code)"
            class="icon is-pulled-right"
          >
            <i class="fa fa-check" />
          </span>
        </div>
      </div>
    </div>

    <hr>

    <b-button
      type="is-primary"
      class="is-pulled-right"
      @click="saveAndContinue"
    >
      {{ saved ? '' : 'Save and ' }}Continue
    </b-button>
  </div>
</template>

<script>
import moment from 'moment'
import accountMixin from '@/mixins/account'

export default {
  name: 'AccountSetupTerms',
  mixins: [accountMixin],
  data () {
    return {
      selected: []
    }
  },
  computed: {
    currentSelections () {
      return this.$store.state.auth.user.terms
    },
    saved () {
      return (
        JSON.stringify(this.currentSelections) === JSON.stringify(this.selected)
      )
    },
    terms () {
      return this.$store.state.schedule.terms.filter(term => moment(term.endDate).isAfter(this.rightNow))
    }
  },
  created () {
    this.selected = this.currentSelections.slice(0)
  },
  methods: {
    toggleTerm (termCode) {
      if (this.selected.includes(termCode)) {
        this.selected.splice(this.selected.indexOf(termCode), 1)
      } else {
        this.selected.push(termCode)
      }
    },
    async saveAndContinue () {
      if (this.saved) {
        this.$router.push({ name: 'setup-course-schedule' })
        return
      }

      this.loading = true

      let request
      try {
        request = await this.$http.post('/account/terms', {
          termCodes: this.selected
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser)
      if (this.$store.getters.onBreak) {
        this.$store.commit('SET_UPCOMING_ASSESSMENTS', [])
        this.$store.commit('SET_COURSES', [])
      } else {
        await this.$store.dispatch('GET_COURSES')
        await this.$store.dispatch('GET_UNAVAILABILITIES')
        await this.$store.dispatch('AUTO_GET_UPCOMING_WORK')
      }

      // Notify user of success
      this.$buefy.toast.open({
        message: 'Saved terms!',
        type: 'is-success'
      })

      this.$router.push({ name: 'setup-course-schedule' })

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.term {
  cursor: pointer;
}
</style>
