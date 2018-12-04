<template>
  <div class="assignment-overview">
    <EditAssignmentModal
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
        <div class="assignment-controls buttons has-addons is-pulled-right">
          <router-link
            to="/assignments"
            class="button is-link"
          >
            <span class="icon">
              <i class="fas fa-angle-left margin-right" />
            </span>
            Browse
          </router-link>

          <button
            v-if="!isPast"
            class="button is-warning"
            @click="toggleEditing"
          >
            <span class="icon">
              <i class="fas fa-pencil-alt" />
            </span>
            Edit Info
          </button>

          <button
            class="button"
            :class="{ 'is-success': !assignment.completed, 'is-danger': assignment.completed }"
            @click="toggleCompleted"
          >
            <span class="icon">
              <i
                class="fas"
                :class="{ 'fa-times' : assignment.completed, 'fa-check': !assignment.completed }"
              />
            </span>
            {{ assignment.completed ? 'Mark Incomplete' : 'Mark Complete' }}
          </button>
        </div>

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
          <span
            class="has-text-grey"
          >
            {{ isPast ? 'Past ': '' }}Assignment
          </span>
        </h2>
        <h1 class="title">
          {{ assignment.title }}
          <h2
            class="subtitle has-text-grey due-title"
          >
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

      <div class="tabs">
        <ul>
          <li
            :class="{ 'is-active': tab === 'schedule' }"
            @click="tab = 'schedule'"
          >
            <a>Work Schedule</a>
          </li>
          <li
            :class="{ 'is-active': tab === 'comments' }"
            @click="tab = 'comments'"
          >
            <a>
              Comments
              <span
                v-if="assignment.comments.length > 0"
                class="tag is-dark comment-count"
              >
                {{ assignment.comments.length }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div
        v-if="tab === 'schedule'"
        class="assignment-schedule"
      />
      <div
        v-else-if="tab === 'comments'"
        class="assignment-comments"
      >
        <div
          v-if="assignment.comments.length === 0"
          class="has-text-grey has-text-centered"
        >
          {{ isPast ? 'No comments were posted for this assignment.' : 'You have not posted any comments yet.' }}
        </div>
        <div
          v-for="(c, index) in assignment.comments"
          :key="index"
          class="box"
        >
          <small
            class="has-text-grey is-pulled-right added-at tooltip is-tooltip-left"
            :data-tooltip="toFullDateTimeString(c.addedAt)"
          >
            {{ fromNow(c.addedAt) }}
          </small>
          <VueMarkdown
            :source="c.body"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
        </div>
        <template v-if="!isPast">
          <hr>
          <div class="box is-clearfix">
            <form @submit.prevent="addComment">
              <div class="field">
                <div class="control">
                  <textarea
                    id="new-comment"
                    v-model="newComment"
                    placeholder="Write your comment here. Markdown is supported!"
                    cols="30"
                    rows="10"
                    class="input"
                    required
                  />
                </div>
              </div>
              <button
                :class="{ 'is-loading': commentLoading }"
                class="button is-success is-pulled-right"
              >
                Add Comment
              </button>
            </form>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';

import EditAssignmentModal from '@/components/assignments/EditAssignmentModal';

export default {
  name: 'AssignmentOverview',
  components: { VueMarkdown, EditAssignmentModal },
  data () {
    return {
      tab: 'comments',
      newComment: '',
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
      return moment().isAfter(moment(this.assignment.dueDate));
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
        await this.$http.post(`/assignments/a/${assignmentID}/remove`);
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
    async addComment () {
      if (!this.newComment) return;

      this.commentLoading = true;
      let request;
      request = await this.$http.post(
        `/assignments/a/${this.assignment._id}/comments/add`,
        { comment: this.newComment }
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

      this.newComment = '';
      this.commentLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.due-title {
  margin-top: 5px;
}
.assignment-controls {
  span.icon {
    margin-right: 0px !important;
  }
}
.comment-count {
  margin-left: 3px;
}
#new-comment {
  max-width: 900px;
  min-height: 100px;
  max-height: 200px;
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
