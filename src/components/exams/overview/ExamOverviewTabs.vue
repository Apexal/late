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
            </span>Work Schedule
            <span
              v-if="!exam.passed && !fullyScheduled"
              class="tag is-danger tooltip is-tooltip-right"
              data-tooltip="You haven't scheduled enough time to study for this!"
            >
              !
            </span>
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
            >
              {{ exam.comments.length }}
            </span>
          </a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'exam'"
      :assessment="exam"
      :loading="loading"
      @add-comment="$emit('add-comment', arguments[0])"
      @update-assessment="$emit('update-assessment', arguments[0])"
      @edit-work-block="$emit('edit-work-block', arguments[0])"
      @remove-work-block="$emit('remove-work-block', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssessmentOverviewWorkSchedule from '@/components/AssessmentOverviewWorkSchedule';
import AssessmentOverviewComments from '@/components/AssessmentOverviewComments';

export default {
  name: 'ExamOverviewTabs',
  components: {
    AssessmentOverviewComments,
    AssessmentOverviewWorkSchedule
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
        schedule: 'AssessmentOverviewWorkSchedule'
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
