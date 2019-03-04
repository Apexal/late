<template>
  <div
    ref="tabs"
    class="assignment-overview-tabs"
  >
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
              v-if="!assignment.completed && !fullyScheduled"
              class="tag is-danger tooltip is-tooltip-right"
              data-tooltip="You haven't scheduled enough time to work on this!"
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
              v-if="assignment.comments.length > 0"
              class="tag is-dark comment-count"
            >{{ assignment.comments.length }}</span>
          </a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'assignment'"
      :assessment="assignment"
      :loading="loading"
      @update-assessment="$emit('update-assessment', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssessmentOverviewComments from '@/views/components/AssessmentOverviewComments';
import AssessmentOverviewWorkSchedule from '@/views/components/AssessmentOverviewWorkSchedule';

export default {
  name: 'AssignmentOverviewTabs',
  components: {
    AssessmentOverviewComments,
    AssessmentOverviewWorkSchedule
  },
  props: {
    tab: {
      type: String,
      required: true
    },
    assignment: {
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
      return this.assignment._blocks.reduce(
        (acc, block) => acc + block.duration,
        0
      );
    },
    totalEstimatedMinutes () {
      return this.assignment.timeEstimate * 60;
    },
    fullyScheduled () {
      return this.scheduledMinutes >= this.totalEstimatedMinutes;
    },
    workScheduleLocked () {
      return this.assignment.completed || this.assignment.passed;
    },
    componentName () {
      return {
        comments: 'AssessmentOverviewComments',
        schedule: 'AssessmentOverviewWorkSchedule'
      }[this.tab];
    }
  },
  methods: {
    scrollTo () {
      this.$refs.tabs.scrollIntoView({
        behavior: 'smooth'
      });
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
