<template>
  <div class="exam-overview-tabs">
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
      @add-work-block="$emit('add-work-block', arguments[0])"
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
</style>
