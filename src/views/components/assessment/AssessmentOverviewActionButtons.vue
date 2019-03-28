<template>
  <div class="assessment-actions clearfix">
    <router-link
      :to="`/${assessmentType}s/upcoming`"
      class="button is-link tooltip"
      :data-tooltip="`Browse all ${assessmentType}s.`"
    >
      <i class="fas fa-angle-left" />
      Browse {{ assessmentTypeCaps }}s
    </router-link>
    <button
      class="button is-warning"
      @click="$emit('toggle-editing')"
    >
      <i class="fas fa-edit" />
      Edit Info
    </button>
    <button
      class="button is-pulled-right"
      @click="$emit('copy-'+assessmentType)"
    >
      Copy {{ assessmentTypeCaps }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewActionButtons',
  props: {
    assessmentType: {
      type: String,
      required: true
    },
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
