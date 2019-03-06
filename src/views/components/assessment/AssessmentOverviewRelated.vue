<template>
  <div class="related-assessments">
    <p
      v-if="loading"
      class="has-text-grey has-text-centered"
    >
      Loading {{ assessmentType }}s...
    </p>
    <AssignmentsTable
      v-if="!loading && assessmentType === 'assignment'"
      :assignments="related"
    />
  </div>
</template>

<script>
import AssignmentsTable from '@/views/components/assignments/AssignmentsTable';

export default {
  name: 'AssessmentOverviewRelated',
  components: { AssignmentsTable },
  props: {
    assessmentType: {
      type: String,
      required: true
    },
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
      request = await this.$http.get(
        `/${this.assessmentType}s?title=${this.assessment.title}`
      );

      this.related = request.data[this.assessmentType + 's'].filter(
        assessment => assessment._id !== this.assessment._id
      );

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
