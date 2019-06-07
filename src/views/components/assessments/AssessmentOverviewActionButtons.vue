<template>
  <div class="assessment-actions clearfix">
    <b-button
      type="is-warning"
      :title="editButtonTitle"
      @click="$emit('toggle-editing')"
    >
      <i class="fas fa-edit" />
      Edit {{ assessmentTypeCaps }}
    </b-button>
    <b-button
      v-if="assessmentType === 'assignment' && isOwner"
      type="is-link"
      class="tooltip is-tooltip-top"
      data-tooltip="Collaborate on this assignment with other students!"
      @click="toggleSharedClick"
    >
      <i class="fas fa-users" />
      {{ assessment.shared ? "Stop Sharing" : "Share" }}
    </b-button>
    <b-button
      class="is-pulled-right"
      @click="$emit('copy-assessment')"
    >
      Duplicate {{ assessmentTypeCaps }}
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewActionButtons',
  props: {
    assessment: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    isOwner () {
      return this.assessment._student._id === this.user._id;
    },
    assessmentType () {
      return this.assessment.assessmentType;
    },
    assessmentTypeCaps () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    },
    editButtonTitle () {
      return this.assessment.updatedAt
        ? `Last edited ${this.shortDateTimeFormat(this.assessment.updatedAt)}`
        : 'Never edited';
    }
  },
  methods: {
    toggleSharedClick () {
      this.$dialog.confirm({
        title: this.assessment.shared ? 'Stop Sharing' : 'Share Assignment',
        message: this.assessment.shared
          ? 'Stop sharing this assignment? Students currently able to view it will no longer have access. This can be reversed at any time.'
          : 'Sharing this assignment allows you to choose students that can view/edit/schedule for this assignment together. It can be turned off at any time.',
        confirmText: this.assessment.shared ? 'Stop' : 'Share',
        type: 'is-warning',
        hasIcon: true,
        icon: 'users',
        onConfirm: this.toggleShared
      });
    },
    async toggleShared () {
      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch(
          'UPDATE_ASSESSMENT',
          Object.assign(this.assessment, { shared: !this.assessment.shared })
        );
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        this.editing = false;
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message: updatedAssessment.shared
          ? 'This assignment is now shared, add people by their RPI usernames.'
          : 'Sharing stopped. Only you can see this assignment now.',
        type: 'is-success'
      });

      this.$emit(
        'set-tab',
        updatedAssessment.shared ? 'shared-info' : 'schedule'
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-actions {
  i {
    margin-right: 5px;
  }
}
</style>
