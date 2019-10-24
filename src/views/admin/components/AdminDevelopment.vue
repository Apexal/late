<template>
  <div class="admin-development">
    <h2 class="subtitle">
      Development Mode Actions
    </h2>
    <div class="columns">
      <div class="column is-half">
        <div class="box dummy-assessments">
          <form @submit.prevent="generateDummyAssessments">
            <b-radio
              v-model="assessmentType"
              name="name"
              native-value="assignments"
            >
              Assignments
            </b-radio>
            <b-radio
              v-model="assessmentType"
              name="name"
              native-value="exams"
            >
              Exams
            </b-radio>

            <b-input
              v-model="count"
              type="number"
              min="1"
              max="30"
              required
            />

            <button
              class="button is-info"
              type="submit"
            >
              Generate
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AdminDevelopment',
  data () {
    return {
      assessmentType: 'assignments',
      count: 10
    }
  },
  methods: {
    async generateDummyAssessments () {
      if (this.count < 0 || this.count > 30) {
        this.count = 10
        return
      }
      // Given the data properties from the form, send them to the server who will actually
      // generate, save, and return the assessments we want to be created

      let response
      try {
        response = await this.$http.post(`/${this.assessmentType}/generate`, { count: this.count })
      } catch (e) {
        return this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }

      this.$buefy.toast.open({
        message: `Generated ${this.count} assignments`,
        type: 'is-success'
      })

      const generatedAssignments = response.data.generatedAssignments
      // Add upcoming ones to Vuex
      for (let assignment of generatedAssignments) {
        if (
          moment(assignment.date).isSameOrAfter(moment().startOf('day'))
        ) {
          await this.$store.dispatch('ADD_UPCOMING_ASSESSMENT', assignment)
        }
      }

      this.count = 10
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
