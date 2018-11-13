<template>
  <details
    class="schedule panel user-courses"
    open
  >
    <summary class="panel-heading">Today's Schedule
      <span
        v-if="in_class"
        class="tag is-info"
      >In Class</span>
      <span
        v-else-if="is_weekend"
        class="tag is-success"
      >
        Weekend
      </span>
      <span
        v-else-if="classes_over"
        class="tag is-warning"
      >Classes Over</span>
    </summary>
    <template v-if="is_weekend">
      <div class="panel-block">
        <h2 class="subtitle">It's the weekend!</h2>
      </div>
    </template>
    <template v-else-if="classes_over">
      <div class="panel-block">
        <h2 class="subtitle">Classes are over for today!</h2>
      </div>
    </template>
    <template v-else>
      <div
        v-for="p in periods"
        :key="p.start"
        class="panel-block period-block is-clearfix"
        :class="{ 'is-active': p == current_period, 'has-background-white-ter': hasPassed(p) }"
      >
        <span class="course-longname is-full-width">
          {{ course(p).longname }}
          <small class="course-times is-pulled-right has-text-grey">{{ timeFormat(p.start) }}-{{ timeFormat(p.end) }} </small>
        </span>
      </div>
    </template>
  </details>
</template>

<script>
import moment from 'moment';

export default {
  name: 'Schedule',
  data () {
    return {};
  },
  computed: {
    schedule () {
      return this.$store.state.schedule;
    },
    periods () { return this.schedule.periods || []; },
    current_course () {
      return this.schedule.current.course;
    },
    current_period () {
      return this.schedule.current.period;
    },
    next_course () {
      return this.schedule.next.course;
    },
    next_period () {
      return this.schedule.next.period;
    },
    in_class () {
      return this.$store.getters.in_class;
    },
    classes_over () {
      return this.$store.getters.classes_over;
    },
    is_weekend () {
      return new Date().getDay() === 6 || new Date().getDay() === 0;
    },
    dateStr () {
      return moment(this.schedule.date).format('YYYY-MM-DD');
    }
  },
  methods: {
    timeFormat: datetime => moment(datetime, 'Hmm').format('h:mma'),
    hasPassed: p => moment(p.end, 'Hmm').isBefore(moment()),
    course (p) {
      return this.$store.getters.getCourseFromPeriod(p);
    }
  }
};
</script>

<style lang='scss' scoped>
.period-block {
  &.is-active {
    font-weight: bold;
  }
}
</style>
