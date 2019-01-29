<template>
  <div class="assignments-overview">
    <canvas id="confetti-canvas" />
    <AssignmentsModalEdit
      v-if="!isPast"
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
      <div class="is-clearfix">
        <AssignmentOverviewActionButtons
          :assignment="assignment"
          :loading="loading || toggleLoading"
          @toggle-editing="toggleEditing"
          @toggle-completed="toggleCompleted"
          @remove-assignment="remove"
        />

        <span
          class="tag is-medium course-tag"
          :style="{ 'background-color': course.color }"
          @click="$store.commit('OPEN_COURSE_MODAL', course)"
        >
          <b class="course-longname">
            {{ course.longname }}
          </b>
          {{ isPast ? 'Past ': '' }}Assignment
        </span>

        <h1 class="title">
          {{ assignment.title }}
          <h2 class="subtitle has-text-grey due-title">
            {{ isPast ? 'Was due' : 'Due' }}
            <b>{{ shortDateTimeString(assignment.dueDate) }}</b>
          </h2>
        </h1>
      </div>

      <nav class="level is-mobile assignment-stats">
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
              <span class="has-text-grey">
                min
              </span>
            </p>
            <p v-else>
              <span
                class="tag is-danger not-scheduled-tag"
                @click="tab = 'schedule'"
              >
                Not fully scheduled!
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
        ref="tabs"
        :tab="tab"
        :assignment="assignment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedAssignment"
        @add-comment="addComment"
        @delete-comment="deleteComment"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import 'confetti-js';

// Page components
import AssignmentsModalEdit from '@/components/assignments/AssignmentsModalEdit';
import AssignmentOverviewActionButtons from '@/components/assignments/overview/AssignmentOverviewActionButtons';
import AssignmentOverviewTabs from '@/components/assignments/overview/AssignmentOverviewTabs';

export default {
  name: 'AssignmentsOverview',
  components: {
    VueMarkdown,
    AssignmentsModalEdit,
    AssignmentOverviewActionButtons,
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
        this.loading = false;
        this.isUpcoming = true;
        document.title = `${this.assignment.title} | LATE`;
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
        this.updatedAssignment(request.data.updatedAssignment);
      }

      this.commentLoading = false;
    },
    async deleteComment (i) {
      let request;
      request = await this.$http.delete(
        `/assignments/a/${this.assignment._id}/comments`,
        { params: { index: i } }
      );

      // Calls API and updates state
      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.commit(
          'UPDATE_UPCOMING_ASSIGNMENT',
          request.data.updatedAssignment
        );
      } else {
        this.updatedAssignment(request.data.updatedAssignment);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.not-scheduled-tag {
  cursor: pointer;
}

.course-tag {
  cursor: pointer;
  color: white;

  .course-longname {
    margin-right: 5px;
  }

  margin-bottom: 10px;
}
.course-circle {
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

.assignment-description { 
    word-break: break-all; 
    }
</style>
