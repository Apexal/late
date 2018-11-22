<template>
  <div class="assignment-overview">
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">Loading Assignment...</h1>
    </section>
    <section
      v-else
      class="section"
    >
      <span
        class="is-pulled-right has-text-grey"
        :title="toFullDateTimeString(assignment.dueDate)"
      >
        due {{ fromNow(assignment.dueDate) }}
      </span>
      <h2 class="subtitle">
        <span
          class="dot course-dot"
          :title="course.longname"
          :style="'background-color: ' + course.color"
        />
        {{ course.longname }} Assignment</h2>
      <h1 class="title">{{ assignment.title }}</h1>
      <div class="content">
        <blockquote>
          <VueMarkdown
            v-if="assignment.description.length > 0"
            :source="assignment.description"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
          <i v-else>No description given.</i>
        </blockquote>
      </div>
      <hr>
      <div class="buttons">
        <router-link
          to="/assignments"
          class="button is-link"
        >
          <span class="icon">
            <i class="fas fa-angle-left margin-right" />
          </span>
          All Assignments
        </router-link>
        <button class="button is-warning">
          Edit
          <span class="icon margin-left">
            <i class="fas fa-pencil-alt" />
          </span>
        </button>
        <button
          class="button is-danger"
          @click="remove"
        >
          Remove
          <span class="icon is-small margin-left">
            <i class="fas fa-times" />
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';

export default {
  name: 'AssignmentOverview',
  components: { VueMarkdown },
  data () {
    return {
      loading: true,
      isUpcoming: false,
      assignment: {}
    };
  },
  computed: {
    course () {
      return this.$store.getters.getCourseFromCRN(this.assignment.courseCRN);
    }
  },
  watch: {
    '$route': 'getAssignment'
  },
  created () {
    this.getAssignment();
  },
  methods: {
    async getAssignment () {
      // If its an upcoming assignment, we already have the data on it
      if (this.$store.getters.getUpcomingAssignmentById(this.$route.params.assignmentID)) {
        this.assignment = this.$store.getters.getUpcomingAssignmentById(this.$route.params.assignmentID);
        this.loading = false;
        this.isUpcoming = true;
        return;
      }

      this.loading = true;
      this.isUpcoming = false;

      let request;
      try {
        request = await this.$http.get(`/assignments/a/${this.$route.params.assignmentID}`);
      } catch (e) {
        this.loading = false;
        this.$router.push('/assignments');
        return this.$store.dispatch('ADD_NOTIFICATION', {
          type: 'danger',
          description: e.response.data.message
        });
      }

      this.assignment = request.data.assignment;

      this.loading = false;
    },
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    async remove () {
      // Confirm user wants to remove assignment
      if (
        !confirm(
          `Are you sure you want to remove assignment ${this.assignment.title}?`
        )
      ) return;

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
      this.$store.dispatch('ADD_NOTIFICATION', {
        type: 'success',
        description: `Successfully removed assignment '${assignmentTitle}'.`
      });
    },
    fromNow: date => moment(date).fromNow()
  }
};
</script>

<style lang="scss" scoped>
.margin-right {
  margin-right: 5px;
}

.margin-left {
  margin-left: 2px !important;
}
</style>
