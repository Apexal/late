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

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
