<template>
  <div class="assessment-overview">
    <canvas id="confetti-canvas" />
    <AssignmentsModalEdit
      :open="editing"
      :initial-assignment="assignment"
      @toggle-modal="editing = !editing"
      @edit-assignment="updatedAssignment"
      @remove-assignment="remove"
    />
    <ExamsModalEdit
      v-if="!isPast"
      :open="editing"
      :initial-exam="exam"
      @toggle-modal="editing = !editing"
      @edit-exam="updatedExam"
      @remove-exam="remove"
    />
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">
        Loading Assessment...
      </h1>
    </section>
    <section
      v-else
      class="section"
    >
      ${this.$route.params.assignmentID}?
      (<AssessmentOverviewTitle
        :assessment-type="'assignment'"
        :assessment="assignment"
        @toggle-completed="toggleCompleted"
      />
      <AssessmentOverviewDescription
        :assessment-type="'assignment'"
        :assessment="assignment"
        @update-assessment="updatedAssignment"
      />
      <AssignmentOverviewTabs
        ref="tabs"
        :tab="tab"
        :assignment="assignment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedAssignment"
      />):
      (<AssessmentOverviewTitle
        :assessment-type="'exam'"
        :assessment="exam"
      />
      <AssessmentOverviewDescription
        :assessment-type="'exam'"
        :assessment="exam"
        @update-assessment="updatedExam"
      />
      <ExamOverviewTabs
        :tab="tab"
        :exam="exam"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedExam"
      />)

      ${this.$route.params.assignmentID}?
      (<AssignmentOverviewStats
        :assignment="assignment"
        @not-fully-scheduled-click="notFullyScheduledClick"
      />):(<ExamOverviewStats :exam="exam" />)


      <hr>
      ${this.$route.params.assignmentID}?
      (<AssessmentOverviewActionButtons
        :assessment-type="'assignment'"
        :assessment="assignment"
        :loading="loading"
        @toggle-editing="toggleEditing"
        @copy-assignment="copyAssignment"
      />):(
      <AssessmentOverviewActionButtons
        :assessment-type="'exam'"
        :assessment="exam"
        :loading="loading"
        @toggle-editing="toggleEditing"
        @copy-exam="copyExam"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import 'confetti-js';
import VueMarkdown from 'vue-markdown';

// Page components
import ExamOverviewStats from '@/views/components/exams/overview/ExamOverviewStats';
import AssignmentOverviewStats from '@/views/components/assignments/overview/AssignmentOverviewStats';
import AssessmentOverviewDescription from '@/views/components/assessment/AssessmentOverviewDescription';
import AssessmentOverviewActionButtons from '@/views/components/assessment/AssessmentOverviewActionButtons';
import AssessmentOverviewTitle from '@/views/components/assessment/AssessmentOverviewTitle';
import ExamsModalEdit from '@/views/components/exams/ExamsModalEdit';
import ExamOverviewTabs from '@/views/components/exams/overview/ExamOverviewTabs';
import AssignmentsModalEdit from '@/views/components/assignments/AssignmentsModalEdit';
import AssignmentOverviewTabs from '@/views/components/assignments/overview/AssignmentOverviewTabs';

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
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    lastEdited () {
      return moment(this.assignment.createdAt).isSame(this.assignment.updatedAt)
        ? 'never'
        : moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    isPast () {
      return this.assessment.passed;
    },
    toggleButtonTitle () {
      return this.assignment.completed
        ? `Completed ${moment(this.assignment.completedAt).format(
          'M/DD/YY h:mma'
        )}`
        : 'Click to mark as completed.';
    }
  },
  watch: {
    $route: 'getAssignment',
    assignment (newAssignment) {
      document.title = `${newAssignment.title} | LATE`;
    }
    // $route: 'getExam',
    // exam (newExam) {
    //   document.title = `${newExam.title} | LATE`;
    // }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.confetti = new ConfettiGenerator(this.confettiSettings);
  },
  created () {
    this.$route.params.assignmentID
      ? this.getAssignment() : this.getExam();
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
    updatedExam (newExam) {
      this.exam = newExam;
    },
    updatedAssignment (newAssignment) {
      this.assignment = newAssignment;
    },
    notFullyScheduledClick () {
      this.tab = 'schedule';
      this.$refs.tabs.scrollTo();
    },
    copyExam () {
      this.$store.dispatch('COPY_EXAM_TO_MODAL', this.exam);
      this.$store.commit('TOGGLE_ADD_EXAM_MODAL');
    },
    copyAssignment () {
      this.$store.dispatch('COPY_ASSIGNMENT_TO_MODAL', this.assignment);
      this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
    },
    async toggleCompleted () {
      if (
        !confirm(
          `Are you sure you want to mark this assignment as ${
            this.assignment.completed ? 'incomplete' : 'complete'
          }?`
        )
      ) {
        return;
      }
      this.toggleLoading = true;

      // If upcoming assignment, let store handle it
      try {
        if (
          this.$store.getters.getUpcomingAssignmentById(this.assignment._id)
        ) {
          await this.$store.dispatch(
            'TOGGLE_UPCOMING_ASSIGNMENT',
            this.assignment._id
          );
          await this.getAssignment();
        } else {
          const request = await this.$http.post(
            `/assignments/a/${this.assignment._id}/toggle`
          );

          this.updatedAssignment(request.data.updatedAssignment);
        }
        this.$toasted[this.assignment.completed ? 'success' : 'show'](
          this.assignment.completed
            ? 'Marked assignment as completed! Nice job!'
            : 'Marked assignment as incomplete.',
          {
            icon: this.assignment.completed ? 'check-circle' : 'circle',
            action: {
              text: 'Undo'
            }
          }
        );

        if (this.assignment.completed) {
          this.confetti.render();
          setTimeout(() => this.confetti.clear(), 2000);
        }
      } catch (e) {
        this.$toasted.error(e.response.data.message);
      }

      this.toggleLoading = false;
    },
    async getExam () {
      // If its an upcoming exam, we already have the data on it
      if (this.$store.getters.getUpcomingExamById(this.$route.params.examID)) {
        this.exam = this.$store.getters.getUpcomingExamById(
          this.$route.params.examID
        );
        this.loading = false;
        this.isUpcoming = true;

        if ((this.assessment.completed) || (this.passed)) this.tab = 'comments';
        return;
      }

      this.tab = 'comments';

      this.loading = true;
      this.isUpcoming = false;

      let request;
      try {
        request = await this.$route.params.assignmentID
          ? this.$http.get(`/assignments/a/${this.$route.params.assignmentID}`) : this.$http.get(`/exams/e/${this.$route.params.examID}`);
      } catch (e) {
        this.loading = false;
        this.$route.params.assignmentID ? this.$router.push('/assignments') : this.$router.push('/exams');

        return this.$toasted.error(e.response.data.message);
      }
      if (this.$route.params.assignmentID) {
        this.assignment = request.data.assignment;
        this.editedDescription = this.assignment.description;
      } else {
        this.exam = request.data.exam;
        document.title = `${this.exam.title} | LATE`;
      }

      this.loading = false;
    },
    async getAssignment () {
      // If its an upcoming assignment, we already have the data on it
      if (
        this.$store.getters.getUpcomingAssignmentById(
          this.$route.params.assignmentID
        )
      ) {
        this.assignment = this.$store.getters.getUpcomingAssignmentById(
          this.$route.params.assignmentID
        );
        this.editedDescription = this.assignment.description;

        this.loading = false;
        this.isUpcoming = true;

        if ((this.assessment.completed) || (this.passed)) this.tab = 'comments';
        return;
      }

      this.tab = 'comments';

      this.loading = true;
      this.isUpcoming = false;

      let request;
      try {
        request = await this.$route.params.assignmentID
          ? this.$http.get(`/assignments/a/${this.$route.params.assignmentID}`)
          : this.$http.get(`/exams/e/${this.$route.params.examID}`);
      } catch (e) {
        this.loading = false;
        this.$route.params.assignmentID
          ? this.$router.push('/assignments') : this.$router.push('/exams');

        return this.$toasted.error(e.response.data.message);
      }
      if (this.$route.params.assignmentID) {
        this.assignment = request.data.assignment;
        this.editedDescription = this.assignment.description;
      } else {
        this.exam = request.data.exam;
        document.title = `${this.exam.title} | LATE`;
      }
      this.loading = false;
    },
    async dispatchOrDelete (assessmentID) {
      var dispatchStr = '';
      var deleteStr = '';
      if (this.$route.params.assignmentID) {
        this.$router.push('/assignments');
        dispatchStr = 'REMOVE_UPCOMING_ASSIGNMENT';
        deleteStr = `/assignment/a/${assessmentID}`;
      } else {
        this.$router.push('/exams');
        dispatchStr = 'REMOVE_UPCOMING_EXAM';
        deleteStr = `/exams/e/${assessmentID}`;
      }
      // This handles the API call and state update
      if (this.isUpcoming) {
        await this.$store.dispatch(dispatchStr, assessmentID);
      } else {
        await this.$http.delete(deleteStr);
      }
    },
    async remove () {
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
        });
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
