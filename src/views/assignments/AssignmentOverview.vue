<template>
  <div class="assignment-overview">
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">Loading Assignment</h1>
    </section>
    <section
      v-else
      class="section"
    >
      <span
        class="is-pulled-right has-text-grey"
        :title="toFullDateTimeString(assignment.dueDate)"
      >
        {{ fromNow(assignment.dueDate) }}
      </span>
      <h2 class="subtitle">{{ course.longname }}</h2>
      <h1 class="title">{{ assignment.title }}</h1>
      <div class="content">
        <blockquote>
          <p>{{ assignment.description }}</p>
        </blockquote>
      </div>
      <hr>
      <router-link
        to="/assignments"
        class="button is-link"
      >
        <span class="icon">
          <i class="fas fa-angle-left" />
        </span>
        All Assignments
      </router-link>
      <button
        class="button is-danger"
        @click="remove"
      >
        Remove</button>
    </section>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentOverview',
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
    // call again the method if the route changes
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
</style>
