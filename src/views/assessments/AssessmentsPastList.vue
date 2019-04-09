<template>
  <div class="past-assessments">
    <h2 class="subtitle">
      Week of {{ weekOf }}
    </h2>
    <div class="is-flex-tablet">
      <button
        class="button"
        :disabled="!canGoPrev"
        :class="{ 'is-loading': loading }"
        @click="shiftDates(-7)"
      >
        <span class="icon">
          <i class="fas fa-chevron-left" />
        </span>
      </button>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="control">
            <input
              id="start"
              :value="startDate"
              class="input"
              type="date"
              min="2018-09-01"
              :max="endDate"
              disabled
            >
          </div>
        </div>
      </div>

      <div
        style="flex: 1"
        class="buttons is-centered"
      >
        <div class="field is-horizontal">
          <div class="field-body">
            <div
              class="control"
              style="margin-right:1em;"
            >
              <input
                id="assignmentFilter"
                v-model="assignmentFilter"
                class="input"
                type="text"
                placeholder="Filter Assignments"
              >
            </div>
          </div>

          <button
            class="button is-primary"
            :disabled="isLastWeek"
            @click="gotoLastWeek"
          >
            Last Week
          </button>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-body">
          <div class="control">
            <input
              id="end"
              :value="endDate"
              class="input"
              type="date"
              min="2018-09-01"
              :max="today"
              disabled
            >
          </div>
        </div>
      </div>

      <button
        class="button"
        :class="{ 'is-loading': loading }"
        :disabled="!canGoForward"
        @click="shiftDates(7)"
      >
        <span class="icon">
          <i class="fas fa-chevron-right" />
        </span>
      </button>
    </div>

    <AssessmentsTable
      v-if="filteredAssessments.length > 0"
      :assessments="filteredAssessments"
      :show-remove-button="true"
      @remove-assessment="removeAssessment"
    />
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      No Assessments
      <i
        v-if="filter.length > 0 || !showCompleted"
        style="font-style:inherit"
      >matching your filters </i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >this week!</i>
    </p>
  </div>
</template>

<script>
import moment from 'moment';
import AssessmentsTable from '@/views/components/assessments/AssessmentsTable';

export default {
  name: 'AssessmentsPastList',
  components: { AssessmentsTable },
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
  data () {
    return {
      assignmentFilter: '',
      loading: true,
      startDate:
        this.$route.query.start ||
        moment()
          .subtract(7, 'days')
          .format('YYYY-MM-DD'),
      endDate: this.$route.query.end || moment().format('YYYY-MM-DD'),
      currentAssessments: []
    };
  },
  computed: {
    filteredAssessments () {
      return this.currentAssessments.filter(assessment => {
        if (assessment.assessmentType === 'assignment') {
          if (!this.showCompleted && assessment.completed) return false;
        }
        return !this.filter.includes(assessment.courseCRN);
      });
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    canGoForward () {
      return this.endMoment.isBefore(moment().startOf('day'));
    },
    canGoPrev () {
      return moment(this.startMoment)
        .subtract(1, 'week')
        .isSameOrAfter(this.currentTerm.start, 'week');
    },
    startMoment () {
      return moment(this.startDate, 'YYYY-MM-DD', true);
    },
    endMoment () {
      return moment(this.endDate, 'YYYY-MM-DD', true);
    },
    isLastWeek () {
      return this.endMoment.isSame(moment(), 'day');
    },
    weekOf () {
      return this.startMoment.format('dddd, MMMM Do YYYY');
    },
    range () {
      return this.endMoment.diff(
        moment(this.startDate, 'YYYY-MM-DD', true),
        'days'
      );
    },
    today: () => moment().format('YYYY-MM-DD'),
    yesterday: () =>
      moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD')
  },
  watch: {
    startDate () {
      this.getAssessments();
    }
  },
  created () {
    this.getAssessments();
  },
  methods: {
    async removeAssessment (assessment) {
      // Confirm user wants to remove assignment
      if (!confirm(`Are you sure you want to remove ${assessment.title}?`)) {
        return;
      }

      // This handles the API call and state update
      if (assessment.assessmentType === 'assignment') {
        await this.$http.delete(`/assignments/a/${assessment._id}`);
      } else await this.$http.delete(`/exams/e/${assessment._id}`);

      this.currentAssessments = this.currentAssessments.filter(
        as => as._id !== assessment._id
      );

      // Notify user of success
      this.$toasted.success(
        `Successfully removed past ${assessment.assessmentType} '${
          assessment.title
        }'.`,
        {
          icon: 'times',
          action: {
            text: 'Undo'
          }
        }
      );
    },
    gotoLastWeek () {
      this.endDate = this.today;
      this.startDate = moment()
        .subtract('1', 'week')
        .format('YYYY-MM-DD');

      this.getAssessments();
    },
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    shiftDates (amount) {
      this.startDate = moment(this.startDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');
      this.endDate = moment(this.endDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');

      this.getAssessments();
    },
    async getAssessments () {
      this.loading = true;
      let request;
      try {
        request = await this.$http.get('/exams', {
          params: {
            start: this.startMoment.format('YYYY-MM-DD'),
            end: this.endMoment.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        this.loading = false;
        this.currentAssessments = [];
        return this.$toasted.error(e.response.data.message);
      }
      let currentExams = request.data.exams.filter(e => e.passed); // Only get passed exams

      try {
        request = await this.$http.get('/assignments', {
          params: {
            start: this.startMoment.format('YYYY-MM-DD'),
            end: this.endMoment.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        this.loading = false;
        this.currentAssessments = [];
        return this.$toasted.error(e.response.data.message);
      }

      let currentAssignments = request.data.assignments.filter(e => e.passed); // Only get passed exams

      this.currentAssessments = currentAssignments
        .concat(currentExams)
        .sort((a, b) => {
          const aDate = a.dueDate || a.date;
          const bDate = b.dueDate || b.date;

          if (aDate > bDate) return 1;
          if (aDate < bDate) return -1;
          return 0;
        });

      this.loading = false;
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: dueDate => moment(dueDate).format('M/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.dot {
  margin-right: 5px;
}

.assignment-link {
  color: inherit;
}

.fas {
  &.fa-check {
    color: green;
  }

  &.fa-times {
    color: red;
  }
}
</style>
