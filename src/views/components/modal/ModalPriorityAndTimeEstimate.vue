<template>
  <div>
    <div class="columns">
      <div class="column">
        <div class="field">
          <label
            class="label"
            for="time-due"
          >
            When is it due?
          </label>
          <div class="control">
            <input
              id="time-due"
              class="input"
              type="time"
              :value="dueTime"
              @change="$emit('update-due-time', $event.target.value)"
            >
          </div>
        </div>
        <div class="buttons has-addons is-centered">
          <span
            class="button is-small"
            :class="{ 'is-active': dueTime === dueDatePeriodStart}"
            :disabled="!dueDatePeriod"
            @click="dueDatePeriod && $emit('update-due-time', dueDatePeriodStart)"
          >
            Start of Class
          </span>
          <span
            class="button is-small"
            :class="{ 'is-active': dueTime === '23:59'}"
            @click="$emit('update-due-time', '23:59')"
          >
            Midnight
          </span>
          <span
            class="button is-small"
            :class="{ 'is-active': dueTime === dueDatePeriodEnd}"
            :disabled="!dueDatePeriod"
            @click="dueDatePeriod && $emit('update-due-time', dueDatePeriodEnd)"
          >
            End of Class
          </span>
        </div>
      </div>
      <div class="column">
        <div class="priority-input">
          <label
            class="label"
            for="priority"
          >
            Priority
            <span
              class="tag"
              :class="prioritySliderClass"
            >
              {{ priorityString }}
            </span>
          </label>
          <input
            id="priority"
            type="range"
            :value="priority"
            class="is-fullwidth"
            step="1"
            min="1"
            max="5"
            required
            @change="$emit('update-priority', $event.target.value)"
          >
        </div>
        <div class="time-estimate-input">
          <label
            class="label"
            for="time-estimate"
          >
            Time Estimate
            <span class="tag">
              {{ timeEstimate }} hours
            </span>
          </label>
          <input
            id="time-estimate"
            type="range"
            :value="timeEstimate"
            class="is-fullwidth"
            step="0.5"
            min="0.5"
            max="10"
            required
            @change="$emit('update-time-estimate', $event.target.value)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ModalPriorityAndTimeEstimate',
  props: ['courseCRN', 'dueDate', 'dueTime', 'priority', 'timeEstimate'],
  computed: {
    prioritySliderClass () {
      return {
        1: 'is-light',
        2: 'is-warning',
        3: 'is-primary',
        4: 'is-dark',
        5: 'is-danger'
      }[this.priority];
    },
    priorityString () {
      return {
        1: 'Optional',
        2: 'Low',
        3: 'Normal',
        4: 'High',
        5: '𝙊𝙃 𝙂𝙊𝘿'
      }[this.priority];
    },
    dueDatePeriodStart () {
      if (!this.dueDatePeriod) return '00:00';
      const time = moment(this.dueDatePeriod.start, 'Hmm', true);
      return time.format('HH:mm');
    },
    dueDatePeriodEnd () {
      if (!this.dueDatePeriod) return '00:00';
      const time = moment(this.dueDatePeriod.end, 'Hmm', true);
      return time.format('HH:mm');
    },
    dueDatePeriod () {
      if (!this.courseCRN) return false;
      let course = this.$store.getters.current_schedule.find(
        course => course.crn === this.courseCRN
      );
      return course.periods.find(p => p.day === moment(this.dueDate).day());
    }
  },
  methods: {
    formatHours: function (val) {
      if (val > 1) {
        return val + ' hours';
      } else {
        return val + ' hour';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
input.is-fullwidth {
  width: 100%;
}
</style>
