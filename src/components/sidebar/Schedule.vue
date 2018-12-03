<template>
  <details
    class="schedule panel user-courses"
    open
  >
    <summary class="panel-heading is-unselectable is-size-6 is-clearfix">
      Today's Schedule
      <span
        v-if="in_class"
        class="tag is-info tooltip is-pulled-right"
        :style="{ 'background-color': current_course.color }"
        :data-tooltip="'Until end of ' + current_course.longname + ' ' + periodType(current_period)"
      >{{ countdown }}</span>
    </summary>
    <template v-if="is_weekend">
      <div class="panel-block">
        <h2 class="subtitle has-text-grey is-size-6">It's the weekend!</h2>
      </div>
    </template>
    <template v-else-if="classes_over">
      <div class="panel-block">
        <h2 class="subtitle has-text-grey is-size-6">Classes are over for today!</h2>
      </div>
    </template>
    <template v-else>
      <div
        v-for="p in periods"
        :key="p.start"
        class="panel-block period-block is-clearfix is-size-7"
        :class="{ 'is-active': p == current_period, 'has-background-grey-lighter': hasPassed(p) }"
      >
        <span class="course-longname is-full-width">
          <span
            class="course-dot dot"
            :style="'background-color: ' + course(p).color"
          />
          <span
            class="tooltip is-tooltip-bottom"
            :data-tooltip="fromNow(p.start)"
          >
            {{ course(p).longname }}
            <span class="has-text-grey">{{ periodType(p) }}</span>
          </span>
          <div
            class="course-times is-pulled-right has-text-grey tooltip is-tooltip-left"
            :data-tooltip="duration(p) + ' minutes'"
          >
            <span>{{ timeFormat(p.start) }}</span>
            <span>{{ timeFormat(p.end) }}</span>
          </div>
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
    now () {
      return this.$store.state.now;
    },
    schedule () {
      return this.$store.state.schedule;
    },
    periods () {
      return this.schedule.periods || [];
    },
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
      return moment().day() === 6 || moment().day() === 0;
    },
    dateStr () {
      return moment(this.schedule.date).format('YYYY-MM-DD');
    },
    countdown () {
      const diff = moment.duration(
        moment(this.current_period.end, 'Hmm', true).diff(this.now)
      );
      return `${diff.hours()}h ${diff.minutes()}m left`;
    }
  },
  methods: {
    fromNow (datetime) {
      const time = moment(datetime, 'Hmm', true);
      return `${time.isBefore(this.now) ? 'Started' : 'Starting'} ${time.from(
        this.now
      )}`;
    },
    timeFormat: datetime => moment(datetime, 'Hmm', true).format('h:mma'),
    hasPassed: p => moment(p.end, 'Hmm', true).isBefore(moment()),
    duration: p =>
      moment(p.end, 'Hmm', true).diff(moment(p.start, 'Hmm', true), 'minutes'),
    course (p) {
      return this.$store.getters.getCourseFromPeriod(p);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
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

.course-dot {
  margin-right: 5px;
}

.course-times {
  line-height: 11px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
}
</style>
