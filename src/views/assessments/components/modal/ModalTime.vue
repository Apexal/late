<!--Modals: Select a time-->
<template>
  <div>
    <div class="columns">
      <div class="column">
        <div class="field">
          <label
            class="label"
            for="time"
          >When is it {{ assessmentType === 'assignment' ? 'due' : 'happening' }}?</label>
          <div class="control">
            <input
              id="time"
              class="input"
              type="time"
              :value="time"
              @change="$emit('update-time', $event.target.value)"
            >
          </div>
        </div>
        <div class="buttons has-addons is-centered">
          <span
            class="button is-small"
            :class="{'is-active': time === datePeriodStart}"
            :disabled="!datePeriod"
            @click="datePeriod && $emit('update-time', datePeriodStart)"
          >Start of Class</span>
          <span
            class="button is-small"
            :class="{'is-active': time === '23:59'}"
            @click="$emit('update-time', '23:59')"
          >Midnight</span>
          <span
            class="button is-small"
            :class="{'is-active': time === datePeriodEnd}"
            :disabled="!datePeriod"
            @click="datePeriod && $emit('update-time', datePeriodEnd)"
          >End of Class</span>
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
            >{{ priorityString }}</span>
          </label>
          <input
            id="priority"
            type="range"
            :value="priority"
            class="is-fullwidth"
            step="1"
            min="1"
            :max="priorityMax"
            required
            @change="$emit('update-priority', parseInt($event.target.value))"
          >
        </div>
        <div class="time-estimate-input">
          <label
            class="label"
            for="time-estimate"
          >
            {{ assessmentType === 'assignment' ? 'Work' : 'Study' }} Time Estimate
            <span
              class="tag"
            >{{ timeEstimate }} hours</span>
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
            @change="$emit('update-time-estimate', parseFloat($event.target.value))"
          >
        </div>
        <div
          v-if="assessmentType === 'assignment'"
          class="recurring"
        >
          <label
            class="label"
            for="is-recurring"
          >
            Recurring?
            <input
              id="is-recurring"
              :checked="isRecurring"
              type="checkbox"
              @change="$emit('update-is-recurring', $event.target.checked)"
            >
          </label>
          <div
            v-if="isRecurring"
            class="recurring-options"
          >
            <div class="buttons has-addons">
              <a
                v-for="(day, index) in dayNames"
                :key="index"
                class="button"
                :class="{'is-primary': index === date.day(), 'is-active': recurringDays.includes(index)}"
                :title="`Repeat this assignment every ${day} each week.`"
                @click="recurringDayClick(index)"
              >{{ day.charAt(0) }}</a>
            </div>
          </div>
          <small
            v-if="isRecurring"
            class="has-text-grey"
          >on {{ recurringDays.length }} {{ recurringDays.length === 1 ? 'day' : 'days' }} weekly</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ModalTime',
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    courseCRN: {
      type: String,
      required: true
    },
    date: {
      type: Object, // Moment
      required: true
    },
    time: {
      type: String,
      required: true
    },
    priorityMax: {
      type: Number,
      required: true
    },
    priority: {
      type: Number,
      required: true
    },
    timeEstimate: {
      type: Number,
      required: true
    },
    isRecurring: {
      type: Boolean,
      default: false,
      required: false
    },
    recurringDays: {
      type: Array,
      default: () => [],
      required: false
    }
  },
  computed: {
    prioritySliderClass () {
      return {
        1: 'is-light',
        2: 'is-warning',
        3: 'is-primary',
        4: 'is-dark',
        5: 'is-danger'
      }[this.priority]
    },
    priorityString () {
      if (this.assessmentType === 'assignment') {
        return {
          1: 'Optional',
          2: 'Low',
          3: 'Normal',
          4: 'High',
          5: '𝙊𝙃 𝙂𝙊𝘿'
        }[this.priority]
      } else {
        return {
          1: 'Low',
          2: 'Normal',
          3: 'High'
        }[this.priority]
      }
    },
    datePeriodStart () {
      if (!this.datePeriod) return '00:00'
      return this.datePeriod.startTime
    },
    datePeriodEnd () {
      if (!this.datePeriod) return '00:00'
      return this.datePeriod.endTime
    },
    datePeriod () {
      if (!this.courseCRN) return false
      const course = this.courses.find(
        course => course.crn === this.courseCRN
      )
      return course.periods.find(p => p.day === moment(this.date).day())
    },
    dayNames () {
      return [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
    }
  },
  methods: {
    recurringDayClick (index) {
      if (this.recurringDays.includes(index)) {
        if (index === this.date.day()) return

        this.$emit(
          'update-recurring-days',
          this.recurringDays.filter(dayIndex => dayIndex !== index)
        )
      } else {
        this.$emit('update-recurring-days', [index, ...this.recurringDays])
      }
    },
    formatHours: function (val) {
      if (val > 1) {
        return val + ' hours'
      } else {
        return val + ' hour'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
input.is-fullwidth {
  width: 100%;
}
</style>
