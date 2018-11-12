<template>
  <details
    class="panel sidebar-upcoming-assignments"
    open
  >
    <summary class="panel-heading is-clearfix">Pressing Assignments
      <span class="is-pulled-right icon">
        <i
          class="fas fa-plus add-assignment"
          @click="$emit('toggle-modal')"
        />
      </span>
    </summary>
    <div
      v-for="a in pressing"
      :key="a._id"
      class="assignment panel-block"
    >
      <router-link
        :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
        tag="span"
        class="is-full-width"
      >
        {{ a.title }}
        <span
          v-if="a.priority >= 7"
          class="tag is-danger priority-tag"
        >!</span>
        <small class="is-pulled-right has-text-grey">{{ getCourseFromCRN(a.courseCRN).longname }}</small>
      </router-link>
    </div>
    <div class="panel-block">
      <router-link
        tag="b"
        to="/assignments"
      >View All Assignments</router-link>
    </div>
  </details>
</template>

<script>
export default {
  name: 'PressingAssignments',
  props: {
    pressing: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  methods: {
    getCourseFromCRN (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    }
  }
};
</script>

<style lang="scss" scoped>
.assignment {
  cursor: pointer;
  .priority-tag {
    margin-left: 5px;
  }
}

.add-assignment {
  cursor: pointer;
}
</style>
