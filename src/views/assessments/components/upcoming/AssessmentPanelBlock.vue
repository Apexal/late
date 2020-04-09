<template>
  <div
    class="assessment panel-block"
    :class="panelBlockClasses"
    :data-tooltip="showScheduled ? scheduleWarningTitle : undefined"
    :style="{'border-right-color': `rgba(255, 0, 0, ${assessmentTimeWarningOpacity})`}"
  >
    <span
      v-if="assessmentType === 'assignment'"
      class="icon toggle-assignment"
      @click="toggleAssignment()"
    >
      <span
        :class="[
          assessment.completed ? 'fas fa-check-circle' : 'far fa-circle'
        ]"
        :title="toggleAssignmentTitle"
        :style="{color: course.color}"
      />
    </span>
    <router-link
      class="assessment-link"
      :title="
        (assessment.priority === 1 ? '(OPTIONAL) ' : '') +
          (assessment.description || '').substring(0, 500)
      "
      :to="linkToParams"
      :class="{
        [assessment.assessmentType]: true,
        priority: assessment.priority > 3,
        'has-text-grey is-italic': assessment.priority === 1
      }"
    >
      <span
        v-if="assessmentType === 'exam'"
        :style="{color: course.color}"
        class="icon exam-icon"
        :title="`${course.title} Exam`"
      >
        <i class="fas fa-exclamation-triangle" />
      </span>
      <b class="course-title is-hidden-tablet">{{ course.title }}</b>
      <span class="assessment-title">{{ assessment.title }}</span>
      <i
        v-if="assessmentType === 'assignment' && assessment.shared"
        class="fas fa-users has-text-grey-light"
        title="Shared assignment"
      />
    </router-link>
    <!-- <span
      v-if="showScheduled"
      class="has-tooltip-left icon has-text-danger is-pulled-right"
      :class="{
        tooltip:
          assessmentType === 'exam' ||
          (assessmentType === 'assignment' && !assessment.completed)
      }"
      :data-tooltip="scheduleWarningTitle"
    >
      <i
        :style="{opacity: assessmentTimeWarningOpacity}"
        class="far fa-clock"
      />
    </span> -->
    <small
      v-if="groupBy === 'date'"
      class="has-text-grey"
    >{{
      timeFormat(assessment.date)
    }}</small>
    <small
      v-else
      class="is-pulled-right tooltip has-tooltip-left has-text-grey"
      :data-tooltip="toDateShortString + ' ' + timeFormat(assessment.date)"
    >{{ fromNow(assessmentDate) }}</small>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'AssessmentsUpcomingPanelBlock',
  props: {
    groupBy: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    },
    showScheduled: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN)
    },
    toggleAssignmentTitle () {
      return (
        'Click to mark ' +
        this.course.title +
        ' Assignment' +
        (this.assessment.completedAt
          ? ` (Completed ${this.shortDateTimeFormat(
            this.assessment.completedAt
          )}) as incomplete`
          : ' as complete')
      )
    },
    scheduleWarningTitle () {
      return `${this.assessment.scheduledTime}/${this.assessment.timeEstimate *
        60} min scheduled`
    },
    panelBlockClasses () {
      return {
        'tooltip has-tooltip-right':
          this.showScheduled &&
          (
            this.assessmentType === 'exam' ||
            (this.assessmentType === 'assignment' && !this.assessment.completed)
          )
      }
    },
    panelBlockStyle () {
      return {}
    },
    assessmentDate () {
      return this.assessmentType === 'assignment'
        ? this.assessment.dueDate
        : this.assessment.date
    },
    toDateShortString () {
      if (moment(this.assessmentDate).isSame(moment(), 'day')) {
        return 'Today'
      }
      if (moment(this.assessmentDate).isSame(moment().add(1, 'day'), 'day')) {
        return 'Tomorrow'
      }
      return moment(this.assessmentDate).format('dddd [the] Do')
    },
    daysAway () {
      return moment(this.assessmentDate).diff(
        moment(this.rightNow).startOf('day'),
        'days'
      )
    },
    assessmentTimeWarningOpacity () {
      if (this.assessmentType === 'assignment' && this.assessment.completed) {
        return 0
      }
      if (this.assessment.scheduledTime === 0) return 1
      if (this.assessment.timeEstimate === 0) return 0
      if (this.assessment.timeEstimate === this.assessment.scheduledTime) {
        return 0
      }

      return (
        1 - this.assessment.scheduledTime / (this.assessment.timeEstimate * 60)
      )
    },
    linkToParams () {
      return {
        name: this.assessmentType + '-overview',
        params: { [this.assessmentType + 'ID']: this.assessment._id }
      }
    }
  },
  methods: {
    async toggleAssignment () {
      try {
        const toggledAssignment = await this.$store.dispatch(
          'TOGGLE_ASSIGNMENT',
          this.assessment
        )

        this.$buefy.snackbar.open({
          message: `Marked '${toggledAssignment.title}' as ${
            toggledAssignment.completed ? 'complete' : 'incomplete'
          }!`,
          type: 'is-primary',
          position: 'is-bottom',
          actionText: 'View',
          onAction: () => {
            this.$router.push({
              name: 'assignment-overview',
              params: { assignmentID: this.assessment._id }
            })
          }
        })
      } catch (e) {
        return this.showError(e.response.data.message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.assessment {
  padding-right: 5px;
  padding-left: 5px;
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);

  &.tooltip {
    border-right-width: 2px;
    border-right-style: solid;
  }

  .assessment-link {
    color: inherit;
    word-wrap: break-word;
    flex: 1;
  }
  .is-completed {
    text-decoration: line-through;
  }

  .toggle-assignment {
    cursor: pointer;
  }

  .priority,
  .exam {
    font-weight: 500;
  }
}
</style>
