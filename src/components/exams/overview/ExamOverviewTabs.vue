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
      :exam="exam"
      :loading="loading"
      @add-comment="this.$emit('add-comment', arguments[0])"
      @add-work-block="this.$emit('add-work-block', arguments[0])"
      @edit-work-block="editWorkBlock"
      @remove-work-block="removeWorkBlock"
    />
  </div>
</template>

<script>
// Tabs
import ExamOverviewTabsComments from '@/components/exams/overview/tabs/ExamOverviewTabsComments';
import ExamOverviewabsWorkSchedule from '@/components/exams/overview/tabs/ExamOverviewabsWorkSchedule';

export default {
  name: 'ExamOverviewTabs',
  components: { ExamOverviewTabsComments, ExamOverviewabsWorkSchedule },
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
        comments: 'ExamOverviewTabsComments',
        schedule: 'ExamOverviewabsWorkSchedule'
      }[this.tab];
    }
  },
  methods: {
    editWorkBlock (payload) {
      this.$emit('edit-work-block', payload);
    },
    removeWorkBlock (blockID) {
      this.$emit('remove-work-block', blockID);
    }
  }
};
</script>

<style lang="scss" scoped>
.comment-count {
  margin-left: 3px;
}
</style>
