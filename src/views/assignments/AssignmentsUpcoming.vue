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
      >matching your filters.</i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >this month!</i>
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
            >{{ percentDone(key) }}%</span>
            <span
              class="key"
              :title="headerTitle"
              @click="headerClick(key)"
            >{{ headerText(key) }}</span>
          </p>
          <AssignmentPanelBlock
            v-for="a in assignments"
            :key="a._id"
            :group-by="groupBy"
            :assignment="a"
            @toggle-assignment="$emit('toggle-assignment', arguments[0])"
          />
        </div>
      </div>
    </div>
    <hr>
    <div
      v-if="farFutureUpcomingAssignments.length > 0"
      class="far-future-assignments"
    >
      <p class="has-text-centered has-text-grey">
        {{ farFutureUpcomingAssignments.length }} far future assignments {{ showingFutureAssignments ? 'shown' : 'hidden' }}
        <a
          @click="showingFutureAssignments = !showingFutureAssignments"
        >Toggle</a>
      </p>

      <AssignmentsTable
        v-if="showingFutureAssignments"
        :assignments="filteredFarFuture"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import AssignmentPanelBlock from '@/views/components/assignments/upcoming/AssignmentPanelBlock';
import AssignmentsTable from '@/views/components/assignments/AssignmentsTable.vue';

export default {
  name: 'AssignmentsUpcoming',
  components: { AssignmentsTable, AssignmentPanelBlock },
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
  data () {
    return {
      showingFutureAssignments: false
    };
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
    filteredFarFuture () {
      return this.farFutureUpcomingAssignments.filter(a => {
        if (!this.showCompleted && a.completed) return false;
        return !this.filter.includes(a.courseCRN);
      });
    },
    groupedAssignments () {
      return this.groupBy === 'course'
        ? this.upcomingAssignmentsGroupedByCourse
        : this.upcomingAssignmentsGroupedByDueDate;
    },
    farFutureUpcomingAssignments () {
      return this.$store.getters.farFutureUpcomingAssignments;
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
        this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
          dueDate: moment(key)
        });
        this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
      }
    },
    clickDateHeading (date) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        dueDate: moment(date)
      });
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

.dot {
  margin-right: 5px;
}
</style>
