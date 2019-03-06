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
    <ExamsTable
      v-if="!loading && assessmentType === 'exam'"
      :exams="related"
      :date-format="'M/D/YY h:mm a'"
    />
    <p
      v-if="!loading && related.length === 0"
      class="has-text-grey has-text-centered"
    >
      No related {{ assessmentType }}s found!
    </p>
  </div>
</template>

<script>
import AssignmentsTable from '@/views/components/assignments/AssignmentsTable';
import ExamsTable from '@/views/components/exams/ExamsTable';

export default {
  name: 'AssessmentOverviewRelated',
  components: { AssignmentsTable, ExamsTable },
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
      try {
        request = await this.$http.get(
          `/${this.assessmentType}s?title=${this.assessment.title}`
        );
      } catch (e) {
        this.$toasted.error(`Failed to load related ${this.assessmentType}s.`);
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
