<template>
  <div class="assessments-upcoming">
    <p
      v-if="none"
      class="has-text-centered has-text-grey"
    >
      No upcoming assessments
      <i
        v-if="filter.length > 0 || !showCompleted"
        style="font-style:inherit"
      >matching your filters.</i>
      <i
        v-else-if="filter.length <= 0"
        style="font-style:inherit"
      >for the next 2 weeks!</i>
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <div
        v-for="(assessments, key) in groupedFilteredLimitedAssessments"
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
              :title="`Your assessments for this day are ${percentDone(key)}% complete`"
            >{{ percentDone(key) }}%</span>
            <span
              class="key"
              :title="headerTitle"
              @click="headerClick(key)"
            >{{ headerText(key) }}</span>
          </p>
          <AssessmentPanelBlock
            v-for="a in assessments"
            :key="a._id"
            :group-by="groupBy"
            :assessment="a"
            @toggle-assignment="$emit('toggle-assignment', arguments[0])"
          />
        </div>
      </div>
    </div>
    <div
      v-if="farFutureUpcomingAssessments.length > 0"
      class="far-future-assignments"
    >
      <hr>
      <p class="has-text-centered has-text-grey">
        {{ farFutureUpcomingAssessments.length }} far future assignments {{ showingFutureAssignments ? 'shown' : 'hidden' }}
        <a
          @click="showingFutureAssignments = !showingFutureAssignments"
        >Toggle</a>
      </p>

      <AssignmentsTable
        v-if="showingFutureAssignments"
        :assignments="filteredFarFutureAssessments"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import AssessmentPanelBlock from '@/views/components/assessment/upcoming/AssessmentPanelBlock';
import AssignmentsTable from '@/views/components/assignments/AssignmentsTable.vue';

export default {
  name: 'AssessmentsUpcoming',
  components: { AssignmentsTable, AssessmentPanelBlock },
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
      return Object.keys(this.filteredLimitedAssessments).length === 0;
    },
    headerTitle () {
      return this.groupBy === 'courseCRN'
        ? 'Open course modal'
        : 'Add assignment to this day';
    },
    filteredLimitedAssessments () {
      return this.$store.getters.limitedUpcomingAssessments.filter(
        assessment => {
          if (assessment.assessmentType === 'assignment') {
            if (!this.showCompleted && assessment.completed) return false;
          } else {
            return !this.filter.includes(assessment.courseCRN);
          }

          return true;
        }
      );
    },
    groupedFilteredLimitedAssessments () {
      return this.$store.getters.groupAssessments(
        this.groupBy,
        this.filteredLimitedAssessments
      );
    },
    farFutureUpcomingAssessments () {
      return this.$store.getters.farFutureUpcomingAssessments;
    },
    filteredFarFutureAssessments () {
      return this.farFutureUpcomingAssessments.filter(assessment => {
        if (assessment.assessmentType === 'assignment') {
          if (!this.showCompleted && assessment.completed) return false;
        } else {
          return !this.filter.includes(assessment.courseCRN);
        }
      });
    }
  },
  methods: {
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    },
    headerText (key) {
      return this.groupBy === 'courseCRN'
        ? this.course(key).longname
        : this.toDateShortString(key);
    },
    headerStyle (key) {
      if (this.groupBy === 'date') return {};
      let color = this.course(key).color;
      if (color.length < 5) {
        color += color.slice(1);
      }
      return {
        'background-color':
          this.groupBy === 'courseCRN' ? this.course(key).color : 'inherit',
        color: color.replace('#', '0x') > 0xffffff / 1.2 ? '#333' : '#fff'
      };
    },
    headerClick (key) {
      if (this.groupBy === 'courseCRN') {
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
      const assignments = this.groupedFilteredLimitedAssessments[key];
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
