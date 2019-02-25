<template>
  <div class="buttons assignment-actions has-addons is-full-width is-flex">
    <button
      class="button is-success tooltip"
      :data-tooltip="'Mark this assignment as ' + (assignment.completed ? 'incomplete.' : 'finished.')"
      @click="$emit('toggle-completed')"
    >
      <i class="fas fa-check-square" />
      {{ assignment.completed ? 'Undo' : 'Mark Done' }}
    </button>
    <button
      class="button is-warning tooltip"
      data-tooltip="Change this assignment's info."
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
      to="/assignments"
      class="button is-link tooltip"
      data-tooltip="Browse all assignments."
    >
      <i class="fas fa-angle-left" />Browse
      <span class="is-hidden-touch">Assignments</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'AssignmentOverviewActionButtons',
  props: {
    assignment: {
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
.assignment-actions {
  margin-bottom: 0;

  .button {
    flex: 1;
    margin-bottom: 0;
    i.fas {
      margin-right: 5px;
    }

    .is-hidden-touch {
      margin-left: 3px;
    }
  }
}
</style>
