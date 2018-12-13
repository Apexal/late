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
      :assignment="assignment"
      :loading="loading"
      @add-comment="addComment"
    />
  </div>
</template>

<script>
// Tabs
import AssignmentOverviewTabsComments from '@/components/assignments/overview/tabs/AssignmentOverviewTabsComments';
import AssignmentOverviewabsWorkSchedule from '@/components/assignments/overview/tabs/AssignmentOverviewabsWorkSchedule';

export default {
  name: 'AssignmentOverviewTabs',
  components: { AssignmentOverviewTabsComments, AssignmentOverviewabsWorkSchedule },
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
        'comments': 'AssignmentOverviewTabsComments',
        'schedule': 'AssignmentOverviewabsWorkSchedule'
      }[this.tab];
    }
  },
  methods: {
    addComment (newComment) {
      this.$emit('add-comment', newComment);
    }
  }
};
</script>

<style lang="scss" scoped>

.comment-count {
  margin-left: 3px;
}
</style>
