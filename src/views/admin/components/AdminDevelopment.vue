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
              disabled="true"
              title="Someone develop this!"
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

            <b-datepicker
              v-model="startDate"
              placeholder="Starting from..."
              icon="calendar"
            />
            <b-datepicker
              v-model="endDate"
              placeholder="Up until..."
              icon="calendar"
            />

            <button
              class="button is-info"
              type="submit"
            >
              Generate dummy assessments
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
      startDate: null,
      endDate: null,
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
        response = await this.$http.post(`/${this.assessmentType}/generate`, { startDate: this.startDate, endDate: this.endDate, count: this.count })
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$buefy.toast.open({
        message: `Generated ${this.count} ${this.assessmentType}!`,
        type: 'is-success'
      })

      const generatedAssessments = response.data.generatedAssessments
      // Add upcoming ones to Vuex
      for (const assessment of generatedAssessments) {
        if (
          moment(assessment.date).isSameOrAfter(moment().startOf('day'))
        ) {
          await this.$store.dispatch('ADD_UPCOMING_ASSESSMENT', assessment)
        }
      }

      this.count = 10
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
