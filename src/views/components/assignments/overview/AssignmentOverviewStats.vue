<template>
  <nav class="box level assignment-stats has-background-grey-darker has-text-white">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">
          Priority
        </p>
        <p
          class="subtitle"
          :title="'Priority level ' + assignment.priority"
          :class="{ 'has-text-grey': assignment.priority === 1 }"
          :style="{ 'font-weight': fontWeight }"
        >
          {{ priorityString }}
        </p>
      </div>
    </div>

    <div class="level-item has-text-centered">
      <div>
        <p class="heading">
          {{ assignment.passed ? 'Was Due' : 'Due' }}
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
      v-if="assignment.completed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          Completed
        </p>
        <p
          class="subtitle tooltip"
          :data-tooltip="fromNow(assignment.completedAt)"
        >
          {{ completedAt }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          {{ assignment.fullyScheduled ? 'Scheduled Work Left' : 'Work Schedule' }}
        </p>
        <p
          v-if="assignment.fullyScheduled"
          class="subtitle"
        >
          {{ assignment.scheduledTimeRemaing }}
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
  name: 'AssignmentOverviewStats',
  props: {
    assignment: {
      type: Object,
      required: true
    }
  },
  computed: {
    fontWeight () {
      return (
        {
          1: 300,
          2: 300,
          3: 'normal',
          4: 500,
          5: 700
        }[this.assignment.priority] || 600
      );
    },
    priorityString () {
      return (
        {
          1: 'Optional',
          2: 'Low',
          3: 'Normal',
          4: 'High',
          5: 'Important'
        }[this.assignment.priority] || 'Unknown'
      );
    },
    completedAt () {
      return moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    timeLeft () {
      const diff = moment.duration(
        moment(this.assignment.dueDate).diff(this.now)
      );
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    },
    shortDueDateString () {
      return this.shortDateTimeString(this.assignment.dueDate);
    }
  },
  methods: {
    shortDateTimeString: dueDate =>
      moment(dueDate).format('ddd, MMM Do YY [@] h:mma'),
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
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

.level.assignment-stats {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-top: 10px;
  margin-bottom: 0;
  padding: 5px;

  .level-item .subtitle {
    color: white;
  }
}
</style>
