<template>
  <details
    class="panel sidebar-upcoming-assignments"
    open
  >
    <summary class="panel-heading is-clearfix is-unselectable is-size-6">
      Pressing Assignments
      <span class="is-pulled-right icon">
        <i
          class="fas fa-plus add-assignment"
          @click="$emit('toggle-modal')"
        />
      </span>
    </summary>
    <div
      v-if="pressing.length == 0"
      class="panel-block has-text-grey is-size-7"
    >
      <span>No pressing assignments!</span>
    </div>
    <transition-group
      name="list"
      tag="div"
    >
      <div
        v-for="a in pressing"
        :key="a._id"
        class="assignment panel-block is-size-7"
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
            <b class="course-title is-hidden-tablet">{{ course(a).longname }}</b>
            {{ a.title }}
          </router-link>
          <span
            v-if="a.priority >= 7"
            class="tag priority-tag is-danger"
            title="You marked this assignment as high priority!"
          >!</span>
          <small
            class="has-text-grey is-pulled-right tooltip is-tooltip-left"
            :data-tooltip="toFullDateTimeString(a.dueDate)"
          >{{ fromNow(a.dueDate) }}</small>
        </span>
      </div>
    </transition-group>
    <div class="panel-block">
      <router-link
        tag="button"
        class="button is-small is-link is-outlined is-fullwidth"
        to="/assignments"
      >All Assignments</router-link>
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
    now () {
      return this.$store.state.now;
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('ddd, MMM Do YYYY, h:mma'),
    getCourseFromCRN (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    }
  }
};
</script>

<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  //transform: translateY(30px);
}

.assignment {
  cursor: pointer;
  .priority-tag {
    margin-left: 5px;
  }
  .assignment-link {
    color: inherit;
  }

  .course-title {
    margin-left: 5px;
  }
}

.add-assignment {
  cursor: pointer;
}
</style>
