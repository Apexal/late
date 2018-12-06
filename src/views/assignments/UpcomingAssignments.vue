<template>
  <div class="upcoming-assignments">
    <p
      v-if="none"
      class="has-text-centered has-text-grey"
    >
      No upcoming assignments left (with filters)!
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
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
                  :style="{ 'color': course(a).color }"
                />
              </span>
              <router-link
                class="assignment-link"
                :title="a.description.substring(0, 500)"
                :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
                :class="{ 'priority': a.priority >= 7 }"
              >
                <b class="course-title is-hidden-tablet">
                  {{ course(a).longname }}
                </b>
                {{ a.title }}
              </router-link>
              <small
                :data-tooltip="'in ' + hoursFromNow(a.dueDate) + ' hours'"
                class="tooltip is-tooltip-left is-pulled-right has-text-grey"
              >
                {{ toTimeString(a.dueDate) }}
              </small>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'UpcomingAssignments',
  props: {
    showCompleted: {
      type: Boolean,
      default: true
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
      for (let date in this.upcomingAssignmentsGroupedByDueDate) {
        filtered[date] = this.upcomingAssignmentsGroupedByDueDate[date].filter(
          a => {
            if (!this.showCompleted && a.completed) return false;
            return !this.filter.includes(this.course(a).crn);
          }
        );
        if (filtered[date].length === 0) delete filtered[date];
      }

      return filtered;
    },
    upcomingAssignmentsGroupedByDueDate () {
      return this.$store.getters.upcomingAssignmentsGroupedByDueDate;
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toggleAssignmentTitle (a) {
      return (
        this.course(a).longname +
        (a.completedAt
          ? ` | Completed ${moment(a.completedAt).format('MM/DD/YY h:mma')}`
          : '')
      );
    },
    percentDone (date) {
      const assignments = this.upcomingAssignmentsGroupedByDueDate[date];
      return Math.round(
        (assignments.filter(a => a.completed).length / assignments.length) * 100
      );
    },
    progressClass (date) {
      const percentDone = this.percentDone(date);
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
    hoursFromNow (date) {
      return moment(date).diff(this.now, 'hours');
    },
    daysAway (date) {
      return moment(date).diff(moment(this.now).startOf('day'), 'days');
    }
  }
};
</script>

<style lang="scss" scoped>
.course-title {
  margin-right: 5px;
}

.assignment {
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
