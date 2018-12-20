<template>
  <div
    class="sidebar-pressing-assignments"
  >
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
      <router-link
        v-for="a in pressing"
        :key="a._id"
        tag="div"
        class="assignment assignment-link panel-block is-size-7"
        :title="a.description.substring(0, 500)"
        :to="{ name: 'assignments-overview', params: { assignmentID: a._id }}"
        :class="{ 'priority': a.priority >= 7 }"
      >
        <span class="is-full-width">
          <span
            class="dot course-dot"
            :title="course(a).longname"
            :style="'background-color: ' + course(a).color"
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
    <div class="panel-block">
      <router-link
        tag="button"
        class="button is-small is-link is-outlined is-fullwidth"
        to="/assignments"
      >
        All Assignments
      </router-link>
    </div>
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
</style>
