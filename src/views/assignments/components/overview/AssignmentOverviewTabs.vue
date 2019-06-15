<template>
  <div
    id="assignment-overview-tabs"
    ref="tabs"
  >
    <div class="tabs">
      <ul>
        <li
          class="schedule"
          :class="{ 'is-active': tab === 'schedule' }"
          @click="$emit('set-tab', 'schedule')"
        >
          <a>
            <span
              class="icon is-small"
            ><i
              class="fas fa-calendar-alt"
              aria-hidden="true"
            /></span>
            <span>Work Schedule</span>
            <span
              v-if="!assignment.completed && !fullyScheduled"
              class="tag is-danger tooltip is-tooltip-right"
              data-tooltip="You haven't scheduled enough time to work on this!"
            >!</span>
          </a>
        </li>
        <li
          class="comments"
          :class="{ 'is-active': tab === 'comments' }"
          @click="$emit('set-tab', 'comments')"
        >
          <a>
            <span
              class="icon is-small"
            ><i
              class="fas fa-comments"
              aria-hidden="true"
            /></span>
            <span>Comments</span>
            <span
              v-if="hasComments"
              class="tag is-dark comment-count"
            >{{
              assignment.comments.length
            }}</span>
          </a>
        </li>
        <li
          v-if="assignment.shared"
          class="shared-info"
          :class="{ 'is-active': tab === 'shared-info' }"
          @click="$emit('set-tab', 'shared-info')"
        >
          <a>
            <span
              class="icon is-small"
            ><i
              class="fas fa-users"
              aria-hidden="true"
            /></span>
            <span>Shared Assignment Info</span></a>
        </li>
        <li
          v-else
          class="related"
          :class="{ 'is-active': tab === 'related' }"
          @click="$emit('set-tab', 'related')"
        >
          <a>
            <span
              class="icon is-small"
            ><i
              class="fas fa-clipboard-check"
              aria-hidden="true"
            /></span>
            <span>Related Assignments</span>
          </a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'assignment'"
      :assessment="assignment"
      :loading="loading"
      @updated-assessment="$emit('updated-assessment', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssessmentOverviewComments from '@/views/assessments/components/overview/AssessmentOverviewComments';
import AssessmentOverviewWorkSchedule from '@/views/assessments/components/overview/AssessmentOverviewWorkSchedule';
import AssessmentOverviewRelated from '@/views/assessments/components/overview/AssessmentOverviewRelated';
import AssignmentOverviewTabsSharedInfo from '@/views/assignments/components/overview/AssignmentOverviewTabsSharedInfo';

export default {
  name: 'AssignmentOverviewTabs',
  components: {
    AssessmentOverviewComments,
    AssessmentOverviewWorkSchedule,
    AssessmentOverviewRelated,
    AssignmentOverviewTabsSharedInfo
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
    hasComments () {
      return this.assignment.comments && this.assignment.comments.length > 0;
    },
    scheduledMinutes () {
      if (!this.assignment._blocks) return 0;

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
    componentName () {
      return {
        comments: 'AssessmentOverviewComments',
        schedule: 'AssessmentOverviewWorkSchedule',
        related: 'AssessmentOverviewRelated',
        'shared-info': 'AssignmentOverviewTabsSharedInfo'
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
