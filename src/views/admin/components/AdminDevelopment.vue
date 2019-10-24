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
              v-model="radio"
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
      // Given the data properties from the form, send them to the server who will actually
      // generate, save, and return the assessments we want to be created

      let response
      try {
        response = await this.$http.post(`/${this.assessmentType}/generate`, { count: this.count })
      } catch (e) {
        alert('oops')
      }

      console.log(response.data)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
