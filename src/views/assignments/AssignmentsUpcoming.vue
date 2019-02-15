<template>
  <div class="assignments-upcoming">
    <p
      v-if="none"
      class="has-text-centered has-text-grey"
    >
      No upcoming assignments
      <i v-if="filter.length > 0 || !showCompleted">
        with filters
      </i>!
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <template v-if="groupBy === 'course'">
        <div
          v-for="(assignments, crn) in filtered"
          :key="crn"
          class="due-date column is-one-third-desktop is-half-tablet"
        >
          <div class="panel">
            <p class="panel-heading is-unselectable course-heading">
              <span
                class="tag is-pulled-right"
                :class="progressClass(crn)"
                :title="`You are ${percentDone(crn)}% complete with this course's assignments.`"
              >
                {{ percentDone(crn) }}%
              </span>
              <span class="date">
                {{ course(crn).longname }}
              </span>
            </p>
            <div
              v-for="a in assignments"
              :key="a._id"
              class="panel-block assignment"
            >
              <span class="is-full-width">
                <span
                  class="icon toggle-assignment"
                  @click="$emit('toggle-assignment', a._id)"
                >
                  <span
                    :class="{ 'fas fa-check-circle': a.completed, 'far fa-circle': !a.completed }"
                    :title="toggleAssignmentTitle(a)"
                    :style="{ 'color': course(a.courseCRN).color }"
                  />
                </span>
                <router-link
                  class="assignment-link"
                  :title="(a.priority === 1 ? '(OPTIONAL) ' : '') + a.description.substring(0, 500)"
                  :to="{ name: 'assignments-overview', params: { assignmentID: a._id }}"
                  :class="{ 'priority': a.priority > 3, 'has-text-grey is-italic': a.priority === 1 }"
                >
                  <b class="course-title is-hidden-tablet">
                    {{ course(a.courseCRN).longname }}
                  </b>
                  {{ a.title }}
                </router-link>
                <span
                  :style="{visibility: a.completed || a.fullyScheduled ? 'hidden' : ''}"
                  class="tooltip is-tooltip-left icon has-text-danger is-pulled-right"
                  :data-tooltip="`You've only scheduled ${a.scheduledTime} out of ${a.timeEstimate * 60} min to work on this.`"
                >
                  <i class="far fa-clock" />
                </span>
                <small
                  class="is-pulled-right tooltip is-tooltip-left has-text-grey"
                  :data-tooltip="toDateShortString(a.dueDate) + ' ' + toTimeString(a.dueDate)"
                >
                  {{ fromNow(a.dueDate) }}
                </small>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(assignments, date) in filtered"
          :key="date"
          class="due-date column is-one-third-desktop is-half-tablet"
        >
          <div class="panel">
            <p
              class="panel-heading tooltip is-tooltip-bottom is-unselectable date-heading"
              :data-tooltip="daysAway(date) + ' days away'"
            >
              <span
                class="tag is-pulled-right"
                :class="progressClass(date)"
                :title="`You are ${percentDone(date)}% complete with this day's assignments.`"
              >
                {{ percentDone(date) }}%
              </span>
              <span class="date">
                {{ toDateShortString(date) }}
              </span>
            </p>
            <div
              v-for="a in assignments"
              :key="a._id"
              class="panel-block assignment"
            >
              <span class="is-full-width">
                <span
                  class="icon toggle-assignment"
                  @click="$emit('toggle-assignment', a._id)"
                >
                  <span
                    :class="{ 'fas fa-check-circle': a.completed, 'far fa-circle': !a.completed }"
                    :title="toggleAssignmentTitle(a)"
                    :style="{ 'color': course(a.courseCRN).color }"
                  />
                </span>
                <router-link
                  class="assignment-link"
                  :title="(a.priority === 1 ? '(OPTIONAL) ' : '') + a.description.substring(0, 500)"
                  :to="{ name: 'assignments-overview', params: { assignmentID: a._id }}"
                  :class="{ 'priority': a.priority > 3, 'has-text-grey is-italic': a.priority === 1 }"
                >
                  <b class="course-title is-hidden-tablet">
                    {{ course(a.courseCRN).longname }}
                  </b>
                  {{ a.title }}
                </router-link>
                <span
                  :style="{visibility: a.completed || a.fullyScheduled ? 'hidden' : ''}"
                  class="tooltip is-tooltip-left icon has-text-danger is-pulled-right"
                  :data-tooltip="`You've only scheduled ${a.scheduledTime} out of ${a.timeEstimate * 60} min to work on this.`"
                >
                  <i class="far fa-clock" />
                </span>
                <small class="is-pulled-right has-text-grey">
                  {{ toTimeString(a.dueDate) }}
                </small>
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'AssignmentsUpcoming',
  props: {
    showCompleted: {
      type: Boolean,
      default: true
    },
    groupBy: {
      type: String,
      required: true
    },
    filter: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    none () {
      return Object.keys(this.filtered).length === 0;
    },
    filtered () {
      const filtered = {};
      for (let key in this.groupedAssignments) {
        filtered[key] = this.groupedAssignments[key].filter(a => {
          if (!this.showCompleted && a.completed) return false;
          return !this.filter.includes(this.course(a.crn));
        });
        if (filtered[key].length === 0) delete filtered[key];
      }

      return filtered;
    },
    groupedAssignments () {
      return this.groupBy === 'course'
        ? this.upcomingAssignmentsGroupedByCourse
        : this.upcomingAssignmentsGroupedByDueDate;
    },
    upcomingAssignmentsGroupedByDueDate () {
      return this.$store.getters.upcomingAssignmentsGroupedByDueDate;
    },
    upcomingAssignmentsGroupedByCourse () {
      return this.$store.getters.upcomingAssignmentsGroupedByCourse;
    }
  },
  methods: {
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    },
    toggleAssignmentTitle (a) {
      return (
        this.course(a.courseCRN).longname +
        (a.completedAt
          ? ` | Completed ${moment(a.completedAt).format('M/DD/YY h:mma')}`
          : '')
      );
    },
    percentDone (key) {
      const assignments = this.groupedAssignments[key];
      return Math.round(
        (assignments.filter(a => a.completed).length / assignments.length) * 100
      );
    },
    progressClass (key) {
      const percentDone = this.percentDone(key);
      if (percentDone === 100) return 'is-success';
      if (percentDone >= 50) return 'is-warning';
      if (percentDone > 0) return 'is-danger';
      return 'is-white';
    },
    toDateShortString (dueDate) {
      if (moment(dueDate).isSame(moment(), 'day')) return 'Today';
      if (moment(dueDate).isSame(moment().add(1, 'day'), 'day')) {
        return 'Tomorrow';
      }
      return moment(dueDate).format('dddd [the] Do');
    },
    toTimeString (dueDate) {
      return moment(dueDate).format('h:mma');
    },
    fromNow (date) {
      return moment(date).fromNow();
    },
    daysAway (date) {
      return moment(date).diff(moment(this.now).startOf('day'), 'days');
    }
  }
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

.dot {
  margin-right: 5px;
}
</style>
