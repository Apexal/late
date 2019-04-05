<template>
  <div class="assignment-overview">
    <canvas id="confetti-canvas" />
    <AssignmentsModalEdit
      :open="editing"
      :initial-assignment="assignment"
      @toggle-modal="editing = !editing"
      @edit-assignment="updatedAssignment"
      @remove-assignment="remove"
    />
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">
        Loading Assignment...
      </h1>
    </section>
    <section
      v-else
      class="section"
    >
      <AssessmentOverviewTitle
        :assessment-type="'assignment'"
        :assessment="assignment"
        @toggle-completed="toggleCompleted"
      />

      <AssignmentOverviewStats
        :assignment="assignment"
        @not-fully-scheduled-click="notFullyScheduledClick"
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
      />

      <hr>

      <AssessmentOverviewActionButtons
        :assessment-type="'assignment'"
        :assessment="assignment"
        :loading="loading"
        @toggle-editing="toggleEditing"
        @copy-assignment="copyAssignment"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import 'confetti-js';

// Page components
import AssignmentOverviewStats from '@/views/components/assignments/overview/AssignmentOverviewStats';
import AssessmentOverviewDescription from '@/views/components/assessment/AssessmentOverviewDescription';
import AssessmentOverviewActionButtons from '@/views/components/assessment/AssessmentOverviewActionButtons';
import AssessmentOverviewTitle from '@/views/components/assessment/AssessmentOverviewTitle';
import AssignmentsModalEdit from '@/views/components/assignments/AssignmentsModalEdit';
import AssignmentOverviewTabs from '@/views/components/assignments/overview/AssignmentOverviewTabs';

export default {
  name: 'AssignmentsOverview',
  components: {
    AssignmentOverviewStats,
    AssessmentOverviewDescription,
    AssessmentOverviewTitle,
    AssignmentsModalEdit,
    AssessmentOverviewActionButtons,
    AssignmentOverviewTabs
  },
  data () {
    return {
      tab: 'schedule',
      commentLoading: false,
      toggleLoading: false,
      loading: true,
      isUpcoming: false,
      assignment: {},
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
      return this.$store.getters.getCourseFromCRN(this.assignment.courseCRN);
    },
    lastEdited () {
      return moment(this.assignment.createdAt).isSame(this.assignment.updatedAt)
        ? 'never'
        : moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    isPast () {
      return this.assignment.passed;
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
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.confetti = new ConfettiGenerator(this.confettiSettings);
  },
  created () {
    this.getAssignment();
  },
  methods: {
    tabChanged (newTab) {
      this.tab = newTab;
    },
    toggleEditing () {
      this.editing = !this.editing;
    },
    updatedAssignment (newAssignment) {
      Object.assign(this.assignment, newAssignment);
    },
    notFullyScheduledClick () {
      this.tab = 'schedule';
      this.$refs.tabs.scrollTo();
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
          this.$store.getters.getUpcomingAssessmentById(this.assignment._id)
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
    async getAssignment () {
      // If its an upcoming assignment, we already have the data on it
      if (
        this.$store.getters.getUpcomingAssessmentById(
          this.$route.params.assignmentID
        )
      ) {
        this.assignment = this.$store.getters.getUpcomingAssessmentById(
          this.$route.params.assignmentID
        );
        this.editedDescription = this.assignment.description;

        this.loading = false;
        this.isUpcoming = true;

        if (this.assignment.completed) this.tab = 'comments';
        return;
      }

      this.tab = 'comments';

      this.loading = true;
      this.isUpcoming = false;

      let request;
      try {
        request = await this.$http.get(
          `/assignments/a/${this.$route.params.assignmentID}`
        );
      } catch (e) {
        this.loading = false;
        this.$router.push('/assignments');

        return this.$toasted.error(e.response.data.message);
      }

      this.assignment = request.data.assignment;
      this.editedDescription = this.assignment.description;

      this.loading = false;
    },
    async remove () {
      // Confirm user wants to remove assignment
      if (
        !confirm(
          `Are you sure you want to remove assignment ${this.assignment.title}?`
        )
      ) {
        return;
      }

      const assignmentTitle = this.assignment.title;
      const assignmentID = this.assignment._id;

      this.$router.push('/assignments');

      // This handles the API call and state update
      if (this.isUpcoming) {
        await this.$store.dispatch('REMOVE_UPCOMING_ASSIGNMENT', assignmentID);
      } else {
        await this.$http.delete(`/assignments/a/${assignmentID}`);
      }

      // Notify user of success
      this.$toasted.success(
        `Successfully removed assignment '${assignmentTitle}'.`,
        {
          icon: 'times',
          action: {
            text: 'Undo'
          }
        }
      );
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
