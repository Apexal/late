<template>
  <nav class="level is-mobile box exam-stats">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">
          Priority
        </p>
        <p class="subtitle">
          {{ priorityStr }}
        </p>
      </div>
    </div>

    <div
      v-if="!exam.passed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          Scheduled Studying Left
        </p>
        <p class="subtitle">
          {{ exam.scheduledTimeRemaing }}
          <span class="has-text-grey">
            min
          </span>
        </p>
      </div>
    </div>

    <div
      v-if="!exam.passed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          Starting In
        </p>
        <p class="subtitle">
          {{ timeLeft }}
        </p>
      </div>
    </div>
  </nav>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamOverviewStats',
  props: {
    exam: {
      type: Object,
      required: true
    }
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    priorityStr () {
      return ['Low', 'Normal', 'High'][this.exam.priority - 1] || 'Unknown';
    },
    timeLeft () {
      const diff = moment.duration(moment(this.exam.date).diff(this.now));
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
