<template>
  <nav class="level box exam-stats has-background-grey-darker has-text-white">
    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="The importance of this exam."
        >
          Priority
        </p>
        <p class="subtitle">
          {{ priorityStr }}
        </p>
      </div>
    </div>

    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="When is this exam taking place?"
        >
          {{ exam.passed ? 'Was On' : 'When' }}
        </p>
        <p
          class="subtitle tooltip"
          :data-tooltip="timeLeft"
        >
          {{ shortDueDateString }}
        </p>
      </div>
    </div>

    <div
      v-if="!exam.passed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          {{ exam.fullyScheduled ? 'Scheduled Work Left' : 'Work Schedule' }}
        </p>
        <p
          v-if="exam.fullyScheduled"
          class="subtitle"
        >
          {{ exam.scheduledTimeRemaing }}
          <span class="has-text-grey">min</span>
        </p>
        <p v-else>
          <span
            class="tag is-danger not-scheduled-tag"
            @click="$emit('not-fully-scheduled-click')"
          >Not fully scheduled!</span>
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
    },
    shortDueDateString () {
      return this.shortDateTimeString(this.exam.date);
    }
  },
  methods: {
    shortDateTimeString: date =>
      moment(date).format('ddd, MMM Do YY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
.not-scheduled-tag {
  cursor: pointer;
}

.exam-stats {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  margin-top: 20px;
  margin-bottom: 0;
  padding: 5px;

  .level-item .subtitle {
    color: white;
  }
}
</style>
