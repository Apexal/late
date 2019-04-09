<template>
  <div class="related-assessments">
    <p
      v-if="loading"
      class="has-text-grey has-text-centered"
    >
      Loading {{ assessmentType }}s...
    </p>
    <AssessmentsTable
      v-else
      :assessments="related"
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
