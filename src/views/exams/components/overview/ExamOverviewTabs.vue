<!--Assessments: Exam overview tabs module-->
<template>
  <div
    id="exam-overview-tabs"
    ref="tabs"
  >
    <div class="tabs">
      <ul>
        <li
          :class="{'is-active': tab === 'schedule'}"
          @click="$emit('set-tab', 'schedule')"
        >
          <a>
            <span class="icon is-small">
              <i
                class="fas fa-calendar-alt"
                aria-hidden="true"
              />
            </span>
            <span>Schedule</span>

            <span
              v-if="!exam.passed && !fullyScheduled"
              class="tag is-danger tooltip has-tooltip-right"
              data-tooltip="You haven't scheduled enough time to study for this!"
            >!</span>
          </a>
        </li>
        <li
          :class="{'is-active': tab === 'studyPlan'}"
          @click="$emit('set-tab', 'studyPlan')"
        >
          <a>
            <span class="icon is-small">
              <i
                class="fas fa-list-ol"
                aria-hidden="true"
              />
            </span>
            <span>Study Plan</span>
            <span
              v-if="studyPlanMade"
              class="tag is-success"
            >{{ studyPlanCompletedPercent }}%</span>
            <span
              v-else
              data-tooltip="You have not made a study plan for this exam yet!"
              class="tag is-danger tooltip has-tooltip-right"
            >!</span>
          </a>
        </li>
        <li
          :class="{'is-active': tab === 'comments'}"
          @click="$emit('set-tab', 'comments')"
        >
          <a>
            <span class="icon is-small">
              <i
                class="fas fa-comments"
                aria-hidden="true"
              />
            </span>
            <span>Comments</span>
            <span
              v-if="hasComments"
              class="tag is-dark comment-count"
            >
              {{ exam.comments.length }}
            </span>
          </a>
        </li>

        <li
          v-if="!exam.passed"
          class="reminders"
          :class="{'is-active': tab === 'reminders'}"
          @click="$emit('set-tab', 'reminders')"
        >
          <a>
            <span class="icon is-small">
              <i class="fas fa-bell" />
            </span>
            <span>Reminders</span>
          </a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'exam'"
      :assessment="exam"
      :loading="loading"
      @updated-assessment="$emit('updated-assessment', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssessmentOverviewWorkSchedule from '@/views/assessments/components/overview/AssessmentOverviewWorkSchedule'
import AssessmentOverviewComments from '@/views/assessments/components/overview/AssessmentOverviewComments'
import AssessmentOverviewReminders from '@/views/assessments/components/overview/AssessmentOverviewReminders'
import ExamOverviewStudyPlan from '@/views/exams/components/overview/ExamOverviewStudyPlan'

export default {
  name: 'ExamOverviewTabs',
  components: {
    AssessmentOverviewComments,
    AssessmentOverviewWorkSchedule,
    ExamOverviewStudyPlan,
    AssessmentOverviewReminders
  },
  props: {
    tab: {
      type: String,
      required: true
    },
    exam: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    hasComments () {
      return this.exam.comments && this.exam.comments.length > 0
    },
    scheduledMinutes () {
      if (!this.exam._blocks) return 0

      return this.exam._blocks.reduce((acc, block) => acc + block.duration, 0)
    },
    totalEstimatedMinutes () {
      return this.exam.timeEstimate * 60
    },
    fullyScheduled () {
      return this.scheduledMinutes >= this.totalEstimatedMinutes
    },
    studyPlan () {
      return this.exam.studyPlan
    },
    studyPlanMade () {
      if (!this.studyPlan) return false

      return Object.keys(this.studyPlan).length > 0
    },
    studyPlanCompletedPercent () {
      const totalItemCount = this.studyPlan.reduce(
        (acc, item) => acc + 1 + item.children.length,
        0
      )
      const totalCompleted = this.studyPlan.reduce(
        (acc, item) =>
          acc + item.completed + item.children.filter(c => c.completed).length,
        0
      )

      if (totalItemCount === 0) return 0

      return Math.round((totalCompleted / totalItemCount) * 100)
    },
    componentName () {
      return {
        comments: 'AssessmentOverviewComments',
        schedule: 'AssessmentOverviewWorkSchedule',
        studyPlan: 'ExamOverviewStudyPlan',
        reminders: 'AssessmentOverviewReminders'
      }[this.tab]
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  margin-top: 20px;
}

.comment-count {
  margin-left: 3px;
}
.tag {
  margin-left: 3px;
}
</style>
