<template>
  <div class="assessment-overview">
    <canvas id="confetti-canvas" />
    <AssignmentsModalEdit
      v-if="assessmentType === 'assignment'"
      :open="editing"
      :initial-assignment="assessment"
      @toggle-modal="editing = !editing"
      @edit-assignment="updatedAssessment"
      @remove-assignment="removeAssessment"
    />
    <ExamsModalEdit
      v-else-if="assessmentType === 'exam'"
      :open="editing"
      :initial-exam="assessment"
      @toggle-modal="editing = !editing"
      @edit-exam="updatedAssessment"
      @remove-exam="removeAssessment"
    />
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">
        Loading {{ assessmentType }}...
      </h1>
    </section>
    <section
      v-else
      class="section"
    >
      <AssessmentOverviewTitle
        :assessment-type="'assignment'"
        :assessment="assessment"
        @toggle-completed="toggleCompleted"
      />

      <AssignmentOverviewStats
        v-if="assessmentType === 'assignment'"
        :assignment="assessment"
        @not-fully-scheduled-click="notFullyScheduledClick"
        @update-assessment="updatedAssessment"
      />

      <ExamOverviewStats
        v-else
        :exam="assessment"
        @not-fully-scheduled-click="notFullyScheduledClick"
      />

      <AssessmentOverviewDescription
        :assessment="assessment"
        @update-assessment="updatedAssessment"
      />
      <AssignmentOverviewTabs
        v-if="assessmentType === 'assignment'"
        ref="tabs"
        :tab="tab"
        :assignment="assessment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedAssessment"
      />

      <ExamOverviewTabs
        v-else
        :tab="tab"
        :exam="assessment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedAssessment"
      />

      <hr>

      <AssessmentOverviewActionButtons
        :assessment="assessment"
        :loading="loading"
        @toggle-editing="toggleEditing"
        @copy-assessment="copyAssessment"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import 'confetti-js';
import VueMarkdown from 'vue-markdown';

// Page components
import AssignmentOverviewStats from '@/views/components/assignments/overview/AssignmentOverviewStats';
import AssessmentOverviewDescription from '@/views/components/assessments/AssessmentOverviewDescription';
import AssessmentOverviewActionButtons from '@/views/components/assessments/AssessmentOverviewActionButtons';
import AssessmentOverviewTitle from '@/views/components/assessments/AssessmentOverviewTitle';

import AssignmentOverviewTabs from '@/views/components/assignments/overview/AssignmentOverviewTabs';
import AssignmentsModalEdit from '@/views/components/assignments/AssignmentsModalEdit';

import ExamsModalEdit from '@/views/components/exams/ExamsModalEdit';
import ExamOverviewStats from '@/views/components/exams/overview/ExamOverviewStats';
import ExamOverviewTabs from '@/views/components/exams/overview/ExamOverviewTabs';

