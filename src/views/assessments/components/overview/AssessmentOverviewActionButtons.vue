<!--Assessment: Overview page action buttons module-->
<template>
  <div class="assessment-actions">
    <div class="is-hidden-mobile clearfix">
      <b-button
        v-if="assessmentType === 'exam' || isOwner"
        class="edit-assessment"
        type="is-warning"
        :title="editButtonTitle"
        @click="$emit('toggle-editing')"
      >
        <i class="fas fa-edit" />
        Edit {{ capitalizedAssessmentType }}
      </b-button>
      <!-- <b-button
        v-if="assessmentType === 'assignment' && isOwner"
        type="is-link"
        class="tooltip has-tooltip-top share-assignment"
        data-tooltip="Collaborate on this assignment with other students!"
        @click="toggleSharedClick"
      >
        <i class="fas fa-users" />
        {{ assessment.shared ? "Stop Sharing" : "Share" }}
      </b-button> -->
      <b-button
        class="is-pulled-right copy-assessment"
        @click="$emit('copy-assessment')"
      >
        <i class="far fa-copy" />
        Duplicate {{ capitalizedAssessmentType }}
      </b-button>
    </div>

    <b-dropdown
      aria-role="list"
      class="is-hidden-tablet"
    >
      <button
        slot="trigger"
        class="button is-dark"
      >
        <span>Actions</span>
        <span class="icon">
          <i class="fas fa-angle-down" />
        </span>
      </button>

      <b-dropdown-item
        v-if="assessmentType === 'exam' || isOwner"
        aria-role="listitem"
        @click="$emit('toggle-editing')"
      >
        <i class="fas fa-edit" />
        Edit {{ capitalizedAssessmentType }}
      </b-dropdown-item>

      <b-dropdown-item
        v-if="assessmentType === 'assignment' && isOwner"
        aria-role="listitem"
        @click="toggleSharedClick"
      >
        <i class="fas fa-users" />
        {{ assessment.shared ? "Stop Sharing" : "Share" }}
      </b-dropdown-item>

      <b-dropdown-item
        aria-role="listitem"
        @click="$emit('copy-assessment')"
      >
        <i class="far fa-copy" />
        Duplicate {{ capitalizedAssessmentType }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewActionButtons',
  mixins: [assessmentsMixin],
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
    editButtonTitle () {
      return this.assessment.updatedAt
        ? `Last edited ${this.shortDateTimeFormat(this.assessment.updatedAt)}`
        : 'Never edited'
    }
  },
  methods: {
    toggleSharedClick () {
      this.$buefy.dialog.confirm({
        title: this.assessment.shared ? 'Stop Sharing' : 'Share Assignment',
        message: this.assessment.shared
          ? 'Stop sharing this assignment? Students currently able to view it will no longer have access. This can be reversed at any time.'
          : 'Sharing this assignment allows you to choose students that can view/edit/schedule for this assignment together. It can be turned off at any time.',
        confirmText: this.assessment.shared ? 'Stop' : 'Share',
        type: 'is-warning',
        hasIcon: true,
        icon: 'users',
        onConfirm: this.toggleShared
      })
    },
    async toggleShared () {
      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessmentType,
          updates: { shared: !this.assessment.shared }
        })
      } catch (e) {
        this.showError(e.response.data.message)
        this.editing = false
        return
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message: updatedAssessment.shared
          ? 'This assignment is now shared, add people by their RPI usernames.'
          : 'Sharing stopped. Only you can see this assignment now.',
        type: 'is-success'
      })

      this.$emit(
        'set-tab',
        updatedAssessment.shared ? 'shared-info' : 'schedule'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.assessment-actions {
  i {
    margin-right: 5px;
  }
}
</style>
