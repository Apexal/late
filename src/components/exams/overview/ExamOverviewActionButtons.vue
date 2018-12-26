<template>
  <div class="exam-actions">
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
            v-if="!exam.passed"
            href="#"
            class="dropdown-item"
            @click="$emit('toggle-editing')"
          >
            <span class="icon margin-left">
              <i class="fas fa-pencil-alt" />
            </span>
            Edit Info
          </a>
          <hr class="dropdown-divider">
          <router-link
            to="/exams"
            class="dropdown-item"
          >
            <span class="icon">
              <i class="fas fa-angle-left margin-right" />
            </span>
            All Exams
          </router-link>
        </div>
      </div>
    </div>

    <div class="exam-controls buttons has-addons is-pulled-right is-hidden-touch">
      <router-link
        to="/exams"
        class="button is-link tooltip"
        data-tooltip="Browse all exams."
      >
        <span class="icon">
          <i class="fas fa-angle-left margin-right" />
        </span>
        Browse
      </router-link>

      <button
        v-if="!exam.passed"
        class="button is-warning tooltip"
        data-tooltip="Change this exam's info."
        @click="$emit('toggle-editing')"
      >
        <span class="icon">
          <i class="fas fa-pencil-alt" />
        </span>
        Edit Info
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssignmentOverviewActionButtons',
  props: {
    exam: {
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
.exam-controls {
  span.icon {
    margin-right: 0px !important;
  }
}
</style>
