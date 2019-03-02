<template>
  <div class="assignments-overview">
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

      <nav class="box level assignment-stats">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Priority
            </p>
            <p
              class="subtitle"
              :title="'Priority level ' + assignment.priority"
              :class="{ 'has-text-grey': assignment.priority === 1 }"
              :style="{ 'font-weight': fontWeight }"
            >
              {{ priorityString }}
            </p>
          </div>
        </div>

        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              {{ isPast ? 'Was Due' : 'Due' }}
            </p>
            <p
              class="subtitle tooltip"
              :data-tooltip="timeLeft"
            >
              {{ shortDueDateString }}
            </p>
          </div>
        </div>
        <div
          v-if="assignment.completed"
          class="level-item has-text-centered"
        >
          <div>
            <p class="heading">
              Completed
            </p>
            <p
              class="subtitle tooltip"
              :data-tooltip="fromNow(assignment.completedAt)"
            >
              {{ completedAt }}
            </p>
          </div>
        </div>

        <div
          v-if="!assignment.completed"
          class="level-item has-text-centered"
        >
          <div>
            <p
              class="heading"
            >
              {{ assignment.fullyScheduled ? 'Scheduled Work Left' : 'Work Schedule' }}
            </p>
            <p
              v-if="assignment.fullyScheduled"
              class="subtitle"
            >
              {{ assignment.scheduledTimeRemaing }}
              <span class="has-text-grey">min</span>
            </p>
            <p v-else>
              <span
                class="tag is-danger not-scheduled-tag"
                @click="notFullyScheduledClick"
              >Not fully scheduled!</span>
            </p>
          </div>
        </div>
      </nav>

      <AssignmentOverviewActionButtons
        :assignment="assignment"
        :loading="loading || toggleLoading"
        :description-expanded="descriptionExpanded"
        @toggle-description="descriptionExpanded = !descriptionExpanded"
        @toggle-completed="toggleCompleted"
        @toggle-editing="toggleEditing"
        @remove-assignment="remove"
      />

      <div
        v-if="descriptionExpanded"
        class="content assignment-description"
      >
        <blockquote>
          <textarea
            v-if="editingDescription"
            v-model.trim="editedDescription"
            class="edited-description"
          />
          <template v-else>
            <VueMarkdown
              v-if="assignment.description.length > 0"
              :source="assignment.description"
              :html="false"
              :emoji="true"
              :anchor-attributes="{target: '_blank'}"
            />
            <i v-else>No description given.</i>
          </template>
          <span
            class="edit-description tooltip is-tooltip-left"
            :data-tooltip="editingDescription ? 'Click to save description.' : 'Click to edit description.'"
            @click="toggleEditingDescription"
          >
            <i class="fas fa-pencil-alt" />
          </span>
        </blockquote>
      </div>
      <hr>
      <AssignmentOverviewTabs
        ref="tabs"
        :tab="tab"
        :assignment="assignment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedAssignment"
      />
      <hr>
      <div class="bottom-actions clearfix">
        <button
          class="button"
          @click="scrollToTop"
        >
          Back to Top
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import 'confetti-js';

// Page components
import AssessmentOverviewTitle from '@/components/AssessmentOverviewTitle';
import AssignmentsModalEdit from '@/components/assignments/AssignmentsModalEdit';
import AssignmentOverviewActionButtons from '@/components/assignments/overview/AssignmentOverviewActionButtons';
import AssignmentOverviewTabs from '@/components/assignments/overview/AssignmentOverviewTabs';

export default {
  name: 'AssignmentsOverview',
  components: {
    AssessmentOverviewTitle,
    VueMarkdown,
    AssignmentsModalEdit,
    AssignmentOverviewActionButtons,
    AssignmentOverviewTabs
  },
  data () {
    return {
      tab: 'schedule',
      editingDescription: false,
      editedDescription: '',
      commentLoading: false,
      toggleLoading: false,
      loading: true,
      isUpcoming: false,
      descriptionExpanded: true,
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
    completedAt () {
      return moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    lastEdited () {
      return moment(this.assignment.createdAt).isSame(this.assignment.updatedAt)
        ? 'never'
        : moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    fontWeight () {
      return (
        {
          1: 300,
          2: 300,
          3: 'normal',
          4: 500,
          5: 700
        }[this.assignment.priority] || 600
      );
    },
    priorityString () {
      return (
        {
          1: 'Optional',
          2: 'Low',
          3: 'Normal',
          4: 'High',
          5: 'Important'
        }[this.assignment.priority] || 'Unknown'
      );
    },
    timeLeft () {
      const diff = moment.duration(
        moment(this.assignment.dueDate).diff(this.now)
      );
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    },
    shortDueDateString () {
      return this.shortDateTimeString(this.assignment.dueDate);
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
    },
    descriptionExpanded (newDescriptionExpanded) {
      localStorage.setItem(
        'assignmentOverviewDescriptionExpanded',
        newDescriptionExpanded
      );
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.confetti = new ConfettiGenerator(this.confettiSettings);

    if (localStorage.getItem('assignmentOverviewDescriptionExpanded')) {
      try {
        this.descriptionExpanded = JSON.parse(
          localStorage.getItem('assignmentOverviewDescriptionExpanded')
        );
      } catch (e) {
        localStorage.removeItem('assignmentOverviewDescriptionExpanded');
      }
    }
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
      this.assignment = newAssignment;
    },
    async toggleEditingDescription () {
      if (this.editingDescription) {
        if (this.editedDescription === this.assignment.description) {
          this.editingDescription = false;
          return;
        }

        let request;
        try {
          request = await this.$http.patch(
            `/assignments/a/${this.assignment._id}`,
            { description: this.editedDescription }
          );
        } catch (e) {
          this.$toasted.error(e.response.data.message);
          this.editingDescription = false;
          return;
        }

        // Calls API and updates state
        if (
          this.$store.getters.getUpcomingAssignmentById(this.assignment._id)
        ) {
          this.$store.dispatch(
            'UPDATE_UPCOMING_ASSIGNMENT',
            request.data.updatedAssignment
          );
        } else {
          this.updatedAssignment(request.data.updatedAssignment);
        }

        this.editingDescription = false;
      } else {
        this.editedDescription = this.assignment.description;
        this.editingDescription = true;
      }
    },
    notFullyScheduledClick () {
      this.tab = 'schedule';
      this.$refs.tabs.scrollTo();
    },
    scrollToTop () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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
    shortDateTimeString: dueDate =>
      moment(dueDate).format('ddd, MMM Do YY [@] h:mma'),
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
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
.not-scheduled-tag {
  cursor: pointer;
}

.due-title {
  margin-top: 5px;
}

.level.assignment-stats {
  margin-top: 20px;
  margin-bottom: 0;
  padding: 10px;
}

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

.assignment-description blockquote {
  word-break: break-word;
  position: relative;

  .edited-description {
    max-width: 600px;
    min-width: 100%;

    min-height: 100px;
    max-height: 400px;
  }

  .edit-description {
    cursor: pointer;
    z-index: 2;
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
