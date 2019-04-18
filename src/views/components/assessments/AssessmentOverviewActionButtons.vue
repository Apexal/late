<template>
  <div class="assessment-actions clearfix">
    <button
      class="button is-warning"
      @click="$emit('toggle-editing')"
    >
      <i class="fas fa-edit" />
      Edit {{ assessmentTypeCaps }}
    </button>
    <button
      class="button is-pulled-right"
      @click="$emit('copy-assessment')"
    >
      Copy {{ assessmentTypeCaps }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewActionButtons',
  props: {
    assessment: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType;
    },
    assessmentTypeCaps () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-actions {
  i {
    margin-right: 5px;
  }
}
</style>
