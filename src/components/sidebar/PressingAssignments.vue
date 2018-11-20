<template>
  <details
    class="panel sidebar-upcoming-assignments"
    open
  >
    <summary class="panel-heading is-clearfix is-unselectable">Pressing Assignments
      <span class="is-pulled-right icon">
        <i
          class="fas fa-plus add-assignment"
          @click="$emit('toggle-modal')"
        />
      </span>
    </summary>
    <div
      v-if="pressing.length == 0"
      class="panel-block has-text-grey"
    >
      <span>No pressing assignments!</span>
    </div>
    <div
      v-for="a in pressing"
      :key="a._id"
      class="assignment panel-block"
    >
      <span class="is-full-width">
        <span
          class="dot course-dot"
          :title="course(a).longname"
          :style="'background-color: ' + course(a).color"
        />
        <router-link
          class="assignment-link"
          :title="a.description.substring(0, 500)"
          :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
        >
          <b
            class="course-title is-hidden-tablet"
          >{{ course(a).longname }}</b>

          {{ a.title }}</router-link>
        <span
          v-if="a.priority >= 7"
          class="tag priority-tag is-danger"
          title="You marked this assignment as high priority!"
        >!</span>
        <small
          class="is-pulled-right"
          :title="toFullDateTimeString(a.dueDate)"
        >{{ fromNow(a.dueDate) }}</small>
      </span>
    </div>
    <div class="panel-block">
      <router-link
        tag="button"
        class="button is-link is-outlined is-fullwidth"
        to="/assignments"
      >
        All Assignments
      </router-link>
    </div>
  </details>
</template>

<script>
import moment from 'moment';

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
    fromNow: date => moment(date).fromNow(),
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
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
  .assignment-link {
    color: inherit;
  }
}

.add-assignment {
  cursor: pointer;
}
</style>
