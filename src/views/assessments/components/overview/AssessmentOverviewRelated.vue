<!--Assessments: assessment overview related assignments module-->
<template>
  <div class="related-assessments">
    <AssessmentsTable
      :assessments="related"
      :loading="loading"
      :empty-message="`No related ${assessmentType}s found.`"
    />
  </div>
</template>

<script>
import AssessmentsTable from '@/views/assessments/components/AssessmentsTable'
import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewRelated',
  components: { AssessmentsTable },
  mixins: [assessmentsMixin],
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      related: []
    }
  },
  computed: {

  },
  watch: {
    assessment: 'getRelatedAssessments'
  },
  async created () {
    await this.getRelatedAssessments()
  },
  methods: {
    async getRelatedAssessments () {
      this.loading = true

      let request
      try {
        request = await this.$http.get(`/${this.assessmentType}s`, {
          params: {
            title: this.assessment.title,
            courseCRN: this.assessment.courseCRN
          }
        })
      } catch (e) {
        this.showError(`Failed to load related ${this.assessmentType}s.`)
        this.related = []
        this.loading = false
        return
      }

      this.related = request.data[this.assessmentType + 's']
        .filter(assessment => assessment._id !== this.assessment._id)
        .reverse()

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
