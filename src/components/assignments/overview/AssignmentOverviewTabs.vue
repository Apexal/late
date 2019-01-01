<template>
  <div class="assignment-overview-tabs">
    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': tab === 'schedule' }"
          @click="$emit('set-tab', 'schedule')"
        >
          <a>Work Schedule</a>
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
            >
              {{ assignment.comments.length }}
            </span>
          </a>
        </li>
      </ul>
    </div>

    <Component
      :is="componentName"
      :assessment-type="'assignment'"
      :assessment="assignment"
      :assignment="assignment"
      :loading="loading"
      @add-comment="$emit('add-comment', arguments[0])"
      @add-work-block="$emit('add-work-block', arguments[0])"
      @edit-work-block="$emit('edit-work-block', arguments[0])"
      @remove-work-block="$emit('remove-work-block', arguments[0])"
    />
  </div>
</template>

<script>
// Tabs
import AssignmentOverviewTabsComments from '@/components/assignments/overview/tabs/AssignmentOverviewTabsComments';
// import AssignmentOverviewabsWorkSchedule from '@/components/assignments/overview/tabs/AssignmentOverviewTabsWorkSchedule';
import AssessmentOverviewWorkSchedule from '@/components/AssessmentOverviewWorkSchedule';

export default {
  name: 'AssignmentOverviewTabs',
  components: {
    AssignmentOverviewTabsComments,
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
    componentName () {
      return {
        comments: 'AssignmentOverviewTabsComments',
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
</style>
