<template>
  <div class="assignments-upcoming">
    <p
      v-if="none"
      class="has-text-centered has-text-grey"
    >
      No upcoming assignments
      <i
        v-if="filter.length > 0 || !showCompleted"
        style="font-style:inherit"
      >
        matching your filters.
      </i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >
        this month!
      </i>
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <div
        v-for="(assignments, key) in filtered"
        :key="key"
        class="column is-one-third-desktop is-half-tablet"
      >
        <div class="panel">
          <p
            class="panel-heading is-unselectable key-heading"
            :style="headerStyle(key)"
          >
            <span
              class="tag is-pulled-right"
              :class="progressClass(key)"
              :title="`You are ${percentDone(key)}% complete with these assignments.`"
            >
              {{ percentDone(key) }}%
            </span>
            <span
              class="key"
              :title="headerTitle"
              @click="headerClick(key)"
            >
              {{ headerText(key) }}
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
                v-if="groupBy === 'dueDate'"
                class="is-pulled-right has-text-grey"
              >
                {{ toTimeString(a.dueDate) }}
              </small>
              <small
                v-else
                class="is-pulled-right tooltip is-tooltip-left has-text-grey"
                :data-tooltip="toDateShortString(a.dueDate) + ' ' + toTimeString(a.dueDate)"
              >
                {{ fromNow(a.dueDate) }}
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
    headerTitle () {
      return this.groupBy === 'course'
        ? 'Open course modal.'
        : 'Add assignment to this day.';
    },
    filtered () {
      const filtered = {};
      for (let key in this.groupedAssignments) {
        filtered[key] = this.groupedAssignments[key].filter(a => {
          if (!this.showCompleted && a.completed) return false;
          return !this.filter.includes(a.courseCRN);
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
    headerText (key) {
      return this.groupBy === 'course'
        ? this.course(key).longname
        : this.toDateShortString(key);
    },
    headerStyle (key) {
      if (this.groupBy === 'dueDate') return {};
      let color = this.course(key).color;
      if (color.length < 5) {
        color += color.slice(1);
      }
      return {
        'background-color':
          this.groupBy === 'course' ? this.course(key).color : 'inherit',
        color: color.replace('#', '0x') > 0xffffff / 1.2 ? '#333' : '#fff'
      };
    },
    headerClick (key) {
      if (this.groupBy === 'course') {
        this.$store.commit('OPEN_COURSE_MODAL', this.course(key));
      } else {
        this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', moment(key));
        this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
      }
    },
    clickDateHeading (date) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', moment(date));
      this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
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
.key-heading {
  span.key {
    cursor: pointer;
  }
}
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
