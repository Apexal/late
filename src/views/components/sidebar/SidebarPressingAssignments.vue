<template>
  <div class="sidebar-pressing-assignments">
    <template v-if="onBreak">
      <div class="panel-block has-text-grey">
        There's no work over break!
      </div>
    </template>
    <template v-else>
      <div
        v-if="pressing.length == 0"
        class="panel-block has-text-grey"
      >
        <span style="has-text-centered">
          No pressing assignments!
        </span>
      </div>
      <transition-group
        name="list"
        tag="div"
        class="sidebar-body"
      >
        <router-link
          v-for="a in pressing"
          :key="a._id"
          tag="div"
          class="assignment assignment-link panel-block"
          :title="a.description.substring(0, 500)"
          :to="{ name: 'assignments-overview', params: { assignmentID: a._id }}"
          :class="{ 'priority': a.priority > 3 }"
        >
          <span class="is-full-width">
            <span
              class="dot course-dot"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
              @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(a))"
            />
            <b class="course-title is-hidden-tablet">
              {{ course(a).longname }}
            </b>
            {{ a.title }}
            <small
              class="has-text-grey is-pulled-right tooltip is-tooltip-left"
              :data-tooltip="toFullDateTimeString(a.dueDate)"
            >
              {{ fromNow(a.dueDate) }}
            </small>
          </span>
        </router-link>
      </transition-group>
      <div class="controls panel-block has-background-white-ter">
        <span class="is-full-width">
          <button
            class="button is-link is-small"
            title="Add new assignment"
            @click.prevent="$emit('toggle-modal')"
          >
            <span class="icon">
              <i class="fa fa-plus" />
            </span>
            Add Assignment
          </button>
          <router-link
            tag="button"
            class="button is-link is-small is-outlined is-pulled-right"
            to="/assignments"
            title="View all assignments"
          >
            View Assignments
          </router-link>
        </span>
      </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SidebarPressingAssignments',
  props: {
    pressing: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    },
    now () {
      return this.$store.state.now;
    }
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('ddd, MMM Do YYYY, h:mma')
  }
};
</script>

<style lang="scss" scoped>
.priority {
  font-weight: 500;
}

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

  .assignment-link {
    color: inherit;
  }

  .course-title {
    margin-left: 5px;
  }
}

.controls {
  .icon {
    margin-right: 0 !important;
  }
}
</style>