export default {
  name: 'AssessmentsOverview',
  components: {
    AssessmentOverviewDescription,
    AssessmentOverviewTitle,
    AssessmentOverviewActionButtons,
    VueMarkdown,
    ExamsModalEdit,
    ExamOverviewTabs,
    ExamOverviewStats,
    AssignmentsModalEdit,
    AssignmentOverviewTabs,
    AssignmentOverviewStats
  },
  props: {
    assessmentType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      tab: 'schedule',
      commentLoading: false,
      toggleLoading: false,
      loading: true,
      isUpcoming: false,
      assessment: {},
      editing: false,
      confetti: null,
      confettiSettings: { target: 'confetti-canvas', clock: 75, max: 150 }
    };
  },
  computed: {
    assessmentID () {
      return this.assessmentType === 'assignment'
        ? this.$route.params.assignmentID
        : this.$route.params.examID;
    },
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    lastEdited () {
      return moment(this.assessment.createdAt).isSame(this.assessment.updatedAt)
        ? 'never'
        : moment(this.assessment.updatedAt).format('M/DD/YY h:mma');
    },
    isPast () {
      return this.assessment.passed;
    },
    toggleButtonTitle () {
      return this.assessment.completed
        ? `Completed ${moment(this.assessment.completedAt).format(
          'M/DD/YY h:mma'
        )}`
        : 'Click to mark as completed.';
    }
  },
  watch: {
    $route: 'getAssessment',
    assessment (newAssessment) {
      document.title = `${newAssessment.title} | LATE`;
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.confetti = new ConfettiGenerator(this.confettiSettings);
  },
  created () {
    this.getAssessment();
  },
  methods: {
    tabChanged (newTab) {
      this.tab = newTab;
    },
    toggleEditing () {
      this.editing = !this.editing;
    },
    scrollToTop () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    updatedAssessment (newAssessment) {
      // eslint-disable-next-line
      this.assessment = newAssessment;
    },
    notFullyScheduledClick () {
      this.tab = 'schedule';
      this.$refs.tabs.scrollTo();
    },
    copyAssessment () {
      this.$store.dispatch(
        'COPY_' + this.assessmentType.toUpperCase() + '_TO_MODAL',
        this.assessment
      );
      this.$store.commit(
        'TOGGLE_ADD_' + this.assessmentType.toUpperCase() + '_MODAL'
      );
    },
    async toggleCompleted () {
      if (this.assessmentType !== 'assignment') return;

      if (
        !confirm(
          `Are you sure you want to mark this ${this.assessmentType} as ${
            this.assessment.completed ? 'incomplete' : 'complete'
          }?`
        )
      ) {
        return;
      }
      this.toggleLoading = true;

      // If upcoming assignment, let store handle it
      try {
        if (
          this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
        ) {
          await this.$store.dispatch(
            'TOGGLE_UPCOMING_ASSIGNMENT',
            this.assessment._id
          );
          await this.getAssessment();
        } else {
          const request = await this.$http.post(
            `/assignments/a/${this.assessment._id}/toggle`
          );

          this.updatedAssessment(request.data.updatedAssignment);
        }
        this.$toasted[this.assessment.completed ? 'success' : 'show'](
          this.assessment.completed
            ? 'Marked assignment as completed! Nice job!'
            : 'Marked assignment as incomplete.',
          {
            icon: this.assessment.completed ? 'check-circle' : 'circle',
            action: {
              text: 'Undo'
            }
          }
        );

        if (this.assessment.completed) {
          this.confetti.render();
          setTimeout(() => this.confetti.clear(), 2000);
        }
      } catch (e) {
        this.$toasted.error(e.response.data.message);
      }

      this.toggleLoading = false;
    },
    async getAssessment () {
      // If its an upcoming assignment, we already have the data on it
      const assessmentID = this.$route.params[this.assessmentType + 'ID'];
      if (this.$store.getters.getUpcomingAssessmentById(assessmentID)) {
        this.updatedAssessment(
          this.$store.getters.getUpcomingAssessmentById(assessmentID)
        );

        this.editedDescription = this.assessment.description;
        document.title = `${this.assessment.title} | LATE`;
        this.loading = false;
        this.isUpcoming = true;

        if (this.assessment.completed || this.passed) this.tab = 'comments';
        return;
      }

      // Not an upcoming assessment

      this.tab = 'comments';
      this.loading = true;
      this.isUpcoming = false;

      let request;
      let apiURL =
        this.assessmentType === 'assignment' ? '/assignments/a/' : '/exams/e/';
      try {
        request = await this.$http.get(apiURL + this.assessmentID);
      } catch (e) {
        this.loading = false;
        this.router.push('/assessments');

        return this.$toasted.error(e.response.data.message);
      }

      this.updatedAssessment(request.data[this.assessmentType]);
      this.editedDescription = this.assessment.description;
      document.title = `${this.assessment.title} | LATE`;

      this.loading = false;
    },
    async dispatchOrDelete (assessmentID) {
      // This handles the API call and state update
      if (this.isUpcoming) {
        await this.$store.dispatch('REMOVE_UPCOMING_ASSESSMENT', assessmentID);
      } else {
        await this.$http.delete(
          (this.assessmentType === 'assignment'
            ? '/assignments/a/'
            : '/exams/e/') + assessmentID
        );
      }
      this.$router.push('/assessments');
    },
    async removeAssessment () {
      // Confirm user wants to remove assessment
      if (
        !confirm(
          `Are you sure you want to remove assessment ${this.assessment.title}?`
        )
      ) {
        return;
      }

      const assessmentTitle = this.assessment.title;
      const assessmentID = this.assessment._id;
      this.dispatchOrDelete(assessmentID);

      // Notify user of success
      this.$toasted.success(
        `Successfully removed assessment '${assessmentTitle}'.`,
        {
          icon: 'times',
          action: {
            text: 'Undo'
          }
        }
      );
    },
    shortDateTimeString: date =>
      moment(date).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
.margin-right {
  margin-right: 10px;
}

.margin-left {
  margin-left: 2px !important;
}

#confetti-canvas {
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
