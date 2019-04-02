<template>
  <div class="assignment panel-block">
    <span class="is-full-width">
      <span
        id="toggle-group-assignments" class="icon toggle-assignment"
        @click="$emit('toggle-assignment', assignment._id)"
      >
        <span
          :class="[ assignment.completed ? 'fas fa-check-circle' : 'far fa-circle' ]"
          :title="toggleAssignmentTitle"
          :style="{ 'color': course.color }"
        />
      </span>
      <router-link
        class="assignment-link"
        :title="(assignment.priority === 1 ? '(OPTIONAL) ' : '') + assignment.description.substring(0, 500)"
        :to="{ name: 'assignments-overview', params: { assignmentID: assignment._id }}"
        :class="{ 'priority': assignment.priority > 3, 'has-text-grey is-italic': assignment.priority === 1 }"
      >
        <b class="course-title is-hidden-tablet">{{ course.longname }}</b>
        {{ assignment.title }}
      </router-link>
      <span
        class="tooltip is-tooltip-left icon has-text-danger is-pulled-right"
        :data-tooltip="`You've only scheduled ${assignment.scheduledTime} out of ${assignment.timeEstimate * 60} min to work on this.`"
      >
        <i
          :style="{ opacity: assignmentTimeWarningOpacity }"
          class="far fa-clock"
        />
      </span>
      <small
        v-if="groupBy === 'dueDate'"
        class="is-pulled-right has-text-grey"
      >{{ toTimeString }}</small>
      <small
        v-else
        class="is-pulled-right tooltip is-tooltip-left has-text-grey"
        :data-tooltip="toDateShortString + ' ' + toTimeString"
      >{{ fromNow }}</small>
    </span>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'AssignmentsUpcomingPanelBlock',
  props: {
    groupBy: {
      type: String,
      required: true
    },
    assignment: {
      type: Object,
      required: true
    }
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assignment.courseCRN);
    },
    toggleAssignmentTitle () {
      return (
        this.course.longname +
        (this.assignment.completedAt
          ? ` | Completed ${moment(this.assignment.completedAt).format(
            'M/DD/YY h:mma'
          )}`
          : '')
      );
    },
    toDateShortString () {
      if (moment(this.assignment.dueDate).isSame(moment(), 'day')) { return 'Today'; }
      if (
        moment(this.assignment.dueDate).isSame(moment().add(1, 'day'), 'day')
      ) {
        return 'Tomorrow';
      }
      return moment(this.assignment.dueDate).format('dddd [the] Do');
    },
    toTimeString () {
      return moment(this.assignment.dueDate).format('h:mma');
    },
    fromNow () {
      return moment(this.assignment.dueDate).fromNow();
    },
    daysAway () {
      return moment(this.assignment.dueDate).diff(
        moment(this.now).startOf('day'),
        'days'
      );
    },
    assignmentTimeWarningOpacity () {
      if (this.assignment.completed) return 0;
      if (this.assignment.scheduledTime === 0) return 1;
      if (this.assignment.timeEstimate === 0) return 0;
      if (this.assignment.timeEstimate === this.assignment.scheduledTime) { return 0; }

      return (
        this.assignment.scheduledTime / (this.assignment.timeEstimate * 60)
      );
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.assignment {
  padding-right: 5px;
  padding-left: 5px;
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);

  .assignment-link {
    color: inherit;
  }
  .is-completed {
    text-decoration: line-through;
  }

  .toggle-assignment {
    cursor: pointer;
  }

  .priority {
    font-weight: 500;
  }
}
</style>
