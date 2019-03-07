<template>
  <div class="buttons assessment-actions has-addons is-full-width is-flex">
    <button
      v-if="assessmentType === 'assignment'"
      class="button is-success tooltip"
      :data-tooltip="'Mark this assignment as ' + (assessment.completed ? 'incomplete.' : 'finished.')"
      @click="$emit('toggle-completed')"
    >
      <i class="fas fa-check-square" />
      {{ assessment.completed ? 'Undo' : 'Mark Done' }}
    </button>
    <button
      class="button is-warning tooltip"
      :data-tooltip="`Change this ${assessmentType}'s info.`"
      @click="$emit('toggle-editing')"
    >
      <i class="fas fa-pencil-alt" />Edit
      <span class="is-hidden-touch">Details</span>
    </button>
    <button
      class="button is-info tooltip"
      data-tooltip="Toggle description."
      @click="$emit('toggle-description')"
    >
      <i
        class="fas"
        :class="[descriptionExpanded ? 'fa-angle-down' : 'fa-angle-up']"
      />
      {{ descriptionExpanded ? 'Showing': 'Hiding' }} Description
    </button>
    <router-link
      :to="`/${assessmentType}s`"
      class="button is-link tooltip"
      :data-tooltip="`Browse all ${assessmentType}s.`"
    >
      <i class="fas fa-angle-left" />Browse
      <span class="is-hidden-touch">{{ assessmentType }}s</span>
    </router-link>
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
    descriptionExpanded: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-actions {
  margin-bottom: 0;

  .button {
    flex: 1;
    margin-bottom: 0;
    text-transform: capitalize;

    i.fas {
      margin-right: 5px;
    }

    .is-hidden-touch {
      margin-left: 3px;
    }
  }
}
</style>
