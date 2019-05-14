<template>
  <div class="assessment-actions clearfix">
    <b-button
      type="is-warning"
      :title="editButtonTitle"
      @click="$emit('toggle-editing')"
    >
      <i class="fas fa-edit" />
      Edit {{ assessmentTypeCaps }}
    </b-button>
    <b-button
      class="is-pulled-right"
      @click="$emit('copy-assessment')"
    >
      Copy {{ assessmentTypeCaps }}
    </b-button>
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
    },
    editButtonTitle () {
      return this.assessment.updatedAt ? `Last edited ${this.shortDateTimeFormat(this.assessment.updatedAt)}` : 'Never edited';
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
