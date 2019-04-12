<template>
  <div class="exam-overview-tabs">
    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': tab === 'schedule' }"
          @click="$emit('set-tab', 'schedule')"
        >
          <a>
            <span
              v-if="workScheduleLocked"
              class="icon tooltip is-tooltip-right"
              data-tooltip="This can no longer be edited."
            >
              <i class="fa fa-lock" />
            </span>
            <span>Work Schedule</span>

            <span
              v-if="!exam.passed && !fullyScheduled"
              class="tag is-danger tooltip is-tooltip-right"
              data-tooltip="You haven't scheduled enough time to study for this!"
            >!</span>
          </a>
        </li>
        <li
          :class="{ 'is-active': tab === 'comments' }"
          @click="$emit('set-tab', 'comments')"
        >
          <a>
            Comments
            <span
              v-if="exam.comments.length > 0"
              class="tag is-dark comment-count"
            >{{ exam.comments.length }}</span>
          </a>
        </li>
        <li
          :class="{ 'is-active': tab === 'related' }"
          @click="$emit('set-tab', 'related')"
        >
          <a>Related Exams</a>
        </li>
        <li
          :class="{ 'is-active': tab === 'studyPlan' }"
          @click="$emit('set-tab', 'studyPlan')"
        >
          <a>Study Plan</a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'exam'"
      :assessment="exam"
      :loading="loading"
      @update-assessment="$emit('update-assessment', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssessmentOverviewWorkSchedule from '@/views/components/assessments/AssessmentOverviewWorkSchedule';
import AssessmentOverviewComments from '@/views/components/assessments/AssessmentOverviewComments';
import AssessmentOverviewRelated from '@/views/components/assessments/AssessmentOverviewRelated';
import ExamOverviewStudyPlan from '@/views/components/exams/overview/ExamOverviewStudyPlan';

export default {
  name: 'ExamOverviewTabs',
  components: {
    AssessmentOverviewComments,
    AssessmentOverviewWorkSchedule,
    AssessmentOverviewRelated,
    ExamOverviewStudyPlan
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
    scheduledMinutes () {
      return this.exam._blocks.reduce((acc, block) => acc + block.duration, 0);
    },
    totalEstimatedMinutes () {
      return this.exam.timeEstimate * 60;
    },
    fullyScheduled () {
      return this.scheduledMinutes >= this.totalEstimatedMinutes;
    },
    workScheduleLocked () {
      return this.exam.passed;
    },
    componentName () {
      return {
        comments: 'AssessmentOverviewComments',
        schedule: 'AssessmentOverviewWorkSchedule',
        related: 'AssessmentOverviewRelated',
        studyPlan: 'ExamOverviewStudyPlan'
      }[this.tab];
    }
  }
};
</script>

<style lang="scss" scoped>
.comment-count {
  margin-left: 3px;
}
.tag {
  margin-left: 3px;
}
</style>
