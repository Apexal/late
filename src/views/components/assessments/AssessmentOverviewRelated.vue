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
import AssessmentsTable from '@/views/components/assessments/AssessmentsTable';

export default {
  name: 'AssessmentOverviewRelated',
  components: { AssessmentsTable },
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
    };
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType;
    }
  },
  watch: {
    assessment: 'getRelatedAssessments'
  },
  async created () {
    await this.getRelatedAssessments();
  },
  methods: {
    async getRelatedAssessments () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.get(`/${this.assessmentType}s`, {
          params: {
            title: this.assessment.title,
            courseCRN: this.assessment.courseCRN
          }
        });
      } catch (e) {
        this.$toast.open({
          message: `Failed to load related ${this.assessmentType}s.`,
          type: 'is-danger'
        });
        this.related = [];
        this.loading = false;
        return;
      }

      this.related = request.data[this.assessmentType + 's']
        .filter(assessment => assessment._id !== this.assessment._id)
        .reverse();

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
