<template>
  <div class="shared-assignment-info">
    <template v-if="isOwner">
      <b>You are the owner of this shared assignment.</b>

      <ul>
        <li
          v-for="(rcs_id, index) in assessment.sharedWith"
          :key="index"
        >
          {{ rcs_id }}
        </li>
        <li>
          <form @submit.prevent="addStudent">
            <b-field>
              <b-input
                v-model.trim="newStudent"
                type="text"
                placeholder="RPI username of student, e.g. matraf"
                required
              />
              <p class="control">
                <button
                  class="button"
                  :class="{ 'is-loading': loading }"
                >
                  Add Student
                </button>
              </p>
            </b-field>
          </form>
        </li>
      </ul>
    </template>
    <template v-else>
      This assignment was created by
      <b
        class="tooltip is-tooltip-top"
        :data-tooltip="owner.rcs_id"
      >{{
        owner.display_name
      }}</b>. They have shared it with:
      <ul>
        <li
          v-for="(rcs_id, index) in assessment.sharedWith"
          :key="index"
        >
          <b-tag type="is-primary">
            {{ rcs_id }}
          </b-tag>
        </li>
      </ul>

      Scheduling work blocks for this assignment places them in everybody's
      schedule. <b>LATE</b> will also show everybody's availability to help you
      find time slots that work for everyone.
    </template>
  </div>
</template>

<script>
export default {
  name: 'AssignmentOverviewTabsSharedInfo',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      newStudent: ''
    };
  },
  computed: {
    owner () {
      return this.assessment._student;
    },
    isOwner () {
      return this.assessment._student._id === this.user._id;
    }
  },
  methods: {
    async addStudent () {
      this.loading = true;

      if (
        this.assessment.sharedWith.includes(this.newStudent) ||
        this.newStudent === this.user.rcs_id
      ) {
        this.loading = false;
        this.newStudent = '';
        return;
      }

      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch(
          'UPDATE_ASSESSMENT',
          Object.assign(this.assessment, {
            sharedWith: [...this.assessment.sharedWith, this.newStudent]
          })
        );
      } catch (e) {
        console.error(e);
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.editing = false;
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message: `Shared this assignment with <b>${
          this.newStudent
        }</b>. They have been emailed.`,
        type: 'is-success'
      });

      this.newStudent = '';
      this.loading = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
