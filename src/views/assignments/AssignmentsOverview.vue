<template>
  <div class="assignments-overview">
    <AssignmentsModalEdit
      v-if="!isPast"
      :open="editing"
      :initial-assignment="assignment"
      @toggle-modal="editing = !editing"
      @edit-assignment="editedAssignment"
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
      <div class="is-clearfix">
        <AssignmentOverviewActionButtons
          :assignment="assignment"
          :loading="loading || toggleLoading"
          @toggle-editing="toggleEditing"
          @toggle-completed="toggleCompleted"
        />

        <h2 class="subtitle">
          <span
            v-if="assignment.completed"
            class="icon"
          >
            <span
              class="fas fa-check-circle"
              :style="{ 'color': course.color }"
            />
          </span>
          {{ course.longname }}
          <span class="has-text-grey">
            {{ isPast ? 'Past ': '' }}Assignment
          </span>
        </h2>
        <h1 class="title">
          {{ assignment.title }}
          <h2 class="subtitle has-text-grey due-title">
            {{ isPast ? 'Was due' : 'Due' }} {{ shortDateTimeString(assignment.dueDate) }}
          </h2>
        </h1>
      </div>

      <hr>

      <nav class="level is-mobile box assignment-stats">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Priority
            </p>
            <p class="subtitle">
              {{ assignment.priority }}
            </p>
          </div>
        </div>

        <div
          v-if="assignment.completed"
          class="level-item has-text-centered"
        >
          <div>
            <p class="heading">
              Work Done
            </p>
            <p class="subtitle">
              <span class="has-text-grey">
                ---
              </span>
            </p>
          </div>
        </div>

        <div
          v-else
          class="level-item has-text-centered"
        >
          <div>
            <p class="heading">
              Work Left
            </p>
            <p class="subtitle">
              {{ assignment.timeRemaining }}
              <span class="has-text-grey">
                hrs
              </span>
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
              class="subtitle tooltip is-tooltip-bottom"
              :data-tooltip="fromNow(assignment.completedAt)"
            >
              {{ completedAt }}
            </p>
          </div>
        </div>
        <div
          v-else
          class="level-item has-text-centered"
        >
          <div>
            <p class="heading">
              Due In
            </p>
            <p class="subtitle">
              {{ timeLeft }}
            </p>
          </div>
        </div>
      </nav>

      <div class="content assignment-description">
        <blockquote>
          <VueMarkdown
            v-if="assignment.description.length > 0"
            :source="assignment.description"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
          <i v-else>
            No description given.
          </i>
        </blockquote>
      </div>

      <AssignmentOverviewTabs
        :tab="tab"
        :assignment="assignment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @add-comment="addComment"
        @add-work-block="addWorkBlock"
        @remove-work-block="removeWorkBlock"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';

// Page components
import AssignmentsModalEdit from '@/components/assignments/AssignmentsModalEdit';
import AssignmentOverviewActionButtons from '@/components/assignments/overview/AssignmentOverviewActionButtons';
import AssignmentOverviewTabs from '@/components/assignments/overview/AssignmentOverviewTabs';

export default {
  name: 'AssignmentsOverview',
  components: { VueMarkdown, AssignmentsModalEdit, AssignmentOverviewActionButtons, AssignmentOverviewTabs },
  data () {
    return {
      tab: 'schedule',
      commentLoading: false,
      toggleLoading: false,
      loading: true,
      isUpcoming: false,
      assignment: {},
      editing: false
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
      return moment(this.assignment.updatedAt).format('MM/DD/YY h:mma');
    },
    lastEdited () {
      return moment(this.assignment.createdAt).isSame(this.assignment.updatedAt)
        ? 'never'
        : moment(this.assignment.updatedAt).format('MM/DD/YY h:mma');
    },
    timeLeft () {
      const diff = moment.duration(
        moment(this.assignment.dueDate).diff(this.now)
      );
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    },
    isPast () {
      return this.assignment.passed;
    },
    toggleButtonTitle () {
      return this.assignment.completed
        ? `Completed ${moment(this.assignment.completedAt).format(
          'MM/DD/YY h:mma'
        )}`
        : 'Click to mark as completed.';
    }
  },
  watch: {
    $route: 'getAssignment'
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
    editedAssignment (newAssignment) {
      this.assignment = newAssignment;
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

          this.editedAssignment(request.data.updatedAssignment);
        }
        this.$toasted.show('Toggled assignment.', {
          icon: this.assignment.completed ? 'check-circle' : 'circle',
          action: {
            text: 'Undo'
          }
        });
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
        this.loading = false;
        this.isUpcoming = true;
        document.title = `${this.assignment.title} | LATE`;
        return;
      }

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
      document.title = `${this.assignment.title} | LATE`;
      this.loading = false;
    },
    shortDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMM Do YYYY [@] h:mma'),
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
    },
    async addWorkBlock ({ start, end }) {
      let request;
      request = await this.$http.post(`/assignments/a/${this.assignment._id}/blocks`, { startTime: start, endTime: end, assessmentType: 'assignment' });

      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.commit(
          'UPDATE_UPCOMING_ASSIGNMENT',
          request.data.updatedAssignment
        );
      } else {
        this.editedAssignment(request.data.updatedAssignment);
      }

      this.$toasted.show('Added work block to your schedule!');
    },
    async removeWorkBlock (blockID) {
      let request;
      request = await this.$http.delete(`/assignments/a/${this.assignment._id}/blocks/${blockID}`);

      // Update state by removing work block from this assignment
      const updatedAssignment = Object.assign({}, this.assignment, { _blocks: this.assignment._blocks.filter(b => b._id !== blockID) });
      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.commit(
          'UPDATE_UPCOMING_ASSIGNMENT',
          updatedAssignment
        );
      } else {
        this.editedAssignment(updatedAssignment);
      }

      this.$toasted.error('Removed work block from your schedule!');
    },
    async addComment (newComment) {
      if (!newComment) return;

      this.commentLoading = true;
      let request;
      request = await this.$http.post(
        `/assignments/a/${this.assignment._id}/comments`,
        { comment: newComment }
      );

      // Calls API and updates state
      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.commit(
          'UPDATE_UPCOMING_ASSIGNMENT',
          request.data.updatedAssignment
        );
      } else {
        this.editedAssignment(request.data.updatedAssignment);
      }

      this.commentLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.due-title {
  margin-top: 5px;
}

.assignment-stats {
  padding: 10px;
}

.margin-right {
  margin-right: 10px;
}

.margin-left {
  margin-left: 2px !important;
}
</style>
