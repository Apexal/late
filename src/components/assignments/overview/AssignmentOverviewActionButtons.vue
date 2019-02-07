<template>
  <div class="assignment-actions">
    <div class="dropdown is-hoverable is-right is-pulled-right is-hidden-desktop">
      <div class="dropdown-trigger">
        <button
          class="button is-dark"
          :class="{ 'is-loading': loading }"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
        >
          <span>Actions</span>
          <span class="icon is-small">
            <i
              class="fas fa-angle-down"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
      <div
        id="dropdown-menu"
        class="dropdown-menu"
        role="menu"
      >
        <div class="dropdown-content">
          <a
            v-if="!assignment.passed"
            href="#"
            class="dropdown-item"
            @click="$emit('toggle-editing')"
          >
            <span class="icon margin-left">
              <i class="fas fa-pencil-alt" />
            </span>
            Edit Info
          </a>
          <a
            href="#"
            class="dropdown-item"
            @click="$emit('toggle-completed')"
          >
            <span class="icon margin-left">
              <i
                class="fas"
                :class="{ 'fa-times' : assignment.completed, 'fa-check': !assignment.completed }"
              />
            </span>
            {{ assignment.completed ? 'Mark Incomplete' : 'Mark Complete' }}
          </a>
          <hr class="dropdown-divider">
          <router-link
            to="/assignments"
            class="dropdown-item"
          >
            <span class="icon">
              <i class="fas fa-angle-left margin-right" />
            </span>
            All Assignments
          </router-link>
        </div>
      </div>
    </div>

    <div class="assignment-controls buttons has-addons is-pulled-right is-hidden-touch">
      <router-link
        to="/assignments"
        class="button tooltip"
        data-tooltip="Browse all assignments."
      >
        <i class="fas fa-angle-left margin-right" />
      </router-link>

      <button
        v-if="!assignment.passed"
        class="button tooltip"
        data-tooltip="Change this assignment's info."
        @click="$emit('toggle-editing')"
      >
        <i class="fas fa-pencil-alt" />
      </button>

      <button
        v-if="assignment.passed"
        class="button tooltip"
        data-tooltip="Remove Assignment"
        @click="$emit('remove-assignment')"
      >
        <i class="fas fa-times" />
      </button>

      <button
        class="button tooltip is-outlined"
        :class="{ 'is-success' : assignment.completed, 'is-danger': !assignment.completed }"
        data-tooltip="Toggle this assignment's completion status."
        @click="$emit('toggle-completed')"
      >
        <i class="fas fa-check-square" />
      </button>
    </div>
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
    loading: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.assignment-controls {
  span.icon {
    margin-right: 0px !important;
  }
}
</style>
