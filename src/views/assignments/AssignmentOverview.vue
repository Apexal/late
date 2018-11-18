<template>
  <div class="assignment-overview">
    <EditAssignmentModal
      :open="editAssignmentModalExpanded"
      :assignment-id="assignment._id"
      @toggle-modal="$store.commit('TOGGLE_EDIT_ASSIGNMENT_MODAL')"
    />
    <section
      v-if="!assignment"
      class="section"
    >
      <h1 class="title">Assignment Not Found</h1>
      <router-link
        to="/assignments"
        tag="button"
        class="button is-primary"
      >Assignment List</router-link>
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
          <input
            v-if="editing"
            id="title"
            v-model="title"
            type="text"
            class="input"
            maxlength="200"
            placeholder="Short descriptive title"
          >
          <p
            v-if="!editing"
            @click="toggleEdit"
          >{{ assignment.description }}</p>
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
import EditAssignmentModal from '@/components/assignments/EditAssignmentModal';

export default {
  name: 'AssignmentOverview',
  components: { EditAssignmentModal },
  data () {
    return {
    };
  },

  computed: {
    assignment () {
      return this.$store.getters.getAssignmentById(
        this.$route.params.assignmentID
      );
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assignment.courseCRN);
    },
    editing () {
      return this.$store.getters.getEditState;
    },
    editAssignmentModalExpanded () {
      return this.$store.getters.getEditAssignmentModalExpanded;
    }
  },
  methods: {
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
      await this.$store.dispatch('REMOVE_ASSIGNMENT', assignmentID);

      // Notify user of success
      this.$store.commit('ADD_NOTIFICATION', {
        type: 'success',
        description: `Successfully removed assignment '${assignmentTitle}'.`
      });
    },

    async toggleEdit () {
      // await this.$store.dispatch('EDIT_STATE');//toggles edit state
      const assignmentID = this.assignment._id;
      this.$store.dispatch('TOGGLE_EDIT_ASSIGNMENT_MODAL', assignmentID);
    },
    fromNow: date => moment(date).fromNow()
  }
};
</script>

<style lang="scss" scoped>
</style>
